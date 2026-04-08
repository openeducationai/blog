---
title: 'The classroom inside the notebook — padho.ai'
description: 'How we designed a shared thinking space where teacher and student solve problems together—and why every design decision is rooted in how learning actually happens.'
pubDate: 2026-04-08
---

<div class="notebook-article">

<p class="nb-deck">How we designed a shared thinking space where teacher and student solve problems together and why every design decision is rooted in how learning actually happens.</p>

<p>Shawn opened a maths problem. Read it once. Read it again. Then typed two words into the coach panel: <em>"Guide me."</em></p>
<p>The coach responded immediately. "No worries at all, Shawn. We can definitely break this problem down together. First, let us get the problem statement on the board. What information do you think is important here?"</p>
<p>What happened next is the product we have spent the last six months building and this is the story of every design decision behind it.</p>
<p>Most edtech products separate the lesson from the work. You watch a video, then close it and open a blank page. The explanation and the solving never happen in the same place at the same time.</p>
<p>We wanted to build something different. An interface where the teacher is present in the room while you think. Not a pre-recorded voice, not a solution engine. A live coach who watches you work, asks questions when you get stuck, and writes on the same surface you are writing on.</p>

<div class="nb-divider"></div>

<div class="nb-section-num">01 — The shared notebook</div>
<h2>One surface. Two hands.</h2>

<figure class="nb-figure">
  <img
    src="https://res.cloudinary.com/ddgqbftjb/image/upload/v1775595981/opening_fymew4.png"
    alt="Blank notebook canvas with “Guide me” just sent to the coach"
    loading="lazy"
    decoding="async"
  />
  <figcaption>The blank canvas with “Guide me” just sent — the moment before the coach writes on the board.</figcaption>
</figure>

<p>The notebook in padho.ai is a single, shared canvas and both the PadhoAI Coach and the student write on it.</p>
<p>Shawn typed "Words and hours." The coach responded, then put the setup directly on the board. A section heading appeared in violet: <em>What is a Rate?</em> A definition followed. Then a formula. Then a second section, <em>Samantha's Writing Rate,</em> with the values from the problem laid out, the equation set up, and a blank input waiting for Shawn to fill in the answer.</p>
<p>The dot grid underneath is structure without imposition. Enough to align handwriting and diagrams, not enough to impose a format. Students can type, draw, or bring in an image. The notebook welcomes every mode of thinking.</p>

<div class="nb-intent">
  <div class="nb-intent-label">Design intent</div>
  <p>The teacher structuring the problem on the shared canvas does something a chat bubble never could. It externalises the thinking process. The student does not receive a hint; they see the problem being reorganised. Structure itself becomes the instruction.</p>
</div>

<div class="nb-divider"></div>

<div class="nb-section-num">02 — The coach</div>
<h2>A teacher who never gives the answer</h2>

<p>The PadhoAI Coach panel is persistent. Everything said between coach and student stays there. The entire conversation is the context for what comes next. The coach remembers that Shawn said "Words and hours." It builds on that. It remembers.</p>
<p>Notice what the coach put on the board. The formula. The given values. A blank input with a question mark. Everything Shawn needs to arrive at the answer himself. The coach never typed "150 words per hour." It set up the conditions for Shawn to get there. The chat narrates, the notebook shows.</p>

<figure class="nb-figure">
  <img
    src="https://res.cloudinary.com/ddgqbftjb/image/upload/v1775595987/Screenshot_2026-04-08_at_2.24.30_AM_rrcwsm.png"
    alt="Notebook with the rate problem, formula, and Shawn’s answer filled in"
    loading="lazy"
    decoding="async"
  />
  <figcaption>The filled canvas with the rate problem, formula, and Shawn’s answer — the payoff of the shared notebook idea.</figcaption>
</figure>

<div class="nb-intent">
  <div class="nb-intent-label">Design intent</div>
  <p>The conversation never resets. Every exchange is context for the next question.</p>
</div>

<div class="nb-divider"></div>

<div class="nb-section-num">03 — Context chips</div>
<h2>Nudges that force thinking, not shortcuts to answers</h2>

<p>Above the input field is a row of chips. They change based on where the student is in the problem. At the start of a fresh problem, they look like this:</p>

<div class="nb-chip-tray">
  <div class="nb-chips">
    <span class="nb-chip">I need a hint</span>
    <span class="nb-chip">Let's start</span>
    <span class="nb-chip nb-chip-active">What's a rate?</span>
    <span class="nb-chip">I need help</span>
    <span class="nb-chip">Check my work</span>
  </div>
</div>

<p>After the coach has written the given values on the board and the student has started to engage, the chips shift:</p>

<div class="nb-chip-tray">
  <div class="nb-chips">
    <span class="nb-chip">Okay</span>
    <span class="nb-chip">Show me how</span>
    <span class="nb-chip nb-chip-active">I need help</span>
    <span class="nb-chip">Check my work</span>
  </div>
</div>

<p>Each one triggers a different coaching response. "What's a rate?" opens a concept explanation. "Check my work" triggers evaluation with the notebook content as context. "I need a hint" gives the smallest possible push, not the answer.</p>
<p>The free text input, labelled "Ask anything about this problem..." with a microphone icon, is the escape valve. Chips handle the common cases. Free text handles everything else. Half-formed thoughts, confusions that do not fit a category, speaking out loud what you are thinking. The microphone means students can talk through their reasoning the way they would with a human tutor sitting next to them.</p>

<div class="nb-intent">
  <div class="nb-intent-label">Design intent</div>
  <p>Chips reduce the activation energy for engagement without removing the thinking. A blank input field can feel intimidating when stuck. Chips say: here are some directions you can go. The student still chooses. The coach still responds to that choice, not to a pre-set path.</p>
</div>

<div class="nb-divider"></div>

<div class="nb-section-num">04 — Write on Phone</div>
<h2 class="nb-h2-icon">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="17" r="1" fill="currentColor"/></svg>
  Your phone as a pen
</h2>

<p>Just tap this button in the top bar:</p>

<div class="nb-wop-button">
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="17" r="0.8" fill="currentColor"/></svg>
  Write on Phone
</div>

<p>Connect your smartphone and your phone screen becomes a live drawing surface for the notebook. No stylus required. No special hardware. The phone sitting next to you on the desk becomes the input device. For students who think by writing, working through a ratio problem with actual fractions or sketching a geometry diagram, this returns the physical act of handwriting to a digital workspace.</p>

<div class="nb-intent">
  <div class="nb-intent-label">Design intent</div>
  <p>Most Indian students already hold a smartphone while studying. Write on Phone does not introduce a new device into the workflow. It integrates the one already in their hand. The setup friction is near-zero.</p>
</div>

<div class="nb-divider"></div>

<div class="nb-pullquote">"The best thinking interface disappears. It becomes the surface, not the subject."</div>

<p>These design decisions are ongoing. If you are a designer, educator, or student with thoughts on how a learning interface should feel, we would love to hear from you at <a href="mailto:reach@padho.ai">reach@padho.ai</a></p>
<p class="nb-cta">Try padho.ai at <a href="https://learn.padho.ai">learn.padho.ai</a></p>

</div>
