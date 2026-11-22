// Генерация упражнений из слов урока. Готовые задания не хранятся.
import type { Lesson, Word } from '../types';
import { hashSeed, mulberry32, shuffle, type Rng } from './rng';
import { norm } from './check';

export type Exercise =
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

/** Урок ≈16 заданий: каждое слово встречается минимум 1 раз, типы чередуются по сложности. */
export function buildLesson(lesson: Lesson, levelPool: Word[], seed = Date.now()): Exercise[] {
  const r = mulberry32(hashSeed(lesson.id) ^ seed);
  const ws = lesson.words;
  const pool = levelPool.length >= 8 ? levelPool : ws;
  const half = Math.ceil(ws.length / 2);
  const a = ws.slice(0, half), b = ws.slice(half);
  const out: Exercise[] = [];
  a.forEach((w) => out.push(choice(w, pool, r, 'en-ru')));
  if (a.length >= 3) out.push(pairs(a.slice(0, 5), r, `${lesson.id}-a`));
  b.forEach((w) => out.push(choice(w, pool, r, 'ru-en')));
  if (b.length >= 3) out.push(pairs(b.slice(0, 5), r, `${lesson.id}-b`));
  const late = shuffle(ws, r);
  late.slice(0, 2).forEach((w) => out.push(typeEx(w)));
  let built = 0;
  for (const w of late.slice(2)) {
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

/** Тест уровня: n вопросов «выбери перевод» из случайных слов уровня. */
export function placementQuestions(pool: Word[], n: number, seed = Date.now()): Exercise[] {
  const r = mulberry32(seed);
  return shuffle(pool, r).slice(0, n).map((w, i) => choice(w, pool, r, i % 2 ? 'ru-en' : 'en-ru'));
}
