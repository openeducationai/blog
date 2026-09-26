import fs from 'node:fs/promises';
import process from 'node:process';

const [branch, sha, reviewer] = process.argv.slice(2);
if (!branch || !sha || !reviewer) {
	console.error('Usage: node scripts/prepare-blog-approval.mjs <branch> <sha> <reviewer>');
	process.exit(2);
}
if (!/^automation\/daily-blog-\d{4}-\d{2}-\d{2}$/.test(branch)) {
	throw new Error(`Unsafe or invalid daily blog branch: ${branch}`);
}
if (!/^[0-9a-f]{40}$/.test(sha)) throw new Error(`Invalid approved commit SHA: ${sha}`);

const marker = `<!-- padho-daily-blog-approved ${JSON.stringify({ branch, sha })} -->`;
const message = [
	marker,
	'',
	`Content approved by @${reviewer}.`,
	'The Padho marketing app can now open the pull request.',
	'Publishing still requires a manual PR merge.',
	'',
].join('\n');

await fs.mkdir('.daily-blog', { recursive: true });
await fs.writeFile('.daily-blog/approval-comment.md', message, 'utf8');
