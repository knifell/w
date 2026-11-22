#!/usr/bin/env node
// Проверка контента: дубли, пустые поля, неверный уровень, структура.
// Код выхода 1 при ошибках. Предупреждения не валят сборку.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CORE, NAMES, tokens, knownToken } from '../app/src/engine/vocab.ts';

const ROOT = process.env.CONTENT_DIR || join(dirname(fileURLToPath(import.meta.url)), '..', 'content', 'levels');
const LEVELS = ['A1', 'A2', 'B1', 'B2'];
const POS = ['noun', 'verb', 'adjective', 'adverb', 'phrase', 'preposition', 'pronoun', 'conjunction', 'other'];
const MIN_DAYS = 30, MIN_WORDS = 8, MAX_WORDS = 12;
const errors = [], warns = [];
const err = (f, m) => errors.push(`✖ ${f}: ${m}`);
const warn = (f, m) => warns.push(`⚠ ${f}: ${m}`);
const str = (v) => typeof v === 'string' && v.trim().length > 0;
const norm = (s) => s.toLowerCase().trim().replace(/\s+/g, ' ');

const read = (f) => {
  try { return JSON.parse(readFileSync(f, 'utf8')); }
  catch (e) { err(f, `не JSON: ${e.message}`); return null; }
};

const allIds = new Map();     // id -> file
const allExamples = new Map(); // норм. текст примера -> id

// Словарь «изучено к уроку»: служебные слова (CORE), которые курс нигде не проходит отдельным словом,
// имена, а также слова всех предыдущих уроков (этого уровня и ниже) и текущего урока, с формами.
const lessonFiles = (dir) => {
  const d = join(ROOT, dir, 'lessons');
  return existsSync(d) ? readdirSync(d).filter((f) => /^day-\d+\.json$/.test(f)).sort().map((f) => join(d, f)) : [];
};
const taughtSingles = new Set();
for (const dir of readdirSync(ROOT).sort()) for (const f of lessonFiles(dir)) {
  try {
    for (const w of JSON.parse(readFileSync(f, 'utf8')).words ?? []) {
      const t = tokens(w.en ?? '');
      if (t.length === 1) taughtSingles.add(t[0]);
    }
  } catch { /* ошибку JSON покажет основной проход */ }
}
const known = new Set([...[...CORE].filter((w) => !taughtSingles.has(w)), ...NAMES]);
const enByLevel = new Map();  // норм. en -> {level, file}

