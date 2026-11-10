#!/usr/bin/env python3
"""Read-only checks of the built blog or its public search-discovery surface."""
import argparse
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from html.parser import HTMLParser
import json
from pathlib import Path
import sys
from urllib.parse import urljoin, urlparse, unquote
from urllib.request import Request, urlopen
from urllib.robotparser import RobotFileParser
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = 'https://padho.ai'
SITEMAP = ORIGIN + '/blog/sitemap-index.xml'
NS = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
BOTS = {
    'Googlebot': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'bingbot': 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
    'OAI-SearchBot': 'Mozilla/5.0 (compatible; OAI-SearchBot/1.4; +https://openai.com/searchbot)',
    'PerplexityBot': 'Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)',
}


class Page(HTMLParser):
    def __init__(self, data):
        super().__init__()
        self.meta, self.links, self.schemas, self.h1, self.authors = {}, [], [], [], []
        self.canonical, self.image, self._script, self._author = None, None, None, None
        self._in_h1 = False
        self.feed(data.decode('utf-8'))

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'meta': self.meta[a.get('property') or a.get('name')] = a.get('content', '')
        if tag == 'link' and a.get('rel') == 'canonical': self.canonical = a.get('href')
        if tag == 'a':
            self.links.append(a.get('href', ''))
            if 'author' in a.get('rel', '').split(): self._author = {'url': a.get('href'), 'name': ''}
        if tag == 'h1': self._in_h1 = True
        if tag == 'img' and 'reading-image' in a.get('class', '').split(): self.image = a
        if tag == 'script' and a.get('type') == 'application/ld+json': self._script = ''

    def handle_data(self, data):
        if self._script is not None: self._script += data
        if self._in_h1: self.h1.append(data)
        if self._author is not None: self._author['name'] += data

    def handle_endtag(self, tag):
        if tag == 'script' and self._script is not None:
            self.schemas.append(json.loads(self._script)); self._script = None
        if tag == 'h1': self._in_h1 = False
        if tag == 'a' and self._author is not None:
            self._author['name'] = self._author['name'].strip()
            self.authors.append(self._author); self._author = None


def require(condition, message):
    if not condition: raise ValueError(message)


def built_path(url, directory):
    path = unquote(urlparse(url).path)
    require(path == '/blog' or path.startswith('/blog/'), f'Outside blog build: {url}')
    relative = path.removeprefix('/blog').lstrip('/')
    target = directory / relative
    if not target.suffix: target /= 'index.html'
    require(target.resolve().is_relative_to(directory.resolve()), 'Invalid build path')
    return target


