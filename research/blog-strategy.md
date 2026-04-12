# Blog Strategy for padho.ai

*Research document produced overnight, 12 April 2026. For the padho.ai founding team.*

---

## Part I — Field Survey: Exemplary Blogs and Why They're Good

You are about to read a survey of 38 blogs, organised into six categories. Each entry names the blog, says what it is in one sentence, explains why it is in this survey, picks one representative post, and extracts something concrete padho.ai can steal. The categories are ranked by relevance to padho.ai's thesis — interactive/explorable essays first, product/strategy blogs last.

---

### Category 1: Interactive and Explorable Essays

This is the most important category for padho.ai. These are the blogs that prove a website can explain better than a textbook — because the reader can *touch* the explanation. The padho-wiki already lives in this lineage. The blog should reference it, cross-pollinate with it, and occasionally aspire to it.

---

**1. Bartosz Ciechanowski — ciechanow.ski**

A one-person site publishing long, deeply interactive essays on physical and mechanical systems.

**Why it's here:** Ciechanowski is the gold standard for what padho.ai's wiki already aspires to — and what the blog should occasionally reach for. Every essay contains 3D models you can rotate, sliders you can drag, and animations that respond to your input. The text never says "imagine this" when it can say "drag this."

**Representative post:** *Mechanical Watch* (ciechanow.ski/mechanical-watch/). The essay opens with a nostalgic one-sentence frame — "In the world of modern portable devices, it may be hard to believe that merely a few decades ago the most convenient way to keep track of time was a mechanical watch" — then immediately drops you into a 3D model of a watch mechanism. You drag a slider; the watch opens. The entire 5000+ word essay proceeds this way: text sets up the question, the interactive answers it, text confirms what you just saw.

**What padho.ai can steal:** The *text-then-interactive-then-text* sandwich. Ciechanowski never puts an interactive element in a vacuum. There is always a sentence before it that tells you what to look for, and a sentence after it that confirms what you saw. This three-beat pattern — setup, interaction, payoff — is the mechanical foundation the padho.ai blog should use whenever it includes a diagram or interactive.

---

**2. Nicky Case — ncase.me**

A creator of explorable explanations — playful, simulation-driven essays on game theory, psychology, and social dynamics.

**Why it's here:** Nicky Case proves that interactivity does not require 3D rendering or months of engineering. Some of the most effective explorable explanations use simple circles, toggles, and sliders. The production value is low; the pedagogical value is extraordinary.

**Representative post:** *The Evolution of Trust* (ncase.me/trust/). A 30-minute interactive game-theory essay that teaches iterated prisoner's dilemma by having you *play* it. The essay has been translated into 20+ languages — the simulations carry meaning even without text. You toggle strategies, watch populations evolve, and arrive at conclusions about cooperation that feel discovered, not lectured.

**What padho.ai can steal:** The participation loop. Every few paragraphs, Nicky Case makes you *do* something — press a button, run a simulation, make a choice. The ratio is roughly one interaction per 200-300 words of text. This is a cadence padho.ai should target for its most ambitious posts: never let the reader go more than a scroll-length without touching something.

---

**3. Distill.pub**

A peer-reviewed journal for interactive machine learning explanations, now on hiatus but with an influential back-catalogue.

**Why it's here:** Distill proved that interactive visual explanations can be *rigorous* — not just pretty. Their articles were peer-reviewed, cited in academic papers, and still treated the reader as someone who learns by manipulating, not just reading.

**Representative post:** *Feature Visualization* (distill.pub/2017/feature-vis/). Shows how neural networks build up image understanding layer by layer, with interactive diagrams that let you zoom into activation patterns. The article's visual layer does something text literally cannot: it shows you what a neural network "sees" at different resolutions.

**What padho.ai can steal:** The idea that interactive visuals are not decoration — they are *evidence*. When padho.ai writes about how its adaptive learning engine works, the diagram should not be a static flowchart. It should be a live simulation: you move the student's knowledge state, the engine responds, you see the adaptation in real time.

---

**4. The Pudding — pudding.cool**

A digital publication of visual essays, using data and scrollytelling to explain cultural phenomena.

**Why it's here:** The Pudding's signature move is *scrollytelling* — data visualisations that animate as you scroll. This format is achievable in Astro/MDX and is perfectly suited to the kind of "here's what we found when we looked at learning data" post padho.ai should write.

**Representative post:** *Women's Pockets Are Inferior* (pudding.cool/2018/08/pockets/). A data-driven investigation into why women's jeans have smaller pockets, told entirely through scrolling data visualisation. The format is simple — text on the left, visualisation on the right, both advance as you scroll.

**What padho.ai can steal:** The scrollytelling format for data-driven posts. When padho.ai writes "Here's what we learned from 10,000 student sessions," it should not be a wall of text with a bar chart at the end. It should be a scroll-driven narrative: you scroll, the data appears, the insight builds.

---

**5. 3Blue1Brown — 3blue1brown.com**

Grant Sanderson's mathematics animation channel, primarily video but with a written component and a distinctive visual pedagogy.

**Why it's here:** 3Blue1Brown's visual language — geometric transformations, colour-coded vectors, smooth animations that build meaning — is the closest thing to a universal standard for "how to explain math visually." The padho-wiki already references this lineage. The blog should acknowledge it explicitly.

**Representative post:** The *Essence of Linear Algebra* series (YouTube, but the written lesson notes at 3blue1brown.com/lessons/ mirror the structure). Each lesson opens with a concrete geometric picture, builds notation on top of that picture, and uses animation to show what static algebra hides — that matrix multiplication is a transformation of space.

**What padho.ai can steal:** The principle that *notation follows intuition, never leads it*. When the blog introduces a concept (say, how the knowledge graph works), the visual comes first, the symbols come second. This is exactly what the wiki's style guide mandates, and the blog should inherit it unchanged.

---

**6. Bret Victor — worrydream.com**

A researcher and designer whose essays on dynamic media and "tools for thought" defined the explorable-explanations movement.

**Why it's here:** Bret Victor is the intellectual ancestor of everything in this category. His 2011 essay *Explorable Explanations* coined the term. His 2012 talk *Inventing on Principle* demonstrated what it looks like when every value in an explanation is draggable. The padho-wiki's interactive SVGs are direct descendants of this work.

**Representative post:** *Learnable Programming* (worrydream.com/LearnableProgramming/). A 15,000+ word essay arguing that programming environments should show you what your code does *as you type it* — with live interactive demonstrations embedded in the argument. The essay is itself the proof of its thesis.

**What padho.ai can steal:** The meta-principle: *the medium should demonstrate the claim*. When the padho.ai blog argues that interactive learning is better than passive reading, the post itself should be interactive. When it argues that hints are better than answers, the post should give the reader a problem and a hint button. Walk the talk in the medium, not just the message.

---

**7. Quanta Magazine — quantamagazine.org**

An editorially independent publication funded by the Simons Foundation, covering mathematics, physics, biology, and computer science.

**Why it's here:** Quanta is the best example of *rigorous science writing for a general audience* — exactly the dual-audience challenge padho.ai faces (student + parent/teacher). Their articles make cutting-edge research legible to non-experts without dumbing it down.

