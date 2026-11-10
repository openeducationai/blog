const REVIEW_URL = /^https:\/\/github\.com\/openeducationai\/blog\/issues\/\d+$/;

export function buildBlogReviewEmail({
	reviewIssue,
	article,
	reviewerEmail,
	senderEmail,
	revisionSummary = '',
}) {
	if (!reviewIssue?.number || !REVIEW_URL.test(String(reviewIssue.url ?? ''))) {
		throw new Error('The issue file does not contain a valid Padho blog review issue.');
	}
	assertEmailSetting('BLOG_REVIEW_EMAIL', reviewerEmail);
	assertEmailSetting('SES_SENDER_EMAIL', senderEmail);

	const cleanArticle = stripFrontmatter(article).trim();
	if (!cleanArticle) throw new Error('The reviewed article is empty.');
	const title = readTitle(article) || String(reviewIssue.title ?? '').replace(/^Daily blog review:\s*/i, '').trim();
	if (!title) throw new Error('The reviewed article has no title.');

	const prefix = revisionSummary ? '[Revised Padho blog]' : '[Padho blog review]';
	const reviewInstructions = [
		'Review this draft on GitHub:',
		'- Comment APPROVE, APPROVED, or OK to mark this exact draft ready for a pull request.',
		'- Comment SKIP to discard it.',
		'- Or write normal feedback for the next revision.',
		'',
		'Replies to this SES email are not monitored. Nothing is published from silence.',
		`Open the review: ${reviewIssue.url}`,
	].join('\n');
	const text = [
		title,
		...(revisionSummary ? ['', `What changed: ${revisionSummary}`] : []),
		'',
		cleanArticle,
		'',
		'---',
		'',
		reviewInstructions,
		'',
	].join('\n');
	const html = renderEmailHtml({
		title,
		article: cleanArticle,
		reviewUrl: reviewIssue.url,
		revisionSummary,
	});

	return {
		Source: senderEmail,
		Destination: { ToAddresses: [reviewerEmail] },
		Message: {
			Subject: { Data: `${prefix} ${title}`, Charset: 'UTF-8' },
			Body: {
				Text: { Data: text, Charset: 'UTF-8' },
				Html: { Data: html, Charset: 'UTF-8' },
			},
		},
	};
}

export function buildMissingBlogEmail({ reviewerEmail, senderEmail, date }) {
	assertEmailSetting('BLOG_REVIEW_EMAIL', reviewerEmail);
	assertEmailSetting('SES_SENDER_EMAIL', senderEmail);
	if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date ?? ''))) {
		throw new Error('The missing-blog alert requires an ISO calendar date.');
	}

	const subject = `[Padho blog alert] No draft was created for ${date}`;
	const text = [
		`No Padho blog draft was ready for the 09:00 review email on ${date}.`,
		'',
		'The SES email service is working. The 05:45 writing job did not create a review draft.',
		'No older article was resent.',
		'',
	].join('\n');
	const html = `<!doctype html>
<html lang="en">
<body style="margin:0;background:#f4f1ea;color:#172033;font-family:Arial,sans-serif">
  <div style="max-width:640px;margin:28px auto;padding:28px 32px;background:#fff;border:1px solid #ded8cc;border-radius:14px">
    <div style="font-size:12px;letter-spacing:.14em;color:#b34d2e;font-weight:700">PADHO · BLOG ALERT</div>
    <h1 style="font-size:28px;line-height:1.2">No draft was created for ${escapeHtml(date)}</h1>
    <p style="font-size:16px;line-height:1.6">The SES email service is working. The 05:45 writing job did not create a review draft.</p>
    <p style="font-size:16px;line-height:1.6">No older article was resent.</p>
  </div>
</body>
</html>`;

	return {
		Source: senderEmail,
		Destination: { ToAddresses: [reviewerEmail] },
		Message: {
			Subject: { Data: subject, Charset: 'UTF-8' },
			Body: {
				Text: { Data: text, Charset: 'UTF-8' },
				Html: { Data: html, Charset: 'UTF-8' },
			},
		},
	};
}

export function stripFrontmatter(markdown) {
	return String(markdown ?? '').replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
}

export function readTitle(markdown) {
	const raw = String(markdown ?? '').match(/^title:\s*(.+?)\s*$/m)?.[1]?.trim() ?? '';
	if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
		return raw.slice(1, -1).trim();
	}
	return raw;
}

function assertEmailSetting(name, value) {
	if (!value || /[\r\n]/.test(value) || !String(value).includes('@')) {
		throw new Error(`${name} must contain a valid email address.`);
	}
}

