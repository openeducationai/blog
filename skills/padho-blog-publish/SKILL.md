---
name: padho-blog-publish
description: "Write, update, verify and publish student-facing Padho blog articles at padho.ai/blog, including search metadata, crawler checks and syncing the blog repository's main branch. Use for Padho blog publishing; textbook chapters and marketing-page redesigns have separate workflows."
---

# Padho Blog Publish

Publish the requested article or article edits through the existing Astro blog. Preserve the approved reading experience and complete discovery checks and Git synchronization as part of publication.

## Source and scope

- Repository: `/Users/prabodhprakash/Documents/education/blog`; public URL: `https://padho.ai/blog`.
- Work in the existing `main` checkout. Preserve unrelated work. The owner wants approved blog changes committed and pushed to `origin/main`; never force-push or create another branch/worktree for this workflow.
- `src/content/blog/` contains the source articles; `src/assets/articles/` contains their illustrations. Figma is a design reference, not the content database.
- A request to publish authorizes the necessary article edits, validation, scoped blog deployment, commit and push. Honor draft-only or review-only requests without publishing. Reuse existing session authorization rather than adding another approval step.
- Do not infer a daily schedule, create extra articles, prune Figma, add analytics services, or enable Bing/IndexNow from a routine publication request. Those are separate work. Bing setup was explicitly deferred.
- The owner currently handles Google Search Console in another app. Supply exact URLs and any remaining indexing actions; only operate Search Console when subsequently requested and a supported connected surface is available.

## Write for the student

Use the current published articles as the reference for length and tone. Start with the specific question and what the student will explore. Follow one familiar situation through the explanation. Explain terms when first introduced, identify what each diagram element means, and verify the science or mathematics against reliable primary educational sources. Do not pad the article to a word count.

Use the existing `KeyIdea`, `ReadingTerm` and article-figure patterns where they clarify the lesson. Keep essential explanations available in HTML without JavaScript. Figures need an accessible static state, explicit controls where useful, keyboard access and reduced-motion behavior. Use original explanatory visuals rather than unrelated stock decoration.

Preserve the shared landing-page header/footer, Inter UI, Literata reading styles, justified prose and cover near the title. Use existing theme tokens and components. Do not add back buttons, further-reading sections, publication cadence, internal instructions or process commentary to the article. Add links to genuinely related existing articles naturally in the prose; do not force links between unrelated subjects. Category navigation is already provided by the article layout.

## Author and search data

Each article needs `title`, `description`, `category`, `author`, `pubDate`, `heroImage` and meaningful `heroImageAlt`. Categories are `general`, `physics`, `chemistry`, `maths`, `engineering`. The `author` field is an ID from `src/data/authors.json`; `padho` is the existing organization author. Add individual authors only with their real approved identity and URL. Never fabricate a reviewer or claim a human review that did not happen.

Use the actual publication time with its time zone. Use `updatedDate` only for a genuine article update; do not refresh dates to simulate freshness. `draft: true` and future publication dates are excluded from public routes until a qualifying build. A clock change alone does not publish a static build.

`BaseHead.astro` and `BlogPost.astro` generate the canonical URL, social metadata, visible author/category links and `BlogPosting` JSON-LD. Do not maintain a separate competing schema in MDX. The schema must agree with visible titles, dates, author and images. Keep the full article HTML public and indexable. Preserve permanent published URLs and content history.

## Verify, publish and sync

Read [operations.md](references/operations.md) before release or discovery changes. It records the actual destination, checks and root-site boundary.

1. Inspect `git status`, the diff and applicable repository instructions. Fetch `origin/main` and check divergence before committing. Resolve any concurrent remote work without overwriting it.
2. Build from the blog directory with `npm run build`. Run `npm run typecheck` when code changes warrant it and `npm run check:search` against the built output. These commands are permitted for the blog; the separate frontend repo has different build restrictions.
3. Inspect the changed pages in the actual app at desktop and phone sizes. Check readable text, visible covers, links and any changed interactions. Use the app's normal content/navigation, not a separate demo. Do not repeat unaffected interaction tests without a reason.
4. Review the final diff, stage only the approved blog changes, commit on `main` and push to `origin main`. A commit/push failure is a separate incomplete step; do not hide it or force-push to resolve it.
5. Publish the verified build with `node scripts/publish.mjs`. It runs the local search preflight before uploading. Do not edit content after the verified build; rebuild if source changes.
6. Run `python3 scripts/check-search.py --live --output /tmp/padho-blog-search-live.json`, inspect the changed live pages, and confirm the Git worktree is clean and local HEAD matches the remote main SHA.

If a release upload, generation guard or CDN operation fails, stop dependent writes and inspect what succeeded. Do not loop retries or overwrite a concurrent generation. Finish unaffected checks and report the precise incomplete step.

Report the published URL, verification result, Git commit/sync result and any remaining Search Console action concisely. A successful page response or indexing request is not proof of indexing, ranking or AI citation.
