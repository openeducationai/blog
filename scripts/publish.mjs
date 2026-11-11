import { readFile, readdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const bucket = 'padho-ai-marketing';
const project = 'edtech-05101987';
const prefix = 'blog/';
const dryRun = process.argv.includes('--dry-run');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.xml': 'application/xml', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };

// Reject a build with missing or inconsistent article search metadata before any upload.
execFileSync('node', [path.join(root, 'scripts/blog-editorial.mjs'), 'check'], { cwd: root, stdio: 'inherit' });
execFileSync('python3', [path.join(root, 'scripts/check-search.py')], { cwd: root, stdio: 'inherit' });
execFileSync('node', [path.join(root, 'scripts/check-analytics.mjs')], { cwd: root, stdio: 'inherit' });

async function walk(dir, relative = '') {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const name = path.posix.join(relative, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path.join(dir, entry.name), name));
    else if (entry.isFile()) files.push(name);
  }
  return files;
}

const files = await walk(path.join(root, 'dist'));
const homepage = await readFile(path.join(root, 'dist/index.html'), 'utf8');
if (!homepage.includes('href="https://padho.ai/blog/"') || !files.includes('sitemap-index.xml')) {
  throw new Error('Build the blog for https://padho.ai/blog/ before publishing.');
}
// Upload hashed assets first, then documents, and the entry page last.
files.sort((a, b) => Number(!a.startsWith('_astro/')) - Number(!b.startsWith('_astro/')) || Number(a === 'index.html') - Number(b === 'index.html') || a.localeCompare(b));
if (dryRun) {
  console.log(JSON.stringify({ bucket, objects: [...files.map(file => prefix + file), 'blog'], publicURL: 'https://padho.ai/blog', retained: 'Previously published hashed assets under blog/_astro/', deletes: 'Stale objects under blog/ only, excluding _astro/' }, null, 2));
  process.exit(0);
}

// Keep the existing CLI credential in memory only; never print or save it.
const token = execFileSync('gcloud', ['auth', 'print-access-token'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }).trim();
const api = `https://storage.googleapis.com/storage/v1/b/${bucket}`;
async function request(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { ...options.headers, Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error(`Cloud Storage request failed (${response.status}): ${await response.text()}`);
  return response;
}
const metadata = await (await request(`${api}?fields=website`)).json();
if (metadata.website?.mainPageSuffix !== 'index.html') {
  throw new Error('The existing marketing bucket must already serve index.html. No bucket settings were changed.');
}

const existing = new Map();
let nextPage;
do {
  const query = new URLSearchParams({ prefix, fields: 'items(name,generation),nextPageToken' });
  if (nextPage) query.set('pageToken', nextPage);
  const page = await (await request(`${api}/o?${query}`)).json();
  for (const object of page.items ?? []) existing.set(object.name, object.generation);
  nextPage = page.nextPageToken;
} while (nextPage);
// The exact /blog object prevents Cloud Storage from redirecting to /blog/index.html.
const alias = await fetch(`${api}/o/blog?fields=generation`, { headers: { Authorization: `Bearer ${token}` } });
if (alias.ok) existing.set('blog', (await alias.json()).generation);
else if (alias.status !== 404) throw new Error(`Could not inspect /blog (${alias.status}).`);

async function upload(name, file) {
  if (!name.startsWith(prefix) && name !== 'blog') throw new Error('Refusing to write outside the blog.');
  const hashedAsset = name.startsWith('blog/_astro/');
  if (hashedAsset && existing.has(name)) return;
  const data = await readFile(path.join(root, 'dist', file));
  const contentType = types[path.extname(file)] ?? 'application/octet-stream';
  const boundary = `padho-blog-${randomUUID()}`;
  const object = { name, contentType, cacheControl: hashedAsset ? 'public, max-age=31536000, immutable' : 'public, max-age=300, must-revalidate' };
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(object)}\r\n--${boundary}\r\nContent-Type: ${contentType}\r\n\r\n`),
    data, Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);
  const query = new URLSearchParams({ uploadType: 'multipart', ifGenerationMatch: existing.get(name) ?? '0' });
  await request(`https://storage.googleapis.com/upload/storage/v1/b/${bucket}/o?${query}`, {
    method: 'POST', headers: { 'Content-Type': `multipart/related; boundary=${boundary}` }, body,
  });
  console.log(`Uploaded ${name}`);
}
for (const file of files) await upload(prefix + file, file);
await upload('blog', 'index.html');
const keep = new Set(files.map(file => prefix + file));
for (const [name, generation] of existing) {
  if (!name.startsWith(prefix) || name.startsWith('blog/_astro/') || keep.has(name)) continue;
  await request(`${api}/o/${encodeURIComponent(name)}?ifGenerationMatch=${generation}`, { method: 'DELETE' });
  console.log(`Removed stale blog object ${name}`);
}
for (const cachePath of ['/blog', '/blog/*']) {
  execFileSync('gcloud', ['compute', 'url-maps', 'invalidate-cdn-cache', 'padhoai-https-redirect', `--project=${project}`, '--host=padho.ai', `--path=${cachePath}`, '--quiet'], { stdio: 'inherit' });
}
console.log('Published https://padho.ai/blog');