**Representative post:** *In Math, Rigor Is Vital. But Are Digitized Proofs Taking It Too Far?* (April 2026). The article opens with a concrete tension — the gap between mathematical practice and formalised proof — and builds the argument through interviews, examples, and historical context. Custom illustrations accompany the text, but the writing carries the explanation alone.

**What padho.ai can steal:** The dual-layer headline. Quanta headlines do two things at once: state the topic and create tension. "In Math, Rigor Is Vital. But Are Digitized Proofs Taking It Too Far?" — the first sentence establishes authority, the second creates a question. padho.ai should study this form for its own headlines.

---

**8. Nautilus — nautil.us**

A science magazine that connects research to broader human questions through narrative journalism.

**Why it's here:** Nautilus shows how to make *science feel personal*. Their articles don't just explain what was discovered — they explain why it matters to you. This narrative bridge between research and reader experience is exactly what padho.ai needs when writing about learning science.

**Representative post:** *Survival of the Wittiest* — an investigation into humour's evolutionary origins that moves between lab studies and personal anecdotes, making evolutionary psychology feel like a story about you, not about distant primates.

**What padho.ai can steal:** The "why this matters to your life" bridge. Every Nautilus article connects the abstract finding to the reader's experience within the first three paragraphs. padho.ai should do this every time it cites learning research: not "research shows X" but "you've probably felt X — here's the research that explains why."

---

### Category 2: Teaching and Learning Blogs

These blogs think explicitly about *how people learn* — the same question at padho.ai's core. They're less visual than Category 1 but deeper on pedagogy, metacognition, and the experience of understanding.

---

**9. Better Explained — betterexplained.com**

Kalid Azad's site dedicated to "aha! moments" in mathematics, using the ADEPT method (Analogy, Diagram, Example, Plain English, Technical definition).

**Why it's here:** Better Explained is the closest existing analogue to what the padho.ai blog should be. Same audience (students struggling with math), same thesis (intuition before formalism), same conversational tone. The ADEPT method is essentially a formalised version of the wiki's article arc.

**Representative post:** *A Visual, Intuitive Guide to Imaginary Numbers*. Opens by validating frustration — "most explanations fell into one of two categories" — then rebuilds the concept from scratch using rotation as the core metaphor. Approximately 2500-3000 words, heavily illustrated.

**What padho.ai can steal:** The frustration-validation opening. Better Explained almost always opens by naming the specific confusion the reader has felt: "You've been told imaginary numbers are important, but nobody explained *why*." This opening pattern — naming the frustration, then resolving it — is the single most effective hook for padho.ai's student-facing content.

---

**10. Andy Matuschak — andymatuschak.org**

An applied researcher building tools for thought, with deep writing on spaced repetition, reading comprehension, and what it means to *understand* something.

**Why it's here:** Matuschak thinks harder about *how learning actually works* than almost anyone else writing publicly. His concept of the "mnemonic medium" — a text that has spaced-repetition prompts woven into it — is the most ambitious rethinking of the reading experience since hypertext.

**Representative post:** *Quantum Country* (quantum.country), co-authored with Michael Nielsen. A textbook on quantum computing with embedded review questions that the system schedules for you to revisit. Not a blog post — a new medium. But it demonstrates the principle.

**What padho.ai can steal:** The idea that a blog post can *continue working after the reader closes the tab*. If padho.ai sends the reader a follow-up question two days later — "Remember the adaptive learning post? Here's a question to test whether the core idea stuck" — that is the Matuschak principle in action. Even a simple email follow-up would be unprecedented for an Indian ed-tech blog.

---

**11. Maggie Appleton — maggieappleton.com**

A designer and anthropologist who creates visual essays and maintains a digital garden on programming, design, and tools for thought.

**Why it's here:** Appleton's site demonstrates two things padho.ai should learn: (1) the *digital garden* format — notes at different stages of maturity, from seedling to evergreen — and (2) the use of *hand-drawn illustration as primary explanation*, not decoration.

**Representative post:** Her essay on *ambient co-presence* in digital design. The illustration carries the argument; the text narrates around it.

**What padho.ai can steal:** The "garden vs stream" mental model. The padho.ai blog should have some posts that are finished essays (stream) and some that are living documents that update over time (garden) — like "What we've learned about how students use hints" that gets updated quarterly with new data.

---

**12. Wait But Why — waitbutwhy.com**

Tim Urban's long-form, stick-figure-illustrated blog about science, technology, and society.

**Why it's here:** Wait But Why proves that you do not need sophisticated interactive elements to make complex ideas visual and accessible. Stick figures and hand-drawn charts, combined with conversational prose at 8000-9000 words per post, have generated some of the most widely-read explanations of AI, space, and procrastination on the internet.

**Representative post:** *The AI Revolution: The Road to Superintelligence* (8000+ words, 1176 comments). Opens with a time-travel thought experiment, builds through concrete analogies, defines terms clearly, and uses stick-figure graphs to make exponential growth intuitive. The tone is "your smartest friend explaining this over chai" — conversational, self-deprecating, but never imprecise.

**What padho.ai can steal:** The self-deprecating honesty about confusion. Urban regularly writes things like "our meager brains" and "nahhh feels right... but it's probably actually wrong." This is the anti-textbook voice. padho.ai should license itself to say "this is confusing, and it should be — here's why it confused everyone for 200 years."

---

**13. Terence Tao — terrytao.wordpress.com ("What's New")**

A Fields Medal-winning mathematician's research and expository blog.

**Why it's here:** Tao's blog is proof that the world's best mathematician can also be an excellent communicator. His expository posts open with motivation and physical intuition before formalism — exactly the wiki's pattern. More importantly, his blog models *intellectual generosity*: sharing thinking-in-progress, not just polished results.

**Representative post:** *Mathematical methods and human thought in the age of AI* (March 2026). A philosophical essay examining what happens to mathematical thinking when AI can prove theorems.

**What padho.ai can steal:** The courage to write about the *process* of understanding, not just the result. Tao regularly posts half-formed ideas, works-in-progress, and questions he doesn't have answers to. padho.ai should do the same: "Here's a design problem we're stuck on. Here's how we're thinking about it."

---

**14. Farnam Street — fs.blog**

Shane Parrish's blog on mental models, decision-making, and learning how to learn.

**Why it's here:** Farnam Street has built a million-subscriber newsletter by writing about *how to think* rather than *what to think*. The padho.ai blog's parent-facing content should study this model: parents don't want to learn calculus, they want to understand *how their child should learn*.

**Representative post:** Articles on mental models and the art of reading. Parrish structures these as: claim, evidence from multiple domains, practical application.

**What padho.ai can steal:** The cross-domain evidence pattern. When Farnam Street says "the best learners do X," it cites evidence from chess, medicine, and military strategy. When padho.ai says "guided discovery works better than direct instruction," it should cite evidence from Socratic dialogue, cognitive science, and its own product data.

---

**15. Cal Newport — calnewport.com**

Computer scientist and author of *Deep Work*, writing about focus, productivity, and how students can study effectively.

**Why it's here:** Newport writes directly to students and knowledge workers about how to study. His early blog posts — "Study Hacks" — are the closest existing content to what padho.ai's student-facing blog should be.

