import assert from 'node:assert/strict';
import test from 'node:test';
import {
	clearFeedbackComments,
	isSafeApprovedBlogComparison,
	parseApprovalMetadata,
	parseFeedbackCommentIds,
	parseReviewMetadata,
	queueFeedbackComment,
} from './lib/blog-review.mjs';

test('allows an approved one-file draft even when main advanced during review', () => {
	const post = 'src/content/blog/a-clear-title.md';
	const file = { filename: post, status: 'added' };
	assert.equal(
		isSafeApprovedBlogComparison({ status: 'ahead', ahead_by: 1, files: [file] }, post),
		true,
	);
	assert.equal(
		isSafeApprovedBlogComparison(
			{ status: 'diverged', ahead_by: 2, behind_by: 3, files: [file] },
			post,
		),
		true,
	);
	assert.equal(
		isSafeApprovedBlogComparison({ status: 'behind', ahead_by: 0, files: [] }, post),
		false,
	);
	assert.equal(
		isSafeApprovedBlogComparison(
			{ status: 'diverged', ahead_by: 2, files: [file, { filename: 'astro.config.mjs', status: 'modified' }] },
			post,
		),
		false,
	);
});

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

test('queues feedback IDs without copying email text into issue metadata', () => {
	const original = '<!-- padho-daily-blog-review {"branch":"automation/daily-blog-2026-09-27","post":"src/content/blog/a-clear-title.md"} -->\n\nReview me.\n';
	const once = queueFeedbackComment(original, 101);
	const twice = queueFeedbackComment(once, 202);
	const duplicate = queueFeedbackComment(twice, 101);
	assert.deepEqual(parseFeedbackCommentIds({ body: duplicate }), [101, 202]);

	const partlyCleared = clearFeedbackComments(duplicate, [101]);
	assert.deepEqual(partlyCleared.remaining, [202]);
	assert.deepEqual(parseFeedbackCommentIds({ body: partlyCleared.body }), [202]);

	const cleared = clearFeedbackComments(partlyCleared.body, [202]);
	assert.deepEqual(cleared.remaining, []);
	assert.deepEqual(parseFeedbackCommentIds({ body: cleared.body }), []);
});
