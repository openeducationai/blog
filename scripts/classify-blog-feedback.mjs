import fs from 'node:fs/promises';
import process from 'node:process';
import { hasLabel, parseReviewMetadata } from './lib/blog-review.mjs';

const [eventFile, reviewIssueFile] = process.argv.slice(2);
if (!eventFile || !reviewIssueFile) {
	console.error('Usage: node scripts/classify-blog-feedback.mjs <event.json> <review-issue.json>');
	process.exit(2);
}

const reviewer = process.env.BLOG_REVIEWER?.trim();
if (!reviewer) throw new Error('BLOG_REVIEWER is required.');

const [event, reviewIssue] = await Promise.all([
	fs.readFile(eventFile, 'utf8').then(JSON.parse),
	fs.readFile(reviewIssueFile, 'utf8').then(JSON.parse),
]);

const author = event.comment?.user?.login ?? '';
const state = reviewIssue.state ?? '';
const body = String(event.comment?.body ?? '').trim();
const firstLine = body.split(/\r?\n/, 1)[0].trim().toUpperCase();
const commentId = Number(event.comment?.id);

let decision = { process: false, action: 'ignore', reason: '', branch: '', post: '' };
let metadata;

if (author.toLowerCase() !== reviewer.toLowerCase()) {
	decision.reason = `Comment author ${author || '(unknown)'} is not the configured reviewer.`;
} else if (state !== 'OPEN') {
	decision.reason = 'The review issue is not open.';
} else if (hasLabel(reviewIssue, 'daily-blog-approved')) {
	decision.reason = 'The draft is already approved.';
} else if (!body) {
	decision.reason = 'The reply is empty.';
} else if (firstLine === 'APPROVE' && hasLabel(reviewIssue, 'daily-blog-revision-requested')) {
	decision.reason = 'A requested revision must be completed before this draft can be approved.';
} else if (firstLine === 'APPROVE') {
	try {
		metadata = parseReviewMetadata(reviewIssue);
		decision = {
			process: true,
			action: 'approve',
			reason: 'Reviewer approved the draft.',
			...metadata,
		};
	} catch (error) {
		decision.reason = error.message;
	}
} else if (firstLine === 'SKIP') {
	try {
		metadata = parseReviewMetadata(reviewIssue);
		decision = {
			process: true,
			action: 'skip',
			reason: 'Reviewer skipped the draft.',
			...metadata,
		};
	} catch (error) {
		decision.reason = error.message;
	}
} else {
	try {
		if (!Number.isSafeInteger(commentId) || commentId <= 0) {
			throw new Error('The feedback comment has no valid GitHub comment ID.');
		}
		metadata = parseReviewMetadata(reviewIssue);
		decision = {
			process: true,
			action: 'revise',
			reason: 'Reviewer supplied revision feedback.',
			feedbackCommentId: commentId,
			...metadata,
		};
	} catch (error) {
		decision.reason = error.message;
	}
}

process.stdout.write(`${JSON.stringify(decision)}\n`);
