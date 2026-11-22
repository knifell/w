#!/usr/bin/env node
// Собирает каждый уровень в один файл app/public/content/<level>.json (+ index.json).
import { readFileSync, readdirSync, mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'content', 'levels');
const out = join(root, 'app', 'public', 'content');
const j = (f) => JSON.parse(readFileSync(f, 'utf8'));

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const index = [];
for (const dir of readdirSync(src).sort()) {
  const ld = join(src, dir, 'lessons');
  const lessons = existsSync(ld)
    ? readdirSync(ld).filter((f) => f.endsWith('.json')).sort().map((f) => j(join(ld, f)))
    : [];
  const level = { ...j(join(src, dir, 'level.json')), lessons };
  writeFileSync(join(out, `${dir}.json`), JSON.stringify(level));
  index.push({ level: level.level, title: level.title, lessons: lessons.length, words: lessons.reduce((n, l) => n + l.words.length, 0) });
}
writeFileSync(join(out, 'index.json'), JSON.stringify({ builtAt: new Date().toISOString(), levels: index }));
console.log('content:', index.map((l) => `${l.level} ${l.lessons} ур./${l.words} сл.`).join(', '));
