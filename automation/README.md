# Daily blog automation

This automation prepares one researched technical article each day. It never
publishes directly.

## Daily flow

1. At 05:45 IST, GitHub Actions checks for an open daily-blog review issue.
2. If none exists, the research pass searches the curated 100-source registry.
3. A separate writing pass produces one focused Markdown article.
4. The local quality gate checks length, sentence structure, sourcing, and
   banned AI-style language.
5. Astro must build successfully before a review branch and GitHub issue are
   created.
6. At 09:00 IST, GitHub emails the reviewer the full article in an issue
   comment.
7. The reviewer can reply to that email with `APPROVE`, `SKIP`, or normal
   feedback. GitHub adds the reply to the review issue.
8. `APPROVE` reruns the checks and marks the exact approved commit as ready for
   a pull request. `SKIP` closes the review and deletes its branch. Normal
   feedback revises the same branch and emails the new article again.
9. The Padho marketing app runs `npm run blog:open-approved-pr`. That command
   opens a pull request only for the exact approved commit. The reviewer still
   merges that pull request manually.

If a review issue is still open the next morning, the system does not create a
second article. The 09:00 GitHub email sends the pending draft again.

The workflow does not modify the frontend repository. It does not restart the
blog deployment. Deployment behavior stays unchanged while the initial rollout
is observed.

## Required GitHub configuration

Add this repository secret to `openeducationai/blog`:

- `OPENAI_API_KEY`: project API key used for research and writing.

Repository variables:

- `BLOG_REVIEWER`: the GitHub username allowed to approve, skip, or revise a
  daily blog. Replies from every other account are ignored.

- `OPENAI_MODEL`: defaults to `gpt-6-astra`.
- `OPENAI_REASONING_EFFORT`: defaults to `high`.

The reviewer must enable GitHub email notifications for participating and
mentioned issues. A reply to a GitHub notification becomes a comment on that
issue. These replies go to GitHub's thread address, not to `reach@padho.ai`.

GitHub Actions does not create or merge pull requests. This avoids the
organization setting that blocks Actions-created pull requests.

## Marketing app integration

Run this command from the blog repository once each day at 16:05 Asia/Kolkata:

```sh
npm run blog:open-approved-pr
```

The command is idempotent. With no approved draft, it exits successfully and
does nothing. With an approved draft, it verifies all of the following before
opening a pull request:

- both review and approval labels are present;
- the approval record names the current branch commit exactly;
- the branch differs from `main` by one added blog Markdown file only;
- no pull request already exists for the branch.

The Mac process must have `gh` installed and authenticated as a user who may
open pull requests in `openeducationai/blog`. It does not need a reusable
GitHub token stored in repository secrets.

If approval arrives after 16:05, run the same command manually or let the next
day's scheduled check pick it up.

## Manual checks

Generate a draft for a chosen topic:

```sh
BLOG_TOPIC="How next-item correctness changes AI tutor evaluation" npm run blog:draft
```

Check a post:

```sh
npm run blog:check -- src/content/blog/example.md
```

Both scheduled workflows also support `workflow_dispatch`, so they can be run
manually from the GitHub Actions page.

## Email replies

The first non-empty line controls the review:

- `APPROVE` validates the post and marks its exact commit ready for a PR.
- `SKIP` closes the post without publishing it.
- Any other reply is treated as editorial feedback. The article is revised on
  the same branch, checked again, and sent back for another review.

Silence never creates a PR or publishes a post. Only the configured GitHub
reviewer can issue these commands. Publishing still requires a manual PR merge.

## Editorial controls

`EDITORIAL_GUIDE.md` is injected into every writing and revision pass. The
local checker then enforces the measurable rules. A model cannot open a pull
request by ignoring those rules.

`sources.json` is a discovery allowlist. It includes product engineering,
learning science, academic venues, standards, core AI research, and Indian
education infrastructure. It is inspiration and evidence, not a corpus to
copy. Articles must link to their sources and form an original argument.
