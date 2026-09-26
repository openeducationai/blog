import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { inspectBlog } from './lib/blog-style.mjs';

const ROOT = process.cwd();
const MODEL = process.env.OPENAI_MODEL || 'gpt-6-astra';
const REASONING_EFFORT = process.env.OPENAI_REASONING_EFFORT || 'high';
const API_KEY = process.env.OPENAI_API_KEY;

if (!API_KEY) {
	throw new Error('OPENAI_API_KEY is required to generate a daily blog draft.');
}

const [guide, sourceRegistry] = await Promise.all([
	fs.readFile(path.join(ROOT, 'automation/EDITORIAL_GUIDE.md'), 'utf8'),
	fs.readFile(path.join(ROOT, 'automation/sources.json'), 'utf8').then(JSON.parse),
]);

if (sourceRegistry.length !== 100) {
	throw new Error(`Expected 100 editorial sources; found ${sourceRegistry.length}.`);
}

const allowedDomains = [...new Set(sourceRegistry.map((source) => source.domain))].slice(0, 100);
const existingPosts = await readExistingPosts();
const today = new Intl.DateTimeFormat('en-CA', {
	timeZone: 'Asia/Kolkata',
	year: 'numeric',
	month: '2-digit',
	day: '2-digit',
}).format(new Date());

const researchSchema = {
	type: 'object',
	properties: {
		topic: { type: 'string', minLength: 12 },
		thesis: { type: 'string', minLength: 20 },
		why_now: { type: 'string', minLength: 20 },
		plain_language_idea: { type: 'string', minLength: 20, maxLength: 180 },
		category: {
			type: 'string',
			enum: [
				'ai-tutoring',
				'learning-science',
				'learning-analytics',
				'assessment',
				'multilingual-ai',
				'education-infrastructure',
				'responsible-ai',
			],
		},
		mechanism: { type: 'string', minLength: 40 },
		concrete_example: { type: 'string', minLength: 40 },
		counterargument: { type: 'string', minLength: 30 },
		distinctness: {
			type: 'object',
			properties: {
				example_domain: { type: 'string', minLength: 10 },
				opening_device: { type: 'string', minLength: 10 },
				narrative_shape: { type: 'string', minLength: 10 },
				why_new_for_padho: { type: 'string', minLength: 30 },
			},
			required: ['example_domain', 'opening_device', 'narrative_shape', 'why_new_for_padho'],
			additionalProperties: false,
		},
		claims: {
			type: 'array',
			minItems: 4,
			maxItems: 8,
			items: {
				type: 'object',
				properties: {
					statement: { type: 'string' },
					evidence: { type: 'string' },
					source_title: { type: 'string' },
					source_url: { type: 'string' },
					source_type: {
						type: 'string',
						enum: [
							'primary-research',
							'official-engineering',
							'official-standard',
							'public-data',
							'secondary-analysis',
						],
					},
					confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
				},
				required: [
					'statement',
					'evidence',
					'source_title',
					'source_url',
					'source_type',
					'confidence',
				],
				additionalProperties: false,
			},
		},
		claims_to_avoid: {
			type: 'array',
			items: { type: 'string' },
			maxItems: 5,
		},
	},
	required: [
		'topic',
		'thesis',
		'why_now',
		'plain_language_idea',
		'category',
		'mechanism',
		'concrete_example',
		'counterargument',
		'distinctness',
		'claims',
		'claims_to_avoid',
	],
	additionalProperties: false,
};

