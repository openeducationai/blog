# Rolling blog review in Figma

The owner explicitly requested a new **Blogs** Design file on the existing
openeducationai Full-seat plan (`team::1488513447884601015`). Its file key is
`GsBNGG7jIMvsPyhP7w0zXK`; never create a new file for each run. The permanent
design reference remains Core Views `co2qZpIRPjghQaW8T7UHCA`, Blogs page `1906:2`.
Core Views' header/footer components are local/unpublished, so cross-file
`importComponentByKeyAsync` returned “not found” at setup. Do not loop that import.

Load the installed Figma use and generate-design skills before file work.
Create a fresh Figma session per run and use the exact returned session ID.
Read the dedicated file's pages and `editorial/figma-pages.json` before writes.

Use one date-named page (`YYYY-MM-DD`, Asia/Kolkata) per published batch. Within
it, retain editable article frames at desktop 1440 and phone 390 widths, named
`<category> · <slug> · Desktop` and `… · Phone`. Include each article's real
title, date/byline, cover, complete prose, figures, target question and final
questions/solutions. Show solution content in a readable review state if its
website presentation uses disclosure. Link the frames to their permanent live
article URLs. Do not add internal publishing commentary to the article frames.

When capturing through an isolated headless browser, activate the target tab and keep its CDP connection and viewport override open until the capture submission finishes. Closing early resets viewport size and background tabs may pause serialization. Verify the resulting Figma frame width is exactly 1440 or 390 before accepting it. Capture the real production preview when available to avoid the Astro development toolbar. If a development capture includes that toolbar, remove only its confirmed generated layer. Inline ReadingTerm buttons may split a paragraph into overlapping text layers: merge those pieces into one editable, justified text node while preserving the original text, font, colour and underline ranges. Verify its height fits the original paragraph. Clip top-level article frames to the browser viewport; full-bleed footer effects otherwise expand exports far beyond the frame.

Use the real Astro app and current content, retaining the exact shared header,
footer, background and typography. The dedicated file's earlier verified
frames are the nearest reusable reference. Use the current Figma capture skill
for new web views and `use_figma` for editable components/refinements; remove
complete-page screenshot references. Assert that content is editable text and
native layers, covers are discrete images, paragraphs use Literata, controls
use Inter and body paragraphs are justified. Check desktop and phone screenshots
for clipped text, broken equations and empty images. A successful tool call
alone is not a visual pass.

DS Approved's library key is
`lk-5f0a2b3b2644c40a268d893d014e0899930af7bafd588024f0b2e1ec910e68364fdb400abc55082cbeed223786978140a3276d0f05bfb04cb4343d40ebf3bd93`.
Use `search_design_system` scoped to it for applicable reading styles; do not
substitute the unrelated Littlehooman or generic community libraries. The
actual app's `src/styles/reading.css` and `tokens.css` are the matching source.

After verification, record `pageId`, `name`, `date`, `generated: true`,
`verified: true`, article slugs, frame IDs and the current source commit in
`editorial/figma-pages.json`. If resuming, update the recorded frames; do not
create a second page or lose comments. A rename or missing registered node
requires inspection before an automatic replacement or deletion.

Run `node scripts/blog-editorial.mjs prune-figma <today>` for a read-only expiry
plan. The retained window is today and the six preceding calendar dates.
Archive accessible review feedback, then match the file key, page ID and
date-name before calling `remove()` on each expired registered page. Preserve
the deletion receipt in `removedPages`, and only then remove its active entry.
Never delete the file itself, unregistered pages, current templates still in
use, Core Views, DS Approved, textbooks or website content. If there are no
expired registered pages, perform no deletion.
