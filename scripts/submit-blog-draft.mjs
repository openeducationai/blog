import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import {
	BLOG_REPOSITORY,
	ensureReviewLabels,
	externalLinks,
	indiaDate,
	listOpenDailyBlogPullRequests,
	listReviewIssues,
	readFrontmatter,
	run,
	runGh,
} from './lib/blog-agent.mjs';
import { inspectBlog } from './lib/blog-style.mjs';

const [draftFile] = process.argv.slice(2);
if (!draftFile) {
	console.error('Usage: node scripts/submit-blog-draft.mjs <draft.md>');
	process.exit(2);
}

const markdown = await fs.readFile(path.resolve(draftFile), 'utf8');
const review = inspectBlog(markdown);
if (review.issues.length) {
	throw new Error(`Draft failed the quality gate:\n- ${review.issues.join('\n- ')}`);
}

const frontmatter = readFrontmatter(markdown);
const title = String(frontmatter.title ?? '').trim();
if (!title) throw new Error('The draft frontmatter must contain a title.');
const today = indiaDate();
if (String(frontmatter.pubDate ?? '') !== today) {
	throw new Error(`The draft pubDate must be today's India date (${today}).`);
}

const basename = path.basename(draftFile);
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*\.md$/.test(basename)) {
	throw new Error('The draft filename must be a lowercase hyphenated Markdown slug.');
}

const reviews = listReviewIssues();
if (reviews.length) {
	throw new Error(`Issue #${reviews[0].number} is already awaiting daily blog review.`);
}
const pullRequests = listOpenDailyBlogPullRequests();
if (pullRequests.length) {
	throw new Error(`Pull request #${pullRequests[0].number} must be merged or closed first.`);
}

const branch = `automation/daily-blog-${today}`;
const post = `src/content/blog/${basename}`;
const tempDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'padho-blog-submit-'));
const cloneDirectory = path.join(tempDirectory, 'blog');
let pushed = false;

try {
	runGh(['repo', 'clone', BLOG_REPOSITORY, cloneDirectory, '--', '--quiet']);
	const existingBranch = run('git', ['ls-remote', '--heads', 'origin', branch], {
		cwd: cloneDirectory,
	}).trim();
	if (existingBranch) throw new Error(`The review branch ${branch} already exists.`);
	run('git', ['checkout', '-b', branch, 'origin/main'], { cwd: cloneDirectory });

	const destination = path.join(cloneDirectory, post);
	await fs.writeFile(destination, `${markdown.trim()}\n`, { encoding: 'utf8', flag: 'wx' });
	run(process.execPath, ['scripts/check-blog-style.mjs', post], { cwd: cloneDirectory });
	run('npm', ['ci'], { cwd: cloneDirectory, inherit: true });
	run('npm', ['run', 'build'], { cwd: cloneDirectory, inherit: true });

	run('git', ['config', 'user.name', 'padho-marketing-agent'], { cwd: cloneDirectory });
	run('git', ['config', 'user.email', 'blog-bot@padho.ai'], { cwd: cloneDirectory });
	run('git', ['add', '--', post], { cwd: cloneDirectory });
	const staged = run('git', ['diff', '--cached', '--name-status'], { cwd: cloneDirectory }).trim();
	if (staged !== `A\t${post}`) {
		throw new Error(`Expected one added blog file, but staged changes were: ${staged || '(none)'}`);
	}
	run('git', ['commit', '-m', `blog: daily technical draft for ${today}`], {
		cwd: cloneDirectory,
	});
	const comparison = run('git', ['diff', '--name-status', 'origin/main...HEAD'], {
		cwd: cloneDirectory,
	}).trim();
	if (comparison !== `A\t${post}`) {
		throw new Error('The review branch is not exactly one added blog Markdown file.');
	}
	run('git', ['push', '--set-upstream', 'origin', branch], { cwd: cloneDirectory });
	pushed = true;

	ensureReviewLabels();
	const issueBodyFile = path.join(tempDirectory, 'review-issue.md');
	await fs.writeFile(
		issueBodyFile,
		buildIssueBody({ branch, post, title, review, links: [...externalLinks(markdown)] }),
		'utf8',
	);
	const issueUrl = runGh([
		'issue',
		'create',
		'--repo',
		BLOG_REPOSITORY,
		'--title',
		`Daily blog review: ${title}`,
		'--body-file',
		issueBodyFile,
		'--label',
		'daily-blog-review',
	]).trim();
	console.log(`Daily blog review created: ${issueUrl}`);
} catch (error) {
	if (pushed) {
		try {
			run('git', ['push', 'origin', '--delete', branch], { cwd: cloneDirectory });
		} catch {
			// Preserve the original failure. A later run will report the leftover exact branch.
		}
	}
	throw error;
} finally {
	await fs.rm(tempDirectory, { recursive: true, force: true });
}

function buildIssueBody({ branch, post, title, review: quality, links }) {
	return [
		`<!-- padho-daily-blog-review ${JSON.stringify({ branch, post })} -->`,
		'',
		'## Daily Padho technical blog draft',
		'',
		`**Article:** ${title}`,
		'',
		`**File:** \`${post}\``,
		'',
		'### Automated quality gate',
		'',
		`- ${quality.metrics.words} words`,
		`- ${quality.metrics.averageSentenceWords} words per sentence on average`,
		`- Longest sentence: ${quality.metrics.longestSentenceWords} words`,
		`- ${links.length} checked source links across ${quality.metrics.sourceDomains} domains`,
		'- Astro production build passed',
		'',
		'### Content review',
		'',
		'Reply `APPROVE` to mark this exact draft ready for a pull request.',
		'Reply `SKIP` to discard it, or reply normally with revision feedback.',
		'The marketing agent never merges the pull request.',
		'No frontend files or deployment configuration are changed.',
		'',
	].join('\n');
}