const draftSchema = {
	type: 'object',
	properties: {
		title: { type: 'string', minLength: 12, maxLength: 85 },
		description: { type: 'string', minLength: 40, maxLength: 190 },
		slug: { type: 'string', pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' },
		category: { type: 'string' },
		tags: {
			type: 'array',
			minItems: 2,
			maxItems: 5,
			items: { type: 'string', minLength: 2, maxLength: 32 },
		},
		body_markdown: { type: 'string', minLength: 3000 },
	},
	required: ['title', 'description', 'slug', 'category', 'tags', 'body_markdown'],
	additionalProperties: false,
};

const noveltySchema = {
	type: 'object',
	properties: {
		passes: { type: 'boolean' },
		closest_existing_post: { type: 'string' },
		shared_elements: {
			type: 'array',
			maxItems: 6,
			items: { type: 'string' },
		},
		explanation: { type: 'string', minLength: 20 },
		revision_direction: { type: 'string', minLength: 20 },
		clear_to_general_reader: { type: 'boolean' },
		plain_language_summary: { type: 'string', minLength: 20, maxLength: 180 },
		unexplained_terms: {
			type: 'array',
			maxItems: 8,
			items: { type: 'string' },
		},
	},
	required: [
		'passes',
		'closest_existing_post',
		'shared_elements',
		'explanation',
		'revision_direction',
		'clear_to_general_reader',
		'plain_language_summary',
		'unexplained_terms',
	],
	additionalProperties: false,
};

const topicOverride = process.env.BLOG_TOPIC?.trim();
const researchPrompt = [
	`Today is ${today} in India.`,
	'The publication is the Padho.ai technical education blog.',
	topicOverride ? `Research this requested topic: ${topicOverride}` : 'Choose one timely, durable topic.',
	'Do not write the article yet.',
	'Search the allowed source set and build an evidence brief.',
	'Use at least four sources from at least three domains.',
	'Prefer primary research, official engineering reports, standards, and public data.',
	'Avoid generic AI-in-education predictions.',
	'Express the main idea in one sentence that needs no research or engineering terms.',
	'The topic, classroom example, opening device, and narrative shape must feel new for this publication.',
	'Do not default to fractions, a stuck learner, or a child who can answer only after receiving help.',
	'Compare against these current library fingerprints:',
	JSON.stringify(existingPosts, null, 2),
	'The thesis must be narrow enough to explain through one mechanism and one example.',
	'Only include claims supported by the exact source URL you provide.',
].join('\n\n');

const researchResponse = await createResponse({
	instructions: [
		'You are a skeptical education technology researcher.',
		'Find a strong idea. Reject fashionable claims with weak evidence.',
		'Do not use a company marketing post as proof of learning outcomes.',
		'When evidence is limited, lower the confidence and say why.',
	].join('\n'),
	input: researchPrompt,
	schemaName: 'padho_daily_research',
	schema: researchSchema,
	webSearch: true,
});

const research = researchResponse.parsed;
validateResearchSources(research, allowedDomains, extractWebSearchSourceUrls(researchResponse.raw));

let draft = (
	await createResponse({
		instructions: guide,
		input: buildWritingPrompt(research, existingPosts),
		schemaName: 'padho_daily_draft',
		schema: draftSchema,
	})
).parsed;

let markdown = renderMarkdown(draft, today);
let review = inspectBlog(markdown);

for (let attempt = 1; review.issues.length && attempt <= 2; attempt += 1) {
	const revision = await createResponse({
		instructions: guide,
		input: [
			'Rewrite this draft so every listed quality problem is fixed.',
			'Do not change factual claims or source URLs.',
			'Do not add new claims.',
			`Quality problems:\n- ${review.issues.join('\n- ')}`,
			`Research brief:\n${JSON.stringify(research, null, 2)}`,
			`Current draft:\n${JSON.stringify(draft, null, 2)}`,
		].join('\n\n'),
		schemaName: 'padho_daily_revision',
		schema: draftSchema,
	});
	draft = revision.parsed;
	markdown = renderMarkdown(draft, today);
	review = inspectBlog(markdown);
}

if (review.issues.length) {
	throw new Error(`Draft failed the quality gate:\n- ${review.issues.join('\n- ')}`);
}

let novelty = await evaluateNovelty(draft, existingPosts);

if (!novelty.passes || !novelty.clear_to_general_reader) {
	draft = (
		await createResponse({
			instructions: guide,
			input: [
				'Rewrite this draft so it is clearly distinct from the existing Padho library.',
				'Make it clear to a thoughtful reader with no research or engineering background.',
				'The title and first five sentences must reveal the whole point in plain language.',
				'Preserve the researched thesis, factual claims, and source URLs.',
				'Change the opening device, concrete example, and narrative shape as needed.',
				'Do not merely replace nouns inside the same classroom story.',
				`Novelty review:\n${JSON.stringify(novelty, null, 2)}`,
				`Existing library:\n${JSON.stringify(existingPosts, null, 2)}`,
				`Research brief:\n${JSON.stringify(research, null, 2)}`,
				`Current draft:\n${JSON.stringify(draft, null, 2)}`,
			].join('\n\n'),
			schemaName: 'padho_distinct_revision',
			schema: draftSchema,
		})
	).parsed;

	markdown = renderMarkdown(draft, today);
	review = inspectBlog(markdown);
	for (let attempt = 1; review.issues.length && attempt <= 2; attempt += 1) {
		const revision = await createResponse({
			instructions: guide,
			input: [
				'Fix every listed quality problem without restoring any overlap with existing posts.',
				'Preserve the factual claims and source URLs.',
				`Quality problems:\n- ${review.issues.join('\n- ')}`,
				`Novelty review to respect:\n${JSON.stringify(novelty, null, 2)}`,
				`Current draft:\n${JSON.stringify(draft, null, 2)}`,
			].join('\n\n'),
			schemaName: 'padho_distinct_style_revision',
			schema: draftSchema,
		});
		draft = revision.parsed;
		markdown = renderMarkdown(draft, today);
		review = inspectBlog(markdown);
	}
	if (review.issues.length) {
		throw new Error(`Distinct revision failed the quality gate:\n- ${review.issues.join('\n- ')}`);
	}
	novelty = await evaluateNovelty(draft, existingPosts);
}

if (!novelty.passes || !novelty.clear_to_general_reader) {
	throw new Error(`Draft failed the editorial review: ${novelty.explanation}`);
}

validateDraftSources(markdown, research);

const destination = path.join(ROOT, 'src/content/blog', `${draft.slug}.md`);
const destinationRelative = path.relative(ROOT, destination);
const reviewBranch = `automation/daily-blog-${today}`;
try {
	await fs.access(destination);
	throw new Error(`A post already exists at ${destination}. Choose a new topic or slug.`);
} catch (error) {
	if (error.code !== 'ENOENT') throw error;
}

await fs.mkdir(path.join(ROOT, '.daily-blog'), { recursive: true });
await fs.writeFile(destination, markdown, 'utf8');
await fs.writeFile(
	path.join(ROOT, '.daily-blog', 'metadata.json'),
	JSON.stringify(
		{
			date: today,
			file: destinationRelative,
			branch: reviewBranch,
			title: draft.title,
			description: draft.description,
			thesis: research.thesis,
				category: draft.category,
				tags: draft.tags,
				metrics: review.metrics,
				novelty,
			sources: research.claims.map((claim) => ({
				title: claim.source_title,
				url: claim.source_url,
				type: claim.source_type,
				confidence: claim.confidence,
			})),
			model: MODEL,
		},
		null,
		2,
	),
	'utf8',
);

await fs.writeFile(
	path.join(ROOT, '.daily-blog', 'review-issue-body.md'),
	buildReviewIssueBody(
		draft,
		research,
		review,
		novelty,
		reviewBranch,
		destinationRelative,
	),
	'utf8',
);

console.log(`Created ${destinationRelative}`);
console.log(JSON.stringify(review.metrics));

async function createResponse({ instructions, input, schemaName, schema, webSearch = false }) {
	const payload = {
		model: MODEL,
		reasoning: { effort: REASONING_EFFORT },
		instructions,
		input,
		text: {
			format: {
				type: 'json_schema',
				name: schemaName,
				strict: true,
				schema,
			},
		},
		max_output_tokens: 16000,
	};

	if (webSearch) {
		payload.tools = [
			{
				type: 'web_search',
				search_context_size: 'high',
				external_web_access: true,
				filters: { allowed_domains: allowedDomains },
			},
		];
		payload.tool_choice = 'required';
		payload.include = ['web_search_call.action.sources'];
	}

	const response = await fetch('https://api.openai.com/v1/responses', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${API_KEY}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(payload),
		signal: AbortSignal.timeout(14 * 60 * 1000),
	});

	const result = await response.json();
	if (!response.ok) {
		throw new Error(`OpenAI API request failed (${response.status}): ${JSON.stringify(result.error ?? result)}`);
	}

	const outputText = extractOutputText(result);
	if (!outputText) throw new Error('OpenAI API returned no output text.');

	try {
		return { parsed: JSON.parse(outputText), raw: result };
	} catch (error) {
		throw new Error(`Could not parse structured response: ${error.message}`);
	}
}

