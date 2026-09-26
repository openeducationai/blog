import fs from 'node:fs/promises';
import process from 'node:process';

const [reviewIssueFile, articleFile] = process.argv.slice(2);
if (!reviewIssueFile || !articleFile) {
	console.error('Usage: node scripts/prepare-blog-review.mjs <review-issue.json> <article.md>');
	process.exit(2);
}

const reviewer = process.env.BLOG_REVIEWER;
if (!reviewer) throw new Error('BLOG_REVIEWER is required.');

const [reviewIssue, article] = await Promise.all([
	fs.readFile(reviewIssueFile, 'utf8').then(JSON.parse),
	fs.readFile(articleFile, 'utf8'),
]);

if (!reviewIssue?.number || !reviewIssue?.url) {
	throw new Error('The issue file does not contain a valid blog review issue.');
}

const cleanArticle = article.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '').trim();
const title = article.match(/^title:\s*["']?(.+?)["']?\s*$/m)?.[1] ?? reviewIssue.title;
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
	'- Reply `APPROVE` to mark the article ready for a pull request.',
	'- Reply `SKIP` if you do not want this topic.',
	'- Otherwise, write your feedback normally. A revised draft will be sent again.',
	'',
	'After approval, the Padho marketing app opens a PR in the blog repo.',
	'You still review and merge that PR manually. Nothing is published from silence.',
	'',
	`[Open the review issue](${reviewIssue.url})`,
	'',
].join('\n');

await fs.mkdir('.daily-blog', { recursive: true });
await fs.writeFile('.daily-blog/review-comment.md', message, 'utf8');

console.log(`Prepared review message for issue #${reviewIssue.number}.`);
