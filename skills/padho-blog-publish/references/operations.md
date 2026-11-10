# Padho blog release and discovery

## Deployment boundary

- GCP project: `edtech-05101987`.
- Bucket: `gs://padho-ai-marketing`.
- Blog publisher: `/Users/prabodhprakash/Documents/education/blog/scripts/publish.mjs`.
- CDN URL map: `padhoai-https-redirect`; host `padho.ai`.
- Routine writes are only `blog/*` and the exact `blog` entry object. Invalidate `/blog` and `/blog/*` only.

The publisher uploads assets before documents and the homepage last; it uses generation guards, retains previous hashed assets and removes stale files only under `blog/`. `node scripts/publish.mjs --dry-run` lists the targets after local validation.

Do not mirror the bucket root, invoke the old marketing root-sync script, or deploy the legacy container to publish the apex blog. The homepage is served through the marketing creative catalogue; a root `index.html` replacement is not the homepage workflow.

Use existing authorized Google Cloud credentials. Keep tokens in process memory and never print or save them. If renewal is necessary, report the exact authentication issue and continue work that does not require the credential.

## Root discovery file

The root crawler file is owned by the frontend marketing source:

`/Users/prabodhprakash/Documents/education/fe/marketing-site/robots.txt`

Its public URL is `https://padho.ai/robots.txt`. It should advertise both:

```text
Sitemap: https://padho.ai/sitemap.xml
Sitemap: https://padho.ai/blog/sitemap-index.xml
```

Routine blog publishing does not rewrite the root file. If a requested discovery change needs it, preserve all unrelated directives, inspect the current GCS object's bytes and generation/metageneration, upload only the exact `robots.txt` object with matching preconditions, retain a rollback copy and invalidate only `/robots.txt`. Do not commit unrelated frontend changes while syncing the blog repo.

The existing wildcard `Allow: /` permits search crawling. Explicit allow groups are unnecessary unless more-specific rules would otherwise block the intended crawler. Preserve training-crawler choices; search and model training are separate controls. A user-agent probe cannot prove access from the provider's own crawler IP ranges. Where relevant, also inspect the active CDN/WAF policy and Search Console's live inspection result.

## Search checks

```sh
npm run check:search
python3 scripts/check-search.py --live --output /tmp/padho-blog-search-live.json
```

The read-only checker validates sitemap routes, canonical URLs, indexability, article JSON-LD against visible content, author attribution, image availability and blog links. Live mode also checks root sitemap advertisement and public responses using Googlebot, bingbot, OAI-SearchBot and PerplexityBot user agents. It does not submit anything to Bing or Google, or change search settings.

## Google handoff and monitoring

Property: `sc-domain:padho.ai` in Google Search Console.

- Submit `https://padho.ai/blog/sitemap-index.xml` if it is not already registered; do not create duplicate submissions on every release.
- Inspect each new article URL. If appropriate, request indexing through the connected UI. Report the actual result and any quota/error; do not claim the article is indexed based on a request alone.
- Check Settings → Search generative AI when that setting is available in the current product and confirm inclusion. Recheck official guidance when the UI or controls change.
- Review Page indexing and Performance for `/blog/`: indexed pages, errors, impressions, clicks and queries. Use existing analytics for AI referrals when available; do not add a new tracker without scope. Citation reports and referral visits are distinct measures.
- Google Preferred Sources is optional and domain-based (`padho.ai`, not `/blog`). Check actual eligibility before adding a control. It is not a condition for ordinary indexing.
- Bing Webmaster Tools and IndexNow setup remain deferred until requested. Testing Bing's public crawler response does not activate either integration.

Current authoritative references to consult when needed:

- [Google AI search guidance](https://developers.google.com/search/docs/appearance/ai-features)
- [Google article structured data](https://developers.google.com/search/docs/appearance/structured-data/article)
- [Google Search generative AI controls](https://support.google.com/webmasters/answer/16908024)
- [Google Preferred Sources](https://developers.google.com/search/docs/appearance/preferred-sources)
- [OpenAI search and training crawlers](https://developers.openai.com/api/docs/bots)
- [Perplexity crawlers](https://docs.perplexity.ai/docs/resources/perplexity-crawlers)
