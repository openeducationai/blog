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

export function isSafeApprovedBlogComparison(comparison, post) {
	const changedFiles = comparison?.files ?? [];
	return (
		['ahead', 'diverged'].includes(comparison?.status) &&
		Number(comparison?.ahead_by) > 0 &&
		changedFiles.length === 1 &&
		changedFiles[0].filename === post &&
		changedFiles[0].status === 'added'
	);
}

const feedbackMarkerPattern = /<!--\s*padho-daily-blog-feedback\s+(\{[^\r\n]+\})\s*-->/;

export function parseFeedbackCommentIds(reviewItem) {
	const body = String(reviewItem?.body ?? '');
	const match = body.match(feedbackMarkerPattern);
	if (!match) return [];

	let metadata;
	try {
		metadata = JSON.parse(match[1]);
	} catch (error) {
		throw new Error(`The queued blog feedback metadata is invalid: ${error.message}`);
	}

	if (!Array.isArray(metadata.commentIds)) {
		throw new Error('The queued blog feedback must contain commentIds.');
	}

	const ids = metadata.commentIds.map(Number);
	if (ids.some((id) => !Number.isSafeInteger(id) || id <= 0)) {
		throw new Error('The queued blog feedback contains an invalid comment ID.');
	}
	return [...new Set(ids)];
}

export function queueFeedbackComment(body, commentId) {
	const id = Number(commentId);
	if (!Number.isSafeInteger(id) || id <= 0) {
		throw new Error('Cannot queue feedback without a valid GitHub comment ID.');
	}

	const reviewItem = { body };
	parseReviewMetadata(reviewItem);
	const ids = [...new Set([...parseFeedbackCommentIds(reviewItem), id])];
	const marker = `<!-- padho-daily-blog-feedback ${JSON.stringify({ commentIds: ids })} -->`;
	if (feedbackMarkerPattern.test(body)) return body.replace(feedbackMarkerPattern, marker);
	return `${String(body).trim()}\n\n${marker}\n`;
}

export function clearFeedbackComments(body, processedIds) {
	const processed = new Set(processedIds.map(Number));
	const remaining = parseFeedbackCommentIds({ body }).filter((id) => !processed.has(id));
	if (remaining.length) {
		const marker = `<!-- padho-daily-blog-feedback ${JSON.stringify({ commentIds: remaining })} -->`;
		return { body: body.replace(feedbackMarkerPattern, marker), remaining };
	}
	return {
		body: body.replace(feedbackMarkerPattern, '').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n',
		remaining,
	};
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
