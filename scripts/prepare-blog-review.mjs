import fs from 'node:fs/promises';
import process from 'node:process';

const [pullRequestFile, articleFile] = process.argv.slice(2);
if (!pullRequestFile || !articleFile) {
	console.error('Usage: node scripts/prepare-blog-review.mjs <pull-request.json> <article.md>');
	process.exit(2);
}

const reviewer = process.env.BLOG_REVIEWER;
if (!reviewer) throw new Error('BLOG_REVIEWER is required.');

const [pullRequestJson, article] = await Promise.all([
	fs.readFile(pullRequestFile, 'utf8').then(JSON.parse),
	fs.readFile(articleFile, 'utf8'),
]);

if (!pullRequestJson?.number || !pullRequestJson?.url) {
	throw new Error('The pull-request file does not contain a valid review PR.');
}

const cleanArticle = article.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '').trim();
const title = article.match(/^title:\s*["']?(.+?)["']?\s*$/m)?.[1] ?? pullRequestJson.title;
let revisionSummary = '';
try {
	revisionSummary = (await fs.readFile('.daily-blog/revision-summary.txt', 'utf8')).trim();
} catch (error) {
	if (error.code !== 'ENOENT') throw error;
}

const message = [
	`@${reviewer} your ${revisionSummary ? 'revised ' : ''}daily Padho blog is ready.`,
	...(revisionSummary ? ['', `**What changed:** ${revisionSummary}`] : []),
	'',
	`# ${title}`,
	'',
	cleanArticle,
	'',
	'---',
	'',
	'## Reply from email',
	'',
	'- Reply `APPROVE` to merge this article after all checks pass.',
	'- Reply `SKIP` if you do not want this topic.',
	'- Otherwise, write your feedback normally. A revised draft will be sent again.',
	'',
	'Nothing is merged from silence. An approval must come from the configured reviewer.',
	'',
	`[Open the pull request](${pullRequestJson.url})`,
	'',
].join('\n');

await fs.mkdir('.daily-blog', { recursive: true });
await fs.writeFile('.daily-blog/review-comment.md', message, 'utf8');

console.log(`Prepared review message for PR #${pullRequestJson.number}.`);
