// Генерация упражнений из слов урока. Готовые задания не хранятся.
import type { Lesson, Word } from '../types';
import { hashSeed, mulberry32, shuffle, type Rng } from './rng';
import { norm } from './check';
import { knownSentence, knownToken } from './vocab';

export type Exercise =
  | { kind: 'learn'; id: string; word: Word; options: string[]; answer: string }
  | { kind: 'choice'; id: string; dir: 'en-ru' | 'ru-en'; word: Word; prompt: string; options: string[]; answer: string }
  | { kind: 'pairs'; id: string; words: Word[]; labels: string[]; left: number[]; right: number[] }
  | { kind: 'type'; id: string; word: Word; prompt: string; answers: string[] }
  | { kind: 'build'; id: string; word: Word; prompt: string; answer: string; tokens: string[] }
  /** На слух: слово звучит (только английский). choose — выбрать перевод, write — написать по-английски. */
  | { kind: 'listen'; id: string; mode: 'choose' | 'write'; word: Word; options: string[]; answer: string; answers: string[] };

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

export const tokenize = (s: string) =>
  s.replace(/[.,!?;:"«»“”()…]/g, '').split(/\s+/).filter((t) => /[\p{L}\p{N}]/u.test(t));

/**
 * Выбор перевода. Если варианты английские (ru-en) и передан familiar — ловушки берём из уже
 * знакомых игроку слов, чтобы в задании не появлялись непройденные английские слова.
 */
function choice(w: Word, pool: Word[], r: Rng, dir: 'en-ru' | 'ru-en', familiar?: Word[]): Exercise {
  const f = dir === 'en-ru' ? 'ru' : 'en';
  const answer = val(w, f);
  let wrong = dir === 'ru-en' && familiar ? distractors(w, familiar, 3, r, f) : [];
  if (wrong.length < 3) wrong = [...wrong, ...distractors(w, pool, 3, r, f).filter((x) => !wrong.includes(x))].slice(0, 3);
  return {
    kind: 'choice', id: `c-${dir}-${w.id}`, dir, word: w,
    prompt: dir === 'en-ru' ? w.en : w.ru.join('; '),
    answer, options: shuffle([answer, ...wrong], r),
  };
}

/**
 * Пары: у каждого слова должна быть своя подпись по-русски. Если перевод слова совпадает
 * с переводом соседа (leg/foot → «нога»), берём другой вариант перевода, а если его нет — слово убираем.
 */
function pairs(group: Word[], r: Rng, tag: string): Exercise | null {
  const ws: Word[] = [], labels: string[] = [];
  for (const w of group) {
    const others = group.filter((x) => x !== w).flatMap((x) => x.ru.map(norm));
    const label = w.ru.find((t) => !others.includes(norm(t)) && !labels.some((l) => norm(l) === norm(t)));
    if (label && !ws.some((x) => norm(x.en) === norm(w.en))) { ws.push(w); labels.push(label); }
  }
  if (ws.length < 3) return null;
  const idx = ws.map((_, i) => i);
  return { kind: 'pairs', id: `p-${tag}`, words: ws, labels, left: shuffle(idx, r), right: shuffle(idx, r) };
}

/** Ввод слова. Синонимы с тем же переводом (mother/mum на «мама») тоже засчитываются. */
function listenEx(w: Word, pool: Word[], r: Rng, mode: 'choose' | 'write'): Exercise {
  const ch = choice(w, pool, r, 'en-ru');
  const t = typeEx(w, pool);
  return {
    kind: 'listen', id: `a-${mode}-${w.id}`, mode, word: w,
    options: ch.kind === 'choice' ? ch.options : [], answer: ch.kind === 'choice' ? ch.answer : w.ru[0],
    answers: t.kind === 'type' ? t.answers : [w.en],
  };
}

const typeEx = (w: Word, pool: Word[] = []): Exercise => {
  const ru = new Set(w.ru.map(norm));
  const alts = pool.filter((x) => x.id !== w.id && x.ru.some((t) => ru.has(norm(t)))).map((x) => x.en);
  return { kind: 'type', id: `t-${w.id}`, word: w, prompt: w.ru.join('; '), answers: [w.en, ...(w.forms ?? []), ...alts] };
};

/**
 * Сборка предложения из примера. Если передан словарь игрока (vocab), берём только
 * предложения из знакомых слов, и лишние плитки — тоже из знакомых слов.
 */
function build(w: Word, pool: Word[], r: Rng, vocab?: Set<string>): Exercise | null {
  const ex = w.examples.find((e) => tokenize(e.en).length <= 10 && (!vocab || knownSentence(e.en, vocab)));
  if (!ex) return null;
  const toks = tokenize(ex.en);
  const inSent = new Set(toks.map((t) => t.toLowerCase()));
  const extra = shuffle(
    [...new Set(pool.flatMap((p) => p.examples.flatMap((e) => tokenize(e.en))).map((t) => t.toLowerCase()))]
      .filter((t) => t.length >= 3 && !inSent.has(t) && (!vocab || knownToken(t, vocab))),
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
export function buildLesson(
  lesson: Lesson, levelPool: Word[], seed = Date.now(), known: Set<string> = new Set(), vocab?: Set<string>, audio = false,
): Exercise[] {
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
    const p = c.length >= 3 ? pairs(c, r, `${lesson.id}-n${i}`) : null;
    if (p) out.push(p);
    // слова, не попавшие в пары (одинаковый перевод с соседом), закрепляем выбором перевода
    c.filter((w) => !p || (p.kind === 'pairs' && !p.words.includes(w))).forEach((w) => out.push(choice(w, pool, r, 'en-ru')));
  });
  shuffle(old, r).forEach((w) => out.push(choice(w, pool, r, 'en-ru')));
  const po = old.length >= 3 ? pairs(shuffle(old, r).slice(0, 5), r, `${lesson.id}-o`) : null;
  if (po) out.push(po);
  const late = shuffle(ws, r);
  const familiar = pool.filter((x) => known.has(x.id) || ws.some((y) => y.id === x.id));
  late.slice(0, 3).forEach((w) => out.push(choice(w, pool, r, 'ru-en', familiar)));
  late.slice(3, 5).forEach((w) => out.push(typeEx(w, pool)));
  if (audio) { // на слух: одно слово выбрать по звуку, одно — записать
    out.push(listenEx(late[late.length - 1], pool, r, 'choose'));
    out.push(listenEx(late[late.length - 2], pool, r, 'write'));
  }
  let built = 0;
  for (const w of late.slice(5)) {
    if (built === 2) break;
    const e = build(w, pool, r, vocab);
    if (e) { out.push(e); built++; }
  }
  // нет подходящих предложений из знакомых слов — вместо сборки ввод слова
  late.slice(5).filter((w) => !out.some((e) => e.kind === 'build' && e.word === w)).slice(0, 2 - built)
    .forEach((w) => out.push(typeEx(w, pool)));
  return out;
}

export const exerciseWords = (e: Exercise): Word[] => (e.kind === 'pairs' ? e.words : [e.word]);

/** Варианты-ловушки — из того же уровня, что и слово (id вида a1-d01-01), иначе A1-ученик видит слова B2. */
const sameLevel = (w: Word, pool: Word[]) => {
  const lv = w.id.split('-')[0];
  const same = pool.filter((x) => x.id.split('-')[0] === lv);
  return same.length >= 8 ? same : pool;
};

/** Повторение: по 1 заданию на слово (выбор/ввод чередуются) + пары, если слов ≥5. */
export function buildReview(words: Word[], pool: Word[], seed = Date.now(), familiar?: Word[], audio = false): Exercise[] {
  const r = mulberry32(seed);
  const ws = shuffle(words, r);
  const out: Exercise[] = ws.map((w, i) =>
    audio && i % 4 === 3 ? listenEx(w, sameLevel(w, pool), r, i % 8 === 7 ? 'write' : 'choose')
      : i % 3 === 2 ? typeEx(w, words) : choice(w, sameLevel(w, pool), r, i % 3 === 0 ? 'ru-en' : 'en-ru', familiar));
  const p = ws.length >= 5 ? pairs(shuffle(ws, r).slice(0, 5), r, `rev-${seed}`) : null;
  if (p) out.splice(Math.min(4, out.length), 0, p);
  return out;
}

/** Мини-тест выбранного уровня: 3 выбора EN→RU, 3 выбора RU→EN, 2 ввода слова. */
export function buildMiniTest(pool: Word[], seed = Date.now()): Exercise[] {
  const r = mulberry32(seed);
  const ws = shuffle(pool, r).slice(0, 8);
  return ws.map((w, i) => (i < 3 ? choice(w, pool, r, 'en-ru') : i < 6 ? choice(w, pool, r, 'ru-en') : typeEx(w, pool)));
}

/** Испытание острова: только ввод и сборка предложений, без подсказок-вариантов. */
export function buildTrial(words: Word[], pool: Word[], seed = Date.now(), vocab?: Set<string>, audio = false): Exercise[] {
  const r = mulberry32(seed);
  const ws = shuffle(words, r).slice(0, 10);
  const out: Exercise[] = [];
  ws.forEach((w, i) => {
    const b = i % 2 ? build(w, pool, r, vocab) : null;
    out.push(b ?? (audio && i % 4 === 2 ? listenEx(w, pool, r, 'write') : typeEx(w, pool)));
  });
  return out;
}
