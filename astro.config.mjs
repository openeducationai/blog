import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://padho.ai',
  base: '/blog',
  trailingSlash: 'always',
  redirects: { '/articles': 'https://padho.ai/blog' },
  vite: { build: { assetsInlineLimit: 0 } },
  integrations: [mdx(), sitemap()],
});
