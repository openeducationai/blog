import test from 'node:test';
import assert from 'node:assert/strict';
import { localDate, trialEligible, prunePlan, validateHistory, sha256 } from './blog-editorial.mjs';

const config = { timezone: 'Asia/Kolkata', subjects: ['physics', 'chemistry', 'maths'], baselineSlugs: [],
  trial: { enabled: true, startDate: '2026-11-11', endDate: '2026-11-17' },
  figma: { fileKey: 'blogs', retentionDays: 7 } };
function sample(slug = 'friction', concept = 'physics/mechanics/friction', at = '2026-11-11T07:30:00+05:30') {
  const sourcePath = `src/content/blog/${slug}.mdx`;
  const source = `---\ntitle: 'Why does it move?'\ncategory: physics\npubDate: '${at}'\n---\nWe will learn to solve this question: Which way does friction act?\n\n## One step\nTeaching text.\n`;
  const hash = sha256(source);
  return { sourcePath, source, record: { slug, title: 'Why does it move?', category: 'physics', chapter: 'mechanics',
    conceptKey: concept, learningObjective: 'Understand the force', example: 'A shoe', sourcePath,
    sourceSha256: hash, url: `https://padho.ai/blog/${slug}/`, publishedAt: at, mode: 'daily', status: 'staged',
    targetQuestionId: `${slug}-question-1`, targetQuestionText: 'Which way does friction act?',
    briefPath: 'editorial/research/friction.json', review: { sourceSha256: hash, reviewedAt: at, notes: 'Solved both questions and checked the diagram.',
      checks: { science: true, readability: true, pyqSolutions: true, visuals: true } },
    pyqs: [1, 2].map(i => ({ id: `${slug}-question-${i}`, sourceUrl: 'https://jeemain.nta.nic.in/paper.pdf', answerKeyUrl: 'https://jeemain.nta.nic.in/key.pdf', locator: `Question ${i}`, answer: '2', verifiedAt: at, adapted: false })) } };
}
const briefs = { 'editorial/research/friction.json': { syllabus: { url: 'https://jeemain.nta.nic.in/syllabus/' },
  corpus: { papersExamined: 2, coverageNotes: 'Only two official papers examined.' }, priority: { rationale: 'Both questions test force direction.' },
  sources: [{ url: 'https://jeemain.nta.nic.in/paper.pdf' }, { url: 'https://ncert.nic.in/chapter.pdf' }] } };
test('trial has an inclusive seven-date boundary and IST date', () => {
  assert.equal(localDate(new Date('2026-11-10T20:00:00Z')), '2026-11-11');
  for (const date of ['2026-11-11', '2026-11-17']) assert.equal(trialEligible(config, date), true);
  for (const date of ['2026-11-10', '2026-11-18']) assert.equal(trialEligible(config, date), false);
});
test('retention selects only registered generated pages before the seven-date window', () => {
  const registry = { fileKey: 'blogs', pages: [
    { pageId: 'old', name: '2026-11-10', date: '2026-11-10', generated: true },
    { pageId: 'boundary', name: '2026-11-11', date: '2026-11-11', generated: true },
    { pageId: 'human', name: '2026-11-01', date: '2026-11-01', generated: false },
    { pageId: 'renamed', name: 'Keep this', date: '2026-11-01', generated: true },
  ] };
  assert.deepEqual(prunePlan(config, registry, '2026-11-17').remove.map(p => p.pageId), ['old']);
  assert.throws(() => prunePlan(config, { ...registry, fileKey: 'core-views' }, '2026-11-17'));
});
test('reviewed daily article with source provenance passes', () => {
  const x = sample();
  assert.deepEqual(validateHistory(config, { articles: [x.record] }, { [x.sourcePath]: x.source }, briefs), []);
});
test('renamed duplicate concept and second same-subject article are rejected', () => {
  const a = sample(), b = sample('other-title');
  const errors = validateHistory(config, { articles: [a.record, b.record] }, { [a.sourcePath]: a.source, [b.sourcePath]: b.source }, briefs);
  assert(errors.some(e => e.includes('Duplicate concept')));
  assert(errors.some(e => e.includes('Duplicate daily slot')));
});
test('editing source after review invalidates the review and historical hash', () => {
  const x = sample();
  const errors = validateHistory(config, { articles: [x.record] }, { [x.sourcePath]: x.source + 'New claim.' }, briefs);
  assert(errors.some(e => e.includes('source hash changed')));
  assert(errors.some(e => e.includes('review does not cover')));
});
test('missing PYQ evidence and unrecorded public articles fail', () => {
  const x = sample(); x.record.pyqs = [];
  const errors = validateHistory(config, { articles: [x.record] }, { [x.sourcePath]: x.source, 'src/content/blog/new.mdx': x.source }, {});
  assert(errors.some(e => e.includes('two or three verified')));
  assert(errors.some(e => e.includes('Unrecorded article')));
  assert(errors.some(e => e.includes('missing research brief')));
});
test('a new article cannot claim to be a grandfathered baseline', () => {
  const x = sample(); x.record.mode = 'baseline';
  assert(validateHistory(config, { articles: [x.record] }, { [x.sourcePath]: x.source }, briefs).some(e => e.includes('not an authorised baseline')));
});
test('the opening must show the target question and connect it to a verified PYQ', () => {
  const x = sample(); x.record.targetQuestionText = 'A question that was never introduced'; x.record.targetQuestionId = 'invented-question';
  const errors = validateHistory(config, { articles: [x.record] }, { [x.sourcePath]: x.source }, briefs);
  assert(errors.some(e => e.includes('visible in the opening')));
  assert(errors.some(e => e.includes('one of the verified PYQs')));
});
