import fs from 'node:fs/promises';
import process from 'node:process';

const [eventFile, pullRequestFile] = process.argv.slice(2);
if (!eventFile || !pullRequestFile) {
	console.error('Usage: node scripts/classify-blog-feedback.mjs <event.json> <pull-request.json>');
	process.exit(2);
}

const reviewer = process.env.BLOG_REVIEWER?.trim();
if (!reviewer) throw new Error('BLOG_REVIEWER is required.');

const [event, pullRequest] = await Promise.all([
	fs.readFile(eventFile, 'utf8').then(JSON.parse),
	fs.readFile(pullRequestFile, 'utf8').then(JSON.parse),
]);

const author = event.comment?.user?.login ?? '';
const branch = pullRequest.headRefName ?? '';
const state = pullRequest.state ?? '';
const body = String(event.comment?.body ?? '').trim();
const firstLine = body.split(/\r?\n/, 1)[0].trim().toUpperCase();

let decision = { process: false, action: 'ignore', reason: '' };

if (author.toLowerCase() !== reviewer.toLowerCase()) {
	decision.reason = `Comment author ${author || '(unknown)'} is not the configured reviewer.`;
} else if (state !== 'OPEN') {
	decision.reason = 'The pull request is not open.';
} else if (!branch.startsWith('automation/daily-blog-')) {
	decision.reason = 'The pull request is not a daily blog draft.';
} else if (!body) {
	decision.reason = 'The reply is empty.';
} else if (firstLine === 'APPROVE') {
	decision = { process: true, action: 'approve', reason: 'Reviewer approved the draft.' };
} else if (firstLine === 'SKIP') {
	decision = { process: true, action: 'skip', reason: 'Reviewer skipped the draft.' };
} else {
	decision = { process: true, action: 'revise', reason: 'Reviewer supplied revision feedback.' };
	await fs.mkdir('.daily-blog', { recursive: true });
	await fs.writeFile('.daily-blog/reviewer-feedback.txt', `${body}\n`, 'utf8');
}

process.stdout.write(`${JSON.stringify(decision)}\n`);
