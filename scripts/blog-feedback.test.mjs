import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('./classify-blog-feedback.mjs', import.meta.url));

test('accepts approval only from the configured reviewer', async () => {
	const approved = await classify({ author: 'dipti-mathur', body: 'APPROVE' });
	assert.deepEqual(approved, {
		process: true,
		action: 'approve',
		reason: 'Reviewer approved the draft.',
		branch: 'automation/daily-blog-2026-09-26',
		post: 'src/content/blog/example.md',
	});

	const ignored = await classify({ author: 'someone-else', body: 'APPROVE' });
	assert.equal(ignored.process, false);
	assert.equal(ignored.action, 'ignore');
});

test('treats a normal review comment as revision feedback', async () => {
	const result = await classify({
		author: 'dipti-mathur',
		body: 'The opening is still too technical. Use a simpler example.',
	});
	assert.equal(result.process, true);
	assert.equal(result.action, 'revise');
	assert.equal(result.feedbackCommentId, 12345);
});

test('does not approve a draft while revision feedback is queued', async () => {
	const result = await classify({
		author: 'dipti-mathur',
		body: 'APPROVE',
		labels: [{ name: 'daily-blog-review' }, { name: 'daily-blog-revision-requested' }],
	});
	assert.equal(result.process, false);
	assert.match(result.reason, /revision must be completed/i);
});

test('ignores reviewer comments on unrelated issues', async () => {
	const result = await classify({
		author: 'dipti-mathur',
		body: 'APPROVE',
		reviewBody: 'This is an unrelated issue.',
	});
	assert.equal(result.process, false);
});

test('ignores more replies after a draft is approved', async () => {
	const result = await classify({
		author: 'dipti-mathur',
		body: 'Change the opening again.',
		labels: [{ name: 'daily-blog-review' }, { name: 'daily-blog-approved' }],
	});
	assert.equal(result.process, false);
	assert.equal(result.reason, 'The draft is already approved.');
});

async function classify({
	author,
	body,
	reviewBody = '<!-- padho-daily-blog-review {"branch":"automation/daily-blog-2026-09-26","post":"src/content/blog/example.md"} -->',
	labels = [{ name: 'daily-blog-review' }],
}) {
	const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'padho-blog-feedback-'));
	const eventFile = path.join(directory, 'event.json');
	const reviewIssueFile = path.join(directory, 'issue.json');

	await Promise.all([
		fs.writeFile(
			eventFile,
			JSON.stringify({ comment: { id: 12345, user: { login: author }, body } }),
			'utf8',
		),
		fs.writeFile(reviewIssueFile, JSON.stringify({ body: reviewBody, state: 'OPEN', labels }), 'utf8'),
	]);

	const run = spawnSync(process.execPath, [script, eventFile, reviewIssueFile], {
		cwd: directory,
		env: { ...process.env, BLOG_REVIEWER: 'dipti-mathur' },
		encoding: 'utf8',
	});

	assert.equal(run.status, 0, run.stderr);
	return JSON.parse(run.stdout);
}
