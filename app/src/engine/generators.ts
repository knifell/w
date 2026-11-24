// Генерация упражнений из слов урока. Готовые задания не хранятся.
import type { Lesson, Word } from '../types';
import { hashSeed, mulberry32, shuffle, type Rng } from './rng';
import { norm } from './check';
import { knownSentence, knownToken } from './vocab';

export type Exercise =
  /** Новое слово. guess — «догадайся по смыслу»: перевод примера виден, перевод слова скрыт. */
  | { kind: 'learn'; id: string; word: Word; options: string[]; answer: string; guess?: boolean }
  /** Словарик: новые слова группы списком (звук, перевод, пример) — затем пары. */
  | { kind: 'glossary'; id: string; words: Word[] }
  /** Переписка с жителем: он спрашивает «как сказать …», ты дописываешь ответ выученным словом. */
  | { kind: 'chat'; id: string; island: number; words: Word[]; steps: { ask: string; before: string; after: string; options: string[]; answer: string; say: string; word: Word }[] }
  /** Письмо с пропусками: вставить слова из банка. */
  | { kind: 'letter'; id: string; words: Word[]; lines: { before: string; after: string; answer: string; ru: string; word: Word }[]; bank: string[] }
  | { kind: 'choice'; id: string; dir: 'en-ru' | 'ru-en'; word: Word; prompt: string; options: string[]; answer: string }
  | { kind: 'pairs'; id: string; words: Word[]; labels: string[]; left: number[]; right: number[] }
  | { kind: 'type'; id: string; word: Word; prompt: string; answers: string[] }
  /** Сборка предложения из плиток. audio — диктант: фраза звучит, перевод не показываем. */
  | { kind: 'build'; id: string; word: Word; prompt: string; answer: string; tokens: string[]; audio?: string }
  /** Выбор одного из вариантов: cloze — вставить слово в предложение, sentence — выбрать верный английский
   *  перевод фразы, meaning — понять английскую фразу (выбрать русский перевод). say — что озвучить после ответа. */
  | { kind: 'select'; id: string; mode: 'cloze' | 'sentence' | 'meaning'; word: Word; prompt: string; hint?: string; say: string; options: string[]; answer: string }
  /** Верно или нет: слово и перевод (правильный или чужой). */
  | { kind: 'tf'; id: string; word: Word; shown: string; truth: boolean }
  /** Собрать слово из букв. */
  | { kind: 'spell'; id: string; word: Word; prompt: string; letters: string[]; answer: string }
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

// ---------- новые виды заданий ----------

/** Пример из знакомых слов (≤ 12 слов), содержащий само слово. */
function exampleOf(w: Word, vocab?: Set<string>) {
  return w.examples.find((e) => tokenize(e.en).length <= 12 && (!vocab || knownSentence(e.en, vocab)));
}

/** Английские слова-ловушки: только знакомые игроку, той же части речи в первую очередь. */
function enDistractors(w: Word, familiar: Word[], n: number, r: Rng, not: string[]): string[] {
  const bad = new Set([norm(w.en), ...not.map(norm)]);
  const ok = familiar.filter((x) => x.id !== w.id && !bad.has(norm(x.en)) && !/\s/.test(x.en.trim()));
  const ordered = [...shuffle(ok.filter((x) => x.pos === w.pos), r), ...shuffle(ok.filter((x) => x.pos !== w.pos), r)];
  const out: string[] = [];
  for (const x of ordered) { if (!out.some((o) => norm(o) === norm(x.en))) out.push(x.en); if (out.length === n) break; }
  return out;
}

/** Где в предложении стоит слово (или его форма): индексы токенов. */
function locate(w: Word, toks: string[]): [number, number] | null {
  const low = toks.map((t) => t.toLowerCase().replace(/[’]/g, "'"));
  for (const f of [w.en, ...(w.forms ?? [])]) {
    const ft = tokenize(f).map((t) => t.toLowerCase());
    if (!ft.length) continue;
    for (let i = 0; i + ft.length <= low.length; i++) if (ft.every((t, j) => low[i + j] === t)) return [i, ft.length];
  }
  return null;
}

const endMark = (s: string) => (/[?!]\s*$/.test(s) ? s.trim().slice(-1) : '.');
const sentenceOf = (toks: string[], end: string) => {
  const t = toks.join(' ');
  return t.charAt(0).toUpperCase() + t.slice(1) + end;
};

