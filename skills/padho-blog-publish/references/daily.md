# Daily PCM publication — seven-day trial

Use this mode only for the requested daily run or an explicitly requested queue/research task. A routine article edit uses SKILL.md's normal workflow. Start by reading `editorial/config.json`, `editorial/memory.md`, `editorial/history.json`, `editorial/queue.json`, `editorial/figma-pages.json` and the current dated run record if one exists.

## Scope and stopping condition

The owner approved three researched student articles daily (one Physics, Chemistry, Maths), a rolling Figma review file, scoped deployment and main synchronization. The trial is 11–17 November 2026, starts each morning at 07:00 Asia/Kolkata, and must not continue without a new owner decision. Read the actual clock and config; do not backdate posts or make up missed days. Stop if the date is outside the enabled trial. The local Mac must be awake, online, signed in and have usable Git, GCP and Figma access. An unavailable credential is a failed run, not permission to bypass access controls.

The scheduled runner uses the existing main checkout, a process lock and one attempt per date. Never run the old SES/PR workflow, send mail, create branches/worktrees/clones, change root marketing files or extend the trial. Preserve dirty work; if its ownership is unclear, stop and report instead of stashing/resetting it. Do not replace a failed article with filler to satisfy the cadence.

## Research and select

1. Read all titles, learning objectives, concept keys, examples and PYQ IDs in history, including archived and staged entries. Compare meanings as well as spellings. A renamed title teaching the same idea is a duplicate. Prefer improving an existing permanent URL when the learning objective is already covered; daily new-article quota does not justify a duplicate.
2. Inspect pending records from a previous interrupted attempt. Reconcile source, Git and live URLs first. Resume those articles, rather than inventing another set. One subject/date has at most one new article. A publication whose Figma copy failed needs a Figma repair, not another deployment or article.
3. Use the latest official JEE Main syllabus, official question papers and final answer keys, plus NCERT or another authoritative educational source for explanations. Open sources and inspect actual questions; search snippets, coaching summaries and memory-based papers cannot establish a verified PYQ. Useful starting points: https://jeemain.nta.nic.in/ and https://ncert.nic.in/textbook.php . Use https://jeeadv.ac.in/archive.html only when explicitly distinguishing Advanced questions.
4. Build a research queue of narrow student questions. Aim to have the next seven days' briefs ready, extending verified coverage over runs; completing 21 briefs is not a reason to weaken today's three articles. Rank by recurrence and marks in an explicitly identified corpus, common misconception and prerequisite value. For five-year analysis, include all available shifts or state missing coverage; compare rates per paper/subject and avoid double-counting multi-concept questions. Never invent percentages, search volume or question IDs. Treat historic frequency as evidence, not a forecast.
5. Each ready topic in `editorial/queue.json` needs: `id`, `category`, `chapter`, stable `conceptKey`, `question`, `learningObjective`, `example`, `status: ready`, `briefPath`, `rationale`, `closestPriorSlugs`, and `difference`. Store the researched brief under `editorial/research/<id>.json`. A brief needs official syllabus and source links, examined corpus/coverage, verified question IDs, the priority rationale and the answer/solution verification. Label tentative ideas `needs_research`; never publish one directly.
6. Select exactly one ready topic per subject, with a sensible prerequisite order and enough variety. Recheck history immediately before creating source. User feedback and actual search queries can refine the queue; unavailable analytics must remain unavailable rather than inferred.

## Write and verify

Use the existing short, lucid articles as the teaching standard, allowing enough extra space for worked questions. Begin with the question and the scenario; teach one idea with one clear example and a useful original visual. Use existing KeyIdea, ReadingTerm, reading styles and figure components. Keep controls and diagrams unambiguous, usable on phones, keyboard accessible and readable without JavaScript or motion.

The owner found the earlier wording difficult even when they knew the subject. Use familiar words and a patient teaching voice. Carry the same concrete subject from one sentence to the next, state what “it”, “this” and “they” refer to when ambiguous, and explain the missing reasoning between steps. One sentence should not require the reader to decode several new ideas. Short sentences alone do not establish readability: make the paragraph flow naturally. Allow roughly 10% extra explanatory space when useful. Read the full draft aloud in sequence and paraphrase each paragraph in ordinary language; rewrite any paragraph that still requires rereading. Keep technical precision without relying on unexplained terms or compressed arguments.

**Show the target exam question in the opening, before the first lesson section.** Say plainly, “We’ll learn how to solve this question,” or an equally natural sentence. Give the readable question (or clearly labelled paraphrase/adaptation plus exact source), state any prerequisites, and connect each teaching step to it. Return to the same question with its worked solution at the end. The target must be one of the verified PYQs; record `targetQuestionId` and the verbatim plain-text opening `targetQuestionText` in history. Do not bury the learning goal in internal metadata or reveal the answer before the explanation.