for (const dir of readdirSync(ROOT).sort()) {
  const L = dir.toUpperCase();
  const base = join(ROOT, dir);
  if (!LEVELS.includes(L)) { err(base, `неизвестная папка уровня "${dir}"`); continue; }

  const lvFile = join(base, 'level.json');
  const lv = existsSync(lvFile) ? read(lvFile) : (err(lvFile, 'нет файла'), null);
  if (lv) {
    if (lv.level !== L) err(lvFile, `level "${lv.level}" ≠ папке ${L}`);
    if (!str(lv.title)) err(lvFile, 'пустой title');
    if (!Array.isArray(lv.islands) || !lv.islands.length) err(lvFile, 'нет islands');
    else lv.islands.forEach((is, i) => {
      if (is.n !== i + 1) err(lvFile, `остров #${i + 1}: n=${is.n}`);
      if (!str(is.name) || !str(is.story)) err(lvFile, `остров ${i + 1}: пустое name/story`);
      if (!Array.isArray(is.days) || is.days.length !== 2) err(lvFile, `остров ${i + 1}: days должен быть [от, до]`);
      if (is.free && i > 0 && !lv.islands[i - 1].free) err(lvFile, `остров ${i + 1}: бесплатные острова должны идти подряд с первого`);
    });
  }

  const lessonDir = join(base, 'lessons');
  const files = existsSync(lessonDir) ? readdirSync(lessonDir).filter((f) => f.endsWith('.json')).sort() : [];
  if (files.length < MIN_DAYS) warn(base, `уроков ${files.length}, нужно ≥${MIN_DAYS} (контент растёт)`);

  const days = new Set();
  for (const fn of files) {
    const f = join(lessonDir, fn);
    const m = fn.match(/^day-(\d{2,3})\.json$/);
    if (!m) { err(f, 'имя файла должно быть day-NN.json'); continue; }
    const day = +m[1];
    const ls = read(f);
    if (!ls) continue;
    days.add(day);
    const pre = `${dir}-d${String(day).padStart(2, '0')}`;

    if (ls.level !== L) err(f, `level "${ls.level}" ≠ папке ${L}`);
    if (ls.day !== day) err(f, `day ${ls.day} ≠ имени файла (${day})`);
    if (ls.id !== pre) err(f, `id "${ls.id}", ожидается "${pre}"`);
    if (!str(ls.title)) err(f, 'пустой title');
    if (!str(ls.topic)) err(f, 'пустой topic');
    if (lv?.islands) {
      const isl = lv.islands.find((i) => day >= i.days[0] && day <= i.days[1]);
      if (!isl) err(f, `день ${day} не входит ни в один остров`);
      else if (ls.island !== isl.n) err(f, `island ${ls.island}, по level.json должен быть ${isl.n}`);
    }
    if (!Array.isArray(ls.words)) { err(f, 'нет words'); continue; }
    for (const w of ls.words) for (const t of [w?.en, ...(w?.forms ?? [])]) if (str(t)) tokens(t).forEach((x) => known.add(x));
    const ruInLesson = new Map(); // перевод -> слово
    if (ls.words.length < MIN_WORDS || ls.words.length > MAX_WORDS)
      err(f, `слов ${ls.words.length}, нужно ${MIN_WORDS}–${MAX_WORDS}`);

    ls.words.forEach((w, i) => {
      const at = `${f} [${i + 1}${w?.en ? ' ' + w.en : ''}]`;
      if (!w || typeof w !== 'object') return err(at, 'слово не объект');
      if (!str(w.id)) err(at, 'пустой id');
      else {
        if (!w.id.startsWith(pre + '-')) err(at, `id "${w.id}" не начинается с "${pre}-"`);
        if (allIds.has(w.id)) err(at, `дубль id, уже в ${allIds.get(w.id)}`);
        allIds.set(w.id, f);
      }
      if (!str(w.en)) err(at, 'пустой en');
      if (!Array.isArray(w.ru) || !w.ru.length || !w.ru.every(str)) err(at, 'ru должен быть непустым массивом строк');
      else if (new Set(w.ru.map(norm)).size !== w.ru.length) err(at, 'дубли в ru');
      else for (const r of w.ru) {
        const k = norm(r).replace(/ё/g, 'е');
        if (ruInLesson.has(k)) err(at, `перевод «${r}» совпадает со словом «${ruInLesson.get(k)}» в этом уроке`);
        else ruInLesson.set(k, w.en);
      }
      if (!POS.includes(w.pos)) err(at, `pos "${w.pos}" не из списка`);
      if (w.forms !== undefined && (!Array.isArray(w.forms) || !w.forms.every(str))) err(at, 'forms должен быть массивом строк');
      if (!Array.isArray(w.examples) || w.examples.length < 1 || w.examples.length > 2) err(at, 'нужно 1–2 примера');
      else w.examples.forEach((ex, j) => {
        if (!str(ex?.en) || !str(ex?.ru)) return err(at, `пример ${j + 1}: пустое en/ru`);
        const unknown = tokens(ex.en).filter((t) => !knownToken(t, known));
        if (unknown.length) err(at, `пример ${j + 1}: неизученные слова: ${[...new Set(unknown)].join(', ')}`);
        const key = norm(ex.en).replace(/[^a-z' ]/g, '');
        if (allExamples.has(key)) err(at, `пример ${j + 1} повторяет пример ${allExamples.get(key)}`);
        else allExamples.set(key, w.id);
        const variants = [w.en, ...(w.forms || [])].map(norm);
        if (str(w.en) && !variants.some((v) => norm(ex.en).includes(v)))
          warn(at, `пример ${j + 1} не содержит слово (добавь forms)`);
      });
      if (str(w.en)) {
        const k = norm(w.en);
        const prev = enByLevel.get(k);
        if (prev) err(at, prev.level === L
          ? `дубль слова в уровне, уже в ${prev.file}`
          : `слово уже есть в уровне ${prev.level} (${prev.file}) — неверный уровень`);
        else enByLevel.set(k, { level: L, file: f });
      }
    });
  }
  const max = Math.max(0, ...days);
  for (let d = 1; d <= max; d++) if (!days.has(d)) err(base, `пропущен день ${d}`);
}

// лавка и штампы
const CONTENT = join(ROOT, '..');
const shopF = join(CONTENT, 'shop.json'), stF = join(CONTENT, 'stickers.json');
const shop = existsSync(shopF) ? read(shopF) : null;
if (shop) {
  const ids = new Set();
  for (const it of shop.items ?? []) {
    if (!str(it.id) || ids.has(it.id)) err(shopF, `пустой или повторный id "${it.id}"`);
    ids.add(it.id);
    if (!str(it.name) || !str(it.desc) || !(it.price > 0)) err(shopF, `${it.id}: пустое name/desc или цена ≤ 0`);
    if (!['boost', 'shield', 'energy'].includes(it.effect?.type)) err(shopF, `${it.id}: неизвестный effect`);
  }
  // покупки за Telegram Stars: только подписка и ракушки, целые цены от 1 звезды
  const st = shop.stars;
  if (!st?.premium || !Array.isArray(st.packs)) err(shopF, 'нет раздела stars (premium, packs)');
  else {
    const sids = new Set();
    for (const x of [st.premium, ...st.packs]) {
      if (!str(x.id) || sids.has(x.id)) err(shopF, `stars: пустой или повторный id "${x.id}"`);
      sids.add(x.id);
      if (!str(x.title) || !str(x.desc)) err(shopF, `stars ${x.id}: пустое title/desc`);
      if (!Number.isInteger(x.stars) || x.stars < 1 || x.stars > 10000) err(shopF, `stars ${x.id}: цена должна быть целой, 1–10000`);
    }
    for (const x of st.packs) if (!Number.isInteger(x.coins) || x.coins < 1) err(shopF, `stars ${x.id}: coins должно быть > 0`);
    if (!(st.premium.periodDays > 0)) err(shopF, 'stars premium: periodDays > 0');
  }
}
const st = existsSync(stF) ? read(stF) : null;
if (st) {
  const albums = new Set((st.albums ?? []).map((a) => a.id));
  const ids = new Set();
  const COND = ['lessons', 'perfect', 'streak', 'mastered', 'reviews', 'islands', 'trials', 'night', 'early', 'premium'];
  for (const x of st.stickers ?? []) {
    if (!str(x.id) || ids.has(x.id)) err(stF, `пустой или повторный id "${x.id}"`);
    ids.add(x.id);
    if (!str(x.name) || !str(x.emoji)) err(stF, `${x.id}: пустое name/emoji`);
    if (!albums.has(x.album)) err(stF, `${x.id}: нет альбома "${x.album}"`);
    if (!['common', 'rare', 'epic', 'legendary'].includes(x.rarity)) err(stF, `${x.id}: rarity "${x.rarity}"`);
    if (!COND.includes(x.cond?.type) || !(x.cond?.n > 0)) err(stF, `${x.id}: неверное условие`);
    if ('price' in x) err(stF, `${x.id}: штампы нельзя продавать (уберите price)`);
  }
}

warns.forEach((m) => console.warn(m));
errors.forEach((m) => console.error(m));
console.log(`\nСлов: ${allIds.size}. Ошибок: ${errors.length}. Предупреждений: ${warns.length}.`);
process.exit(errors.length ? 1 : 0);
