#!/usr/bin/env node
// Проверка контента: дубли, пустые поля, неверный уровень, структура.
// Код выхода 1 при ошибках. Предупреждения не валят сборку.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

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
      if (is.free && i !== 0) err(lvFile, `остров ${i + 1}: free допустим только у первого`);
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
      if (!POS.includes(w.pos)) err(at, `pos "${w.pos}" не из списка`);
      if (w.forms !== undefined && (!Array.isArray(w.forms) || !w.forms.every(str))) err(at, 'forms должен быть массивом строк');
      if (!Array.isArray(w.examples) || w.examples.length < 1 || w.examples.length > 2) err(at, 'нужно 1–2 примера');
      else w.examples.forEach((ex, j) => {
        if (!str(ex?.en) || !str(ex?.ru)) return err(at, `пример ${j + 1}: пустое en/ru`);
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

warns.forEach((m) => console.warn(m));
errors.forEach((m) => console.error(m));
console.log(`\nСлов: ${allIds.size}. Ошибок: ${errors.length}. Предупреждений: ${warns.length}.`);
process.exit(errors.length ? 1 : 0);