/** Вставь слово: «I ___ Anna.» → am. */
function cloze(w: Word, r: Rng, vocab: Set<string> | undefined, familiar: Word[]): Exercise | null {
  const ex = exampleOf(w, vocab);
  if (!ex) return null;
  const toks = tokenize(ex.en);
  const at = locate(w, toks);
  if (!at || at[1] !== 1 || toks.length < 3) return null;
  const answer = toks[at[0]];
  const wrong = enDistractors(w, familiar, 3, r, [answer]);
  if (wrong.length < 3) return null;
  const blanked = toks.map((t, i) => (i === at[0] ? '____' : t));
  const options = shuffle([answer, ...wrong.map((x) => (/^[A-Z]/.test(answer) ? x.charAt(0).toUpperCase() + x.slice(1) : x))], r);
  return { kind: 'select', mode: 'cloze', id: `z-${w.id}`, word: w, prompt: sentenceOf(blanked, endMark(ex.en)), hint: ex.ru, say: ex.en, options, answer };
}

/** Какой перевод верный: верная фраза и две «почти верные» (чужое слово / переставленные слова). */
function sentencePick(w: Word, r: Rng, vocab: Set<string> | undefined, familiar: Word[]): Exercise | null {
  const ex = exampleOf(w, vocab);
  if (!ex) return null;
  const toks = tokenize(ex.en);
  const at = locate(w, toks);
  if (!at || toks.length < 3) return null;
  const end = endMark(ex.en);
  const right = sentenceOf(toks, end);
  const sub = enDistractors(w, familiar, 1, r, toks)[0];
  const opts = new Set<string>([right]);
  if (sub) opts.add(sentenceOf([...toks.slice(0, at[0]), sub, ...toks.slice(at[0] + at[1])], end));
  for (let k = 0; k < 6 && opts.size < 3; k++) { // переставить два соседних слова
    const i = Math.floor(r() * (toks.length - 1));
    const sw = [...toks]; [sw[i], sw[i + 1]] = [sw[i + 1], sw[i]];
    if (sw[i].toLowerCase() !== sw[i + 1].toLowerCase()) opts.add(sentenceOf(sw, end));
  }
  if (opts.size < 3) return null;
  return { kind: 'select', mode: 'sentence', id: `s-${w.id}`, word: w, prompt: ex.ru, say: ex.en, options: shuffle([...opts].slice(0, 3), r), answer: right };
}

/** Что значит фраза: английское предложение → русский перевод из трёх. */
function meaning(w: Word, pool: Word[], r: Rng, vocab: Set<string> | undefined): Exercise | null {
  const ex = exampleOf(w, vocab);
  if (!ex) return null;
  const others: string[] = [];
  for (let k = 0; k < 40 && others.length < 2 && pool.length > 1; k++) { // случайные чужие примеры, без перебора всего пула
    const x = pool[Math.floor(r() * pool.length)];
    const ru = x.id !== w.id ? x.examples[0]?.ru : undefined;
    if (ru && norm(ru) !== norm(ex.ru) && !others.some((o) => norm(o) === norm(ru))) others.push(ru);
  }
  if (others.length < 2) return null;
  return { kind: 'select', mode: 'meaning', id: `m-${w.id}`, word: w, prompt: ex.en, say: ex.en, options: shuffle([ex.ru, ...others], r), answer: ex.ru };
}

/** Верно или нет: в половине случаев — чужой перевод. */
function trueFalse(w: Word, pool: Word[], r: Rng): Exercise {
  const truth = r() < 0.5;
  const fake = truth ? null : distractors(w, pool, 1, r, 'ru')[0];
  return { kind: 'tf', id: `f-${w.id}`, word: w, shown: fake ?? w.ru[0], truth: !fake };
}

/** Собери слово из букв (+2 лишние буквы). Только простые слова из 3–9 букв. */
function spell(w: Word, r: Rng): Exercise | null {
  const a = w.en.trim().toLowerCase();
  if (!/^[a-z]{3,9}$/.test(a)) return null;
  const abc = 'abcdefghijklmnopqrstuvwxyz'.split('').filter((c) => !a.includes(c));
  const extra = shuffle(abc, r).slice(0, 2);
  return { kind: 'spell', id: `w-${w.id}`, word: w, prompt: w.ru.join('; '), letters: shuffle([...a.split(''), ...extra], r), answer: a };
}

