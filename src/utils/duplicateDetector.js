import { getAllQuestions } from '../data/sampleQuestionsLoader.js';

/* ================= Thresholds (قابل تنظیم) ================= */

export const DUPLICATE_THRESHOLDS = {
  // متن سوال
  highSim: 0.82,       // شباهت خیلی بالا → کاندید تکراری
  lowSim: 0.65,        // شباهت متوسط → نیاز به چک keyword
  keyword: 0.70,       // همپوشانی کلمات کلیدی سوال
  maxLenDiff: 0.4,     // رد سریع بر اساس اختلاف طول

  // جواب
  answerSim: 0.65,     // حداقل شباهت جواب (Levenshtein)
  answerKeyword: 0.75, // یا همپوشانی کلمات کلیدی جواب
  requireAnswer: true, // اگه true باشه، جواب‌های نامشخص → غیرتکراری
};

/* ================= Normalization ================= */

const STOPWORDS = new Set([
  'است','هست','می','نمی','که','را','از','به','با','در','برای',
  'این','آن','یا','و','کدام','چه','چی','یک','دو','بر','هم','تا',
  'شود','کرد','کن','دارد','دارند','باشد','مورد','کدام‌یک',
]);

export function normalizeQuestion(text) {
  if (!text) return '';
  return text
    .replace(/[\u200c\u200f\u200e\u200b]/g, '')
    .replace(/[،؛.,!؟?!:()«»""'']/g, '')
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/* ================= Levenshtein ================= */

export function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  let prev = new Array(b.length + 1);
  let curr = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[b.length];
}

