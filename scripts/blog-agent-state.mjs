import process from 'node:process';
import {
	BLOG_REPOSITORY,
	ghJson,
	listOpenDailyBlogPullRequests,
	listReviewIssues,
	readRemoteArticle,
} from './lib/blog-agent.mjs';
import {
	hasLabel,
	parseFeedbackCommentIds,
	parseReviewMetadata,
} from './lib/blog-review.mjs';

const reviews = listReviewIssues();
if (reviews.length > 1) {
	throw new Error(`Found ${reviews.length} open daily blog reviews. Resolve them before continuing.`);
}

if (!reviews.length) {
	const pullRequests = listOpenDailyBlogPullRequests();
	const state = pullRequests.length
		? {
				action: 'wait_for_merge',
				repository: BLOG_REPOSITORY,
				reason: 'A previously approved daily blog pull request is still open.',
				pullRequests,
			}
		: {
				action: 'generate',
				repository: BLOG_REPOSITORY,
				reason: 'No daily blog is awaiting review or merge.',
			};
	process.stdout.write(`${JSON.stringify(state, null, 2)}\n`);
	process.exit(0);
}

const review = reviews[0];
const metadata = parseReviewMetadata(review);
if (hasLabel(review, 'daily-blog-approved')) {
	process.stdout.write(
		`${JSON.stringify(
			{
				action: 'wait_for_pr',
				repository: BLOG_REPOSITORY,
				reason: 'The current draft is approved and is waiting for the 16:05 PR run.',
				issueNumber: review.number,
				issueUrl: review.url,
				...metadata,
			},
			null,
			2,
		)}\n`,
	);
	process.exit(0);
}

const feedbackCommentIds = parseFeedbackCommentIds(review);
if (hasLabel(review, 'daily-blog-revision-requested') || feedbackCommentIds.length) {
	if (!feedbackCommentIds.length) {
		throw new Error(`Issue #${review.number} requests a revision but contains no queued feedback.`);
	}
	const feedback = feedbackCommentIds.map((id) => {
		const comment = ghJson(['api', `repos/${BLOG_REPOSITORY}/issues/comments/${id}`]);
		return {
			id,
			author: comment.user?.login ?? '',
			createdAt: comment.created_at ?? '',
			body: String(comment.body ?? '').trim(),
		};
	});
	process.stdout.write(
		`${JSON.stringify(
			{
				action: 'revise',
				repository: BLOG_REPOSITORY,
				reason: 'The reviewer supplied feedback for the current draft.',
				issueNumber: review.number,
				issueUrl: review.url,
				...metadata,
				feedback,
				articleMarkdown: readRemoteArticle(metadata.post, metadata.branch),
			},
			null,
			2,
		)}\n`,
	);
	process.exit(0);
}

process.stdout.write(
	`${JSON.stringify(
		{
			action: 'wait_for_review',
			repository: BLOG_REPOSITORY,
			reason: 'The current draft is still awaiting reviewer input.',
			issueNumber: review.number,
			issueUrl: review.url,
			...metadata,
		},
		null,
		2,
	)}\n`,
);
