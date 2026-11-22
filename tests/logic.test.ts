// Быстрые проверки игровой логики без браузера: npm test
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { applyAnswer } from '../app/src/engine/../game/srs';
import { emptyState } from '../app/src/game/local';
import { settleStreak, bumpStreak, liveStreak } from '../app/src/game/streak';
import { commitUnlocks, islandState, unlockGap } from '../app/src/game/progress';
import { checkTyped } from '../app/src/engine/check';
import { buildLesson, buildReview } from '../app/src/engine/generators';
import type { LevelPack } from '../app/src/types';

let fakeDay = 20000;
const RealDate = Date;
// @ts-ignore подмена «сегодня»
globalThis.Date = class extends RealDate {
  constructor(...a: any[]) { super(...(a.length ? a : [fakeDay * 86400000 + 12 * 3600000])); }
  static now() { return fakeDay * 86400000 + 12 * 3600000; }
  getTimezoneOffset() { return 0; }
};

let n = 0;
const t = (name: string, fn: () => void) => { fn(); n++; console.log('✓', name); };

t('проверка ввода', () => {
  assert.equal(checkTyped('Boarding Pass', ['boarding pass']), 'exact');
  assert.equal(checkTyped('the umbrella', ['umbrella']), 'exact');
  assert.equal(checkTyped('umbrela', ['umbrella']), 'typo');
  assert.equal(checkTyped('snw', ['snow']), 'wrong');
  assert.equal(checkTyped('', ['snow']), 'wrong');
});

t('интервалы: бесплатно 11 дней до закрепления, Premium 7', () => {
  for (const [premium, want] of [[false, 11], [true, 7]] as const) {
    let [m] = applyAnswer(undefined, true, 0, premium);
    let d = 0;
    while (m.s < 3) { d = m.due; [m] = applyAnswer(m, true, d, premium); }
    assert.equal(d, want);
    assert.equal(unlockGap(premium), want);
  }
});

t('повтор в тот же день не ускоряет', () => {
  let [m] = applyAnswer(undefined, true, 0, false);
  for (let i = 0; i < 5; i++) [m] = applyAnswer(m, true, 0, false);
  assert.equal(m.s, 0);
});

t('костёр: уголь спасает, без угля — спасение за 2 занятия', () => {
  const s = emptyState();
  const noGift = (d: number) => { s.emberWeek = Math.floor((d + 3) / 7); }; // отключаем недельный подарок
  bumpStreak(s, 100); bumpStreak(s, 101);
  assert.equal(s.streak.cur, 2);
  s.inventory.ember = 1;
  noGift(103); settleStreak(s, 103); // пропущен 102
  assert.equal(s.inventory.ember, 0);
  assert.equal(liveStreak(s, 103), 2);
  bumpStreak(s, 103);
  assert.equal(s.streak.cur, 3);
  noGift(105); settleStreak(s, 105); // пропущен 104, угля нет
  assert.ok(s.rescue);
  assert.equal(bumpStreak(s, 105), false);
  assert.equal(bumpStreak(s, 105), true);
  assert.equal(s.streak.cur, 4);
  noGift(108); settleStreak(s, 108); // пропущено 2 дня
  assert.equal(s.streak.cur, 0);
  const g = emptyState();
  settleStreak(g, 200);
  assert.equal(g.inventory.ember, 1); // недельный подарок
});

const pack = JSON.parse(readFileSync('app/public/content/a2.json', 'utf8')) as LevelPack;
// виртуальный остров 1 с 3 уроками; делаем вид, что 2-й остров существует
const fake: LevelPack = { ...pack, lessons: [...pack.lessons, { ...pack.lessons[0], id: 'a2-d11', day: 11, island: 2, words: pack.lessons[0].words.map((w) => ({ ...w, id: w.id + 'x' })) }] };

t('остров открывается только после закрепления 80% слов и паузы экспедиции', () => {
  const s = emptyState();
  s.premium = true; // остров 2 платный
  const isl2 = fake.islands[1];
  assert.equal(islandState(fake, isl2, s).kind, 'locked');
  for (const l of fake.lessons.filter((l) => l.island === 1)) s.done[l.id] = { best: 100, at: 0 };
  const words = fake.lessons.filter((l) => l.island === 1).flatMap((l) => l.words);
  words.slice(0, 23).forEach((w) => (s.mem[w.id] = { s: 3, due: 0, seen: 4, wrong: 0 }));
  commitUnlocks(s, [fake]);
  assert.equal(islandState(fake, isl2, s).kind, 'locked'); // 23/30 < 24
  s.mem[words[23].id] = { s: 3, due: 0, seen: 4, wrong: 0 };
  commitUnlocks(s, [fake]);
  assert.equal(islandState(fake, isl2, s).kind, 'open');
  // второй архипелаг не открывается раньше паузы
  const other: LevelPack = { ...fake, level: 'B1' };
  commitUnlocks(s, [fake, other]);
  assert.equal(islandState(other, other.islands[1], s).kind, 'locked');
  fakeDay += unlockGap(true);
  commitUnlocks(s, [fake, other]);
  assert.equal(islandState(other, other.islands[1], s).kind, 'open');
});

t('генератор: каждое слово урока встречается, повторение строится', () => {
  const pool = pack.lessons.flatMap((l) => l.words);
  for (const l of pack.lessons) {
    const ex = buildLesson(l, pool, 1);
    const seen = new Set(ex.flatMap((e) => (e.kind === 'pairs' ? e.words : [e.word])).map((w) => w.id));
    l.words.forEach((w) => assert.ok(seen.has(w.id), w.en));
    ex.filter((e) => e.kind === 'choice').forEach((e) => e.kind === 'choice' && assert.equal(new Set(e.options).size, 4));
  }
  assert.ok(buildReview(pool.slice(0, 12), pool, 1).length >= 12);
});

console.log(`\n${n} проверок пройдено`);
