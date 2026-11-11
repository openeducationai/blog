# PCM publishing trial

The owner approved one Physics, Chemistry and Maths article per morning, starting
at **07:00 Asia/Kolkata, 11–17 November 2026**. JEE Main is the primary audience.
Publication finishes after research and verification; 07:00 is the start time,
not a promise that all three articles are live at that minute. The trial does not
continue without a new owner decision.

Invoke `$padho-blog-publish` with the daily mode. Its
[daily workflow](../skills/padho-blog-publish/references/daily.md) is the editorial
contract. The opening shows the question the student will learn to solve, and
the ending returns to it with a worked solution and verified PYQs. Readability
and factual accuracy take priority over filling a quota.

## Persistent records

- `history.json`: permanent article URLs, concept keys, learning objectives,
  examples, sources, PYQ IDs, source/review hashes and publication state. Edits
  retain earlier hashes; archived articles still participate in duplicate checks.
- `queue.json` and `research/*.json`: narrow topics, explicit corpus coverage,
  syllabus, source evidence, verified questions, selection rationale and status.
  The initial queue is empty; the first run researches before marking topics ready.
- `runs/YYYY-MM-DD.json`: source commit, actual article URLs, release outcomes,
  checks, Figma IDs and any failure. Do not claim success without evidence.
- `memory.md`: dated owner decisions and compact lessons backed by run records.
  Distil verified lessons; do not copy transcripts or secrets into memory.
- `figma-pages.json`: generated daily page IDs, article frame IDs and deletion
  history for the dedicated Blogs file. Keep the latest seven calendar dates;
  never delete website articles or unregistered Figma pages.

The memory approach borrows the useful pattern from
[Anthropic's dreaming example](https://platform.claude.com/cookbook/managed-agents-cma-dreaming-with-a-dynamic-workflow):
future runs read compact, maintained lessons from earlier work. For this trial,
Git-versioned records supply the evidence. No Claude API service or transcript
export is required.

## Local schedule

The installed LaunchAgent is `ai.padho.blog-pcm-trial`. It invokes
`scripts/daily-blog-run.py`, which uses `codex exec --approve-for-me` in the
existing main checkout. The current Codex model/configuration is inherited.
No bypass-sandbox flag, new branch, worktree or clone is used. The Mac must be
awake and online with its user logged in; Codex, Figma, Git and Google Cloud
credentials must remain valid. Keep its system timezone set to Asia/Kolkata.

The runner holds a process lock, checks clean main, fetches and fast-forwards
only when safe, checks the authoring tools, and permits one attempt per date.
Research, writing, verification and Figma run before deployment. Cloud credentials
are checked only at release time; a release failure retains the ready articles,
Figma copies and dated stage checkpoints. Missed mornings are not backfilled after noon. Failures are
retained for review and are not retried in a loop.

```sh
npm run blog:daily:status
npm run blog:daily:check
python3 scripts/daily-blog-run.py --check --at 2026-11-11T07:00:00+05:30
python3 scripts/install-daily-blog.py            # print the exact seven-date schedule
python3 scripts/install-daily-blog.py --install  # install/load; does not run it now
python3 scripts/install-daily-blog.py --remove   # remove only this trial schedule
```

Local logs: `~/Library/Logs/PadhoBlogTrial/` and `.daily-blog/pcm/`. Agent event
logs are private local files excluded from Git. If an attempt failed, inspect
them and the dated tracked run record; repair or resume the same articles through
the skill. Do not delete the attempt marker just to create another set of posts.

The old marketing-agent generation/PR commands are disabled by
`legacyWorkflowEnabled: false`. The old SES review email workflow is manual-only.
No messages or emails are part of this trial.

## Checks

`npm run check:editorial` validates coverage of source articles, unique concept
keys and daily slots, exact review hashes, target-question setup and recorded
PYQ evidence. It cannot establish semantic novelty, scientific correctness or
readability by itself; the skill requires those reviews against real sources
and rendered pages. The publisher runs it before uploading any object.

`npm test` includes duplicate, provenance, target-question and retention tests.
`npm run test:daily` checks date, timezone, retry and scheduler boundaries.
Run `npm run build`, `npm run check:search` and live checks for every release.

At the trial's end, `trial-review.md` records actual output, gaps, corrections and
owner feedback. Continue only after the owner decides.
