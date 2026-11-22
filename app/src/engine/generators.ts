// Генерация упражнений из слов урока. Готовые задания не хранятся.
import type { Lesson, Word } from '../types';
import { hashSeed, mulberry32, shuffle, type Rng } from './rng';
import { norm } from './check';

export type Exercise =
  | { kind: 'learn'; id: string; word: Word; options: string[]; answer: string }
  | { kind: 'choice'; id: string; dir: 'en-ru' | 'ru-en'; word: Word; prompt: string; options: string[]; answer: string }
  | { kind: 'pairs'; id: string; words: Word[]; left: number[]; right: number[] }
  | { kind: 'type'; id: string; word: Word; prompt: string; answers: string[] }
  | { kind: 'build'; id: string; word: Word; prompt: string; answer: string; tokens: string[] };

const val = (w: Word, f: 'en' | 'ru') => (f === 'en' ? w.en : w.ru[0]);

function distractors(w: Word, pool: Word[], n: number, r: Rng, f: 'en' | 'ru'): string[] {
  const bad = new Set([norm(w.en), ...w.ru.map(norm)]);
  const ok = pool.filter((x) => x.id !== w.id && !bad.has(norm(x.en)) && !x.ru.some((t) => bad.has(norm(t))));
  const ordered = [...shuffle(ok.filter((x) => x.pos === w.pos), r), ...shuffle(ok.filter((x) => x.pos !== w.pos), r)];
  const out: string[] = [];
  for (const x of ordered) {
    const v = val(x, f);
    if (!out.includes(v)) out.push(v);
    if (out.length === n) break;
  }
  return out;
}

export const tokenize = (s: string) => s.replace(/[.,!?;:"«»]/g, '').split(/\s+/).filter(Boolean);

function choice(w: Word, pool: Word[], r: Rng, dir: 'en-ru' | 'ru-en'): Exercise {
  const f = dir === 'en-ru' ? 'ru' : 'en';
  const answer = val(w, f);
  return {
    kind: 'choice', id: `c-${dir}-${w.id}`, dir, word: w,
    prompt: dir === 'en-ru' ? w.en : w.ru.join(', '),
    answer, options: shuffle([answer, ...distractors(w, pool, 3, r, f)], r),
  };
}

const pairs = (ws: Word[], r: Rng, tag: string): Exercise => {
  const idx = ws.map((_, i) => i);
  return { kind: 'pairs', id: `p-${tag}`, words: ws, left: shuffle(idx, r), right: shuffle(idx, r) };
};

const typeEx = (w: Word): Exercise => ({
  kind: 'type', id: `t-${w.id}`, word: w, prompt: w.ru.join(', '), answers: [w.en, ...(w.forms ?? [])],
});

function build(w: Word, pool: Word[], r: Rng): Exercise | null {
  const ex = w.examples.find((e) => tokenize(e.en).length <= 10);
  if (!ex) return null;
  const toks = tokenize(ex.en);
  const inSent = new Set(toks.map((t) => t.toLowerCase()));
  const extra = shuffle(
    [...new Set(pool.flatMap((p) => p.examples.flatMap((e) => tokenize(e.en))).map((t) => t.toLowerCase()))]
      .filter((t) => t.length >= 3 && !inSent.has(t)),
    r,
  ).slice(0, 2);
  return { kind: 'build', id: `b-${w.id}`, word: w, prompt: ex.ru, answer: toks.join(' '), tokens: shuffle([...toks, ...extra], r) };
}

/** Делит новые слова на группы по 3–4: выучил группу → закрепил → следующая. */
function chunks<T>(a: T[]): T[][] {
  const n = Math.ceil(a.length / 4);
  const out: T[][] = Array.from({ length: n }, () => []);
  a.forEach((x, i) => out[Math.floor((i * n) / a.length)].push(x));
  return out;
}

/**
 * Урок по шагам:
 * 1) новые слова группами по 3–4: слово с примером и вариантами перевода
 *    (перевод можно подсмотреть, нажав на слово) → пары на эту группу;
 * 2) знакомые слова: выбор перевода (+ пары);
 * 3) финал на всех словах урока: обратный перевод, ввод слова, сборка предложения.
 */
export function buildLesson(lesson: Lesson, levelPool: Word[], seed = Date.now(), known: Set<string> = new Set()): Exercise[] {
  const r = mulberry32(hashSeed(lesson.id) ^ seed);
  const ws = lesson.words;
  const pool = levelPool.length >= 8 ? levelPool : ws;
  const fresh = ws.filter((w) => !known.has(w.id));
  const old = ws.filter((w) => known.has(w.id));
  const out: Exercise[] = [];
  chunks(fresh).forEach((c, i) => {
    c.forEach((w) => {
      const ch = choice(w, pool, r, 'en-ru');
      if (ch.kind === 'choice') out.push({ kind: 'learn', id: `l-${w.id}`, word: w, options: ch.options, answer: ch.answer });
    });
    if (c.length >= 3) out.push(pairs(c, r, `${lesson.id}-n${i}`));
  });
  shuffle(old, r).forEach((w) => out.push(choice(w, pool, r, 'en-ru')));
  if (old.length >= 3) out.push(pairs(shuffle(old, r).slice(0, 5), r, `${lesson.id}-o`));
  const late = shuffle(ws, r);
  late.slice(0, 3).forEach((w) => out.push(choice(w, pool, r, 'ru-en')));
  late.slice(3, 5).forEach((w) => out.push(typeEx(w)));
  let built = 0;
  for (const w of late.slice(5)) {
    if (built === 2) break;
    const e = build(w, pool, r);
    if (e) { out.push(e); built++; }
  }
  return out;
}

export const exerciseWords = (e: Exercise): Word[] => (e.kind === 'pairs' ? e.words : [e.word]);

/** Повторение: по 1 заданию на слово (выбор/ввод чередуются) + пары, если слов ≥5. */
export function buildReview(words: Word[], pool: Word[], seed = Date.now()): Exercise[] {
  const r = mulberry32(seed);
  const ws = shuffle(words, r);
  const out: Exercise[] = ws.map((w, i) =>
    i % 3 === 2 ? typeEx(w) : choice(w, pool, r, i % 3 === 0 ? 'ru-en' : 'en-ru'));
  if (ws.length >= 5) out.splice(Math.min(4, out.length), 0, pairs(shuffle(ws, r).slice(0, 5), r, `rev-${seed}`));
  return out;
}

/** Мини-тест выбранного уровня: 3 выбора EN→RU, 3 выбора RU→EN, 2 ввода слова. */
export function buildMiniTest(pool: Word[], seed = Date.now()): Exercise[] {
  const r = mulberry32(seed);
  const ws = shuffle(pool, r).slice(0, 8);
  return ws.map((w, i) => (i < 3 ? choice(w, pool, r, 'en-ru') : i < 6 ? choice(w, pool, r, 'ru-en') : typeEx(w)));
}

/** Испытание острова: только ввод и сборка предложений, без подсказок-вариантов. */
export function buildTrial(words: Word[], pool: Word[], seed = Date.now()): Exercise[] {
  const r = mulberry32(seed);
  const ws = shuffle(words, r).slice(0, 10);
  const out: Exercise[] = [];
  ws.forEach((w, i) => {
    const b = i % 2 ? build(w, pool, r) : null;
    out.push(b ?? typeEx(w));
  });
  return out;
}
