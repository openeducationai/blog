---
title: "Schedule reviews from recall risk, not a fixed calendar"
description: "A spaced-review system can estimate each memory's strength, choose a recall target, and schedule practice before that memory is likely to fail."
pubDate: 2026-09-27
---

A learning app should schedule each review from recall risk. A fixed calendar cannot tell which memory is fading now.

This changes the job of a practice system. It stops asking, “Which chapter comes next?” Instead, it asks, “Which answer is this learner close to forgetting?” The system estimates that risk after every attempt. It then brings the item back when recall is useful but still possible.

The result is a small prediction loop. It can reduce easy repetition while protecting fragile memories.

## Fixed gaps ignore the learner

Imagine that every new item returns after one day, then three days, then seven. This schedule is simple. It also treats every learner and every item alike.

One student may remember a familiar term for weeks. Another may lose an unfamiliar term by tomorrow. Repeating both on the same dates wastes time on one and arrives late for the other.

Retrieval itself matters here. In [two experiments with prose passages](https://pubmed.ncbi.nlm.nih.gov/16507066/), restudying helped more on a test after five minutes. Retrieval practice produced better retention after two days and one week. A review should therefore require an answer before revealing it. Simply showing the page again gives the scheduler weaker evidence and the learner less retrieval practice.

Timing is the second problem. A useful review happens after some forgetting has occurred. Too early, and the answer needs little effort. Too late, and the learner repeatedly fails. The right gap depends on the current memory.

## Turn each answer into a memory estimate

A practical scheduler can keep one memory state for each learner-item pair. The state needs a last review time and an estimate of memory strength. It may also include past successes, failures, and item difficulty.

One clear version uses a memory’s half-life. Half-life means the time until estimated recall falls to 50 percent. The [half-life regression model](https://aclanthology.org/P16-1174/) represents recall probability as:

`p = 2^(-d/h)`

Here, `d` is time since review. The value `h` is the estimated half-life. If ten days have passed for a memory with a ten-day half-life, predicted recall is 50 percent.

The product then chooses a target recall probability, `r`. Solving the same equation gives the next gap:

`d = -h × log2(r)`

This target is a policy choice. A higher target causes earlier reviews and more work. Anki’s [official FSRS guidance](https://docs.ankiweb.net/deck-options.html#fsrs) uses 90 percent as its default. It warns that workload rises quickly as the target approaches 100 percent.

After the learner answers, the model updates the memory state. A correct answer usually supports a longer next gap. A failure supports a shorter one. Duolingo’s [released learning-trace format](https://github.com/duolingo/halflife-regression) shows the minimum useful evidence. It records elapsed time, earlier exposures, earlier correct answers, and the new outcome.

Newer schedulers use different curves and state names. FSRS tracks stability, difficulty, and retrievability. Its [technical specification](https://github.com/open-spaced-repetition/awesome-fsrs/wiki/The-Algorithm) still follows the same loop. Estimate recall, observe an answer, update the state, then calculate another interval.

## Follow one biology memory

Suppose a learner studies this prompt: “Which plant tissue carries water upward from the roots?” The expected answer is “xylem.”

Assume the scheduler gives this new memory a ten-day half-life. This number is illustrative, not a measured biological constant. The product chooses an 80 percent recall target. The formula schedules the next attempt after about 3.2 days.

On day three, the app hides the label on a plant diagram. The learner types “xylem” without a hint. That success arrives with useful context. The system knows the item, elapsed time, prompt form, and outcome.

Suppose the update raises the estimated half-life to 30 days. The same 80 percent target now produces a gap of about 9.7 days. A later success can stretch the interval again.

A failure takes the other path. The app shows corrective feedback and records that the earlier estimate was too optimistic. The item returns sooner. Other well-remembered items do not need to follow it.

This is the key advantage over a fixed sequence. The calendar emerges from evidence about one memory. It is not assigned to the whole class in advance.

## Where the prediction breaks

The model never sees memory directly. It sees answers. A lucky guess can look like knowledge. A vague prompt can make knowledge look absent. Hints and inconsistent self-ratings also corrupt the outcome.

This problem is visible in deployed tools. Anki warns that marking a forgotten card “Hard” instead of “Again” can create unreasonable intervals. Its manual also says personalized parameters need several hundred reviews. New learners therefore face a cold start with little individual data.

More features do not always solve the problem. Duolingo’s half-life study added item-specific language features. Some overfit and made certain words appear to decay too quickly. Learners complained, and a simpler variant performed better in a later production experiment.

There is also no single best interval pattern. A [four-week vocabulary experiment](https://pubmed.ncbi.nlm.nih.gov/24744260/) compared expanding and equal gaps. Both produced similar recall on an eight-week test. Expanding gaps kept average recall higher during training. The best schedule therefore depends on whether the goal is steady access, a distant test, or limited study time.

Finally, recalling one label is not the same as understanding a system. A learner may retrieve “xylem” yet fail to explain water movement in a new setting. Memory scheduling should handle durable access to facts and steps. Transfer questions must still test whether those pieces work together.

## Measure predictions before adding complexity

Builders can start with a small event log and a simple forgetting curve. The first useful metric is calibration. Among attempts predicted at 80 percent recall, roughly 80 of every 100 should succeed.

Check calibration by item type and by time gap. Also track review minutes at each target. These measurements reveal whether the scheduler saves work or only moves it around.

Then test learning outside the repeated prompt. Use a delayed question with a new diagram or a changed context. That separates durable access from memorizing the card.

The useful design principle is precise: treat review timing as a prediction problem. Estimate which memory is becoming fragile, ask for retrieval, and learn from the answer. The schedule can then spend a learner’s limited time where one more attempt has the most value.

## Sources

- [A Trainable Spaced Repetition Model for Language Learning, ACL Anthology](https://aclanthology.org/P16-1174/)
- [Duolingo half-life regression code and learning-trace data](https://github.com/duolingo/halflife-regression)
- [Free Spaced Repetition Scheduler algorithm specification](https://github.com/open-spaced-repetition/awesome-fsrs/wiki/The-Algorithm)
- [Anki manual: FSRS and desired retention](https://docs.ankiweb.net/deck-options.html#fsrs)
- [Test-enhanced learning: taking memory tests improves long-term retention](https://pubmed.ncbi.nlm.nih.gov/16507066/)
- [Retrieval practice over the long term: expanding or equal intervals](https://pubmed.ncbi.nlm.nih.gov/24744260/)
