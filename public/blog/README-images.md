# Blog images

**Blog post images** (referenced in Markdown with relative paths like `change_lang.png`) live in **`src/content/blog/`**, not in `public/`. Astro’s content pipeline resolves them from there.

Current images in `src/content/blog/`:
- `change_lang.png` — language selector
- `upload_pdf.png` — upload step
- `punjabi_pdf.png` — Punjabi book
- `explain_local.png` — Explain popup
- `solve_pdf.png` — Solve button

**`public/`** is for site-wide assets (e.g. `padhoai.svg`, `favicon`).