async function evaluateNovelty(draft, posts) {
	return (
		await createResponse({
			instructions: [
				'You are the strict editor of a small publication.',
				'Judge whether the draft adds a genuinely distinct reading experience.',
				'Also judge it for a thoughtful parent or product builder with no specialist background.',
				'Fail it if the main point cannot be repeated in one plain sentence.',
				'Fail it if the title is abstract or technical terms are required to follow the argument.',
				'Short sentences do not count as clear when their ideas remain abstract.',
				'Compare the central claim, concrete example, opening device, section sequence, and conclusion.',
				'Fail the draft when two or more of those elements strongly resemble one existing post.',
				'Fail a classroom example that only swaps surface nouns inside the same learning story.',
				'Do not fail shared technical terms or the publication topic by themselves.',
				'When the draft passes, make revision_direction a short note on what should be preserved.',
			].join('\n'),
			input: [
				`Candidate draft:\n${JSON.stringify(draft, null, 2)}`,
				`Existing publication fingerprints:\n${JSON.stringify(posts, null, 2)}`,
			].join('\n\n'),
			schemaName: 'padho_novelty_review',
			schema: noveltySchema,
		})
	).parsed;
}

function extractOutputText(response) {
	const chunks = [];
	for (const item of response.output ?? []) {
		if (item.type !== 'message') continue;
		for (const content of item.content ?? []) {
			if (content.type === 'output_text' && content.text) chunks.push(content.text);
		}
	}
	return chunks.join('');
}

