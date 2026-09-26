# Daily blog automation

This automation prepares one researched technical article each day. It never
publishes directly.

## Daily flow

1. At 05:45 IST, GitHub Actions checks for an open daily-blog pull request.
2. If none exists, the research pass searches the curated 100-source registry.
3. A separate writing pass produces one focused Markdown article.
4. The local quality gate checks length, sentence structure, sourcing, and
   banned AI-style language.
5. Astro must build successfully before a review pull request is opened.
6. At 09:00 IST, GitHub emails the reviewer the full article in a pull-request
   comment.
7. The reviewer can reply to that email with `APPROVE`, `SKIP`, or normal
   feedback. GitHub adds the reply to the pull request.
8. `APPROVE` reruns the checks and merges the post into `main`. `SKIP` closes
   the draft. Normal feedback revises the same draft and emails it again.

If a pull request is still open the next morning, the system does not create a
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

GitHub Actions must be allowed to create and approve pull requests under:

`Settings → Actions → General → Workflow permissions`

Select **Read and write permissions** and enable pull-request creation.

The reviewer must enable GitHub email notifications for participating and
review-requested pull requests. A reply to a GitHub notification becomes a
comment on that pull request.

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

- `APPROVE` validates and merges the post.
- `SKIP` closes the post without publishing it.
- Any other reply is treated as editorial feedback. The article is revised on
  the same branch, checked again, and sent back for another review.

Silence never publishes a post. Only the configured GitHub reviewer can issue
these commands.

## Editorial controls

`EDITORIAL_GUIDE.md` is injected into every writing and revision pass. The
local checker then enforces the measurable rules. A model cannot open a pull
request by ignoring those rules.

`sources.json` is a discovery allowlist. It includes product engineering,
learning science, academic venues, standards, core AI research, and Indian
education infrastructure. It is inspiration and evidence, not a corpus to
copy. Articles must link to their sources and form an original argument.
