import assert from 'node:assert/strict';
import test from 'node:test';
import {
	buildBlogReviewEmail,
	buildMissingBlogEmail,
	readTitle,
	stripFrontmatter,
} from './lib/blog-email.mjs';

const issue = {
	number: 3,
	title: 'Daily blog review: Memory fades at different speeds',
	url: 'https://github.com/openeducationai/blog/issues/3',
};
const article = `---
title: "Memory fades at different speeds"
pubDate: 2026-09-27
---

Learning schedules should follow recall risk.

## One useful mechanism

- Ask for an answer.
- Update the estimate.

Read the [source](https://example.com/research) and use \`p = 2^(-d/h)\`.
`;

test('builds an SES payload containing the full article and review link', () => {
	const email = buildBlogReviewEmail({
		reviewIssue: issue,
		article,
		reviewerEmail: 'dipti@padho.ai',
		senderEmail: 'Padho Blog <blog@padho.ai>',
	});

	assert.equal(email.Source, 'Padho Blog <blog@padho.ai>');
	assert.deepEqual(email.Destination.ToAddresses, ['dipti@padho.ai']);
	assert.equal(email.Message.Subject.Data, '[Padho blog review] Memory fades at different speeds');
	assert.match(email.Message.Body.Text.Data, /Learning schedules should follow recall risk/);
	assert.match(email.Message.Body.Text.Data, /github\.com\/openeducationai\/blog\/issues\/3/);
	assert.match(email.Message.Body.Html.Data, /<h3[^>]*>One useful mechanism<\/h3>/);
	assert.match(email.Message.Body.Html.Data, /href="https:\/\/example\.com\/research"/);
	assert.match(email.Message.Body.Html.Data, /<code[^>]*>p = 2\^\(-d\/h\)<\/code>/);
	assert.equal('ReplyToAddresses' in email, false);
});

test('marks a revised blog clearly', () => {
	const email = buildBlogReviewEmail({
		reviewIssue: issue,
		article,
		reviewerEmail: 'dipti@padho.ai',
		senderEmail: 'Padho Blog <blog@padho.ai>',
		revisionSummary: 'Made the example shorter.',
	});
	assert.match(email.Message.Subject.Data, /^\[Revised Padho blog]/);
	assert.match(email.Message.Body.Text.Data, /What changed: Made the example shorter/);
});

test('builds a clear alert when the writing job creates no draft', () => {
	const email = buildMissingBlogEmail({
		reviewerEmail: 'dipti@padho.ai',
		senderEmail: 'Padho Blog <reach@padho.ai>',
		date: '2026-09-30',
	});
	assert.equal(email.Source, 'Padho Blog <reach@padho.ai>');
	assert.match(email.Message.Subject.Data, /No draft was created for 2026-09-30/);
	assert.match(email.Message.Body.Text.Data, /05:45 writing job did not create/);
	assert.match(email.Message.Body.Text.Data, /No older article was resent/);
});

test('rejects headers and review URLs that are not trusted', () => {
	assert.throws(
		() =>
			buildBlogReviewEmail({
				reviewIssue: { ...issue, url: 'https://example.com/fake' },
				article,
				reviewerEmail: 'dipti@padho.ai\nBcc: attacker@example.com',
				senderEmail: 'blog@padho.ai',
			}),
		/valid Padho blog review issue/,
	);
	assert.throws(
		() =>
			buildBlogReviewEmail({
				reviewIssue: issue,
				article,
				reviewerEmail: 'dipti@padho.ai\nBcc: attacker@example.com',
				senderEmail: 'blog@padho.ai',
			}),
		/BLOG_REVIEW_EMAIL/,
	);
});

test('reads title and removes frontmatter', () => {
	assert.equal(readTitle(article), 'Memory fades at different speeds');
	assert.doesNotMatch(stripFrontmatter(article), /pubDate/);
});
