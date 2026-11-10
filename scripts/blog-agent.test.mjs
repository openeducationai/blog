import assert from 'node:assert/strict';
import test from 'node:test';
import { externalLinks, indiaDate, readFrontmatter } from './lib/blog-agent.mjs';

test('uses the India calendar date for daily branches', () => {
	assert.equal(indiaDate(new Date('2026-09-26T20:00:00Z')), '2026-09-27');
});

test('reads the required scalar frontmatter fields', () => {
	const data = readFrontmatter(
		'---\ntitle: "A clear title"\npubDate: 2026-09-27\ntags: ["AI", "learning"]\n---\n\nBody\n',
	);
	assert.equal(data.title, 'A clear title');
	assert.equal(data.pubDate, '2026-09-27');
	assert.deepEqual(data.tags, ['AI', 'learning']);
});

test('canonicalizes source links before revision comparison', () => {
	const links = externalLinks(
		'[one](https://example.com/paper/#result) and [two](https://example.com/paper)',
	);
	assert.deepEqual([...links], ['https://example.com/paper']);
});
