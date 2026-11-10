/* Public catalogue adapter. The landing uses the same data and destinations as Learn. */
export function appOrigin(location) {
  return /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)
    ? location.origin : 'https://learn.padho.ai';
}

export function normaliseOverview(payload) {
  if (!Array.isArray(payload?.subjects)) throw new Error('Invalid catalogue');
  const seen = new Set();
  return payload.subjects.filter(row => {
    if (!Number.isInteger(row?.grade) || row.grade < 10 || row.grade > 12 ||
        typeof row.subject !== 'string' || !row.subject.trim() || !(row.chapters > 0)) return false;
    const key = `${row.grade}:${row.subject}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).map(({grade, subject}) => ({grade, subject}));
}

export function classChoices(overview) {
  const grades = [...new Set(overview.map(row => row.grade))].filter(grade => grade >= 10 && grade <= 12).sort((a, b) => a - b);
  const choices = grades.map(grade => ({id: String(grade), label: `Class ${grade}`, grade}));
  if (grades.includes(12)) choices.push({id: 'repeat', label: 'Repeating / drop year', grade: 12});
  return choices;
}

export function subjectLabel(subject) {
  return subject.replace(/_/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());
}

export function subjectChoices(overview, grade) {
  return overview.filter(row => row.grade === grade)
    .map(row => ({id: row.subject, label: subjectLabel(row.subject)}));
}

export function normaliseChapters(payload, grade, subject) {
  if (!Array.isArray(payload?.chapters)) throw new Error('Invalid chapters');
  const seen = new Set();
  return payload.chapters.filter(row => {
    if (typeof row?.id !== 'string' || !row.id || typeof row.title !== 'string' || !row.title.trim() ||
        row.grade !== grade || row.subject !== subject || seen.has(row.id)) return false;
    seen.add(row.id);
    return true;
  }).map(({id, title}, index) => ({id, title, number: index + 1}));
}

export function chapterHref(origin, chapter, grade, subject) {
  const query = new URLSearchParams({grade: String(grade), subject, n: String(chapter.number)});
  return `${origin}/learn/chapter/${encodeURIComponent(chapter.id)}?${query}`;
}

export function createCatalogueClient(origin, fetcher = fetch) {
  async function get(path, signal) {
    const abort = new AbortController();
    const cancel = () => abort.abort(signal?.reason);
    if (signal?.aborted) cancel(); else signal?.addEventListener('abort', cancel, {once: true});
    const timeout = setTimeout(() => abort.abort(new Error('Catalogue request timed out')), 15000);
    try {
      const response = await fetcher(`${origin}/api/v1/kg/${path}`, {signal: abort.signal, credentials: 'omit', headers: {Accept: 'application/json'}});
      if (!response.ok) throw new Error('Catalogue unavailable');
      return await response.json();
    } finally {
      clearTimeout(timeout); signal?.removeEventListener('abort', cancel);
    }
  }
  return {
    async overview(signal) { return normaliseOverview(await get('overview?min_grade=10&max_grade=12', signal)); },
    async chapters(grade, subject, signal) {
      const params = new URLSearchParams({grade: String(grade), subject});
      return normaliseChapters(await get(`chapters?${params}`, signal), grade, subject);
    },
  };
}
