import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const readJSON = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const required = (value, label, errors) => {
  if (typeof value !== 'string' || !value.trim()) errors.push(`${label} is required`);
};
const httpsURL = value => {
  try { return new URL(value).protocol === 'https:'; } catch { return false; }
};

export function localDate(now = new Date(), timezone = 'Asia/Kolkata') {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now).map(part => [part.type, part.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function trialEligible(config, date) {
  return config.trial.enabled && date >= config.trial.startDate && date <= config.trial.endDate;
}

export function prunePlan(config, registry, date) {
  if (registry.fileKey !== config.figma.fileKey) throw new Error('Figma registry file key mismatch');
  const day = Date.parse(`${date}T00:00:00Z`);
  if (!Number.isFinite(day) || new Date(day).toISOString().slice(0, 10) !== date) throw new Error('Invalid retention date');
  const cutoff = new Date(day - (config.figma.retentionDays - 1) * 86400000).toISOString().slice(0, 10);
  return {
    fileKey: config.figma.fileKey, date, cutoff,
    remove: registry.pages.filter(p => p.generated === true && /^\d{4}-\d{2}-\d{2}$/.test(p.date)
      && p.date < cutoff && p.pageId && p.name === p.date),
  };
}

export function scalarFrontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new Error('Missing article frontmatter');
  const result = {};
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^(\w+):\s*(.*?)\s*$/);
    if (!field) continue;
    let value = field[2];
    if (value.startsWith('"')) value = JSON.parse(value);
    else if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1).replaceAll("''", "'");
    result[field[1]] = value;
  }
  return result;
}

export function validateHistory(config, history, sources, briefs = {}) {
  const errors = [], slugs = new Set(), concepts = new Map(), slots = new Set(), pyqs = new Map();
  const records = history.articles ?? [];
  for (const record of records) {
    const label = record.slug || '(unnamed article)';
    for (const field of ['slug', 'title', 'category', 'chapter', 'conceptKey', 'learningObjective', 'example', 'sourcePath', 'sourceSha256']) {
      required(record[field], `${label}.${field}`, errors);
    }
    if (slugs.has(record.slug)) errors.push(`Duplicate slug: ${record.slug}`);
    slugs.add(record.slug);
    if (concepts.has(record.conceptKey)) errors.push(`Duplicate concept: ${record.conceptKey} (${concepts.get(record.conceptKey)}, ${label})`);
    concepts.set(record.conceptKey, label);
    if (!['baseline', 'daily', 'manual', 'archive'].includes(record.mode)) errors.push(`${label}: invalid mode`);
    if (!['staged', 'published', 'archived'].includes(record.status)) errors.push(`${label}: invalid status`);
    if (record.mode === 'baseline' && !config.baselineSlugs.includes(record.slug)) errors.push(`${label}: not an authorised baseline`);
    if ((record.mode === 'archive') !== (record.status === 'archived')) errors.push(`${label}: inconsistent archive status`);
    const source = sources[record.sourcePath];
    if (source === undefined) { errors.push(`${label}: missing source ${record.sourcePath}`); continue; }
    const digest = sha256(source);
    if (record.sourceSha256 !== digest) errors.push(`${label}: source hash changed; update history and review`);
    if (record.status === 'archived') continue;
    let meta;
    try { meta = scalarFrontmatter(source); } catch (e) { errors.push(`${label}: ${e.message}`); continue; }
    for (const [field, expected] of Object.entries({ title: record.title, category: record.category, pubDate: record.publishedAt })) {
      if (meta[field] !== expected) errors.push(`${label}: ${field} differs between source and history`);
    }
    if (!/^src\/content\/blog\/[a-z0-9-]+\.mdx?$/.test(record.sourcePath)) errors.push(`${label}: invalid source path`);
    if (record.url !== `https://padho.ai/blog/${record.slug}/`) errors.push(`${label}: invalid permanent URL`);
    if (record.mode !== 'daily') continue;
    required(record.targetQuestionId, `${label}.targetQuestionId`, errors);
    required(record.targetQuestionText, `${label}.targetQuestionText`, errors);
    const opening = source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '').split(/^##\s/m)[0];
    if (!record.targetQuestionText || !opening.includes(record.targetQuestionText)) errors.push(`${label}: target question must be visible in the opening before the first lesson section`);
    if (!(record.pyqs ?? []).some(q => q.id === record.targetQuestionId)) errors.push(`${label}: target question must identify one of the verified PYQs`);
    if (!config.subjects.includes(record.category)) errors.push(`${label}: invalid daily subject`);
    const time = new Date(record.publishedAt);
    if (!Number.isFinite(time.getTime()) || !/(?:Z|[+-]\d\d:\d\d)$/.test(record.publishedAt ?? '')) {
      errors.push(`${label}: publication needs a real timestamp with timezone`);
    } else {
      const slot = `${localDate(time, config.timezone)}:${record.category}`;
      if (slots.has(slot)) errors.push(`Duplicate daily slot: ${slot}`);
      slots.add(slot);
    }
    const review = record.review ?? {};
    if (review.sourceSha256 !== digest) errors.push(`${label}: review does not cover the exact source bytes`);
    required(review.notes, `${label}.review.notes`, errors);
    if (!Number.isFinite(Date.parse(review.reviewedAt))) errors.push(`${label}: missing review timestamp`);
    for (const check of ['science', 'readability', 'pyqSolutions', 'visuals']) {
      if (review.checks?.[check] !== true) errors.push(`${label}: ${check} review incomplete`);
    }
    const brief = briefs[record.briefPath];
    if (!brief) errors.push(`${label}: missing research brief`);
    else {
      if (!httpsURL(brief.syllabus?.url)) errors.push(`${label}: missing official syllabus evidence`);
      if (!Number.isInteger(brief.corpus?.papersExamined) || brief.corpus.papersExamined < 1) errors.push(`${label}: no examined question-paper corpus`);
      required(brief.corpus?.coverageNotes, `${label}.corpus.coverageNotes`, errors);
      required(brief.priority?.rationale, `${label}.priority.rationale`, errors);
      if (!Array.isArray(brief.sources) || brief.sources.length < 2 || brief.sources.some(s => !httpsURL(s.url))) errors.push(`${label}: insufficient valid source evidence`);
    }
    if (!Array.isArray(record.pyqs) || record.pyqs.length < 2 || record.pyqs.length > 3) errors.push(`${label}: requires two or three verified PYQs`);
    for (const question of record.pyqs ?? []) {
      for (const field of ['id', 'locator', 'answer']) required(question[field], `${label}.pyq.${field}`, errors);
      if (!httpsURL(question.sourceUrl) || !httpsURL(question.answerKeyUrl)) errors.push(`${label}: PYQ needs paper and final answer-key URLs`);
      if (!Number.isFinite(Date.parse(question.verifiedAt))) errors.push(`${label}: PYQ verification timestamp missing`);
      if (typeof question.adapted !== 'boolean') errors.push(`${label}: state whether the PYQ was adapted`);
      if (pyqs.has(question.id)) errors.push(`Repeated PYQ: ${question.id} (${pyqs.get(question.id)}, ${label})`);
      pyqs.set(question.id, label);
    }
  }
  for (const filename of Object.keys(sources).filter(f => f.startsWith('src/content/blog/'))) {
    const meta = scalarFrontmatter(sources[filename]);
    if (meta.draft === 'true') continue;
    if (!records.some(r => r.sourcePath === filename && r.status !== 'archived')) errors.push(`Unrecorded article: ${filename}`);
  }
  return errors;
}

