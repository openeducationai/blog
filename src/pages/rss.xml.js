import rss from '@astrojs/rss';
import { getPublishedPosts, articlePath } from '../lib/blog';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';

export async function GET(context) {
  const posts = await getPublishedPosts();
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: new URL('/blog/', context.site),
    items: posts.map((post) => ({ ...post.data, link: articlePath(post.id) })),
  });
}
