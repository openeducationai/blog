export function parseReviewMetadata(reviewItem) {
	const body = String(reviewItem?.body ?? '');
	const match = body.match(
		/<!--\s*padho-daily-blog-review\s+(\{[^\r\n]+\})\s*-->/,
	);
	if (!match) throw new Error('This issue is not a Padho daily blog review.');

	let metadata;
	try {
		metadata = JSON.parse(match[1]);
	} catch (error) {
		throw new Error(`The blog review metadata is invalid: ${error.message}`);
	}

	const branch = String(metadata.branch ?? '');
	const post = String(metadata.post ?? '');
	if (!/^automation\/daily-blog-\d{4}-\d{2}-\d{2}$/.test(branch)) {
		throw new Error(`Unsafe or invalid daily blog branch: ${branch || '(missing)'}`);
	}
	if (!/^src\/content\/blog\/[a-z0-9]+(?:-[a-z0-9]+)*\.mdx?$/.test(post)) {
		throw new Error(`Unsafe or invalid daily blog path: ${post || '(missing)'}`);
	}

	return { branch, post };
}

export function hasLabel(reviewItem, name) {
	return (reviewItem?.labels ?? []).some((label) =>
		String(typeof label === 'string' ? label : label?.name ?? '').toLowerCase() ===
		name.toLowerCase(),
	);
}

export function parseApprovalMetadata(comment) {
	const body = String(comment?.body ?? '');
	const match = body.match(
		/<!--\s*padho-daily-blog-approved\s+(\{[^\r\n]+\})\s*-->/,
	);
	if (!match) return null;

	let metadata;
	try {
		metadata = JSON.parse(match[1]);
	} catch {
		return null;
	}

	const branch = String(metadata.branch ?? '');
	const sha = String(metadata.sha ?? '');
	if (!/^automation\/daily-blog-\d{4}-\d{2}-\d{2}$/.test(branch)) return null;
	if (!/^[0-9a-f]{40}$/.test(sha)) return null;
	return { branch, sha };
}
