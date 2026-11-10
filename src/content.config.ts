import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import categories from './data/categories.json';
import authors from './data/authors.json';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(categories.map(({ id }) => id) as [string, ...string[]]),
    author: z.enum(Object.keys(authors) as [string, ...string[]]).default('padho'),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: image(),
    heroImageAlt: z.string().min(1),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = { blog };
