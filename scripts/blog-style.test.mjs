import assert from 'node:assert/strict';
import test from 'node:test';
import { inspectBlog } from './lib/blog-style.mjs';

function validPost() {
	const sentence = 'A tutor can use this signal to choose the next useful problem.';
	const section = (heading) => `## ${heading}\n\n${Array.from({ length: 20 }, () => sentence).join('\n\n')}`;
	return [
		'---',
		'title: "A clear technical idea for an adaptive tutor"',
		'description: "A plain explanation of one useful signal and the limits that matter when a tutor acts on it."',
		'pubDate: 2026-09-26',
		'---',
		'',
		section('The signal'),
		'',
		section('How it works'),
		'',
		section('Where it fails'),
		'',
		section('What to build'),
		'',
		'## Sources',
		'',
		'- [Source one](https://example.com/one)',
		'- [Source two](https://example.org/two)',
		'- [Source three](https://example.net/three)',
		'- [Source four](https://example.edu/four)',
		'',
	].join('\n');
}

test('accepts a concise, sourced article', () => {
	const result = inspectBlog(validPost());
	assert.deepEqual(result.issues, []);
	assert.equal(result.metrics.sourceLinks, 4);
});

test('rejects common AI filler and tangled punctuation', () => {
	const post = validPost()
		.replace('A tutor can use this signal', "In today's fast-paced world, a tutor can, moreover, use this signal")
		.replace('Where it fails', 'Where it fails; and why');
	const result = inspectBlog(post);
	assert.ok(result.issues.some((issue) => issue.includes('Banned phrases')));
	assert.ok(result.issues.some((issue) => issue.includes('semicolons')));
});