/** Диктант: фраза звучит, собрать из плиток. */
function dictation(w: Word, pool: Word[], r: Rng, vocab?: Set<string>): Exercise | null {
  const b = build(w, pool, r, vocab);
  if (!b || b.kind !== 'build') return null;
  const ex = w.examples.find((e) => tokenize(e.en).join(' ') === b.answer);
  return ex ? { ...b, id: `d-${w.id}`, audio: ex.en } : null;
}

/** Предложение-пример с одним пропуском (само слово): части до/после и ответ. */
function gapOf(w: Word, vocab?: Set<string>) {
  const ex = exampleOf(w, vocab);
  if (!ex) return null;
  const toks = tokenize(ex.en);
  const at = locate(w, toks);
  if (!at || at[1] !== 1 || toks.length < 3) return null;
  const end = endMark(ex.en);
  const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
  const before = toks.slice(0, at[0]).join(' '), after = toks.slice(at[0] + 1).join(' ') + end;
  return { ex, answer: toks[at[0]], before: before ? cap(before) : '', after, end };
}

/** Переписка: 3 вопроса жителя «Как сказать …?», ответ — фраза с пропуском и 3 варианта. */
function chat(words: Word[], island: number, r: Rng, vocab: Set<string> | undefined, familiar: Word[], tag: string): Exercise | null {
  const steps: Extract<Exercise, { kind: 'chat' }>['steps'] = [];
  for (const w of words) {
    const g = gapOf(w, vocab);
    if (!g) continue;
    const wrong = enDistractors(w, familiar, 2, r, [g.answer]);
    if (wrong.length < 2) continue;
    const fit = (x: string) => (!g.before && /^[A-Z]/.test(g.answer) ? x.charAt(0).toUpperCase() + x.slice(1) : x);
    steps.push({ ask: g.ex.ru, before: g.before, after: g.after, answer: g.answer, options: shuffle([g.answer, ...wrong.map(fit)], r), say: g.ex.en, word: w });
    if (steps.length === 3) break;
  }
  if (steps.length < 2) return null;
  return { kind: 'chat', id: `h-${tag}`, island, words: steps.map((x) => x.word), steps };
}

/** Письмо: 3–4 предложения с пропусками, банк слов (+2 лишних). */
function letter(words: Word[], r: Rng, vocab: Set<string> | undefined, familiar: Word[], tag: string): Exercise | null {
  const lines: Extract<Exercise, { kind: 'letter' }>['lines'] = [];
  for (const w of words) {
    const g = gapOf(w, vocab);
    if (!g || lines.some((l) => norm(l.answer) === norm(g.answer))) continue;
    lines.push({ before: g.before, after: g.after, answer: g.answer, ru: g.ex.ru, word: w });
    if (lines.length === 4) break;
  }
  if (lines.length < 3) return null;
  const extra = enDistractors(lines[0].word, familiar, 6, r, lines.map((l) => l.answer)).filter((x) => /^[a-z]/i.test(x)).slice(0, 2);
  // в банке всё строчными (кроме I и имён), чтобы заглавная буква не выдавала ответ в начале фразы
  const low = (t: string) => (t === 'I' || /^[A-Z][a-z]+$/.test(t) && !lines.some((l) => l.answer === t && l.before === '') ? t : t.toLowerCase());
  return { kind: 'letter', id: `e-${tag}`, words: lines.map((l) => l.word), lines, bank: shuffle([...lines.map((l) => low(l.answer)), ...extra.map(low)], r) };
}

type Gen = 'choiceRu' | 'choiceEn' | 'type' | 'cloze' | 'sentence' | 'meaning' | 'tf' | 'spell';

/** Задание выбранного вида; если для слова не подходит — null. */
function make(g: Gen, w: Word, pool: Word[], r: Rng, familiar: Word[], vocab?: Set<string>): Exercise | null {
  switch (g) {
    case 'choiceRu': return choice(w, pool, r, 'ru-en', familiar);
    case 'choiceEn': return choice(w, pool, r, 'en-ru');
    case 'type': return typeEx(w, pool);
    case 'cloze': return cloze(w, r, vocab, familiar);
    case 'sentence': return sentencePick(w, r, vocab, familiar);
    case 'meaning': return meaning(w, pool, r, vocab);
    case 'tf': return trueFalse(w, pool, r);
    case 'spell': return spell(w, r);
  }
}

