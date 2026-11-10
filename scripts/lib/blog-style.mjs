const BANNED_PHRASES = [
	"in today's fast-paced world",
	'ever-evolving landscape',
	'delve into',
	'game-changer',
	'revolutionize',
	'unlock the power',
	'harness the power',
	'seamlessly',
	'robust solution',
	'transformative journey',
	'it is important to note',
	'at its core',
	'moreover',
	'furthermore',
	'in conclusion',
	'the future is here',
	'paradigm shift',
	'tapestry',
	'realm',
];

function stripMarkdown(markdown) {
	return markdown
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/`[^`]*`/g, ' ')
		.replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		.replace(/^#{1,6}\s+/gm, '')
		.replace(/^[-*+]\s+/gm, '')
		.replace(/^>\s?/gm, '')
		.replace(/[>*_~]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function words(text) {
	return text.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) ?? [];
}

function sentences(text) {
	return (
		text
			.replace(/\b(?:e\.g|i\.e|Dr|Mr|Ms)\./g, (match) => match.replace('.', '∯'))
			.match(/[^.!?]+(?:[.!?]+|$)/g) ?? []
	)
		.map((sentence) => sentence.replaceAll('∯', '.').trim())
		.filter(Boolean);
}

function parseFrontmatter(markdown) {
	const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
	if (!match) return { data: {}, body: markdown };

	const data = {};
	for (const line of match[1].split(/\r?\n/)) {
		const separator = line.indexOf(':');
		if (separator === -1) continue;
		const key = line.slice(0, separator).trim();
		const raw = line.slice(separator + 1).trim();
		if (!key || !raw) continue;
		try {
			data[key] = JSON.parse(raw);
		} catch {
			data[key] = raw.replace(/^['"]|['"]$/g, '');
		}
	}

	return { data, body: markdown.slice(match[0].length) };
}

function linkDomains(markdown) {
	const domains = new Set();
	const urls = new Set();
	for (const match of markdown.matchAll(/\[[^\]]+\]\((https?:\/\/[^)\s]+)\)/g)) {
		try {
			const url = new URL(match[1]);
			urls.add(url.toString().replace(/\/$/, ''));
			domains.add(url.hostname.replace(/^www\./, ''));
		} catch {
			// A malformed URL is reported by the caller through the link count.
		}
	}
	return { urls: [...urls], domains: [...domains] };
}

export function inspectBlog(markdown) {
	const { data, body } = parseFrontmatter(markdown);
	const sourceSplit = body.split(/^## Sources\s*$/m);
	const articleBody = sourceSplit[0];
	const sourceSection = sourceSplit[1] ?? '';
	const plain = stripMarkdown(articleBody);
	const sentenceList = sentences(plain);
	const sentenceWordCounts = sentenceList.map((sentence) => words(sentence).length);
	const totalWords = words(plain).length;
	const averageSentenceWords = sentenceWordCounts.length
		? totalWords / sentenceWordCounts.length
		: 0;
	const longSentences = sentenceWordCounts.filter((count) => count > 25).length;
	const commaHeavySentences = sentenceList.filter(
		(sentence) => (sentence.match(/,/g) ?? []).length > 2,
	).length;
	const headings = [...body.matchAll(/^##\s+(.+)$/gm)].map((match) => match[1].trim());
	const contentHeadings = headings.filter((heading) => heading.toLowerCase() !== 'sources');
	const { urls, domains } = linkDomains(body);
	const sourceListLinks = linkDomains(sourceSection).urls;
	const paragraphs = articleBody
		.split(/\n\s*\n/)
		.map((paragraph) => stripMarkdown(paragraph))
		.filter(Boolean);
	const oversizedParagraphs = paragraphs.filter((paragraph) => words(paragraph).length > 90);
	const lower = plain.toLowerCase();
	const bannedFound = BANNED_PHRASES.filter((phrase) => lower.includes(phrase));
	const emDashCount = (articleBody.match(/—/g) ?? []).length;
	const semicolonCount = (articleBody.match(/;/g) ?? []).length;
	const contrastCount = (plain.match(/\bnot\b[^.!?]{0,90}\bbut\b/gi) ?? []).length;
	const padhoMentions = (plain.match(/\bpadho(?:\.ai)?\b/gi) ?? []).length;

	const issues = [];
	if (!data.title) issues.push('Missing frontmatter title.');
	if (!data.description) issues.push('Missing frontmatter description.');
	if (!data.pubDate) issues.push('Missing frontmatter pubDate.');
	if (String(data.title ?? '').length > 85) issues.push('Title is longer than 85 characters.');
	if (String(data.description ?? '').length > 190) {
		issues.push('Description is longer than 190 characters.');
	}
	if (totalWords < 800) issues.push(`Article is too short (${totalWords} words; minimum 800).`);
	if (totalWords > 1600) issues.push(`Article is too long (${totalWords} words; maximum 1600).`);
	if (averageSentenceWords > 20) {
		issues.push(`Average sentence length is ${averageSentenceWords.toFixed(1)} words; maximum 20.`);
	}
	const longestSentence = Math.max(0, ...sentenceWordCounts);
	if (longestSentence > 34) {
		issues.push(`Longest sentence is ${longestSentence} words; maximum 34.`);
	}
	if (sentenceList.length && longSentences / sentenceList.length > 0.1) {
		issues.push(`${longSentences} sentences exceed 25 words; keep this under 10%.`);
	}
	if (sentenceList.length && commaHeavySentences / sentenceList.length > 0.08) {
		issues.push(`${commaHeavySentences} sentences use more than two commas; keep this under 8%.`);
	}
	if (contentHeadings.length < 3 || contentHeadings.length > 6) {
		issues.push(`Use 3 to 6 main sections; found ${contentHeadings.length}.`);
	}
	if (!headings.some((heading) => heading.toLowerCase() === 'sources')) {
		issues.push('Missing a final "## Sources" section.');
	}
	if (urls.length < 4) issues.push(`Use at least four source links; found ${urls.length}.`);
	if (sourceListLinks.length < 4) {
		issues.push(`List at least four distinct links under Sources; found ${sourceListLinks.length}.`);
	}
	if (domains.length < 3) issues.push(`Use at least three source domains; found ${domains.length}.`);
	if (oversizedParagraphs.length) {
		issues.push(`${oversizedParagraphs.length} paragraphs exceed 90 words.`);
	}
	if (bannedFound.length) issues.push(`Banned phrases found: ${bannedFound.join(', ')}.`);
	if (emDashCount > 2) issues.push(`Use at most two em dashes; found ${emDashCount}.`);
	if (semicolonCount > 0) issues.push(`Do not use semicolons; found ${semicolonCount}.`);
	if (contrastCount > 2) issues.push(`The "not X, but Y" pattern appears ${contrastCount} times.`);
	if (padhoMentions > 3) issues.push(`Padho is mentioned ${padhoMentions} times; maximum 3.`);

	return {
		issues,
		metrics: {
			words: totalWords,
			sentences: sentenceList.length,
			averageSentenceWords: Number(averageSentenceWords.toFixed(1)),
			longestSentenceWords: longestSentence,
			commaHeavySentences,
			sections: contentHeadings.length,
			sourceLinks: urls.length,
			sourceDomains: domains.length,
		},
	};
}

export function assertBlogStyle(markdown) {
	const result = inspectBlog(markdown);
	if (result.issues.length) {
		const error = new Error(`Blog quality gate failed:\n- ${result.issues.join('\n- ')}`);
		error.result = result;
		throw error;
	}
	return result;
}
