import fs from 'node:fs/promises';
import process from 'node:process';
import { queueFeedbackComment } from './lib/blog-review.mjs';

const [decisionFile, reviewIssueFile, outputFile = '.daily-blog/review-issue-body.md'] =
	process.argv.slice(2);
if (!decisionFile || !reviewIssueFile) {
	console.error(
		'Usage: node scripts/queue-blog-feedback.mjs <decision.json> <review-issue.json> [output.md]',
	);
	process.exit(2);
}

const [decision, reviewIssue] = await Promise.all([
	fs.readFile(decisionFile, 'utf8').then(JSON.parse),
	fs.readFile(reviewIssueFile, 'utf8').then(JSON.parse),
]);

if (!decision.process || decision.action !== 'revise') {
	throw new Error('Only validated revision feedback can be queued.');
}

const body = queueFeedbackComment(reviewIssue.body, decision.feedbackCommentId);
await fs.writeFile(outputFile, body, 'utf8');
console.log(`Queued feedback comment ${decision.feedbackCommentId}.`);
