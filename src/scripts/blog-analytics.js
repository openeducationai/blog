// Shared event contract for every blog page, including future articles.
export const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
const UTM_STORAGE = 'padho.marketingUtms.v1';
const ATTRIBUTION_TTL = 30 * 60 * 1000;

export function cleanUrl(value, base, keepCampaign = false) {
  try {
    const url = new URL(value, base);
    if (!['https:', 'http:'].includes(url.protocol)) return undefined;
    const clean = new URL(url.origin + url.pathname);
    if (keepCampaign) for (const key of UTM_KEYS) {
      const value = url.searchParams.get(key);
      if (value && value.length <= 500) clean.searchParams.set(key, value);
    }
    return clean.href;
  } catch { return undefined; }
}

export function cleanEvent(event, context, location) {
  if (!event) return event;
  // Page context stays on events; never persist it into Learn or the homepage.
  event.properties = { ...event.properties, ...context, page_path: location.pathname };
  for (const properties of [event.properties, event.properties.$set, event.properties.$set_once]) {
    if (!properties) continue;
    for (const key of ['$current_url', '$initial_current_url', '$referrer', '$initial_referrer']) {
      if (properties[key] && properties[key] !== '$direct') {
        properties[key] = cleanUrl(properties[key], location.href, key.includes('current_url'));
      }
    }
  }
  return event;
}

export function campaignForVisit(href, storage, now = Date.now()) {
  const query = new URL(href).searchParams;
  const values = Object.fromEntries(UTM_KEYS.flatMap(key => {
    const value = query.get(key)?.trim();
    return value && value.length <= 500 ? [[key, value]] : [];
  }));
  if (Object.keys(values).length) {
    try { storage.setItem(UTM_STORAGE, JSON.stringify({ values, receivedAt: now })); } catch { /* Storage can be blocked. */ }
    return values;
  }
  try {
    const saved = JSON.parse(storage.getItem(UTM_STORAGE) || 'null');
    if (!saved || typeof saved.receivedAt !== 'number' || now < saved.receivedAt || now - saved.receivedAt > ATTRIBUTION_TTL) return {};
    return Object.fromEntries(UTM_KEYS.flatMap(key => {
      const value = saved.values?.[key];
      return typeof value === 'string' && value.length > 0 && value.length <= 500 ? [[key, value]] : [];
    }));
  } catch { return {}; }
}

export function learnDestination(href, campaign) {
  const url = new URL(href);
  if (url.origin !== 'https://learn.padho.ai') return href;
  for (const [key, value] of Object.entries(campaign)) {
    if (UTM_KEYS.includes(key) && !url.searchParams.has(key)) url.searchParams.set(key, value);
  }
  return url.href;
}

// Visible time excludes background tabs and time beyond 60 seconds of inactivity.
// Scroll milestones mean depth reached, never proof that a student understood it.
export function createReadingState(now = 0, visible = true) {
  let lastTick = now, lastActivity = now, activeMs = 0, depth = 0;
  let reportedMs = 0, reportedDepth = 0, engaged = false;
  const milestones = new Set();
  function tick(time) {
    if (visible) activeMs += Math.max(0, Math.min(time, lastActivity + 60000) - lastTick);
    lastTick = time;
  }
  return {
    activity(time) { tick(time); lastActivity = time; },
    visibility(time, nextVisible) {
      tick(time); visible = nextVisible;
      if (visible) lastActivity = time;
    },
    sample(time, percent) {
      tick(time);
      if (!visible) return [];
      depth = Math.max(depth, Math.min(100, Math.max(0, Math.floor(percent))));
      const events = [];
      for (const milestone of [25, 50, 75, 100]) if (depth >= milestone && !milestones.has(milestone)) {
        milestones.add(milestone);
        events.push(['blog_reading_progress', { progress_percent: milestone, active_seconds: Math.floor(activeMs / 1000) }]);
      }
      if (activeMs >= 30000 && !engaged) {
        engaged = true;
        events.push(['blog_article_engaged', { active_seconds: Math.floor(activeMs / 1000), max_scroll_percent: depth }]);
      }
      return events;
    },
    summary(time) {
      tick(time);
      const delta = Math.floor((activeMs - reportedMs) / 1000);
      if (delta === 0 && depth === reportedDepth) return null;
      reportedMs += delta * 1000; reportedDepth = depth;
      return { active_seconds: Math.floor(activeMs / 1000), active_seconds_delta: delta, max_scroll_percent: depth };
    },
  };
}