function renderEmailHtml({ title, article, reviewUrl, revisionSummary }) {
	return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f4f1ea;color:#172033;font-family:Arial,sans-serif">
  <div style="display:none;max-height:0;overflow:hidden">Your daily Padho technical blog is ready for review.</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f1ea;padding:28px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:720px;background:#ffffff;border:1px solid #ded8cc;border-radius:16px;overflow:hidden">
        <tr><td style="padding:28px 34px 20px;border-bottom:1px solid #eee8dd">
          <div style="font-size:12px;letter-spacing:.14em;color:#b34d2e;font-weight:700">PADHO · DAILY BLOG REVIEW</div>
          <h1 style="margin:12px 0 0;font-family:Georgia,serif;font-size:32px;line-height:1.18;color:#172033">${escapeHtml(title)}</h1>
          ${revisionSummary ? `<p style="margin:16px 0 0;padding:12px 14px;background:#fff8e6;border-radius:8px"><strong>What changed:</strong> ${escapeHtml(revisionSummary)}</p>` : ''}
        </td></tr>
        <tr><td style="padding:26px 34px;font-family:Georgia,serif;font-size:17px;line-height:1.7;color:#263247">
          ${renderMarkdown(article)}
        </td></tr>
        <tr><td style="padding:24px 34px 30px;background:#f8f6f1;border-top:1px solid #eee8dd">
          <h2 style="margin:0 0 12px;font-size:20px;color:#172033">Review the draft</h2>
          <p style="margin:0 0 18px;line-height:1.55;color:#42506a">On GitHub, comment <strong>APPROVE</strong>, <strong>APPROVED</strong>, or <strong>OK</strong> to accept the draft. Comment <strong>SKIP</strong> to discard it, or write normal revision feedback. Replies to this SES email are not monitored.</p>
          <a href="${escapeAttribute(reviewUrl)}" style="display:inline-block;background:#b34d2e;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:8px">Open the review</a>
          <p style="margin:18px 0 0;font-size:13px;line-height:1.5;color:#68748a">Nothing is published from silence. A pull request still requires your review and manual merge.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function renderMarkdown(markdown) {
	const lines = markdown.split(/\r?\n/);
	const parts = [];
	let paragraph = [];
	let list = null;

	const closeParagraph = () => {
		if (!paragraph.length) return;
		parts.push(`<p style="margin:0 0 18px">${inlineMarkdown(paragraph.join(' '))}</p>`);
		paragraph = [];
	};
	const closeList = () => {
		if (!list) return;
		parts.push(`</${list}>`);
		list = null;
	};

	for (const rawLine of lines) {
		const line = rawLine.trim();
		if (!line) {
			closeParagraph();
			closeList();
			continue;
		}
		const heading = line.match(/^(#{1,3})\s+(.+)$/);
		if (heading) {
			closeParagraph();
			closeList();
			const level = Math.min(heading[1].length + 1, 4);
			parts.push(`<h${level} style="margin:28px 0 10px;color:#172033;line-height:1.3">${inlineMarkdown(heading[2])}</h${level}>`);
			continue;
		}
		const bullet = line.match(/^[-*]\s+(.+)$/);
		const numbered = line.match(/^\d+\.\s+(.+)$/);
		if (bullet || numbered) {
			closeParagraph();
			const wanted = bullet ? 'ul' : 'ol';
			if (list !== wanted) {
				closeList();
				parts.push(`<${wanted} style="margin:0 0 18px;padding-left:24px">`);
				list = wanted;
			}
			parts.push(`<li style="margin:0 0 7px">${inlineMarkdown((bullet || numbered)[1])}</li>`);
			continue;
		}
		paragraph.push(line);
	}
	closeParagraph();
	closeList();
	return parts.join('\n');
}

function inlineMarkdown(value) {
	const tokens = [];
	const keep = (html) => {
		const index = tokens.push(html) - 1;
		return `\u0000${index}\u0000`;
	};
	let text = String(value).replace(/`([^`]+)`/g, (_match, code) => {
		return keep(`<code style="background:#f1eee7;padding:2px 5px;border-radius:4px;font-family:monospace">${escapeHtml(code)}</code>`);
	});
	text = text.replace(/\[([^\]]+)]\((https:\/\/[^\s)]+)\)/g, (_match, label, url) => {
		return keep(`<a href="${escapeAttribute(url)}" style="color:#9f3f26">${escapeHtml(label)}</a>`);
	});
	text = escapeHtml(text);
	text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
	text = text.replace(/\u0000(\d+)\u0000/g, (_match, index) => tokens[Number(index)]);
	return text;
}

function escapeHtml(value) {
	return String(value)
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

function escapeAttribute(value) {
	return escapeHtml(value);
}