export function similarity(a, b) {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

/* ================= Keyword helpers ================= */

function extractKeywords(text) {
  const norm = normalizeQuestion(text);
  if (!norm) return new Set();
  return new Set(norm.split(' ').filter((w) => w.length > 2 && !STOPWORDS.has(w)));
}

function keywordOverlap(a, b) {
  const ka = extractKeywords(a);
  const kb = extractKeywords(b);
  if (ka.size === 0 || kb.size === 0) return 0;
  let inter = 0;
  for (const w of ka) if (kb.has(w)) inter++;
  return inter / Math.min(ka.size, kb.size);
}

/* ================= Answer extraction ================= */

/**
 * متن پاسخ صحیح هر سوال رو برمی‌گردونه.
 * MCQ → متن گزینه‌ی correctAnswer
 * short_answer → answerText
 * نامشخص → null
 */
export function getCorrectAnswerText(q) {
  if (!q) return null;
  if (q.type === 'mcq') {
    if (
      q.correctAnswer == null ||
      q.correctAnswer < 0 ||
      !Array.isArray(q.options)
    ) {
      return null;
    }
    const opt = q.options[q.correctAnswer];
    return opt && opt.trim() ? opt : null;
  }
  if (q.type === 'short_answer') {
    const ans = q.answerText;
    return ans && ans.trim() ? ans : null;
  }
  return null;
}

/**
 * آیا دو سوال از نظر جواب مشابه هستن؟
 * خروجی: { ok, sim, kw, reason }
 */
export function compareAnswers(a, b) {
  const ansA = getCorrectAnswerText(a);
  const ansB = getCorrectAnswerText(b);

  // اگه هیچ‌کدوم جواب ندارن → با پرچم requireAnswer رفتار می‌کنیم
  if (!ansA || !ansB) {
    if (DUPLICATE_THRESHOLDS.requireAnswer) {
      return { ok: false, sim: null, kw: null, reason: 'missing-answer' };
    }
    // در حالت آسان‌گیرانه، نبود جواب مانع تشخیص نیست
    return { ok: true, sim: null, kw: null, reason: 'missing-answer-lenient' };
  }

  const na = normalizeQuestion(ansA);
  const nb = normalizeQuestion(ansB);

  if (!na || !nb) {
    return { ok: false, sim: null, kw: null, reason: 'empty-answer' };
  }

  const sim = similarity(na, nb);
  if (sim >= DUPLICATE_THRESHOLDS.answerSim) {
    return { ok: true, sim, kw: null, reason: 'answer-similarity' };
  }

  const kw = keywordOverlap(ansA, ansB);
  if (kw >= DUPLICATE_THRESHOLDS.answerKeyword) {
    return { ok: true, sim, kw, reason: 'answer-keyword' };
  }

  return { ok: false, sim, kw, reason: 'answer-different' };
}

/* ================= Pair check ================= */

/**
 * آیا دو سوال تکراری هستن؟
 * شرط: متن سوال مشابه **و** جواب مشابه.
 * خروجی: null | { qSim, qKw, aSim, aKw, reason }
 */
export function checkPair(a, b) {
  const topicA = a.topic || 'unknown';
  const topicB = b.topic || 'unknown';
  if (topicA !== topicB) return null;

  const na = normalizeQuestion(a.question);
  const nb = normalizeQuestion(b.question);

  const maxLen = Math.max(na.length, nb.length);
  if (maxLen === 0) return null;
  const lenDiff = Math.abs(na.length - nb.length) / maxLen;
  if (lenDiff > DUPLICATE_THRESHOLDS.maxLenDiff) return null;

  // مرحله ۱: متن سوال
  const qSim = similarity(na, nb);
  let questionMatches = false;
  let qKw = null;

  if (qSim >= DUPLICATE_THRESHOLDS.highSim) {
    questionMatches = true;
  } else if (qSim >= DUPLICATE_THRESHOLDS.lowSim) {
    qKw = keywordOverlap(a.question, b.question);
    if (qKw >= DUPLICATE_THRESHOLDS.keyword) {
      questionMatches = true;
    }
  }

  if (!questionMatches) return null;

  // مرحله ۲: جواب
  const answerCheck = compareAnswers(a, b);
  if (!answerCheck.ok) return null;

  return {
    qSim,
    qKw,
    aSim: answerCheck.sim,
    aKw: answerCheck.kw,
    reason: `Q(${qSim.toFixed(2)}${qKw != null ? `/${qKw.toFixed(2)}` : ''}) + A(${answerCheck.reason})`,
  };
}

/* ================= Main compute ================= */

const makeKey = (q) => `${q.examId}|${q.id}`;

export function computeDuplicateMap(allQuestions) {
  const result = new Map();

  for (const q of allQuestions) {
    result.set(makeKey(q), {
      isDuplicate: false,
      isFirst: false,
      count: 0,
      firstKey: null,
      firstExamId: null,
      firstExamLabel: null,
      firstQuestionId: null,
      duplicates: [],
    });
  }

  const byTopic = new Map();
  for (const q of allQuestions) {
    const t = q.topic || 'unknown';
    if (!byTopic.has(t)) byTopic.set(t, []);
    byTopic.get(t).push(q);
  }

  const parent = new Map();
  for (const q of allQuestions) parent.set(makeKey(q), makeKey(q));
  const find = (x) => {
    while (parent.get(x) !== x) {
      parent.set(x, parent.get(parent.get(x)));
      x = parent.get(x);
    }
    return x;
  };
  const union = (a, b) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent.set(ra, rb);
  };

  for (const list of byTopic.values()) {
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        if (checkPair(list[i], list[j])) {
          union(makeKey(list[i]), makeKey(list[j]));
        }
      }
    }
  }

  const groups = new Map();
  for (const q of allQuestions) {
    const root = find(makeKey(q));
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root).push(q);
  }

  const indexMap = new Map();
  allQuestions.forEach((q, i) => indexMap.set(makeKey(q), i));

  for (const group of groups.values()) {
    if (group.length < 2) continue;

    const ordered = group
      .slice()
      .sort(
        (a, b) =>
          (indexMap.get(makeKey(a)) ?? 0) - (indexMap.get(makeKey(b)) ?? 0)
      );

    const first = ordered[0];
    const firstKey = makeKey(first);
    const count = ordered.length;

    const firstInfo = result.get(firstKey);
    firstInfo.isFirst = true;
    firstInfo.count = count;
    firstInfo.duplicates = ordered.slice(1).map((q) => ({
      examId: q.examId,
      examLabel: q.examLabel,
      questionId: q.id,
    }));

    for (let i = 1; i < ordered.length; i++) {
      const q = ordered[i];
      const info = result.get(makeKey(q));
      info.isDuplicate = true;
      info.count = count;
      info.firstKey = firstKey;
      info.firstExamId = first.examId;
      info.firstExamLabel = first.examLabel;
      info.firstQuestionId = first.id;
    }
  }

  return result;
}

/* ================= Singleton + lazy ================= */

let _cachedMap = null;

export function getDuplicateMap() {
  if (!_cachedMap) {
    if (import.meta.env.DEV) {
      const all = getAllQuestions();
      const t0 = performance.now();
      _cachedMap = computeDuplicateMap(all);
      const dt = performance.now() - t0;
      // eslint-disable-next-line no-console
      console.log(
        `[duplicateDetector] محاسبه برای ${all.length} سوال در ${dt.toFixed(0)}ms`
      );
    } else {
      _cachedMap = computeDuplicateMap(getAllQuestions());
    }
  }
  return _cachedMap;
}

export function resetDuplicateMap() {
  _cachedMap = null;
}

export function getDuplicateInfo(examId, questionId) {
  if (!examId || !questionId) return null;
  return getDuplicateMap().get(`${examId}|${questionId}`) ?? null;
}