/** Разные задания по очереди: перебирает виды со случайного места и не ставит один вид дважды подряд. */
function varied(words: Word[], gens: Gen[], pool: Word[], r: Rng, familiar: Word[], vocab: Set<string> | undefined, out: Exercise[]) {
  let k = Math.floor(r() * gens.length);
  for (const w of words) {
    for (let tries = 0; tries < gens.length; tries++) {
      const g = gens[(k + tries) % gens.length];
      const e = make(g, w, pool, r, familiar, vocab);
      if (!e || (out.length && kindKey(out[out.length - 1]) === kindKey(e))) continue;
      out.push(e); k = (k + tries + 1) % gens.length; break;
    }
  }
}
const kindKey = (e: Exercise) => (e.kind === 'select' ? `select-${e.mode}` : e.kind === 'choice' ? `choice-${e.dir}` : e.kind);

/** Делит новые слова на группы по 3–4: выучил группу → закрепил → следующая. */
function chunks<T>(a: T[]): T[][] {
  const n = Math.ceil(a.length / 4);
  const out: T[][] = Array.from({ length: n }, () => []);
  a.forEach((x, i) => out[Math.floor((i * n) / a.length)].push(x));
  return out;
}

export interface LessonOpts { format?: 'listen' | 'chat' | 'letter'; intro?: 'cards' | 'glossary' | 'guess' }

/**
 * Урок по шагам (каждый раз в другом порядке и с другими видами заданий):
 * 0) разминка: 2 слова из прошлых уроков (recall) — чтобы выученное не забывалось;
 * 1) новые слова группами по 3–4: карточка (перевод можно подсмотреть) → пары/выбор, иногда «верно или нет»;
 * 2) знакомые слова урока — разными заданиями;
 * 3) смешанный блок: обратный перевод, ввод, пропуск в предложении, выбор фразы, смысл фразы, буквы
 *    (+1 старое слово);
 * 4) на слух (если есть звук): выбрать и записать;
 * 5) финал: сборка предложения и диктант (со звуком) или вторая сборка.
 */
