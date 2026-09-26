import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { inspectBlog } from './lib/blog-style.mjs';

const [articleFile, feedbackFile] = process.argv.slice(2);
if (!articleFile || !feedbackFile) {
	console.error('Usage: node scripts/revise-blog-from-feedback.mjs <article.md> <feedback.txt>');
	process.exit(2);
}

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL || 'gpt-6-astra';
const reasoningEffort = process.env.OPENAI_REASONING_EFFORT || 'high';
if (!apiKey) throw new Error('OPENAI_API_KEY is required to revise a blog draft.');

const [guide, original, feedback] = await Promise.all([
	fs.readFile(path.join(process.cwd(), 'automation/EDITORIAL_GUIDE.md'), 'utf8'),
	fs.readFile(articleFile, 'utf8'),
	fs.readFile(feedbackFile, 'utf8'),
]);

const originalLinks = externalLinks(original);
const revisionSchema = {
	type: 'object',
	properties: {
		change_summary: { type: 'string', minLength: 10, maxLength: 300 },
		markdown: { type: 'string', minLength: 3000 },
	},
	required: ['change_summary', 'markdown'],
	additionalProperties: false,
};

let revision = await createRevision([
	'The reviewer replied to a Padho blog draft with the feedback below.',
	'Apply the feedback directly and fully.',
	'Keep the article simple. Do not make it sound academic or clever.',
	'Do not add factual claims or source URLs that are absent from the current draft.',
	'Keep the existing publication date.',
	'Keep valid YAML frontmatter and return the complete Markdown file.',
	`Reviewer feedback:\n${feedback.trim()}`,
	`Current draft:\n${original}`,
].join('\n\n'));

let review = inspectBlog(revision.markdown);
for (let attempt = 1; review.issues.length && attempt <= 2; attempt += 1) {
	revision = await createRevision([
		'Fix every quality problem in this revised draft.',
		'Keep the reviewer feedback applied.',
		'Do not add factual claims or new source URLs.',
		`Reviewer feedback:\n${feedback.trim()}`,
		`Quality problems:\n- ${review.issues.join('\n- ')}`,
		`Draft:\n${revision.markdown}`,
	].join('\n\n'));
	review = inspectBlog(revision.markdown);
}

if (review.issues.length) {
	throw new Error(`Revised draft failed the quality gate:\n- ${review.issues.join('\n- ')}`);
}

for (const link of externalLinks(revision.markdown)) {
	if (!originalLinks.has(link)) {
		throw new Error(`Revision added a source that was not researched: ${link}`);
	}
}

await fs.writeFile(articleFile, `${revision.markdown.trim()}\n`, 'utf8');
await fs.mkdir('.daily-blog', { recursive: true });
await fs.writeFile('.daily-blog/revision-summary.txt', `${revision.change_summary.trim()}\n`, 'utf8');

console.log(`Revised ${articleFile}`);
console.log(JSON.stringify(review.metrics));

async function createRevision(input) {
	const response = await fetch('https://api.openai.com/v1/responses', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			model,
			reasoning: { effort: reasoningEffort },
			instructions: guide,
			input,
			text: {
				format: {
					type: 'json_schema',
					name: 'padho_feedback_revision',
					strict: true,
					schema: revisionSchema,
				},
			},
			max_output_tokens: 16000,
		}),
		signal: AbortSignal.timeout(14 * 60 * 1000),
	});

	const result = await response.json();
	if (!response.ok) {
		throw new Error(`OpenAI API request failed (${response.status}): ${JSON.stringify(result.error ?? result)}`);
	}

	const outputText = (result.output ?? [])
		.filter((item) => item.type === 'message')
		.flatMap((item) => item.content ?? [])
		.filter((content) => content.type === 'output_text')
		.map((content) => content.text)
		.join('');

	if (!outputText) throw new Error('OpenAI API returned no revised draft.');
	return JSON.parse(outputText);
}

function externalLinks(markdown) {
	const links = new Set();
	for (const match of markdown.matchAll(/\[[^\]]+\]\((https?:\/\/[^)\s]+)\)/g)) {
		const url = new URL(match[1]);
		url.hash = '';
		links.add(url.toString().replace(/\/$/, ''));
	}
	return links;
}
