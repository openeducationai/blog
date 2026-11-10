import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import {
	BLOG_REPOSITORY,
	externalLinks,
	getReviewIssue,
	readFrontmatter,
	readRemoteArticle,
	run,
	runGh,
} from './lib/blog-agent.mjs';
import {
	clearFeedbackComments,
	hasLabel,
	parseFeedbackCommentIds,
	parseReviewMetadata,
} from './lib/blog-review.mjs';
import { inspectBlog } from './lib/blog-style.mjs';

const [issueNumberRaw, revisedFile] = process.argv.slice(2);
const issueNumber = Number(issueNumberRaw);
if (!Number.isSafeInteger(issueNumber) || issueNumber <= 0 || !revisedFile) {
	console.error('Usage: node scripts/submit-blog-revision.mjs <issue-number> <revised.md>');
	process.exit(2);
}

const issue = getReviewIssue(issueNumber);
if (issue.state !== 'OPEN' || !hasLabel(issue, 'daily-blog-review')) {
	throw new Error(`Issue #${issueNumber} is not an open daily blog review.`);
}
if (hasLabel(issue, 'daily-blog-approved')) {
	throw new Error(`Issue #${issueNumber} is already approved.`);
}
if (!hasLabel(issue, 'daily-blog-revision-requested')) {
	throw new Error(`Issue #${issueNumber} has no queued revision request.`);
}

const metadata = parseReviewMetadata(issue);
const feedbackCommentIds = parseFeedbackCommentIds(issue);
if (!feedbackCommentIds.length) throw new Error(`Issue #${issueNumber} has no queued feedback IDs.`);

const [original, revised] = await Promise.all([
	readRemoteArticle(metadata.post, metadata.branch),
	fs.readFile(path.resolve(revisedFile), 'utf8'),
]);
if (original.trim() === revised.trim()) throw new Error('The revised article is unchanged.');

const quality = inspectBlog(revised);
if (quality.issues.length) {
	throw new Error(`Revision failed the quality gate:\n- ${quality.issues.join('\n- ')}`);
}
const originalFrontmatter = readFrontmatter(original);
const revisedFrontmatter = readFrontmatter(revised);
if (String(revisedFrontmatter.pubDate ?? '') !== String(originalFrontmatter.pubDate ?? '')) {
	throw new Error('A revision must preserve the original publication date.');
}
const originalLinks = externalLinks(original);
for (const link of externalLinks(revised)) {
	if (!originalLinks.has(link)) {
		throw new Error(`Revision added a source that was not in the reviewed draft: ${link}`);
	}
}

const tempDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'padho-blog-revise-'));
const cloneDirectory = path.join(tempDirectory, 'blog');
try {
	runGh(['repo', 'clone', BLOG_REPOSITORY, cloneDirectory, '--', '--quiet']);
	run('git', ['checkout', '-B', metadata.branch, `origin/${metadata.branch}`], {
		cwd: cloneDirectory,
	});
	const branchStartSha = run('git', ['rev-parse', 'HEAD'], { cwd: cloneDirectory }).trim();
	const comparisonBefore = run('git', ['diff', '--name-status', 'origin/main...HEAD'], {
		cwd: cloneDirectory,
	}).trim();
	if (comparisonBefore !== `A\t${metadata.post}`) {
		throw new Error('The review branch is no longer exactly one added blog Markdown file.');
	}
	const checkedOutOriginal = await fs.readFile(path.join(cloneDirectory, metadata.post), 'utf8');
	if (checkedOutOriginal !== original) {
		throw new Error('The review branch changed while the revision was being prepared.');
	}

	await fs.writeFile(path.join(cloneDirectory, metadata.post), `${revised.trim()}\n`, 'utf8');
	run(process.execPath, ['scripts/check-blog-style.mjs', metadata.post], { cwd: cloneDirectory });
	run('npm', ['ci'], { cwd: cloneDirectory, inherit: true });
	run('npm', ['run', 'build'], { cwd: cloneDirectory, inherit: true });
	run('git', ['config', 'user.name', 'padho-marketing-agent'], { cwd: cloneDirectory });
	run('git', ['config', 'user.email', 'blog-bot@padho.ai'], { cwd: cloneDirectory });
	run('git', ['add', '--', metadata.post], { cwd: cloneDirectory });
	const staged = run('git', ['diff', '--cached', '--name-status'], { cwd: cloneDirectory }).trim();
	if (staged !== `M\t${metadata.post}`) {
		throw new Error(`Expected one revised blog file, but staged changes were: ${staged || '(none)'}`);
	}
	run('git', ['commit', '-m', 'blog: revise daily draft from review feedback'], {
		cwd: cloneDirectory,
	});

	const currentIssue = getReviewIssue(issueNumber);
	if (
		currentIssue.state !== 'OPEN' ||
		hasLabel(currentIssue, 'daily-blog-approved') ||
		!hasLabel(currentIssue, 'daily-blog-revision-requested')
	) {
		throw new Error(`Issue #${issueNumber} changed state while the revision was being checked.`);
	}
	const remoteSha = runGh([
		'api',
		`repos/${BLOG_REPOSITORY}/commits/${encodeURIComponent(metadata.branch)}`,
		'--jq',
		'.sha',
	]).trim();
	if (remoteSha !== branchStartSha) {
		throw new Error('The review branch changed while the revision was being checked.');
	}
	run('git', ['push', 'origin', `HEAD:${metadata.branch}`], { cwd: cloneDirectory });

	const latestIssue = getReviewIssue(issueNumber);
	const cleared = clearFeedbackComments(latestIssue.body, feedbackCommentIds);
	const issueBodyFile = path.join(tempDirectory, 'review-issue.md');
	await fs.writeFile(issueBodyFile, cleared.body, 'utf8');
	const editArguments = [
		'issue',
		'edit',
		String(issueNumber),
		'--repo',
		BLOG_REPOSITORY,
		'--body-file',
		issueBodyFile,
	];
	if (!cleared.remaining.length) {
		editArguments.push('--remove-label', 'daily-blog-revision-requested');
	}
	runGh(editArguments);
	console.log(`Revised daily blog issue #${issueNumber}; it will be emailed again at 09:00 IST.`);
} finally {
	await fs.rm(tempDirectory, { recursive: true, force: true });
}