async function readExistingPosts() {
	const directory = path.join(ROOT, 'src/content/blog');
	const entries = await fs.readdir(directory, { withFileTypes: true });
	const posts = [];
	for (const entry of entries) {
		if (!entry.isFile() || !/\.mdx?$/i.test(entry.name)) continue;
		const source = await fs.readFile(path.join(directory, entry.name), 'utf8');
		const title = source.match(/^title:\s*["']?(.+?)["']?\s*$/m)?.[1];
		const description = source.match(/^description:\s*["']?(.+?)["']?\s*$/m)?.[1];
		const pubDate = source.match(/^pubDate:\s*["']?(.+?)["']?\s*$/m)?.[1] ?? '';
		const body = source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '').trim();
		const cleanedBody = cleanExcerpt(body);
		const headings = [...body.matchAll(/^##\s+(.+)$/gm)].map((match) => match[1].trim());
		const scenarioExcerpts = body
			.split(/\n\s*\n/)
			.map(cleanExcerpt)
			.filter((paragraph) =>
				/\b(student|child|learner|example|imagine|suppose|consider|problem|question)\b/i.test(
					paragraph,
				),
			)
			.slice(0, 4)
			.join(' ')
			.slice(0, 900);
		posts.push({
			file: entry.name,
			title,
			description,
			pubDate,
			headings,
			opening: cleanedBody.slice(0, 700),
			scenario_excerpts: scenarioExcerpts,
			closing: cleanedBody.slice(-500),
		});
	}
	posts.sort((a, b) => String(b.pubDate).localeCompare(String(a.pubDate)));
	return {
		catalog: posts.map(({ file, title, description, pubDate }) => ({
			file,
			title,
			description,
			pubDate,
		})),
		detailed_fingerprints: posts.slice(0, 40),
	};
}

function cleanExcerpt(markdown) {
	return markdown
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		.replace(/^#{1,6}\s+/gm, '')
		.replace(/^[-*+•]\s+/gm, '')
		.replace(/[>*_~`]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function buildWritingPrompt(research, posts) {
	return [
		'Write one original technical blog post from the research brief below.',
		'The body must be Markdown. Do not include an H1 because the page layout supplies it.',
		'Use three to six ## sections, followed by ## Sources.',
		'Use only the facts and URLs in the brief.',
		'Place source links next to supported claims and list them again under Sources.',
		'Explain the mechanism in plain language before using technical labels.',
		'Use the concrete example. Include the counterargument.',
		'Keep one strong idea. Remove every generic sentence.',
		'Do not use semicolons. Use few commas. Prefer short sentences.',
		'Do not imitate the structure or wording of any source.',
		'Treat distinctness as a hard requirement.',
		'Treat plain-language clarity as a hard requirement.',
		'The title and first five sentences must make the central idea obvious.',
		'Write for a thoughtful reader who does not know research or engineering terms.',
		'Do not reuse an existing post\'s classroom subject, opening pattern, argument arc, or conclusion.',
		'Do not turn an old example into a new one by changing only its nouns.',
		'Use the distinctness plan in the research brief.',
		'Do not repeat these publication fingerprints:',
		JSON.stringify(posts, null, 2),
		'Research brief:',
		JSON.stringify(research, null, 2),
	].join('\n\n');
}

function renderMarkdown(draft, date) {
	const tags = JSON.stringify(draft.tags);
	return [
		'---',
		`title: ${JSON.stringify(draft.title)}`,
		`description: ${JSON.stringify(draft.description)}`,
		`pubDate: ${date}`,
		`category: ${JSON.stringify(draft.category)}`,
		`tags: ${tags}`,
		'---',
		'',
		draft.body_markdown.trim(),
		'',
	].join('\n');
}

function validateResearchSources(research, domains, retrievedUrls) {
	const allowed = new Set(domains);
	const retrieved = new Set(retrievedUrls.map(canonicalSourceKey));
	if (retrieved.size < 4) {
		throw new Error(`Web research returned only ${retrieved.size} source URLs; at least four are required.`);
	}
	const sourceDomains = new Set();
	const sourceUrls = new Set();
	for (const claim of research.claims) {
		let url;
		try {
			url = new URL(claim.source_url);
		} catch {
			throw new Error(`Research returned an invalid source URL: ${claim.source_url}`);
		}
		const hostname = url.hostname.replace(/^www\./, '');
		const accepted = [...allowed].some(
			(domain) => hostname === domain || hostname.endsWith(`.${domain}`) || domain.endsWith(`.${hostname}`),
		);
		if (!accepted) throw new Error(`Source domain is not in the editorial registry: ${hostname}`);
		if (!retrieved.has(canonicalSourceKey(claim.source_url))) {
			throw new Error(`Claim cites a URL that the web research did not retrieve: ${claim.source_url}`);
		}
		sourceDomains.add(hostname);
		sourceUrls.add(canonicalSourceKey(claim.source_url));
	}
	if (sourceUrls.size < 4 || sourceDomains.size < 3) {
		throw new Error('Research must contain at least four distinct sources from three source domains.');
	}
	const strongSourceTypes = new Set([
		'primary-research',
		'official-engineering',
		'official-standard',
		'public-data',
	]);
	const strongSources = research.claims.filter((claim) => strongSourceTypes.has(claim.source_type));
	if (strongSources.length < 2) {
		throw new Error('Research must include at least two primary, engineering, standards, or public-data sources.');
	}
	const lowConfidenceClaims = research.claims.filter((claim) => claim.confidence === 'low');
	if (lowConfidenceClaims.length > 1) {
		throw new Error('Research contains more than one low-confidence claim.');
	}
}

function extractWebSearchSourceUrls(response) {
	const urls = [];
	for (const item of response.output ?? []) {
		if (item.type !== 'web_search_call') continue;
		for (const source of item.action?.sources ?? []) {
			if (source?.url) urls.push(source.url);
		}
	}
	return urls;
}

function validateDraftSources(markdown, research) {
	const approved = research.claims.map((claim) => normalizeUrl(claim.source_url));
	const links = [...markdown.matchAll(/\[[^\]]+\]\((https?:\/\/[^)\s]+)\)/g)].map((match) => match[1]);
	for (const link of links) {
		const normalized = normalizeUrl(link);
		const host = new URL(normalized).hostname.replace(/^www\./, '');
		if (host === 'padho.ai' || host.endsWith('.padho.ai')) continue;
		if (!approved.some((source) => source === normalized)) {
			throw new Error(`Draft used a URL that was not in the research brief: ${link}`);
		}
	}
}

function normalizeUrl(value) {
	const url = new URL(value);
	url.hash = '';
	return url.toString().replace(/\/$/, '');
}

function canonicalSourceKey(value) {
	const url = new URL(value);
	const hostname = url.hostname.replace(/^www\./, '');
	const pathname = url.pathname.replace(/\/$/, '') || '/';
	return `${hostname}${pathname}`;
}

function buildReviewIssueBody(draft, research, review, novelty, branch, post) {
	const sourceRows = research.claims
		.map(
			(claim) =>
				`- [${claim.source_title}](${claim.source_url}) — ${claim.source_type}, confidence: ${claim.confidence}`,
		)
		.join('\n');
	return [
		`<!-- padho-daily-blog-review ${JSON.stringify({ branch, post })} -->`,
		'',
		'## Daily Padho technical blog draft',
		'',
		`**Thesis:** ${research.thesis}`,
		'',
		`**Why now:** ${research.why_now}`,
		'',
		`**Category:** ${draft.category}`,
		'',
		'### Automated quality gate',
		'',
		`- ${review.metrics.words} words`,
		`- ${review.metrics.averageSentenceWords} words per sentence on average`,
		`- Longest sentence: ${review.metrics.longestSentenceWords} words`,
		`- ${review.metrics.sourceLinks} links across ${review.metrics.sourceDomains} domains`,
		'- Passed the Padho editorial style gate',
		`- Plain-language summary: ${novelty.plain_language_summary}`,
		`- Passed the library distinctness gate against: ${novelty.closest_existing_post || 'all posts'}`,
		`- Distinctness note: ${novelty.explanation}`,
		'',
		'### Sources reviewed',
		'',
		sourceRows,
		'',
		'### Content review',
		'',
		'Reply `APPROVE` to mark this draft ready for a pull request.',
		'Reply `SKIP` to discard it, or reply with normal feedback for another revision.',
		'The final publishing decision is still made by manually merging the pull request.',
		'No frontend files or deployment configuration are changed.',
		'',
	].join('\n');
}
