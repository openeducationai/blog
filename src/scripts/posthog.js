import posthog from 'posthog-js';
import { cleanEvent, mountBlogAnalytics } from './blog-analytics.js';

const key = import.meta.env.PUBLIC_POSTHOG_KEY;
const host = import.meta.env.PUBLIC_POSTHOG_HOST;
const productionHost = ['padho.ai', 'www.padho.ai'].includes(window.location.hostname);
const contextElement = document.querySelector('#blog-analytics-context');

if (import.meta.env.DEV && (!key || !host)) {
  console.error('PUBLIC_POSTHOG_KEY / PUBLIC_POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once PUBLIC_POSTHOG_KEY / PUBLIC_POSTHOG_HOST is configured');
}
if (import.meta.env.PROD && productionHost && key && host && contextElement && !window.__padhoBlogAnalyticsInstalled) {
  window.__padhoBlogAnalyticsInstalled = true;
  try {
    const context = JSON.parse(contextElement.textContent);
    posthog.init(key, {
      api_host: host,
      defaults: '2026-08-30',
      person_profiles: 'identified_only',
      cross_subdomain_cookie: true,
      persistence: 'localStorage+cookie',
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: false,
      disable_surveys: true,
      session_recording: { maskAllInputs: true },
      before_send: event => cleanEvent(event, context, window.location),
      loaded: client => mountBlogAnalytics(client, context, { document, window }),
    });
  } catch (error) {
    // Reading and navigation continue if analytics cannot initialize.
    console.warn('Blog analytics could not initialize.', error);
  }
}