def run(args):
    def read(url, agent=None):
        if not args.live: return built_path(url, args.dist).read_bytes(), {}
        with urlopen(Request(url, headers={'User-Agent': agent or 'Padho-blog-search-check/1.0'}), timeout=30) as response:
            require(response.status == 200, f'HTTP {response.status}: {url}')
            require(response.url == url or response.url.rstrip('/') == url.rstrip('/'), f'Unexpected redirect: {url}')
            return response.read(), dict(response.headers.items())

    sitemap = ET.fromstring(read(SITEMAP)[0])
    children = [e.text for e in sitemap.findall('s:sitemap/s:loc', NS)]
    require(children, 'Blog sitemap index is empty')
    urls = []
    for url in children:
        require(url.startswith(ORIGIN + '/blog/'), 'Blog sitemap points outside blog')
        urls.extend(e.text for e in ET.fromstring(read(url)[0]).findall('s:url/s:loc', NS))
    require(urls and len(urls) == len(set(urls)), 'Missing or duplicate sitemap URLs')
    pages, article_urls, images, links = {}, [], set(), set()
    for url in urls:
        require(url.startswith(ORIGIN + '/blog/'), f'Unexpected canonical URL: {url}')
        data, headers = read(url)
        page = Page(data); pages[url] = data
        # The retired /articles route is a redirect document, not an indexable article.
        if url == ORIGIN + '/blog/articles/': continue
        require(page.canonical == url, f'Canonical mismatch: {url}')
        directives = page.meta.get('robots', '').lower() + ' ' + next((v.lower() for k, v in headers.items() if k.lower() == 'x-robots-tag'), '')
        require('noindex' not in directives and 'none' not in directives.split(','), f'Indexing blocked: {url}')
        require(page.meta.get('description'), f'Missing description: {url}')
        for href in page.links:
            target = urljoin(url, href).split('#')[0].split('?')[0]
            if target == ORIGIN + '/blog' or target.startswith(ORIGIN + '/blog/'): links.add(target)
        if page.meta.get('og:type') != 'article': continue
        article_urls.append(url)
        schemas = [s for s in page.schemas if isinstance(s, dict) and s.get('@type') == 'BlogPosting']
        require(len(schemas) == 1, f'Expected one BlogPosting: {url}')
        schema = schemas[0]
        require(schema.get('@context') == 'https://schema.org', f'Invalid schema context: {url}')
        require(schema.get('url') == url and schema.get('mainEntityOfPage', {}).get('@id') == url, f'Schema URL mismatch: {url}')
        require(schema.get('headline') == ''.join(page.h1).strip(), f'Headline differs from visible title: {url}')
        require(schema.get('description') == page.meta['description'], f'Description mismatch: {url}')
        require(schema.get('datePublished') == page.meta.get('article:published_time'), f'Publication date mismatch: {url}')
        published = datetime.fromisoformat(schema['datePublished'].replace('Z', '+00:00'))
        require(published <= datetime.now(timezone.utc), f'Future article exposed: {url}')
        if schema.get('dateModified'):
            require(schema['dateModified'] == page.meta.get('article:modified_time'), f'Modified date mismatch: {url}')
            require(datetime.fromisoformat(schema['dateModified'].replace('Z', '+00:00')) >= published, f'Modified date precedes publication: {url}')
        author = schema.get('author', {})
        require(author.get('@type') in ('Person', 'Organization'), f'Invalid author type: {url}')
        require({'name': author.get('name'), 'url': author.get('url')} in page.authors, f'Author differs from visible byline: {url}')
        require(author.get('url', '').startswith('https://'), f'Missing author URL: {url}')
        require(schema.get('publisher', {}).get('url') == ORIGIN + '/', f'Publisher mismatch: {url}')
        require(schema.get('articleSection') and schema.get('inLanguage') == 'en', f'Missing article context: {url}')
        require(schema.get('image') and page.meta.get('og:image') in schema['image'], f'Missing article image: {url}')
        require(page.image and page.image.get('alt'), f'Missing visible cover/alt text: {url}')
        require(any('/blog/category/' in href for href in page.links), f'Missing category link: {url}')
        images.update(schema['image'])

    for url in sorted(images):
        require(url.startswith(ORIGIN + '/blog/'), f'Unexpected article asset: {url}')
        data, _ = read(url); require(len(data) > 0, f'Empty image: {url}')
    for url in sorted(links): read(url)
    report = {'mode': 'live' if args.live else 'build', 'pages': len(urls), 'articles': len(article_urls), 'articleUrls': article_urls, 'images': len(images), 'internalLinks': len(links), 'metadataMatchesVisibleContent': True}
    if args.live:
        robots_data, _ = read(ORIGIN + '/robots.txt')
        robots_text = robots_data.decode('utf-8')
        robots = RobotFileParser(); robots.parse(robots_text.splitlines())
        require(SITEMAP in (robots.site_maps() or []), 'Root robots.txt does not advertise the blog sitemap')
        require(all(robots.can_fetch(bot, url) for bot in BOTS for url in article_urls), 'A search crawler is blocked by robots.txt')
        def probe(item):
            name, agent, url = item
            data, headers = read(url, agent)
            require(data == pages[url], f'Crawler received different article content: {name} {url}')
            require(not any(k.lower() == 'x-robots-tag' and 'noindex' in v.lower() for k,v in headers.items()), f'Crawler indexing header: {name}')
            return {'crawler': name, 'url': url, 'status': 200, 'sameContent': True}
        with ThreadPoolExecutor(max_workers=4) as pool:
            report['crawlerProbes'] = list(pool.map(probe, [(name, agent, url) for name,agent in BOTS.items() for url in article_urls]))
        report['crawlerEvidenceLimit'] = 'Public user-agent probes and robots rules; not proof of a visit from official crawler IPs or of indexing.'
    return report


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--live', action='store_true')
    parser.add_argument('--dist', type=Path, default=ROOT / 'dist')
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    try:
        report = run(args)
        if args.output: args.output.write_text(json.dumps(report, indent=2) + '\n')
        print(json.dumps(report, indent=2))
    except Exception as error:
        print(f'Search check failed: {error}', file=sys.stderr)
        sys.exit(1)