End with two or three verified past questions that the article prepares the student to solve. Record the exact exam/year/date/shift/paper/question ID and official paper link, verify against the final key, and independently work the solution. Put a hint and a clear solution in existing disclosure styling. Verify units, signs, assumptions, boundary cases and diagrams. If adapted, label it “Adapted from …”; never call an invented exercise a PYQ. Respect source licensing: where verbatim reproduction is not permitted, link the exact official question and provide an original explanation, clearly marking any paraphrase. This still supplies an identifiable past question.

Before publication, read the article as a student: can the opening explain the purpose, can each paragraph be understood without jumping scenarios, and can the final questions be solved from the explanation plus stated prerequisites? Correct ambiguity before proceeding. Do not claim a human or independent review unless it actually occurred.

## Durable records and checks

Create one history entry per new article (never overwrite unrelated entries):

```json
{
  "slug": "permanent-slug",
  "title": "A simple student question?",
  "category": "physics",
  "chapter": "chapter-slug",
  "conceptKey": "physics/chapter-slug/specific-learning-objective",
  "learningObjective": "The precise idea the student will understand",
  "example": "The one situation used to explain it",
  "sourcePath": "src/content/blog/permanent-slug.mdx",
  "sourceSha256": "SHA256 of the exact source bytes",
  "url": "https://padho.ai/blog/permanent-slug/",
  "publishedAt": "actual ISO timestamp with timezone",
  "mode": "daily",
  "status": "staged",
  "targetQuestionId": "official exam + year + date/shift/paper + question ID",
  "targetQuestionText": "The student-facing question shown before the first lesson heading",
  "briefPath": "editorial/research/topic-id.json",
  "pyqs": [
    {
      "id": "official exam + year + date/shift/paper + question ID",
      "sourceUrl": "https://official-source.example/paper.pdf",
      "answerKeyUrl": "https://official-source.example/final-key.pdf",
      "locator": "Question ID/page and shift",
      "answer": "Verified answer",
      "verifiedAt": "actual ISO timestamp",
      "adapted": false
    }
  ],
  "review": {
    "sourceSha256": "same exact source hash",
    "reviewedAt": "actual ISO timestamp",
    "checks": {
      "science": true,
      "readability": true,
      "pyqSolutions": true,
      "visuals": true
    },
    "notes": "Concrete observations from the completed review"
  }
}
```

The example has one PYQ only to show its shape; a daily article requires two or three. `status` becomes `published` only after the live page is verified. Keep failed/staged entries to prevent retries from duplicating them. Source changes invalidate the recorded review hash. An ordinary one-off article can use `mode: manual`; that does not let a scheduled daily article bypass the daily checks.

Run `npm run check:editorial`, `npm run build`, `npm run check:search` and appropriate tests. Inspect each real article on desktop and phone and exercise its controls. Run the actual Astro app, never a fixture/demo. Review the diff, commit only this run's files to main and push. Publish the verified build via `scripts/publish.mjs`, then run live search checks and verify article content, images and links.

Write `editorial/runs/YYYY-MM-DD.json` with `date`, status (`published`, `partial`, `failed`), exact `articleSlugs`, source commit, per-step outcomes, live verification evidence, Figma page/frame IDs and any error. Mark successful history entries published, queue entries published, and update memory with evidence-backed lessons. Commit and push the record update as well. A failed upload, push or Figma update must remain visible; never mark the entire run successful after a partial outcome. If a run is already published, do no further publishing.

## Figma review copy

Use [figma.md](figma.md) to update the dedicated Blogs file. Each date has one generated page containing all three articles at desktop and phone widths, with editable text and native design elements. Save page/frame IDs in `editorial/figma-pages.json`. Keep all student copy identical to the article. Figma is a review copy; the repository remains the content source.

Re-read Figma comments before each run when an available supported tool exposes them. Preserve actionable feedback in the internal record before an old generated page is removed. If comments cannot be accessed, explicitly record that limitation rather than claiming they were checked.

After successful creation and verification, plan retention with `node scripts/blog-editorial.mjs prune-figma YYYY-MM-DD`. Delete only registered generated pages whose dates are before the start of the latest seven calendar dates. Match the configured file key and recorded page ID/name again before deleting. Update `removedPages` with the deletion date; preserve article history and feedback. Never delete a file, unregistered page, Core Views screen, design-system component or website article.

## Trial review

On the final trial run, report all 21 article URLs actually published (or exact gaps), any repeats or corrections, research provenance, readability feedback and deployment/Figma failures. Distinguish observations from hypotheses. The runner stops after 17 November; do not extend it or schedule continued work automatically. The owner decides after reviewing the week's quality.
