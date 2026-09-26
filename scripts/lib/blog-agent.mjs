import { spawnSync } from 'node:child_process';

export const BLOG_REPOSITORY = 'openeducationai/blog';
export const GH = process.env.GH_BIN || 'gh';

export function run(command, args, options = {}) {
	const result = spawnSync(command, args, {
		cwd: options.cwd,
		encoding: 'utf8',
		env: options.env ?? process.env,
		maxBuffer: 20 * 1024 * 1024,
		stdio: options.inherit ? 'inherit' : 'pipe',
	});
	if (result.error) throw result.error;
	if (result.status !== 0) {
		const detail = String(result.stderr || result.stdout || '').trim();
		throw new Error(`${command} ${args.slice(0, 3).join(' ')} failed${detail ? `: ${detail}` : ''}`);
	}
	return result.stdout ?? '';
}

export function runGh(args) {
	return run(GH, args);
}

export function ghJson(args) {
	const output = runGh(args);
	try {
		return JSON.parse(output);
	} catch (error) {
		throw new Error(`gh returned invalid JSON: ${error.message}`);
	}
}

export function indiaDate(date = new Date()) {
	return new Intl.DateTimeFormat('en-CA', {
		timeZone: 'Asia/Kolkata',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	}).format(date);
}

export function readFrontmatter(markdown) {
	const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
	if (!match) throw new Error('The draft must start with YAML frontmatter.');
	const data = {};
	for (const line of match[1].split(/\r?\n/)) {
		const separator = line.indexOf(':');
		if (separator < 1) continue;
		const key = line.slice(0, separator).trim();
		const raw = line.slice(separator + 1).trim();
		if (!raw) continue;
		try {
			data[key] = JSON.parse(raw);
		} catch {
			data[key] = raw.replace(/^['"]|['"]$/g, '');
		}
	}
	return data;
}

export function externalLinks(markdown) {
	const links = new Set();
	for (const match of markdown.matchAll(/\[[^\]]+\]\((https?:\/\/[^)\s]+)\)/g)) {
		const url = new URL(match[1]);
		url.hash = '';
		links.add(url.toString().replace(/\/$/, ''));
	}
	return links;
}

export function listReviewIssues() {
	return ghJson([
		'issue',
		'list',
		'--repo',
		BLOG_REPOSITORY,
		'--state',
		'open',
		'--label',
		'daily-blog-review',
		'--limit',
		'20',
		'--json',
		'number,title,url,body,labels,createdAt',
	]);
}

export function listOpenDailyBlogPullRequests() {
	return ghJson([
		'pr',
		'list',
		'--repo',
		BLOG_REPOSITORY,
		'--state',
		'open',
		'--limit',
		'100',
		'--json',
		'number,title,url,headRefName',
	]).filter((pullRequest) =>
		String(pullRequest.headRefName ?? '').startsWith('automation/daily-blog-'),
	);
}

export function getReviewIssue(number) {
	return ghJson([
		'issue',
		'view',
		String(number),
		'--repo',
		BLOG_REPOSITORY,
		'--json',
		'number,title,url,body,state,labels,createdAt',
	]);
}

export function readRemoteArticle(post, branch) {
	const response = ghJson([
		'api',
		'--method',
		'GET',
		`repos/${BLOG_REPOSITORY}/contents/${post}`,
		'-f',
		`ref=${branch}`,
	]);
	if (response.type !== 'file' || typeof response.content !== 'string') {
		throw new Error(`GitHub did not return ${post} as a file.`);
	}
	return Buffer.from(response.content.replace(/\n/g, ''), 'base64').toString('utf8');
}

export function ensureReviewLabels() {
	const labels = [
		['daily-blog-review', '1D76DB', 'Padho daily blog awaiting content review'],
		['daily-blog-approved', '0E8A16', 'Content approved and ready for a pull request'],
		['daily-blog-revision-requested', 'FBCA04', 'Editorial feedback queued for the marketing agent'],
	];
	for (const [name, color, description] of labels) {
		runGh([
			'label',
			'create',
			name,
			'--repo',
			BLOG_REPOSITORY,
			'--color',
			color,
			'--description',
			description,
			'--force',
		]);
	}
}