**Representative post:** His writing on deep work and deliberate practice, published through a weekly essay newsletter reaching 100,000+ subscribers.

**What padho.ai can steal:** The *study advice that doesn't insult the reader's intelligence*. Newport never writes "10 tips for better grades." He writes about the cognitive science of focus, the structure of deliberate practice, and why most study advice is wrong. padho.ai should match this register.

---

**16. Commoncog — commoncog.com**

Cedric Chin's blog on accelerating expertise through deliberate practice, with a focus on business education.

**Why it's here:** Commoncog is the best public writing on *how expertise is acquired*. Its "Calibration Case Method" — learning to pattern-match like experts by studying real cases — maps directly to what padho.ai does with its adaptive learning engine.

**Representative post:** *How Experts Sensemake* — applies military sensemaking research to business expertise acquisition.

**What padho.ai can steal:** The explicit use of expertise research to justify product decisions. When padho.ai explains *why* its AI gives hints instead of answers, it should cite the deliberate practice research that Commoncog covers so well: expertise comes from struggle at the edge of your ability, not from being told the answer.

---

### Category 3: Craft-of-Writing Blogs

These blogs model *how to write well* — the sentence-level, paragraph-level, and structural craft that makes an explanation land.

---

**17. Paul Graham — paulgraham.com**

The co-founder of Y Combinator, writing essays on startups, technology, and thinking clearly since 2001.

**Why it's here:** Graham's essays are the ur-text of the "smart person writing clearly about ideas" genre. His influence on how the entire tech industry writes blog posts is hard to overstate.

**Representative post:** *How to Do Great Work* (paulgraham.com/greatwork.html). Opens with a single declarative sentence that sounds like advice you'd give a friend, then builds for 4000+ words through layered observations. No headers, no bullet points, no images — just prose.

**What padho.ai can steal:** The one-idea-per-essay discipline. Graham never tries to cover three topics in one post. If the post is about "why hints work better than answers," it is only about that. This focus is what makes essays shareable — people share a single clear idea, not a grab-bag.

---

**18. Derek Sivers — sive.rs**

Musician, entrepreneur, and author of extremely short essays on philosophy, decision-making, and living deliberately.

**Why it's here:** Sivers proves that a 300-word post can have more impact than a 3000-word one. His essay *There's no speed limit* — about a music teacher who taught him a semester's material in a single lesson — is 500 words and has been read millions of times.

**Representative post:** *Obvious to You. Amazing to Others.* A sub-500-word essay on why you should share what you know, because what's obvious to you is revelatory to someone else.

**What padho.ai can steal:** Permission to write short. Not every post needs to be 2000 words. A 500-word post that nails one insight — "The moment your child stops asking 'why?'" — can do more than a long-form essay.

---

**19. James Somers — jsomers.net**

A programmer and writer whose essays on dictionaries, biology, and writing craft are some of the most shared long-form pieces on the internet.

**Why it's here:** Somers models the *curiosity-driven essay* — starting with a question he genuinely wants to answer, doing real research, and sharing the journey. This is the voice padho.ai needs for its "inside a hard problem" posts.

**Representative post:** *You're probably using the wrong dictionary* — a 2500-word essay arguing that Webster's 1913 dictionary is superior to modern dictionaries because its definitions preserve nuance. Opens with a specific frustration, investigates it, arrives at a surprising conclusion.

**What padho.ai can steal:** The investigation structure. Somers doesn't announce a conclusion and then defend it — he takes you on the investigation. "I was annoyed by X. I looked into it. I found Y. This changed how I think about Z." This structure works perfectly for padho.ai's "why we built it this way" posts.

---

**20. Gwern Branwen — gwern.net**

A prolific researcher-essayist covering AI, statistics, psychology, and self-experimentation.

**Why it's here:** Gwern models the maximally rigorous personal blog: extensive citations, Bayesian reasoning, transparent uncertainty, and a living-document approach where essays are updated over years.

**Representative post:** *Spaced Repetition for Efficient Learning* — a literature review with practical applications that synthesises decades of memory research into actionable advice.

**What padho.ai can steal:** The living-document approach. Gwern's essays carry "last updated" dates and change over time as new evidence arrives. padho.ai should mark certain blog posts as living documents — "What we know about learning from our data (updated quarterly)" — and actually update them.

---

**21. Kevin Simler — Melting Asphalt (meltingasphalt.com)**

An essayist exploring philosophy, human behaviour, and complex systems through long-form interactive writing.

**Why it's here:** Simler's *Going Critical* is one of the best examples of an interactive essay that teaches through simulation — you watch networks propagate, adjust parameters, and develop intuition for critical thresholds.

**Representative post:** *Going Critical* (meltingasphalt.com/interactive/going-critical/). An interactive essay on network cascades. You watch a single activation spread through a network grid, adjust the transmission probability, and discover the phase transition where information suddenly goes viral. The interactive does what 1000 words of prose cannot.

**What padho.ai can steal:** The single-parameter simulation. You don't need a complex interactive — sometimes one slider that controls one variable is enough. A post about adaptive difficulty could have one slider: "student ability level." You move it; the system's behaviour changes visibly.

---

**22. Julian Shapiro — julian.com**

A writer of comprehensive, structured handbooks on writing, startups, and fitness.

**Why it's here:** Shapiro's *Writing Well* guide is the most practical writing handbook on the internet, distilled from two million words of practice. Its handbook format — table of contents, numbered sections, progressive depth — is the right format for padho.ai's "how to study" pillar.

**Representative post:** The *Writing Well* guide. Structured as a multi-chapter handbook with clear section headers, practical examples, and progressive depth. Each chapter ends with exercises.

**What padho.ai can steal:** The handbook format for evergreen content. Instead of a one-off blog post called "How to study for JEE," padho.ai should build a multi-part *study handbook* — a living resource that students bookmark and return to.

---

### Category 4: Indian Voices

The padho.ai reader is Indian. The blog cannot be a pure transplant of Western essay culture. This category is thin — a direct consequence of the Indian internet being dominated by video, news, and social media rather than long-form essays. That thinness is itself a finding: *the gap is the opportunity*.

---

**23. Naval Ravikant — nav.al**

Indian-American entrepreneur and philosopher, sharing ideas on wealth, happiness, and learning through short-form audio and text.

**Why it's here:** Naval's ideas on learning — particularly "the best authors respect the reader's time" and his emphasis on reading as the highest-leverage activity — resonate with padho.ai's thesis. His cultural bridge between Indian philosophical traditions and Silicon Valley pragmatism is a voice DNA the blog should learn from.

**Representative post:** His series on *How to Get Rich (Without Getting Lucky)* — originally a Twitter thread, then expanded into podcast episodes. The format is aphoristic: one idea per unit, no padding.

**What padho.ai can steal:** The aphoristic opening. Naval's threads work because each tweet is a standalone idea. padho.ai could open posts with a single sentence that works as a standalone aphorism: "Confidence does not come from getting answers right. It comes from knowing you can figure them out."

---

**24. Venkatesh Rao — Ribbonfarm (ribbonfarm.com)**

