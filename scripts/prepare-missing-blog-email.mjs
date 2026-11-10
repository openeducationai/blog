import fs from 'node:fs/promises';
import { indiaDate } from './lib/blog-agent.mjs';
import { buildMissingBlogEmail } from './lib/blog-email.mjs';

const email = buildMissingBlogEmail({
	reviewerEmail: process.env.BLOG_REVIEW_EMAIL,
	senderEmail: process.env.SES_SENDER_EMAIL,
	date: indiaDate(),
});

await fs.mkdir('.daily-blog', { recursive: true });
await fs.writeFile('.daily-blog/ses-missing-email.json', `${JSON.stringify(email, null, 2)}\n`, 'utf8');
console.log('Prepared the missing-blog SES alert.');
