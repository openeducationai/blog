---
title: "Bring a practice question back when a learner starts to forget"
description: "A review schedule should follow each learner's answers, so a question returns when it is becoming hard to remember."
pubDate: 2026-09-27
---

A practice question should return when a learner is starting to forget it. It should not follow the same fixed calendar for everyone.

Imagine a student named Asha. She is learning how water moves through a plant. Her practice question asks, “Which plant tissue carries water upward from the roots?” The answer is “xylem.”

We will follow that one question through several reviews. The example is made up, but it shows how a useful practice system can work.

## Start with an answer, not a timetable

On Monday, Asha studies a labelled plant diagram. The app then hides the label and asks the question. Asha types “xylem” without a hint.

Many practice systems would now use a fixed plan. Every new question might return after one day, three days, and seven days. That plan is easy to run. Yet it ignores what happened when Asha answered.

Asha may know “xylem” because she learned it last year. Another student may have met the word for the first time. Asking both students on the same days gives one unnecessary work. It may reach the other too late.

The app should first let Asha try to answer. Showing the labelled diagram again would be easier, but it would reveal less. A [study using prose passages](https://pubmed.ncbi.nlm.nih.gov/16507066/) found that rereading helped more on a test five minutes later. Trying to remember produced better results after two days and one week.

That does not mean every question must feel hard. It means the attempt matters. Asha’s answer gives the app useful evidence and gives Asha useful practice.

## Let each answer change the next date

The app keeps a short record for this one question. It notes when Asha last saw it, how long she waited, and whether she answered correctly. A [public set of learning records from Duolingo](https://github.com/duolingo/halflife-regression) contains the same basic clues: time passed, earlier practice, earlier correct answers, and the latest result.

On Thursday, the question returns. The label is still hidden. Asha pauses, pictures the diagram, and types “xylem.”

That correct answer came after a gap. It tells the app more than Monday’s answer did. The question can now wait longer before returning.

The app does not need to know exactly what is happening inside Asha’s mind. It only needs to make a reasonable next choice from her earlier answers. A [Duolingo research paper](https://aclanthology.org/P16-1174/) describes this kind of loop. The system uses past practice to choose a later review, then learns from the next result.

On the following review, Asha answers correctly again. The next gap grows once more. Questions she finds easy stop taking up so much of her study time.

## Bring the question back sooner after a mistake

Two weeks later, the same question returns with a new plant diagram. This time Asha types “phloem.”

The app shows the correct answer and explains the mix-up. Xylem carries water upward from the roots.

The wrong answer tells the app that its last wait was too long for this question. “Xylem” should return sooner. Asha’s other well-remembered questions do not need to move with it.

When the question returns a few days later, Asha answers correctly. The gap can grow again, but carefully. Her schedule now comes from her own pattern of answers.

This is the whole mechanism. Ask without revealing the answer. Record the result and the wait. After a correct answer, try a longer wait. After a mistake, use a shorter one.

There is no single perfect pattern of gaps. A [four-week vocabulary study](https://pubmed.ncbi.nlm.nih.gov/24744260/) compared gaps that grew with gaps that stayed equal. Both groups had similar results on a test eight weeks later. The growing gaps kept answers more available during practice.

The right choice therefore depends on the goal. Asha may need steady access for weekly lessons. Another learner may be preparing for one distant exam.

## Notice when an answer gives the wrong signal

The app never sees learning directly. It sees Asha’s answer. That answer can mislead it.

Asha might guess correctly. A vague question might make her look wrong even when she understands the idea. A hint could turn a hard question into an easy one. If the app records all these answers in the same way, its future dates will drift.

The learner’s buttons can also cause trouble. [Anki’s official guide](https://docs.ankiweb.net/deck-options.html#fsrs) warns that marking a forgotten card as “Hard” instead of “Again” can produce unreasonable gaps. The guide also says that personal settings need several hundred reviews. A new learner gives the app very little history to use.

There is a deeper limit. Remembering the word “xylem” does not prove that Asha understands water movement in plants. She might still struggle to explain a wilted plant or read a new diagram.

The review schedule can keep a fact available. It cannot replace questions that ask the learner to use that fact in a new situation.

## Check whether the schedule helps

Builders should begin with a simple record, not a complicated system. For each question, save the time, the answer, whether a hint appeared, and the result. Use that history to choose the next date.

Then check the choices. When the app expects about four out of five answers to be correct, are about four out of five actually correct? Check easy and hard question types separately. Check short and long waits separately.

Also count the learner’s practice minutes. A schedule is not useful if it keeps knowledge steady by filling every day with reviews.

Finally, give Asha a delayed question with a changed diagram. That test shows whether she can use “xylem” beyond the exact card she practised.

The useful rule is simple. Let a question return when this learner is starting to forget it. Each answer should help choose the next date.

## Sources

- [Test-enhanced learning: taking memory tests improves long-term retention](https://pubmed.ncbi.nlm.nih.gov/16507066/)
- [Duolingo research on choosing review times from past practice](https://aclanthology.org/P16-1174/)
- [Duolingo public learning records](https://github.com/duolingo/halflife-regression)
- [Anki guide to choosing review gaps](https://docs.ankiweb.net/deck-options.html#fsrs)
- [Retrieval practice over the long term: expanding or equal intervals](https://pubmed.ncbi.nlm.nih.gov/24744260/)
