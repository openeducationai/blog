/* Shared behaviour for every marketing page: links into the app, the masthead menu,
 * and the Android hand-off to Google Play. Page-specific behaviour lives beside each page. */
import {appOrigin} from './catalogue.js';

export const PLAY_URL = 'https://play.google.com/store/apps/details?id=ai.padho.learn&hl=en_IN';

// An inline <head> script sets this before the first paint, so the hero never flashes the web-only CTA.
export function isAndroid(document) {
  return document.documentElement.dataset.platform === 'android';
}

export function mountSite({document, window}) {
  const android = isAndroid(document);
  const origin = appOrigin(window.location);
  const bindings = new window.AbortController();
  const on = (target, event, callback, options = {}) => target.addEventListener(event, callback, {...options, signal: bindings.signal});

  // On Android every way into the web app leads to the Play listing instead; it shows "Open" when installed.
  for (const link of document.querySelectorAll('[data-app-path]')) {
    link.href = android ? PLAY_URL : origin + link.dataset.appPath;
    if (android) link.removeAttribute('target');
  }
  const login = document.querySelector('.login-button');
  if (android && login) login.textContent = 'Get the app';
  for (const link of document.querySelectorAll('[data-marketing-cta-placement]')) {
    link.classList.add('ph-no-capture');
    link.setAttribute('data-ph-no-autocapture', '');
  }
  const year = document.getElementById('copyright-year');
  if (year) year.textContent = String(new Date().getFullYear());

  const button = document.querySelector('.menu-button');
  const nav = document.getElementById('mobile-nav');
  let menuOpen = false;
  function setMenu(open, restoreFocus = false) {
    menuOpen = open;
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    nav.hidden = !open;
    if (restoreFocus) button.focus({preventScroll: true});
  }
  if (button && nav) {
    button.hidden = false;
    on(button, 'click', () => setMenu(!menuOpen));
    on(nav, 'click', event => { if (event.target.closest('a')) setMenu(false); });
    on(document, 'click', event => { if (menuOpen && !event.target.closest('.site-header')) setMenu(false); });
    on(document, 'keydown', event => { if (event.key === 'Escape' && menuOpen) setMenu(false, true); });
    on(window.matchMedia('(min-width: 1024px)'), 'change', event => { if (event.matches) setMenu(false); });
  }

  return () => bindings.abort();
}

if (typeof document !== 'undefined' && document.querySelector('.site-header')) mountSite({document, window});
