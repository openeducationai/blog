# Daily blog automation

The Padho marketing Mac agent researches and writes one technical education
article at a time. GitHub handles email review and approval. Nothing publishes
without a manual pull request merge.

## Daily flow

1. At 05:45 IST, the marketing app runs `npm run blog:agent:state` in this
   repository.
2. When the result is `generate`, its Codex specialist researches and writes a
   draft. It then calls `npm run blog:submit-draft -- /absolute/path/draft.md`.
3. When the result is `revise`, the state includes the current article and the
   reviewer's queued feedback. The specialist revises that draft and calls
   `npm run blog:submit-revision -- ISSUE_NUMBER /absolute/path/revised.md`.
4. At 09:00 IST, GitHub emails the reviewer the full current article through a
   GitHub issue comment.
5. The reviewer replies `APPROVE`, `SKIP`, or writes normal feedback. Normal
   feedback is queued for the next 05:45 marketing-agent run.
6. At 16:05 IST, the marketing app runs `npm run blog:open-approved-pr`.
7. The reviewer checks and manually merges the pull request.

Only one daily blog may be in review or awaiting merge. Silence never opens a
pull request. The automation does not modify the frontend repository, restart
the blog service, merge a pull request, or publish directly.

## Authentication

The writing specialist uses the marketing app's existing Codex sign-in. There
is no `OPENAI_API_KEY` in this repository and no AI call in GitHub Actions.

The Mac needs `gh` installed and authenticated as a user who can create
branches, issues, and pull requests in `openeducationai/blog`. No reusable
GitHub token is stored in repository secrets.

Set one repository variable:

- `BLOG_REVIEWER`: the GitHub username allowed to approve, skip, or request a
  revision. Replies from other accounts are ignored.

The reviewer must enable GitHub email notifications for participating and
mentioned issues. Email replies go to GitHub's unique thread address, not to
`reach@padho.ai`.

## Safety boundaries

The submission commands use a fresh temporary clone. They do not write into
the developer's current checkout. Before they push, they require:

- a single new Markdown post under `src/content/blog/`;
- a valid Padho article filename and frontmatter;
- the local style and sourcing checks to pass;
- a successful Astro production build;
- no other review issue or daily-blog pull request to be open.

A revision can change only the existing draft. It must keep the publication
date and cannot add source links that were absent from the reviewed version.

Approval records the exact branch commit. The PR command refuses to continue
if that commit changes or if the branch contains anything except one new blog
post.

## Email replies

The first non-empty line controls the review:

- `APPROVE` validates the post and records its exact commit for the 16:05 PR
  run.
- `SKIP` closes the review and deletes its branch.
- Any other text is stored as revision feedback for the next 05:45 run.

Approval is rejected while revision feedback is waiting. If feedback arrives
after 05:45, it is handled the following morning and the new version is mailed
at 09:00.

## Manual commands

Inspect the current state:

```sh
npm run blog:agent:state
```

Validate a draft without submitting it:

```sh
npm run blog:check -- /absolute/path/draft.md
```

Submit a finished draft or revision:

```sh
npm run blog:submit-draft -- /absolute/path/draft.md
npm run blog:submit-revision -- 123 /absolute/path/revised.md
```

Check once for an approved draft and safely open its PR:

```sh
npm run blog:open-approved-pr
```

The email workflow supports `workflow_dispatch`, so the 09:00 message can also
be sent manually from the GitHub Actions page.

## Editorial controls

`EDITORIAL_GUIDE.md` is the writing contract. `sources.json` contains 100
starting points for discovery. They are inspiration and evidence, not text to
copy. The specialist must still open the original sources, check each claim,
compare the idea with existing Padho posts, and write a new argument.
