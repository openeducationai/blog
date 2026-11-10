import fs from 'node:fs/promises';
import process from 'node:process';
import { parseReviewMetadata } from './lib/blog-review.mjs';

const [reviewIssueFile] = process.argv.slice(2);
if (!reviewIssueFile) {
	console.error('Usage: node scripts/read-blog-review.mjs <review-issue.json>');
	process.exit(2);
}

const reviewIssue = JSON.parse(await fs.readFile(reviewIssueFile, 'utf8'));
process.stdout.write(`${JSON.stringify(parseReviewMetadata(reviewIssue))}\n`);
