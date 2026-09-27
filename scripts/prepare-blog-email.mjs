import fs from 'node:fs/promises';
import process from 'node:process';
import { buildBlogReviewEmail } from './lib/blog-email.mjs';

const [reviewIssueFile, articleFile] = process.argv.slice(2);
if (!reviewIssueFile || !articleFile) {
	console.error('Usage: node scripts/prepare-blog-email.mjs <review-issue.json> <article.md>');
	process.exit(2);
}

const [reviewIssue, article] = await Promise.all([
	fs.readFile(reviewIssueFile, 'utf8').then(JSON.parse),
	fs.readFile(articleFile, 'utf8'),
]);

let revisionSummary = '';
try {
	revisionSummary = (await fs.readFile('.daily-blog/revision-summary.txt', 'utf8')).trim();
} catch (error) {
	if (error.code !== 'ENOENT') throw error;
}

const email = buildBlogReviewEmail({
	reviewIssue,
	article,
	reviewerEmail: process.env.BLOG_REVIEW_EMAIL,
	senderEmail: process.env.SES_SENDER_EMAIL,
	revisionSummary,
});

await fs.mkdir('.daily-blog', { recursive: true });
await fs.writeFile('.daily-blog/ses-email.json', `${JSON.stringify(email, null, 2)}\n`, 'utf8');
console.log(`Prepared SES blog review email for issue #${reviewIssue.number}.`);
