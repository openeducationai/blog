import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanUrl, cleanEvent, campaignForVisit, learnDestination, createReadingState } from '../src/scripts/blog-analytics.js';

const storage = () => { const data = new Map(); return { getItem: key => data.get(key), setItem: (key, value) => data.set(key, value) }; };

test('analytics retains source attribution but removes arbitrary query strings and fragments', () => {
  const url = 'https://padho.ai/blog/topic/?utm_source=google&utm_campaign=jee&email=private@example.com&token=secret#answer';
  assert.equal(cleanUrl(url, url, true), 'https://padho.ai/blog/topic/?utm_source=google&utm_campaign=jee');
  assert.equal(cleanUrl(url, url), 'https://padho.ai/blog/topic/');
  assert.equal(cleanUrl('javascript:alert(1)', url), undefined);
  assert.equal(cleanUrl('mailto:private@example.com', url), undefined);
});

test('page context is added to automatic events and initial person properties are scrubbed too', () => {
  const location = { href: 'https://padho.ai/blog/a/', pathname: '/blog/a/' };
  const event = cleanEvent({ event: '$pageview', properties: { product_surface: 'homepage', $referrer: 'https://google.com/search?q=private', $set_once: { $initial_current_url: 'https://padho.ai/blog/?token=secret&utm_source=google' } } }, { product_surface: 'blog', article_slug: 'a' }, location);
  assert.equal(event.properties.product_surface, 'blog');
  assert.equal(event.properties.article_slug, 'a');
  assert.equal(event.properties.$referrer, 'https://google.com/search');
  assert.equal(event.properties.$set_once.$initial_current_url, 'https://padho.ai/blog/?utm_source=google');
  assert.equal(cleanEvent(null, {}, location), null);
});

test('campaign survives navigation, expires after 30 minutes, and new campaign replaces old touch', () => {
  const store = storage();
  assert.deepEqual(campaignForVisit('https://padho.ai/blog/?utm_source=google&utm_campaign=jee', store, 1000), { utm_source: 'google', utm_campaign: 'jee' });
  assert.deepEqual(campaignForVisit('https://padho.ai/blog/article/', store, 2000), { utm_source: 'google', utm_campaign: 'jee' });
  assert.deepEqual(campaignForVisit('https://padho.ai/blog/article/', store, 1801001), {});
  assert.deepEqual(campaignForVisit('https://padho.ai/blog/?utm_source=bing', store, 3000), { utm_source: 'bing' });
  assert.deepEqual(campaignForVisit('https://padho.ai/blog/article/', store, 2000), {});
});

test('blocked storage does not prevent attribution on this page or break reading', () => {
  const blocked = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
  assert.deepEqual(campaignForVisit('https://padho.ai/blog/?utm_source=google', blocked), { utm_source: 'google' });
  assert.deepEqual(campaignForVisit('https://padho.ai/blog/', blocked), {});
  assert.deepEqual(campaignForVisit('https://padho.ai/blog/', undefined), {});
});

test('campaign handoff preserves explicit destination values and never rewrites Android Play or other hosts', () => {
  assert.equal(learnDestination('https://learn.padho.ai/login?utm_source=existing', { utm_source: 'google', utm_campaign: 'jee' }), 'https://learn.padho.ai/login?utm_source=existing&utm_campaign=jee');
  const play = 'https://play.google.com/store/apps/details?id=ai.padho.learn&hl=en_IN';
  assert.equal(learnDestination(play, { utm_source: 'google' }), play);
  assert.equal(learnDestination('https://example.com/', { utm_source: 'google' }), 'https://example.com/');
});

test('scroll milestones and engagement fire once even after scrolling backward', () => {
  const state = createReadingState();
  assert.deepEqual(state.sample(1000, 24), []);
  assert.deepEqual(state.sample(2000, 60).map(([name, props]) => [name, props.progress_percent]), [['blog_reading_progress', 25], ['blog_reading_progress', 50]]);
  assert.deepEqual(state.sample(3000, 20), []);
  const events = state.sample(30000, 101);
  assert.deepEqual(events.map(([name]) => name), ['blog_reading_progress', 'blog_reading_progress', 'blog_article_engaged']);
  assert.deepEqual(state.sample(40000, 100), []);
  assert.equal(state.summary(40000).active_seconds_delta, 40);
  assert.equal(state.summary(40000), null);
});

test('background and idle time never count toward reading engagement', () => {
  const state = createReadingState();
  state.visibility(10000, false);
  assert.deepEqual(state.sample(600000, 100), []);
  state.visibility(610000, true);
  assert.deepEqual(state.sample(620000, 10), []);
  assert.equal(state.summary(620000).active_seconds, 20);
  assert.equal(state.sample(630000, 10)[0][0], 'blog_article_engaged');
  assert.equal(state.summary(900000).active_seconds, 70);
  state.activity(900000);
  assert.equal(state.summary(905000).active_seconds_delta, 5);
});

test('initially hidden article records no reading until the tab becomes visible', () => {
  const state = createReadingState(0, false);
  assert.deepEqual(state.sample(100000, 100), []);
  assert.equal(state.summary(100000), null);
  state.visibility(100000, true);
  assert.deepEqual(state.sample(105000, 25), [['blog_reading_progress', { progress_percent: 25, active_seconds: 5 }]]);
});