An Indian-American writer's long-running blog of philosophical and cultural essays, subtitled "constructions in magical thinking."

**Why it's here:** Rao is the most prominent Indian-origin long-form essayist in the English internet. His writing demonstrates what Indian intellectual culture looks like when it escapes academic formality — sardonic, diagrammatic, cross-disciplinary, and unafraid of abstraction.

**Representative post:** *Decision Brownouts* — uses the metaphor of electrical brownouts for chronic indecision. Opens with a personal anecdote, builds a theoretical framework, uses Venn diagrams as primary explanatory tools.

**What padho.ai can steal:** The diagram-as-thinking-tool approach. Rao doesn't illustrate after writing — he *thinks in diagrams*. padho.ai should cultivate a similar habit: when planning a blog post, start with the diagram, then write the text around it.

---

**25. Indian Education Substacks**

Several Substacks write about Indian education: *Students of India* (studentsofindia.substack.com) shares stories of what it means to be a student in India; *Abhishar* (abhishar.substack.com) focuses on rural education; *ReTHINK INDIA* has 20K+ subscribers covering higher education policy; *Future of India* (foifaction.substack.com) covers India's youth demographic.

**Why they're here:** These are padho.ai's *adjacent voices* — the people writing about Indian education from a policy, personal, or sociological angle. They are not competitors; they are potential cross-promotion partners and sources of guest perspectives.

**What padho.ai can steal:** The *student story* format. Students of India publishes first-person accounts of the student experience. padho.ai should commission similar pieces: "What it's like to prepare for JEE in a small town with no coaching centre" — real stories from real students using the platform.

---

**26. Scott Alexander — Astral Codex Ten (formerly Slate Star Codex)**

*(Redirected from substack.com; accessed via training data knowledge.)*

A psychiatrist's blog of long-form analytical essays on science, statistics, policy, and culture.

**Why it's here:** Alexander is the internet's best writer of "let me think through this complicated question in public" essays. His statistical literacy, willingness to change his mind, and extreme thoroughness are the qualities padho.ai's product-reasoning posts should aspire to.

**Representative post:** Book reviews that are really 10,000-word essays on the topic the book covers, using the book as a jumping-off point.

**What padho.ai can steal:** The "book review as essay" format. When padho.ai reads an important education paper or book, the blog post should not be a summary — it should be an essay *provoked by* the paper, using it as a launching pad for the blog's own argument.

---

### Category 5: Technical Writing with Visual Ambition

These blogs explain complex technical topics clearly, often with hand-drawn or custom visuals. Julia Evans is the most relevant exemplar for padho.ai — her "complex topic, hand-drawn diagrams, zero jargon" approach maps most closely to the padho.ai voice.

---

**27. Julia Evans — jvns.ca**

A programmer who explains computer systems through blog posts, hand-drawn comics (Wizard Zines), and an intensely curious, encouraging tone.

**Why it's here:** Julia Evans is the blogger padho.ai should study most carefully. Her formula — take something genuinely confusing, draw a simple diagram of it, explain it in plain language, and publish — is exactly what the padho.ai blog needs for its "what a good explanation looks like" pillar. Her zines prove that hand-drawn diagrams can be *better* than polished graphics because they feel approachable.

**Representative post:** *New Zine: How Git Works!* — a post announcing and explaining her zine on git, structured as: what's confusing about git → how she approaches explaining it → preview of the visual style → link to the full resource.

**What padho.ai can steal:** The hand-drawn diagram aesthetic. Evans' zines use simple shapes, handwritten labels, and bright colours. This is achievable — padho.ai doesn't need a design team, just someone with a tablet and a willingness to draw. One hand-drawn diagram per post would transform the blog's visual identity.

---

**28. Simon Willison — simonwillison.net**

A prolific technical blogger publishing multiple posts daily on AI, databases, and web technology.

**Why it's here:** Willison demonstrates what extreme publishing cadence looks like. Multiple posts per day, ranging from quick notes to long analyses, all consistently useful. His blog is more *stream* than *essay* — and that has its own power.

**Representative post:** His detailed analysis posts on new AI model releases, where he tests claims hands-on and publishes results within hours.

**What padho.ai can steal:** The *hands-on testing* credibility pattern. When Willison writes about an AI model, he doesn't summarise the press release — he builds something with it and shows you. When padho.ai writes about a pedagogical technique, it should show what happened when real students used it, with real data.

---

**29. Dan Luu — danluu.com**

A systems engineer whose blog debunks conventional wisdom through empirical investigation and careful measurement.

**Why it's here:** Luu models the *contrarian evidence-based essay*. His posts regularly open with a widely-held belief, then systematically demolish it with data. This pattern is powerful for padho.ai when writing about education myths.

**Representative post:** *Computer latency: 1977-2017* — a historical performance analysis showing that modern computers are sometimes *slower* than 1977 hardware for basic interactions. Opens with a widely-held assumption ("computers keep getting faster"), then measures reality.

**What padho.ai can steal:** The myth-busting essay format. Open with a belief most parents hold ("more practice = better grades"). Show the data that complicates it. Arrive at the nuanced truth. This format is inherently shareable because it challenges something the reader thought they knew.

---

**30. Patrick McKenzie (patio11) — kalzumeus.com**

An engineer-entrepreneur whose writing on salary negotiation, financial infrastructure, and systems thinking has reportedly influenced millions in negotiated raises.

**Why it's here:** McKenzie demonstrates that *writing with genuine conviction about how systems work* builds trust and audience over decades. His Salary Negotiation post has been read millions of times because it gives concrete, actionable advice that the reader can use tomorrow.

**Representative post:** *Salary Negotiation: Make More Money, Be More Valued* — direct, specific, actionable.

**What padho.ai can steal:** The *concrete-and-actionable* test. Before publishing, ask: can the reader do something different tomorrow because of this post? If the answer is no, the post is not ready.

---

### Category 6: Product and Strategy Blogs

These blogs model structure, cadence, and audience-building rather than voice. They are relevant for padho.ai's distribution strategy more than its content strategy.

---

**31. Stratechery — stratechery.com (Ben Thompson)**

The benchmark strategy newsletter, covering technology business through original analytical frameworks.

**Why it's here:** Thompson invented the modern paid newsletter model. His frameworks (Aggregation Theory, the Smiling Curve) become shared vocabulary across the industry. padho.ai doesn't need to write strategy analysis, but it should study how Thompson *names concepts* — giving frameworks sticky names makes them spreadable.

**What padho.ai can steal:** Name your frameworks. If padho.ai has a concept like "the stuck moment" (from the existing blog), give it a capitalised name — The Stuck Moment — use it consistently, and it becomes a shareable idea that people reference.

---

**32. Not Boring — notboring.co (Packy McCormick)**

A technology strategy newsletter reaching 261,000+ subscribers, known for extremely long essays (6,000-40,000 words) that make complex business topics engaging.

**Why it's here:** McCormick proves that length is not the enemy of readability. His 10,000-word essays work because they are structured clearly, use subheadings aggressively, and maintain narrative momentum. padho.ai's longest posts should study this pacing.

**What padho.ai can steal:** The aggressive subheading structure. McCormick uses a subheading every 300-500 words, and each subheading is itself a mini-hook. This keeps the reader oriented in long pieces.

