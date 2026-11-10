import fs from 'node:fs/promises';
import { inspectBlog } from './lib/blog-style.mjs';

const files = process.argv.slice(2);

if (!files.length) {
	console.error('Usage: node scripts/check-blog-style.mjs <post.md> [post.md ...]');
	process.exit(2);
}

let failed = false;

for (const file of files) {
	const markdown = await fs.readFile(file, 'utf8');
	const result = inspectBlog(markdown);
	console.log(`${file}: ${JSON.stringify(result.metrics)}`);
	if (result.issues.length) {
		failed = true;
		for (const issue of result.issues) console.error(`  - ${issue}`);
	}
}

if (failed) process.exit(1);
