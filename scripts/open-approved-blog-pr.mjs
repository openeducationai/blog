import { spawnSync } from 'node:child_process';
import process from 'node:process';
import {
	hasLabel,
	isSafeApprovedBlogComparison,
	parseApprovalMetadata,
	parseReviewMetadata,
} from './lib/blog-review.mjs';

const REPOSITORY = 'openeducationai/blog';
const GH = process.env.GH_BIN || 'gh';

const candidates = JSON.parse(
	runGh([
		'issue',
		'list',
		'--repo',
		REPOSITORY,
		'--state',
		'open',
		'--label',
		'daily-blog-review',
		'--label',
		'daily-blog-approved',
		'--limit',
		'20',
		'--json',
		'number,title,url,body,labels',
	]),
);

if (!candidates.length) {
	console.log('No approved Padho blog is waiting for a pull request.');
	process.exit(0);
}

for (const candidate of candidates) {
	if (!hasLabel(candidate, 'daily-blog-review') || !hasLabel(candidate, 'daily-blog-approved')) {
		continue;
	}

	const review = parseReviewMetadata(candidate);
	const issue = JSON.parse(
		runGh([
			'issue',
			'view',
			String(candidate.number),
			'--repo',
			REPOSITORY,
			'--json',
			'number,title,url,body,labels,comments',
		]),
	);
	const approval = [...(issue.comments ?? [])]
		.reverse()
		.filter((comment) =>
			/^(github-actions|github-actions\[bot\])$/i.test(String(comment?.author?.login ?? '')),
		)
		.map(parseApprovalMetadata)
		.find(Boolean);

	if (!approval || approval.branch !== review.branch) {
		throw new Error(`Issue #${issue.number} has no valid approval record for ${review.branch}.`);
	}

	const currentSha = runGh([
		'api',
		`repos/${REPOSITORY}/commits/${encodeURIComponent(review.branch)}`,
		'--jq',
		'.sha',
	]).trim();
	if (currentSha !== approval.sha) {
		throw new Error(
			`Issue #${issue.number} approved ${approval.sha}, but ${review.branch} now points to ${currentSha}.`,
		);
	}

	const comparison = JSON.parse(
		runGh(['api', `repos/${REPOSITORY}/compare/main...${approval.sha}`]),
	);
	if (!isSafeApprovedBlogComparison(comparison, review.post)) {
		throw new Error(
			`Issue #${issue.number} is not a one-file blog addition from main; refusing to open a PR.`,
		);
	}

	const existing = JSON.parse(
		runGh([
			'pr',
			'list',
			'--repo',
			REPOSITORY,
			'--state',
			'all',
			'--head',
			review.branch,
			'--limit',
			'1',
			'--json',
			'number,url,state',
		]),
	);

	let pullRequestUrl = existing[0]?.url;
	if (!pullRequestUrl) {
		const title = issue.title.replace(/^Daily blog review:\s*/i, 'Daily blog: ');
		const cleanIssueBody = issue.body
			.replace(/<!--\s*padho-daily-blog-review\s+\{[^\r\n]+\}\s*-->/, '')
			.trim();
		const body = [
			cleanIssueBody,
			'',
			'---',
			'',
			`Content approved in #${issue.number}.`,
			'Merging this pull request is the final publishing approval.',
			'No frontend files or deployment configuration are changed.',
		].join('\n');
		pullRequestUrl = runGh([
			'pr',
			'create',
			'--repo',
			REPOSITORY,
			'--base',
			'main',
			'--head',
			review.branch,
			'--title',
			title,
			'--body',
			body,
		]).trim();
	}

	runGh([
		'issue',
		'comment',
		String(issue.number),
		'--repo',
		REPOSITORY,
		'--body',
		`Pull request opened for manual publishing review: ${pullRequestUrl}`,
	]);
	runGh(['issue', 'close', String(issue.number), '--repo', REPOSITORY]);
	console.log(`Opened ${pullRequestUrl} from approved review issue #${issue.number}.`);
}

function runGh(args) {
	const result = spawnSync(GH, args, {
		encoding: 'utf8',
		env: process.env,
		maxBuffer: 10 * 1024 * 1024,
	});
	if (result.error) throw result.error;
	if (result.status !== 0) {
		throw new Error(`gh ${args.slice(0, 2).join(' ')} failed: ${result.stderr.trim()}`);
	}
	return result.stdout;
}