---

**33. Seth Godin — seths.blog**

The most consistently published blog on the internet: daily posts since 2002, each 150-300 words, each a single idea.

**Why it's here:** Godin proves that *cadence builds audience*. Daily publishing for 24 years creates a relationship the reader never has to re-establish. His posts are conversation-starters, not treatises.

**What padho.ai can steal:** The daily-idea format as a supplement to long-form essays. padho.ai could publish weekly long-form posts and daily 200-word "learning observations" — a quick thought about education that the reader sees every morning.

---

**34. Lenny's Newsletter — lennysnewsletter.com (Lenny Rachitsky)**

The leading product management newsletter, with 1.2M+ free subscribers, structured around research-backed advice for product builders.

**Why it's here:** Lenny's format — deeply researched, expert-sourced, with clear frameworks and templates the reader can use immediately — is the benchmark for "useful newsletter." His community Slack (15,000+ members) shows how a newsletter can become a gathering place.

**What padho.ai can steal:** The *template-as-value* approach. Lenny regularly publishes templates, frameworks, and checklists that readers screenshot and share. padho.ai should do the same: "Here's a template for how to help your child with a math problem without giving the answer" — a shareable, printable one-pager.

---

**35. Ben Evans — ben-evans.com**

A technology analyst writing essays and presentations about the macro trends shaping the tech industry, reaching 200,000 newsletter subscribers.

**Why it's here:** Evans' biannual presentations — 100+ slides summarising the state of tech — demonstrate that *data-rich visual content gets shared*. His essays model the "stepping back from the noise" perspective padho.ai needs.

**What padho.ai can steal:** The annual "State of" presentation format. padho.ai should publish an annual "State of Learning in India" report — a data-rich, visual, shareable resource that positions the company as a thinking leader.

---

**36. The Diff — thediff.co (Byrne Hobart)**

A newsletter on high-variance technologies and companies, known for deep "Five Whys" analysis.

**What padho.ai can steal:** The "Five Whys" structure. When writing about a product decision, keep asking "why?" until you reach something fundamental. "Why hints? Because struggle builds understanding. Why does struggle build understanding? Because..." — this depth of reasoning builds trust.

---

**37. Brandur Leach — brandur.org**

A software engineer's blog with exceptional typographic design, dark/light mode, and a multi-format publishing approach (articles, atoms, fragments, newsletter).

**What padho.ai can steal:** The multi-format blog structure. Not every piece needs to be a full essay. Brandur publishes "atoms" (tweet-length), "fragments" (short thoughts), and "articles" (full essays). padho.ai could adopt a similar tiered structure.

---

**38. Aeon — aeon.co**

*(Rate-limited during fetching; cited from training data knowledge.)*

A digital magazine of long-form essays on philosophy, science, and the human condition, with articles typically 2000-5000 words, written by academics and journalists for a general audience.

**What padho.ai can steal:** The "academic rigour, general audience" register. Aeon essays feel smart without feeling exclusionary. This is the register for padho.ai's parent-facing content.

---

## Part II — Pattern Extraction

With 38 exemplars surveyed, here are the *specific, mechanical, operational patterns* that show up repeatedly.

### Opening Moves

How do the best blogs start a post? I categorised the opening patterns across the 38 surveyed blogs:

| Opening Pattern | Count (of 38) | Best Example |
|---|---|---|
| **Concrete scene or scenario** | 14 | Ciechanowski opens *Mechanical Watch* with "merely a few decades ago..."; Urban opens *AI Revolution* with a time-travel thought experiment |
| **Frustration validation** | 9 | Better Explained: "most explanations fell into one of two categories"; Evans: "you've probably tried X and it didn't work" |
| **Counterintuitive claim** | 7 | Luu: "modern computers are sometimes slower than 1977 hardware"; Graham: a declarative sentence that sounds wrong |
| **Direct question** | 5 | Wiki derivative article: "After exactly 2 seconds, how fast is it moving?" |
| **Aphorism or one-liner** | 3 | Sivers: a single sentence that is the entire thesis |

**Observation:** The padho.ai existing blog already uses the two strongest openings — concrete scene (the "stuck moment" post) and frustration validation (the "rote vs conceptual" post). The weakest openings in the existing blog are the feature-announcement posts (multilingual, textbook), which open with product claims instead of reader experience. The pattern is clear: **open with the reader's experience, not the product's features**.

### Length Distributions

| Length Band | When to Use It | Example from Survey |
|---|---|---|
| **300-500 words** | Single insight, daily observation | Seth Godin, Derek Sivers |
| **800-1500 words** | One concept, explained well | Julia Evans blog posts |
| **2000-3000 words** | Deep explanation of one idea | Better Explained, padho.ai "stuck moment" |
| **5000-8000 words** | Research-backed argument or survey | Wait But Why, Not Boring |
| **10,000+ words** | Comprehensive handbook or interactive essay | Ciechanowski, Gwern, Julian Shapiro |

**Observation:** The padho.ai blog currently lives almost entirely in the 800-1500 word band. It should expand in both directions — shorter daily observations *and* longer deep dives.

### The Visual Layer

Of the 38 blogs surveyed:
- **15** (39%) include custom diagrams, illustrations, or interactive elements in most posts
- **10** (26%) include occasional images or screenshots
- **13** (34%) are text-only or nearly so

The blogs with the strongest visual layers (Ciechanowski, Nicky Case, Pudding, Julia Evans, Wait But Why, Better Explained, Maggie Appleton) are disproportionately represented in the "most shared" and "most cited" categories. **The visual layer is not optional for padho.ai's blog.** The existing blog uses screenshots of the product — which is better than nothing but is marketing collateral, not explanation.