export function buildLesson(
  lesson: Lesson, levelPool: Word[], seed = Date.now(), known: Set<string> = new Set(), vocab?: Set<string>, audio = false,
  recall: Word[] = [], opts: LessonOpts = {},
): Exercise[] {
  const { format, intro = 'cards' } = opts;
  const r = mulberry32(hashSeed(lesson.id) ^ seed);
  const ws = lesson.words;
  const inLesson = (x: Word) => ws.some((y) => y.id === x.id);
  const pool = levelPool.length >= 8 ? levelPool : ws;
  const fresh = ws.filter((w) => !known.has(w.id));
  const old = ws.filter((w) => known.has(w.id));
  const familiar = pool.filter((x) => known.has(x.id) || inLesson(x));
  const learnedOnly = pool.filter((x) => known.has(x.id));
  const back = shuffle(recall.filter((w) => !inLesson(w)), r);
  const out: Exercise[] = [];

  varied(back.slice(0, 2), ['choiceRu', 'cloze', 'tf', 'meaning', 'spell'], pool, r, learnedOnly, vocab, out);

  chunks(fresh).forEach((c, i) => {
    if (intro === 'glossary') out.push({ kind: 'glossary', id: `g-${lesson.id}-${i}`, words: c });
    else c.forEach((w) => {
      const ch = choice(w, pool, r, 'en-ru');
      const guess = intro === 'guess' && !!exampleOf(w);
      if (ch.kind === 'choice') out.push({ kind: 'learn', id: `l-${w.id}`, word: w, options: ch.options, answer: ch.answer, guess });
    });
    const p = c.length >= 3 ? pairs(c, r, `${lesson.id}-n${i}`) : null;
    if (p) out.push(p);
    // слова, не попавшие в пары (одинаковый перевод с соседом), закрепляем выбором перевода
    c.filter((w) => !p || (p.kind === 'pairs' && !p.words.includes(w))).forEach((w) => out.push(choice(w, pool, r, 'en-ru')));
    if (c.length >= 2 && r() < 0.5) out.push(trueFalse(c[Math.floor(r() * c.length)], pool, r));
  });

  varied(shuffle(old, r), ['choiceEn', 'tf', 'cloze', 'meaning'], pool, r, familiar, vocab, out);
  const po = old.length >= 3 ? pairs(shuffle(old, r).slice(0, 5), r, `${lesson.id}-o`) : null;
  if (po) out.push(po);

  const late = shuffle(ws, r);
  // формат урока: переписка или письмо — главная часть урока, выученные слова применяются в тексте
  const usePool = [...late, ...back];
  const special = format === 'chat' ? chat(usePool, lesson.island, r, vocab, familiar, lesson.id)
    : format === 'letter' ? letter(usePool, r, vocab, familiar, lesson.id) : null;
  if (special) {
    out.push(special);
    varied(late.filter((w) => !exerciseWords(special).includes(w)).slice(0, 3), ['choiceRu', 'type', 'spell', 'meaning'], pool, r, familiar, vocab, out);
  } else varied([...late.slice(0, 5), ...back.slice(2, 3)], ['choiceRu', 'type', 'cloze', 'sentence', 'meaning', 'spell'], pool, r, familiar, vocab, out);

  if (audio) { // на слух: одно слово выбрать по звуку, одно — записать
    out.push(listenEx(late[late.length - 1], pool, r, 'choose'));
    out.push(listenEx(late[late.length - 2], pool, r, 'write'));
    if (format === 'listen') { // урок-«Маяк»: ещё задания на слух и диктант
      out.push(listenEx(late[late.length - 3] ?? late[0], pool, r, 'choose'));
      const d = dictation(late[late.length - 4] ?? late[0], pool, r, vocab);
      out.push(d ?? listenEx(late[late.length - 4] ?? late[0], pool, r, 'write'));
    }
  }

  const fin = [...late.slice(5), ...late.slice(0, 5)];
  let b: Exercise | null = null;
  for (const w of fin) if ((b = build(w, pool, r, vocab))) break;
  out.push(b ?? typeEx(fin[0], pool));
  let second: Exercise | null = null;
  for (const w of fin) {
    if (b && b.kind === 'build' && b.word === w) continue;
    if ((second = audio ? dictation(w, pool, r, vocab) : build(w, pool, r, vocab))) break;
  }
  // нет подходящих предложений из знакомых слов — вместо сборки ввод слова
  out.push(second ?? typeEx(fin[1] ?? fin[0], pool));
  return out;
}

export const exerciseWords = (e: Exercise): Word[] => ('words' in e ? e.words : [e.word]);

/** Варианты-ловушки — из того же уровня, что и слово (id вида a1-d01-01), иначе A1-ученик видит слова B2. */
const sameLevel = (w: Word, pool: Word[]) => {
  const lv = w.id.split('-')[0];
  const same = pool.filter((x) => x.id.split('-')[0] === lv);
  return same.length >= 8 ? same : pool;
};

/** Повторение: по 1 заданию на слово, виды чередуются (выбор, ввод, пропуск, буквы, фраза…) + пары, если слов ≥5. */
export function buildReview(words: Word[], pool: Word[], seed = Date.now(), familiar?: Word[], audio = false, vocab?: Set<string>): Exercise[] {
  const r = mulberry32(seed);
  const ws = shuffle(words, r);
  const fam = familiar && familiar.length >= 4 ? familiar : words;
  const out: Exercise[] = [];
  const gens: Gen[] = ['choiceEn', 'choiceRu', 'type', 'cloze', 'tf', 'sentence', 'spell', 'meaning'];
  ws.forEach((w, i) => {
    if (audio && i % 4 === 3) out.push(listenEx(w, sameLevel(w, pool), r, i % 8 === 7 ? 'write' : 'choose'));
    else varied([w], gens, sameLevel(w, pool), r, fam, vocab, out);
  });
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

/** «Шторм»: быстрые вопросы на время — «верно или нет» и выбор перевода, без окна ответа. */
export function buildStorm(words: Word[], pool: Word[], seed = Date.now()): Exercise[] {
  const r = mulberry32(seed);
  const out: Exercise[] = [];
  for (let round = 0; round < 3; round++) shuffle(words, r).forEach((w, i) => {
    out.push((i + round) % 2 ? choice(w, sameLevel(w, pool), r, 'en-ru') : trueFalse(w, sameLevel(w, pool), r));
  });
  return out.slice(0, 40);
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
