import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? files(path.join(directory, entry.name)) : path.join(directory, entry.name)))).flat();
}
let pages = 0;
const bundles = new Set();
for (const file of await files(root)) {
  if (!file.endsWith('.html')) continue;
  const html = await readFile(file, 'utf8');
  if (/http-equiv="refresh"/i.test(html)) continue;
  const contexts = [...html.matchAll(/<script id="blog-analytics-context"[^>]*>([\s\S]*?)<\/script>/g)];
  if (contexts.length !== 1) throw new Error(`Expected one analytics context: ${file}`);
  const context = JSON.parse(contexts[0][1]);
  if (context.product_surface !== 'blog' || !['index', 'category', 'article', 'not_found'].includes(context.blog_page_type)) throw new Error(`Invalid analytics context: ${file}`);
  if (context.blog_page_type === 'article' && (!context.article_slug || !context.article_title || !context.blog_category)) throw new Error(`Missing article analytics metadata: ${file}`);
  const scripts = [...html.matchAll(/<script[^>]*src="([^"]*BlogAnalytics[^"]*\.js)"/g)];
  if (scripts.length !== 1) throw new Error(`Expected one analytics bundle: ${file}`);
  bundles.add(path.join(root, scripts[0][1].replace(/^\/blog\//, '')));
  pages++;
}
if (!pages) throw new Error('Build the blog before checking analytics.');
for (const file of bundles) {
  const js = await readFile(file, 'utf8');
  if (!/phc_[A-Za-z0-9]{20,}/.test(js) || !js.includes('https://us.i.posthog.com')) {
    throw new Error('Production analytics configuration is missing. Set PUBLIC_POSTHOG_KEY and PUBLIC_POSTHOG_HOST in .env.production, then rebuild.');
  }
  for (const event of ['blog_reading_progress', 'blog_visual_interacted', 'blog_solution_opened', 'marketing_cta_clicked']) {
    if (!js.includes(event)) throw new Error(`Analytics event missing from build: ${event}`);
  }
}
console.log(`Analytics check passed: ${pages} pages, one shared configured SDK bundle.`);
