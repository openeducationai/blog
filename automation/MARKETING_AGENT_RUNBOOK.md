# Marketing agent runbook: daily Padho blog

This job belongs to the always-running Padho marketing Mac app. The app should
schedule it once at 05:45 Asia/Kolkata. It should schedule the approved-PR
check once at 16:05 Asia/Kolkata.

The job may create branches, review issues, and pull requests only in
`openeducationai/blog`. It must never merge a pull request. It must never edit
the frontend repository or deployment configuration.

Keep a dedicated clean checkout of `openeducationai/blog` under the app's data
directory. Sync it to `origin/main` before each scheduled job. Never switch,
pull, clean, or write into the developer's working checkout. Keep article
scratch files outside every repository.

## 05:45 lifecycle job

Run this from the blog repository:

```sh
npm run blog:agent:state
```

Read the JSON `action` and do exactly one of the following.

### `generate`

1. Read `automation/EDITORIAL_GUIDE.md` completely.
2. Read `automation/sources.json` and the current files in `src/content/blog/`.
3. Choose one deep technical education idea that is clearly different from
   existing Padho posts. Deep tech means a mechanism the reader can follow. It
   does not mean technical-sounding language.
4. Research the idea from current primary or official sources. Use at least
   four source links from at least three domains. Open every source used.
5. Write the complete Markdown article in the marketing app's scratch
   directory. Do not write it into any repository checkout.
6. Run the local quality check. Revise until it passes.
7. Submit it with:

```sh
npm run blog:submit-draft -- /absolute/path/to/scratch/article-slug.md
```

The article must make one useful point. State it in the title and opening.
Prefer short sentences and common words. Explain one mechanism with one fresh
example. Include one real limitation. Remove jargon that the argument does not
need. Do not reuse another post's example, opening, section pattern, or ending.

### `revise`

The state JSON contains `issueNumber`, `articleMarkdown`, and `feedback`.

1. Treat every queued feedback item as an instruction from the reviewer.
2. Revise the supplied article in the app's scratch directory.
3. Preserve its publication date.
4. Do not introduce a factual claim or external link that was not already in
   the reviewed draft. If the request needs new research, leave the claim out
   and keep the article honest.
5. Keep the rest of the editorial guide in force.
6. Submit the complete revised Markdown file with:

```sh
npm run blog:submit-revision -- ISSUE_NUMBER /absolute/path/to/scratch/revised.md
```

The revised article will be sent by the 09:00 GitHub email job. Do not send a
second email from the marketing app.

### `wait_for_review`, `wait_for_pr`, or `wait_for_merge`

Exit successfully. Do not create another article.

## 16:05 approved-PR job

Run:

```sh
npm run blog:open-approved-pr
```

This command is idempotent. It opens a PR only for the exact commit approved by
the configured reviewer. It closes the review issue after the PR exists. The
reviewer still decides whether to merge it.

## Failure behavior

Leave the current review state intact. Do not replace a failed draft with a
weaker article. Do not retry in a tight loop. Record the command error in the
marketing app and wait for the next scheduled run or a manual retry.