export function mountBlogAnalytics(client, context, { document, window }) {
  const capture = (name, properties, leaving = false) => {
    try { client.capture(name, properties, leaving ? { transport: 'sendBeacon', send_instantly: true } : undefined); } catch { /* Analytics must not interrupt reading. */ }
  };
  let storage;
  try { storage = window.sessionStorage; } catch { /* Private browser modes may deny storage. */ }
  const campaign = campaignForVisit(window.location.href, storage);
  const decorate = link => { try { link.href = learnDestination(link.href, campaign); } catch { /* Non-web link. */ } };
  for (const link of document.querySelectorAll('a[href]')) decorate(link);
  const placement = element => element.closest('#mobile-nav') ? 'mobile_nav'
    : element.closest('.site-header') ? 'header'
    : element.closest('.site-footer') ? 'footer'
    : element.closest('.category-hero') ? 'hero'
    : element.closest('.category-card') ? 'categories'
    : element.closest('.recent-card, .category-article-card') ? 'article_list'
    : element.closest('.prose') ? 'article' : 'body';
  const label = element => (element.getAttribute('aria-label') || element.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 150);

  const handleClick = event => {
    if (event.type === 'auxclick' && event.button !== 1) return;
    const target = event.target?.closest?.('a[href], button');
    if (!target || target.disabled || target.hidden) return;
    if (target.matches('a[href]')) {
      decorate(target);
      const destination = cleanUrl(target.href, window.location.href);
      if (!destination) return;
      const url = new URL(destination);
      const properties = { placement: placement(target), link_label: label(target), destination_url: destination, destination_path: url.pathname };
      if (target.hasAttribute('data-app-path')) {
        const eventName = url.hostname === 'play.google.com' ? 'marketing_app_store_clicked' : 'marketing_sign_in_clicked';
        capture(eventName, properties, true);
        // Preserve Padho's existing aggregate CTA funnel as well as the named event.
        capture('marketing_cta_clicked', properties, true);
      } else if (url.origin === window.location.origin && /^\/blog\/category\/([^/]+)/.test(url.pathname)) {
        capture('blog_category_selected', { ...properties, destination_category: url.pathname.split('/')[3] }, true);
      } else if (url.origin === window.location.origin && target.closest('.category-hero, .recent-card, .category-article-card')) {
        capture('blog_article_selected', { ...properties, destination_article_slug: url.pathname.split('/').filter(Boolean).at(-1) }, true);
      } else capture('blog_navigation_clicked', properties, true);
      return;
    }
    if (event.type === 'auxclick') return;
    const figure = target.closest('figure');
    if (target.matches('[data-step]')) {
      capture('blog_visual_interacted', { visual_id: figure?.dataset.articleSteps, action: 'select_step', step: Number(target.dataset.step), option_label: label(target) });
    } else if (target.matches('[data-ribbon-size]')) {
      capture('blog_visual_interacted', { visual_id: 'ribbon_division', action: 'select_size', option: target.dataset.ribbonSize });
    } else if (target.matches('[data-walking-replay], [data-sugar-replay]')) {
      capture('blog_visual_interacted', { visual_id: target.hasAttribute('data-walking-replay') ? 'walking_forces' : 'dissolving_sugar', action: 'replay' });
    } else if (target.matches('.menu-button')) {
      // The existing menu handler has already applied the new state.
      capture('blog_menu_toggled', { open: target.getAttribute('aria-expanded') === 'true' });
    }
  };
  document.addEventListener('click', handleClick);
  document.addEventListener('auxclick', handleClick);

  // Observe actual opening, including keyboard focus and pointer hover definitions.
  const terms = [...document.querySelectorAll('[data-reading-term]')];
  const openTerms = new WeakSet();
  const definitions = new window.MutationObserver(records => {
    for (const { target } of records) {
      if (target.getAttribute('aria-expanded') === 'true') {
        if (!openTerms.has(target)) capture('blog_definition_opened', { term: target.dataset.readingTerm });
        openTerms.add(target);
      } else openTerms.delete(target);
    }
  });
  terms.forEach(term => definitions.observe(term, { attributes: true, attributeFilter: ['aria-expanded'] }));
  for (const [index, details] of [...document.querySelectorAll('.prose details')].entries()) {
    details.addEventListener('toggle', () => {
      if (details.open) capture('blog_solution_opened', { question_index: index + 1, solution_label: label(details.querySelector('summary')) });
    });
  }
  const track = document.querySelector('.category-grid');
  if (track) {
    const cards = [...track.querySelectorAll('.category-card')];
    let current = 0, scrollTimer;
    track.addEventListener('scroll', () => {
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => {
        const next = cards.reduce((best, card, i) => Math.abs(card.offsetLeft - cards[0].offsetLeft - track.scrollLeft) < Math.abs(cards[best].offsetLeft - cards[0].offsetLeft - track.scrollLeft) ? i : best, 0);
        if (next !== current) capture('blog_categories_scrolled', { category_position: next + 1, category: cards[next].querySelector('h2')?.textContent.toLowerCase() });
        current = next;
      }, 180);
    }, { passive: true });
  }

  const prose = document.querySelector('.prose');
  if (context.blog_page_type !== 'article' || !prose) return;
  const now = () => window.performance.now();
  const state = createReadingState(now(), !document.hidden);
  const sample = () => {
    const rect = prose.getBoundingClientRect();
    const percent = rect.height ? (window.innerHeight - rect.top) / rect.height * 100 : 0;
    for (const [name, properties] of state.sample(now(), percent)) capture(name, properties);
  };
  let scrollFrame;
  window.addEventListener('scroll', () => {
    state.activity(now());
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(() => { scrollFrame = null; sample(); });
  }, { passive: true });
  for (const name of ['pointerdown', 'keydown', 'touchstart']) document.addEventListener(name, () => state.activity(now()), { passive: true });
  const summary = () => {
    const properties = state.summary(now());
    if (properties) capture('blog_reading_summary', properties, true);
  };
  document.addEventListener('visibilitychange', () => {
    sample();
    state.visibility(now(), !document.hidden);
    if (document.hidden) summary();
  });
  window.addEventListener('pagehide', summary);
  window.addEventListener('pageshow', () => state.visibility(now(), !document.hidden));
  window.setInterval(sample, 5000);
  sample();
}
