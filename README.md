# Padho Blog

The independent Astro blog for **https://padho.ai/blog**. General, Physics, Chemistry, Maths and Engineering each have a category page. `/blog` is the article index; the retired `/blog/articles/` URL redirects there. The first published article is “If forces are equal, why do things move?”, explained through taking a step, with an animated force diagram.

## Development

```sh
npm ci
npm run dev
```

The existing app runs at `http://localhost:4321/blog/`.

```sh
npm run build
npm run typecheck
npm run check:search
npm run deploy:plan
```

The build writes `dist/`. Only published content in `src/content/blog/` becomes an article. Figma examples are not imported into the content collection. Earlier remote content that is not part of the revamped site is preserved under `archive/blog/`, outside the published collection.

## Design

The UI follows [Core Views / Blogs](https://www.figma.com/design/co2qZpIRPjghQaW8T7UHCA?node-id=1906-3), using DS Approved tokens. `src/styles/tokens.css` is the existing Padho marketing token export; the reading styles were updated from Padho — Books on 2026-11-10. The header, mobile menu, footer and shared styles are copied directly from the main landing page (`fe/public/marketing/homepage/core-landing/`). UI uses Inter; reading uses Literata, with responsive size, weight, line height and paragraph spacing in `reading.css`. Fonts and the exact Figma logo/arrow assets are hosted with the blog.

Category pages open directly with their newest article as a hero, followed by simple cards for the remaining articles. Empty categories show only “No articles”. The homepage category blocks form a swipeable carousel on phones and a grid on larger screens.

Category configuration is in `src/data/categories.json`. It drives server-rendered blocks and category routes. Articles belong in `src/content/blog/` as Markdown or MDX with `title`, `description`, `category`, `author`, `pubDate`, `heroImage` and `heroImageAlt` frontmatter. Author IDs resolve through `src/data/authors.json`; the current organization author is `padho`. The newest article gets a large feature row, followed by alternating narrow/wide pairs of older articles, stacking on phones; the section is absent when there are no published articles. Every article displays its cover near the title. Article prose, leads and excerpts use justified alignment, with automatic hyphenation; navigation and controls retain their functional alignment. Categories are validated against that configuration. `draft: true` and future publication dates are excluded from pages, feeds and article routes. A new build publishes new content.

## Editorial approach

Start each article by stating the question being explored and setting up a familiar situation. Explain each idea through one simple, everyday example before introducing another. Readability takes priority over breadth; avoid unnecessary mechanisms, formulas and controls. Use direct, conversational teaching language, explain new terms as they appear, and connect each visual to the surrounding explanation. Do not add back buttons, further-reading sections or publishing/process commentary to article pages.

`KeyIdea.astro` and `ReadingTerm.astro` reuse the book’s green callouts and rose dotted definitions. Use them sparingly: one central takeaway and unfamiliar terms that need help. Definitions appear on hover or keyboard focus on desktop, and in a closable bottom sheet on phones. Keep essential explanations in the article itself so the reading still works without JavaScript.

## Search discovery and publishing skill

Article layouts generate `BlogPosting` structured data, canonical and social metadata, and visible author/category links. Dates and bylines must describe the actual article; do not invent reviewers or refresh publication dates for search. Link genuinely related articles in the prose without adding a further-reading block.

`npm run check:search` validates the built sitemap, indexability, article metadata against visible content, images and internal links. The publisher runs this preflight before any upload. After publishing, `npm run check:search:live` also checks the public root crawler file and responses to Googlebot, bingbot, OAI-SearchBot and PerplexityBot user-agent probes. These probes do not prove indexing or access from the providers' own networks.

The root `robots.txt` source is `../fe/marketing-site/robots.txt`; it advertises both the marketing sitemap and `https://padho.ai/blog/sitemap-index.xml`. Routine blog releases do not rewrite the root file. Google Search Console submission/indexing is a separate owner action; Bing/IndexNow setup is deferred.

The reusable skill is [Padho Blog Publisher](skills/padho-blog-publish/SKILL.md). Invoke it as `$padho-blog-publish`; it covers writing, existing design conventions, search checks, scoped deployment and committing/pushing approved blog changes on `main`.

The [seven-day PCM trial](editorial/README.md) starts each morning at 07:00
Asia/Kolkata on 11–17 November 2026. Versioned editorial history prevents
repeated learning objectives; researched briefs retain the evidence behind
topic selection and PYQs. The dedicated
[Blogs Figma file](https://www.figma.com/design/GsBNGG7jIMvsPyhP7w0zXK/Blogs)
holds the rolling seven-day review copy. Website articles and history are
permanent. `npm run check:editorial` runs before every publication. The local
Mac scheduler invokes the signed-in Codex CLI and stops agent execution after
the trial; it requires an awake, online Mac and usable credentials.

## Hosting

`padho.ai` already serves marketing paths from `gs://padho-ai-marketing`. Publish this repo's static output under `blog/`; the main React app is not involved. The bucket's existing `index.html` website suffix serves nested category pages. An exact `blog` object also serves the requested URL without redirecting visitors to `index.html`.

After authenticating with the existing Padho Google Cloud account:

```sh
npm run deploy
```

The publisher builds first, uploads assets before HTML, checks object generations to avoid overwriting concurrent edits, retains previous hashed assets for cached pages, removes stale objects **only within `blog/`**, and invalidates only `/blog` and `/blog/*` on the apex CDN. It never mirrors or deletes the marketing bucket root. `npm run deploy:plan` lists the exact target objects without network writes.

The marketing repo's legacy deploy script must exclude `^blog(/.*)?$` from its root mirror. Do not use a root bucket mirror to publish this blog.

The existing `cloudbuild.yaml` still builds the legacy container image; that is not an apex deployment. Use the command above for the static site. The PCM trial invokes this same scoped publisher after its content, editorial and search checks.

## Legacy URL cutover

`learn.padho.ai/blog` belongs to the existing GKE blog service. `nginx.conf` redirects that host and the old `ips.padho.ai` alias to `https://padho.ai` while preserving the path and query. Removed article URLs consequently return 404 on the new site.

Only after the apex site is published and verified, update the legacy service with the new image or mount the checked-in `nginx.conf` as a ConfigMap. Check the live deployment before changing it; preserve its image, resources and unrelated settings. Verify the redirect and `/healthz` after rollout. No main-site navigation changes are included in this blog release.

The forces article follows one step. `WalkingForces.astro` uses the source SVG as an accessible inline diagram, and `walking-forces.js` draws both force arrows together when the reader presses Replay arrows. The diagram remains readable without JavaScript. Reduced-motion users receive the static diagram without the replay control.

The Chemistry article uses `DissolvingSugar.astro`: the same twenty model molecules move from a cluster into the water, with a static image for reduced motion. The Maths article uses `RibbonDivision.astro` to switch the same two-metre ribbon between one-metre and half-metre pieces. Both figures have readable static states without JavaScript. Their original vector cover assets are in `src/assets/articles/`.

## Blog analytics

All blog pages use the existing **padho ai website** PostHog project (190793),
through `BaseHead.astro` → `BlogAnalytics.astro`. New articles inherit tracking.
Copy `.env.example` to `.env.production` on a publishing machine and use the
same **public project token** and ingestion host as the Padho landing page.
The current publisher is configured. Never use a personal API key in the browser.
Production capture runs only on `padho.ai` and `www.padho.ai`; local development
and previews do not send events. Missing configuration leaves the website usable,
but `npm run check:analytics` and the publisher reject an unconfigured release.

Filter [PostHog events](https://us.posthog.com/project/190793/activity/explore)
by `product_surface = blog`. Every event has `blog_page_type` and `page_path`;
article events also have `article_slug`, `article_title` and `blog_category`.
Page context is added per event, never persisted into the Learn app.
The same project and cross-subdomain identity cookie connect the existing
marketing → blog → Learn journey. The blog has no login form and never invents
an identity; Learn continues to identify authenticated users.

| Event | Meaning |
| --- | --- |
| `$pageview`, `$pageleave` | Automatic page visits and exits; referrer and UTM attribution |
| `blog_article_selected`, `blog_category_selected` | Article/card and category navigation |
| `blog_navigation_clicked`, `blog_menu_toggled`, `blog_categories_scrolled` | Header/footer links, mobile menu and carousel movement |
| `blog_reading_progress` | Article prose reached 25%, 50%, 75% or 100%, once per page visit |
| `blog_article_engaged` | 30 seconds of visible, non-idle article time, once per visit |
| `blog_reading_summary` | Cumulative active time and depth on hide/exit; sum `active_seconds_delta` for time, not the cumulative field |
| `blog_visual_interacted` | Visual step/size selection or animation replay |
| `blog_definition_opened` | Actual definition opening by pointer, focus or tap |
| `blog_solution_opened` | Hint/solution disclosure opened, with its position in the article |
| `marketing_sign_in_clicked`, `marketing_app_store_clicked` | Learn login or Android store CTA |
| `marketing_cta_clicked` | Existing aggregate CTA funnel; do not sum it with the named CTA events |

Background tabs and inactivity beyond 60 seconds do not add reading time.
Scroll depth is a reading signal, not proof of comprehension. Reading summaries
use incremental time to avoid double-counting visibility-change plus page-exit.
UTMs survive internal navigation for 30 minutes and are forwarded to Learn;
explicit destination UTMs and Android Play links are preserved. Arbitrary URL
query parameters and fragments are excluded from custom link events and SDK
page/referrer URL properties. Input values are masked in session replay, which
follows the existing project's recording settings. Surveys and generic click
autocapture are disabled; the named events above describe the actual actions.

Run `npm test`, `npm run typecheck`, `npm run build`, and
`npm run check:analytics` before publishing. After a tracking change, verify real
browser events in this project, including mobile interactions and Learn handoff.
A first-party ingestion proxy is an optional follow-up; the blog currently uses
the same direct PostHog ingestion host as the landing page.
