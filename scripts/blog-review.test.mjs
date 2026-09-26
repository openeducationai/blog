import assert from 'node:assert/strict';
import test from 'node:test';
import { parseApprovalMetadata, parseReviewMetadata } from './lib/blog-review.mjs';

test('reads a constrained daily blog branch and post path', () => {
	const metadata = parseReviewMetadata({
		body: '<!-- padho-daily-blog-review {"branch":"automation/daily-blog-2026-09-27","post":"src/content/blog/a-clear-title.md"} -->',
	});
	assert.deepEqual(metadata, {
		branch: 'automation/daily-blog-2026-09-27',
		post: 'src/content/blog/a-clear-title.md',
	});
});

test('rejects review metadata that can escape the blog directory', () => {
	assert.throws(
		() =>
			parseReviewMetadata({
				body: '<!-- padho-daily-blog-review {"branch":"automation/daily-blog-2026-09-27","post":"../frontend/app.ts"} -->',
			}),
		/invalid daily blog path/i,
	);
});

test('reads only a full commit SHA from an approval record', () => {
	const valid = parseApprovalMetadata({
		body: '<!-- padho-daily-blog-approved {"branch":"automation/daily-blog-2026-09-27","sha":"0123456789abcdef0123456789abcdef01234567"} -->',
	});
	assert.deepEqual(valid, {
		branch: 'automation/daily-blog-2026-09-27',
		sha: '0123456789abcdef0123456789abcdef01234567',
	});
	assert.equal(
		parseApprovalMetadata({
			body: '<!-- padho-daily-blog-approved {"branch":"automation/daily-blog-2026-09-27","sha":"main"} -->',
		}),
		null,
	);
});
