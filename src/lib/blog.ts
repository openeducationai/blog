import { getCollection } from 'astro:content';
import categoryData from '../data/categories.json';

export const categories = categoryData;
export type Category = (typeof categories)[number];
export const categoryPath = (id: string) => `/blog/category/${id}/`;
export const articlePath = (id: string) => `/blog/${id}/`;

export async function getPublishedPosts() {
  const now = new Date();
  return (await getCollection('blog', ({ data }) => !data.draft && data.pubDate <= now))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}
