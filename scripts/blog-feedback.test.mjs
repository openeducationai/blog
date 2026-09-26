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
	});

	const ignored = await classify({ author: 'someone-else', body: 'APPROVE' });
	assert.equal(ignored.process, false);
	assert.equal(ignored.action, 'ignore');
});

test('treats a normal email reply as revision feedback', async () => {
	const result = await classify({
		author: 'dipti-mathur',
		body: 'The opening is still too technical. Use a simpler example.',
	});
	assert.equal(result.process, true);
	assert.equal(result.action, 'revise');
});

test('ignores reviewer comments on unrelated pull requests', async () => {
	const result = await classify({
		author: 'dipti-mathur',
		body: 'APPROVE',
		branch: 'feature/unrelated',
	});
	assert.equal(result.process, false);
});

async function classify({ author, body, branch = 'automation/daily-blog-2026-09-26' }) {
	const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'padho-blog-feedback-'));
	const eventFile = path.join(directory, 'event.json');
	const pullRequestFile = path.join(directory, 'pr.json');

	await Promise.all([
		fs.writeFile(
			eventFile,
			JSON.stringify({ comment: { user: { login: author }, body } }),
			'utf8',
		),
		fs.writeFile(
			pullRequestFile,
			JSON.stringify({ headRefName: branch, state: 'OPEN' }),
			'utf8',
		),
	]);

	const run = spawnSync(process.execPath, [script, eventFile, pullRequestFile], {
		cwd: directory,
		env: { ...process.env, BLOG_REVIEWER: 'dipti-mathur' },
		encoding: 'utf8',
	});

	assert.equal(run.status, 0, run.stderr);
	return JSON.parse(run.stdout);
}