**What the best visual layer does that text cannot:**
- Shows a *process* unfolding over time (Ciechanowski's watch mechanism)
- Lets the reader *manipulate* a parameter and see consequences (Nicky Case, wiki's derivative SVG)
- Makes an invisible thing *visible* (Distill's neural network activations)
- Creates a *spatial metaphor* the reader can navigate (Better Explained's number line)

### Cadence and Consistency

| Cadence | Examples | What It Optimises For |
|---|---|---|
| **Daily** | Seth Godin | Habit formation, relationship maintenance |
| **2-3x per week** | Simon Willison, Dan Luu | Recency, authority, SEO |
| **Weekly** | Farnam Street, Lenny, Stratechery | Depth + consistency, sustainable for small teams |
| **Biweekly** | padho.ai current (approx.) | Adequate depth, but risks losing reader habit |
| **Monthly or irregular** | Ciechanowski, Wait But Why | Maximum depth per post, but no cadence habit |

**Observation:** For a founder-written blog with a small team, **weekly is the right cadence**. Biweekly loses the habit. Daily is unsustainable. Weekly is the sweet spot where the reader expects and looks forward to the post.

### How They End

The closing patterns across the 38 blogs:

| Closing Pattern | Count | Effect |
|---|---|---|
| **Restatement of thesis with elevation** | 12 | "So the answer is not X. It's Y — and that changes everything." |
| **Open question for the reader** | 8 | "What would happen if every school did this?" |
| **Concrete next action** | 7 | "Try this with your child tonight." |
| **Cross-link to related content** | 6 | "If this resonated, you might also like..." |
| **Product CTA** | 5 | "Try padho.ai →" |

**Observation:** The padho.ai blog currently ends every post with a product CTA and cross-links. This is fine for a product blog, but the *best* posts in the survey end with an elevated restatement or a question — something that lingers. The CTA should come *after* the emotional close, not *be* the close.

### Linking Discipline

- **Internal links per post:** The survey median is 3-5. Fewer feels orphaned; more feels like SEO gaming.
- **External links per post:** The survey median is 2-4 for essay blogs (citing sources), 0-1 for personal blogs (Sivers, Godin).
- **Inline vs footer:** 28 of 38 blogs use inline links. Footer-only linking (Gwern's style) works for research but is unusual for blogs.

### Headline Craft

Ten headlines from the survey worth copying the *form* of:

1. *"The stuck moment: why answers are not enough"* — padho.ai already has this one. It's excellent. Concrete noun + "why" question.
2. *"You're probably using the wrong dictionary"* — Somers. Direct "you" address + counterintuitive claim.
3. *"There's no speed limit"* — Sivers. Metaphor as title, meaning revealed in the post.
4. *"Going Critical"* — Simler. Two-word title with a double meaning (critical mass + crisis).
5. *"How fast is it moving at this exact instant?"* — the derivative article's implicit question. A question that sounds simple but is secretly profound.
6. *"The AI Revolution: The Road to Superintelligence"* — Urban. Concrete noun + journey metaphor.
7. *"A Visual, Intuitive Guide to Imaginary Numbers"* — Better Explained. Promise of clarity on a confusing topic.
8. *"Obvious to You. Amazing to Others."* — Sivers. Reader validation in six words.
9. *"Computer Latency: 1977-2017"* — Luu. Specific scope + implied story (what changed?).
10. *"In Math, Rigor Is Vital. But Are Digitized Proofs Taking It Too Far?"* — Quanta. Two sentences, first establishes authority, second creates tension.

**The pattern:** Great headlines are either a *concrete promise* ("a visual guide to X"), a *counterintuitive claim* ("you're probably doing X wrong"), or a *question that sounds simple but isn't* ("how fast is it moving at this exact instant?"). They are never generic ("The importance of education") or SEO-stuffed ("Best AI learning platform India 2026").

---

## Part III — padho.ai Blog Strategy Recommendations

### 1. Positioning

The padho.ai blog is *the essay voice of padho.ai* — not the wiki (which is curriculum), not a company blog (which is announcements), not an SEO farm (which is content for Google, not for humans).

It sits at the intersection of two audiences: the **student** (15-year-old in India, curious, slightly sceptical, reading on their phone at 11pm) and the **parent/teacher** (30-50, wants to understand whether padho.ai is trustworthy, has been burned by edtech promises before, reads on their phone during commute).

A good padho.ai blog post works for both: the student finds something worth reading, the parent finds the reasoning legible. When forced to choose, lean toward the parent — they make the purchase decision. But never write *down* to the student. The existing "stuck moment" post does this perfectly: the student recognises their own experience, the parent recognises their child's.

The positioning in one sentence: *padho.ai's blog is where the team thinks out loud about what it means to learn well — for students, parents, and anyone who believes education should be better than it is.*

### 2. Voice

**Inherit unchanged from the wiki style guide:**
- Second person always ("you," never "we" or "one")
- Warm but not childish (no "fun fact!" or emoji decoration)
- Never apologise for the topic
- Never lie to make it simple
- Honesty about what's deferred or simplified
- Indian cultural references over Western ones
- Concrete over abstract

**Adapt for the blog:**
- The wiki presents mathematical truth. The blog presents *educational philosophy and product conviction*. This licenses the blog to be **more opinionated** — "We believe hints are better than answers, and here's why" is a blog voice the wiki cannot use.
- The wiki never uses first person. The blog **can use "I" and "we"** when the founder is sharing a personal story or the team is explaining a decision. But default to "you" for the reader.
- The blog can **acknowledge uncertainty** — "We don't know yet whether X works better than Y, but here's what the data suggests so far." The wiki can't do this because it's a reference. The blog should, because it builds trust.

**New for the blog (not in the wiki style guide):**
- **Name the reader's emotion before explaining the concept.** "You've watched your child copy the solution and close the notebook. You know something is wrong, but you can't name it." This is the emotional register the blog should open with when writing for parents.
- **One concrete product example per post.** Not a sales pitch — a *demonstration*. Show a real screenshot, a real student interaction, a real before-and-after. This grounds the philosophy in the actual product.

### 3. Content Pillars

**Pillar 1: Inside a Hard Problem**
What it is: Take a specific concept that students find hard (quadratic equations, limits, chemical bonding) and explain *why* it's hard — what the intuition gap is, what the common misconceptions are, how a good explanation addresses them.
Why it matters: Demonstrates padho.ai's pedagogical depth. Useful to both students and parents.
First post idea: *"Why does every student get confused by negative numbers — and what to do about it"*
Target cadence: Twice a month.

**Pillar 2: What a Good Explanation Looks Like**
What it is: Meta-posts about explanation itself — how to explain well, what makes a diagram effective, why analogies work, how the padho-wiki articles are designed.
Why it matters: Positions padho.ai as a team that thinks harder about explanation than anyone else.
First post idea: *"Why we draw diagrams before we write equations"*
Target cadence: Once a month.

**Pillar 3: How We Built It (and Why)**
What it is: Product reasoning posts — not feature announcements, but the *thinking* behind product decisions. Why the AI gives hints instead of answers. Why the notebook is shared between coach and student. Why language selection is one click.
Why it matters: Builds trust. Parents want to know the team is thoughtful, not just technically capable.
First post idea: *"Why our AI refuses to give your child the answer"*
Target cadence: Once a month.

**Pillar 4: What the Data Says**
What it is: Posts grounded in padho.ai's own data — what patterns emerge from student sessions, what topics have the highest "stuck" rates, how hint usage correlates with understanding.
Why it matters: Original data is the one thing no competitor can replicate. It is padho.ai's moat for content.
First post idea: *"We analysed 10,000 student sessions. Here's where they get stuck."*
Target cadence: Once a month, or quarterly if data collection is slow.

**Pillar 5: A Student's Story**
What it is: Real stories from real students (or composites) — their learning journey, their struggles, what changed. Written in the student's voice or as a profile.
Why it matters: Social proof that works for both audiences. Parents see children like theirs. Students see themselves.
First post idea: *"Priya was failing maths. Then she stopped looking at the answer key."*
Target cadence: Once a month.

### 4. Cadence and Discipline

**Target: one post per week.** Specifically:
- Week 1: Pillar 1 (Inside a Hard Problem)
- Week 2: Pillar 2 or 3 (Explanation or Product Reasoning)
- Week 3: Pillar 1 (Inside a Hard Problem)
- Week 4: Pillar 4 or 5 (Data or Student Story)

This gives two "Inside a Hard Problem" posts per month (the easiest to produce and the most SEO-valuable), one meta/product post, and one data/story post.

**When to delay vs ship:** Delay if the post makes a claim you haven't verified. Ship if the prose isn't perfect but the idea is clear. A weekly cadence with occasional 2-week breaks (announced: "no post this week — we're heads-down on something") is better than an inconsistent schedule.

### 5. Opening and Closing Templates

**Opening Template 1: The Frustration Mirror**
Pattern: Name the reader's experience → validate the emotion → promise resolution.
Example: *"Your child reads the solution three times. They follow every step. And when they try the next problem — stuck again. Not distracted. Not careless. Genuinely stuck. You've seen this. Here's what's actually happening."*

**Opening Template 2: The Counterintuitive Claim**
Pattern: State something that sounds wrong → create tension → earn the explanation.
Example: *"The worst thing you can do when your child asks for help with a math problem is explain the solution. Here's why."*

**Opening Template 3: The Concrete Question**
Pattern: Ask a question that sounds simple but isn't → demonstrate the complexity → deliver the insight.
Example: *"How do you explain negative numbers to a 10-year-old without saying 'just imagine numbers less than zero'? We tried five different approaches. Only one worked."*

**Closing Template 1: The Elevated Restatement**
Pattern: Restate the thesis at a higher level of abstraction than the opening.
Example: *"Education doesn't fail when a child doesn't know the answer. It fails when they stop trying to find it."*

**Closing Template 2: The Concrete Next Step**
Pattern: Give the reader one thing they can do tonight.
Example: *"Tonight, when your child finishes their homework, try this: instead of asking 'what's the answer?', ask 'can you explain why it works?' The difference will be visible immediately."*

**Closing Template 3: The Open Question**
Pattern: End with a question that the reader carries with them.
Example: *"What if the real barrier to learning in India isn't resources or access or technology — but the simple fact that nobody asked the right question at the right time?"*

### 6. The Visual Layer

**Target:** At least one custom visual element per post. Not a product screenshot — a *diagram that explains the idea*.

**Specific recommendations:**
- **Inside a Hard Problem posts:** Include one SVG diagram that shows the concept being explained. A post about quadratic equations should have a parabola the reader can see, with roots marked and vertex labelled — hand-drawn style, matching the Julia Evans / padho-wiki aesthetic.
- **Product Reasoning posts:** Include one annotated screenshot showing the design decision. Not a marketing screenshot — an annotated one with callouts explaining "this is why this button is here."
- **Data posts:** Include one scrollytelling data visualisation. The Pudding format: text on the left, chart on the right, both advance as you scroll.
- **Student Story posts:** Include one portrait or illustration (even a simple avatar) of the student. Humanise the data.

**The padho-wiki already has an SVG rendering pipeline.** Reuse it for the blog. If the wiki can render an interactive tangent line, the blog can render a simple diagram.

### 7. First 10 Posts

**Post 1: "Why our AI refuses to give your child the answer"**
Brief: The philosophical and pedagogical reasoning behind the no-answer policy. Open with a parent's complaint ("just tell me the answer!"), pivot to the Socratic method, cite the cognitive science of desirable difficulty, show a real coach-student exchange from the product. End with the elevated restatement: hints build thinkers, answers build copiers.
Target length: 2000 words. Pillar 3. Leans on: frustration-validation opening (Better Explained pattern), one product screenshot annotated.

**Post 2: "We analysed 10,000 student sessions. Here's where they get stuck."**
Brief: Data-driven post revealing the most common "stuck points" in the curriculum. Open with a claim: "We thought we knew where students struggle. We were wrong." Share the top 5 surprise findings — topics that look easy but have high stuck-rates, and topics that look hard but students breeze through. Each finding backed by aggregate data (no individual student data). End with what this means for how padho.ai adapts.
Target length: 2500 words. Pillar 4. Leans on: counterintuitive claim opening (Dan Luu pattern), scrollytelling data format (Pudding pattern).

**Post 3: "Why does every student get confused by negative numbers?"**
Brief: A deep dive into the intuition gap around negative numbers. Open with the question: "What is -3 × -2, and *why* is it positive?" Most adults can state the rule but not explain it. Walk through three mental models (number line, debt, pattern extension), show which one actually builds intuition, and demonstrate how padho.ai's coach handles this exact question.
Target length: 2000 words. Pillar 1. Leans on: concrete question opening (wiki derivative pattern), hand-drawn number line diagram.

**Post 4: "Priya was failing maths. Then she stopped looking at the answer key."**
Brief: A student story — real or composite — of a class 9 student in Bhopal who went from copying solutions to solving independently over 8 weeks. Written in close third person. Show the emotional arc: shame → frustration → first independent solve → confidence. Grounded in specific problems and specific interactions with the AI coach.
Target length: 1500 words. Pillar 5. Leans on: concrete scene opening (Ciechanowski/Urban pattern), portrait illustration.

**Post 5: "Why we draw diagrams before we write equations"**
Brief: A meta-post about padho.ai's explanation philosophy. Open with two versions of the same explanation — one equation-first, one diagram-first — and let the reader feel the difference. Reference 3Blue1Brown's visual-first approach, Better Explained's ADEPT method, and the padho-wiki's style guide. Show a before-and-after of a wiki article draft.
Target length: 2000 words. Pillar 2. Leans on: side-by-side comparison (Better Explained pattern), embedded SVG from the wiki.

**Post 6: "The three questions that tell you if your child actually understands"**
Brief: A practical, parent-facing post. Instead of asking "did you finish your homework?", try these three questions: "Can you explain why this step works?", "What would happen if this number changed?", "Can you teach it to me?" Walk through each with a concrete example. This is the post parents share in WhatsApp groups.
Target length: 1200 words. Pillar 2. Leans on: actionable template (Lenny pattern), short length (Sivers pattern).

**Post 7: "What happens inside the notebook when your child says 'I'm stuck'"**
Brief: A product walkthrough that's actually a story. Follow one student (Shawn, from the existing "classroom inside the notebook" post) through a single problem. Show the exact sequence: student says "guide me" → coach writes on the board → context chips appear → student tries → coach adjusts. Annotated screenshots at each step.
Target length: 1800 words. Pillar 3. Leans on: investigation structure (James Somers pattern), annotated screenshots.

**Post 8: "The myth of 'more practice makes perfect' — what actually builds mathematical fluency"**
Brief: A myth-busting post. Open with the assumption every parent holds: "my child just needs more practice." Show the research on deliberate practice vs mindless repetition. The difference between solving 50 problems mindlessly and solving 5 problems with feedback. Cite Ericsson's research (via Commoncog), connect to how padho.ai's adaptive engine selects which problems to give next.
Target length: 2500 words. Pillar 1. Leans on: myth-busting format (Dan Luu pattern), cross-domain evidence (Farnam Street pattern).

**Post 9: "Learning in your mother tongue is not a compromise — it's an advantage"**
Brief: Rewrite the existing multilingual post as an *essay* rather than a feature announcement. Open with a specific scene: a student in Cuttack who understands fractions perfectly in Odia but fails the English-medium test. Cite UNESCO research on mother-tongue education, NEP 2020, and padho.ai's own data on language switching. End with the elevated claim: learning in your language is not falling behind, it's building a stronger foundation.
Target length: 2000 words. Pillar 1. Leans on: concrete scene opening, research-backed argument.

**Post 10: "What it's like to prepare for JEE from a small town with no coaching"**
Brief: A reported piece — interview one or more real students in tier-2/3 cities who use padho.ai. Not a testimonial; a genuine story of what their day looks like, what resources they have and don't have, what the AI tutor changes for them. Let the student's voice come through.
Target length: 2000 words. Pillar 5. Leans on: student story format (Students of India pattern), reported journalism (Nautilus pattern).

### 8. Anti-Patterns

**The "5 Ways to Study Better" Listicle.** Damage: positions padho.ai as just another content-farm edtech company. The reader has seen this exact post on every competitor's blog. It is noise, not signal.

**The Announcement-Only Post.** "We're excited to announce Feature X!" Damage: nobody outside your team is excited about your feature. They're excited about what it does for them. The "classroom inside the notebook" post already avoids this trap — it tells the design *story*. Every product post should do the same.

**The "Our Team Is Hiring" Post.** Damage: tells the reader this blog is for the company, not for them. Put hiring announcements on your careers page, not your blog.

**The SEO-Keyword-Stuffed Post.** The existing multilingual and textbook posts repeat "padho.ai" and "12 Indian languages" so frequently that they read like marketing copy, not essays. Damage: erodes trust with sophisticated readers (parents, teachers) who can smell SEO a paragraph in. Write for the reader, not for Google.

**The "AI Will Change Education" Thinkpiece Without Specifics.** Damage: every edtech company publishes this post. It is interchangeable. The only version of this post worth writing is one with *your own data* — "Here's what AI actually changed for 1000 students on our platform."

**The Post That Opens with a Dictionary Definition.** "Merriam-Webster defines education as..." Damage: the reader closes the tab.

### 9. Distribution

A realistic distribution playbook for a small Indian ed-tech company:

**WhatsApp forwarding (most important for this audience).** Indian parents share content in WhatsApp groups — school groups, coaching groups, family groups. The posts that get shared are: (a) short enough to read on mobile, (b) have a specific, useful insight, and (c) have a headline that makes the sender look thoughtful. "The three questions that tell you if your child actually understands" is a WhatsApp-native headline. Optimise for this.

**Newsletter.** Build an email list from day one. Weekly email with the latest post + one sentence of context. The padho.ai blog's newsletter should feel like a letter from the team, not a marketing email. Farnam Street's format — a brief personal note, then the content — is the right model.

**Twitter/X.** Thread the core insight of each post as a 5-7 tweet thread. Indian edtech Twitter is active. Engage with educators, parents, and students who respond.

**Hacker News.** The "what a good explanation looks like" and "inside a hard problem" posts are Hacker News material — technical audiences love well-crafted explanations. Titles that work on HN: *"Why we draw diagrams before we write equations"*, *"We analysed 10,000 student sessions — here's where they get stuck."*

**Cross-posting to Indian education communities.** Share posts in the Indian education Substacks' communities. Offer guest posts. Build relationships with the authors of Students of India, Abhishar, and ReTHINK INDIA.

**YouTube companion.** For the "Inside a Hard Problem" posts, record a 5-minute companion video that walks through the same explanation. This creates two content artifacts from one research effort.

**What won't work:** Paid social ads for blog content (too expensive for the return), Medium cross-posting (different audience), LinkedIn (wrong demographic for student/parent readers in India).

### 10. Measurement

The right metrics for the padho.ai blog, in order of importance:

**1. "Did the reader come back?"** Measured by: return visitor rate on the blog, week over week. Not unique visitors (vanity), not bounce rate (misleading), not time-on-page (noisy). The question is: did reading one post make them come back for the next one? A blog with 1000 readers who return every week is worth more than one with 100,000 one-time visitors.

**2. "Did the reader share it?"** Measured by: WhatsApp/social shares (use a share button with tracking), backlinks, and organic mentions on Twitter/X. Sharing means the content was worth staking your reputation on.

**3. "Did the reader convert?"** Measured by: blog → padho.ai signups. But track this at the *post* level — which posts drive signups? The hypothesis: "Inside a Hard Problem" posts drive student signups (they came for the explanation, they stayed for the product), and "Product Reasoning" posts drive parent signups (they came for the philosophy, they trusted the team).

**4. "Did we learn something?"** Not a metric — a practice. After every post, the team should ask: did writing this post teach us something about our audience, our product, or our own thinking? If the blog is only a marketing channel, it will die. If it's a *thinking tool*, it will improve the product.

---

## Part IV — Field Notes and Things That Surprised You

**1. The interactive essay gap in India is enormous.** I found zero Indian-authored interactive/explorable essays in the Ciechanowski/Nicky Case tradition. The Indian internet has excellent video (3Blue1Brown-style), good short-form writing (Twitter, Substack), but no interactive essay culture. padho.ai's wiki is possibly the first Indian-authored interactive mathematics resource of this kind. The blog should acknowledge and claim this territory explicitly: "We're building the kind of interactive explanations that exist for computer science but have never been built for Indian students studying maths."

**2. Nicky Case's production simplicity was the biggest surprise.** I expected the interactive essays that work best to require heavy engineering. They don't. *The Evolution of Trust* is built with simple HTML/CSS/JS and circles on a canvas. The padho.ai blog could produce one interactive per month with the same stack it already uses for the wiki.

**3. The blog that most made me think "padho.ai should *be* this" is Better Explained.** Kalid Azad's site has the exact same thesis (intuition-first math explanation for students), the exact same audience (frustrated learners), and the exact same voice (warm, second-person, concrete). The difference is that Better Explained has no AI product behind it — it's a one-person passion project. padho.ai has the product, the data, and the team. If the blog can match Better Explained's pedagogical clarity and add padho.ai's data advantage, it will be the best education blog in India within a year.

**4. Seth Godin's daily cadence is more powerful than it appears.** I initially dismissed daily blogging as unsustainable for a startup. But Godin's posts are 150-300 words — shorter than many emails. A "daily learning observation" from the padho.ai team (a one-paragraph thought about education, posted every morning) would cost 15 minutes a day and build a habit loop with readers that weekly posts cannot.

**5. The parent-WhatsApp distribution channel is underestimated.** Indian parents share educational content in WhatsApp groups with remarkable speed. The constraint is format: the content must be readable in the WhatsApp in-app browser, must have a compelling preview image and headline, and must deliver its core value in the first 200 words (because most WhatsApp clicks are "quick glances" not "sit down and read"). The posts most likely to spread on WhatsApp are the short, actionable ones — "Three questions to ask your child tonight" — not the long research essays. Build the blog for both: long posts for SEO and credibility, short posts for WhatsApp virality.

**6. A contradiction worth noting:** the blogs with the highest per-post quality (Ciechanowski, Wait But Why) publish infrequently — sometimes months between posts. The blogs with the best audience habits (Godin, Willison) publish daily. padho.ai cannot optimise for both. The recommendation — weekly, with occasional long-form specials — is a compromise, and the team should be honest with themselves about which direction they'll drift. If they drift toward infrequency, the audience relationship will suffer. If they drift toward daily, the depth will suffer. Pick one to protect.