export function loadState(root = ROOT) {
  const config = readJSON(path.join(root, 'editorial/config.json'));
  const history = readJSON(path.join(root, 'editorial/history.json'));
  const queue = readJSON(path.join(root, 'editorial/queue.json'));
  const registry = readJSON(path.join(root, 'editorial/figma-pages.json'));
  const sources = {}, briefs = {};
  for (const folder of ['src/content/blog', 'archive/blog']) {
    const absolute = path.join(root, folder);
    if (!fs.existsSync(absolute)) continue;
    for (const filename of fs.readdirSync(absolute).filter(f => /\.mdx?$/.test(f))) {
      sources[`${folder}/${filename}`] = fs.readFileSync(path.join(absolute, filename), 'utf8');
    }
  }
  for (const record of [...history.articles, ...queue.topics]) {
    if (record.briefPath && /^editorial\/research\/[a-z0-9-]+\.json$/.test(record.briefPath)) {
      const filename = path.join(root, record.briefPath);
      if (fs.existsSync(filename)) briefs[record.briefPath] = readJSON(filename);
    }
  }
  return { config, history, queue, registry, sources, briefs };
}

export function checkState(state) {
  const errors = validateHistory(state.config, state.history, state.sources, state.briefs);
  if (state.registry.fileKey !== state.config.figma.fileKey) errors.push('Figma registry file mismatch');
  const ids = new Set(), concepts = new Set();
  for (const topic of state.queue.topics) {
    if (ids.has(topic.id)) errors.push(`Duplicate queue ID: ${topic.id}`);
    ids.add(topic.id);
    if (!['needs_research', 'ready', 'writing', 'published', 'skipped'].includes(topic.status)) errors.push(`${topic.id}: invalid queue status`);
    if (!['ready', 'writing'].includes(topic.status)) continue;
    for (const field of ['id', 'category', 'chapter', 'conceptKey', 'question', 'learningObjective', 'example', 'rationale', 'difference']) required(topic[field], `${topic.id}.${field}`, errors);
    if (!state.config.subjects.includes(topic.category)) errors.push(`${topic.id}: invalid subject`);
    if (!state.briefs[topic.briefPath]) errors.push(`${topic.id}: ready topic lacks research brief`);
    if (concepts.has(topic.conceptKey)) errors.push(`Duplicate queued concept: ${topic.conceptKey}`);
    concepts.add(topic.conceptKey);
    const existing = state.history.articles.find(r => r.conceptKey === topic.conceptKey);
    if (existing && !(topic.status === 'writing' && topic.slug === existing.slug && existing.status === 'staged')) errors.push(`${topic.id}: concept already recorded as ${existing.slug}`);
  }
  return errors;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const state = loadState();
    const command = process.argv[2] ?? 'check';
    const date = process.argv[3] ?? localDate(new Date(), state.config.timezone);
    if (command === 'prune-figma') console.log(JSON.stringify(prunePlan(state.config, state.registry, date), null, 2));
    else if (command === 'status') {
      const runPath = path.join(ROOT, `editorial/runs/${date}.json`);
      console.log(JSON.stringify({ date, eligible: trialEligible(state.config, date), trial: state.config.trial,
        history: state.history.articles.map(r => ({ slug: r.slug, conceptKey: r.conceptKey, status: r.status })),
        readyTopics: state.queue.topics.filter(t => t.status === 'ready'),
        run: fs.existsSync(runPath) ? readJSON(runPath) : null,
        figma: state.config.figma }, null, 2));
    } else if (command === 'check') {
      const errors = checkState(state);
      if (errors.length) throw new Error(errors.join('\n'));
      console.log(`Editorial checks passed: ${state.history.articles.length} historical articles, ${state.queue.topics.length} queued topics.`);
    } else throw new Error(`Unknown command: ${command}`);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
