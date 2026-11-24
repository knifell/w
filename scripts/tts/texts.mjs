// Собирает все английские тексты, которые игра озвучивает (слова и примеры), в JSON для generate.py.
// Запуск: node scripts/tts/texts.mjs > /tmp/texts.json   (после npm run content)
import { readFileSync } from 'node:fs';
const out = new Map();
for (const l of ['a1', 'a2', 'b1', 'b2']) {
  const d = JSON.parse(readFileSync(new URL(`../../app/public/content/${l}.json`, import.meta.url)));
  for (const ls of d.lessons) for (const w of ls.words) {
    out.set(w.en, 'word');
    for (const e of w.examples) if (!out.has(e.en)) out.set(e.en, 'sentence');
  }
}
process.stdout.write(JSON.stringify([...out].map(([text, kind]) => ({ text, kind }))));
