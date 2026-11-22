// Что открыто на карте.
// Уроки — по порядку внутри острова. Остров N+1 — когда пройдены уроки острова N и закреплено 80% его слов.
// «Одна активная экспедиция»: новые острова (на любом уровне) открываются не чаще, чем раз в UNLOCK_GAP дней,
// поэтому параллельная игра на нескольких архипелагах не ускоряет прохождение.
import type { Island, Lesson, LevelPack } from '../types';
import type { LocalState } from './local';
import { INTERVALS, MASTER_STAGE, daysToMaster, islandMastery } from './srs';
import { today } from './time';

export const unlockGap = (premium: boolean) =>
  INTERVALS[premium ? 'premium' : 'free'].slice(0, MASTER_STAGE).reduce((a, b) => a + b, 0);

export type IslandState =
  | { kind: 'open' }
  | { kind: 'premium' }
  | { kind: 'locked'; mastered: number; need: number; total: number; minDays: number; reason: 'lessons' | 'memory' | 'expedition' }
  | { kind: 'fog' };

const key = (p: LevelPack, n: number) => `${p.level}-${n}`;

/** Пройдены уроки и закреплены слова острова n (готов к «покорению»). */
function conquered(pack: LevelPack, n: number, s: LocalState) {
  const isl = pack.islands[n - 1];
  const lessons = pack.lessons.filter((l) => l.island === n);
  const allDone = lessons.length > 0 && lessons.every((l) => s.done[l.id]);
  const m = islandMastery(isl, pack.lessons, s.mem);
  return { allDone, ...m, ok: allDone && m.mastered >= m.need, lessons };
}

const lastUnlock = (s: LocalState) => Math.max(-Infinity, ...Object.values(s.unlocks));

/** Фиксирует покорённые острова (с учётом паузы между открытиями). Вызывается после занятий и при запуске. */
export function commitUnlocks(s: LocalState, packs: LevelPack[]) {
  const day = today();
  for (const p of packs) {
    for (let n = 2; n <= p.islands.length + 1; n++) {   // n = len+1 — архипелаг пройден целиком
      if (s.unlocks[key(p, n)] !== undefined) continue;
      if (!conquered(p, n - 1, s).ok) break;
      if (day - lastUnlock(s) < unlockGap(s.premium)) return;
      s.unlocks[key(p, n)] = day;
    }
  }
}

export function islandState(pack: LevelPack, island: Island, s: LocalState): IslandState {
  const lessons = pack.lessons.filter((l) => l.island === island.n);
  if (!lessons.length) return { kind: 'fog' };
  if (!island.free && !s.premium) return { kind: 'premium' };
  if (island.n === 1 || s.unlocks[key(pack, island.n)] !== undefined) return { kind: 'open' };
  const day = today();
  const c = conquered(pack, island.n - 1, s);
  const base = { kind: 'locked' as const, mastered: c.mastered, need: c.need, total: c.total };
  if (!c.allDone) return { ...base, minDays: Infinity, reason: 'lessons' };
  if (c.ok) return { ...base, minDays: Math.max(1, unlockGap(s.premium) - (day - lastUnlock(s))), reason: 'expedition' };
  const left = c.lessons.flatMap((l) => l.words).map((w) => daysToMaster(s.mem[w.id], day, s.premium)).sort((a, b) => a - b);
  return { ...base, minDays: left[c.need - 1] ?? 0, reason: 'memory' };
}

/** Урок открыт, если открыт остров и пройден предыдущий урок острова. */
export function lessonOpen(pack: LevelPack, day: number, s: LocalState, isl: IslandState) {
  if (isl.kind !== 'open') return false;
  const prev = pack.lessons.find((l) => l.day === day - 1);
  const l = pack.lessons.find((x) => x.day === day)!;
  return !prev || prev.island !== l.island || !!s.done[prev.id];
}

export const conqueredCount = (s: LocalState) => Object.keys(s.unlocks).length;

export interface NextSteps {
  nextLesson: Lesson | undefined;      // ближайший открытый непройденный урок
  trialIsland: Island | undefined;     // последний открытый остров с пройденными уроками
  blocked: 'premium' | 'locked' | 'end' | null; // почему дальше уроков нет
}

/** Что игрок может сделать сейчас: урок, а если уроков нет — испытание, повторение или Premium. */
export function nextSteps(pack: LevelPack, s: LocalState): NextSteps {
  const states = pack.islands.map((isl) => islandState(pack, isl, s));
  const nextLesson = pack.lessons.find((l) => !s.done[l.id] && lessonOpen(pack, l.day, s, states[l.island - 1]));
  const trialIsland = [...pack.islands].reverse().find((isl) =>
    states[isl.n - 1].kind === 'open' && pack.lessons.some((l) => l.island === isl.n && s.done[l.id]));
  const closed = states.find((x) => x.kind !== 'open');
  const blocked = nextLesson ? null : !closed || closed.kind === 'fog' ? 'end' : closed.kind === 'premium' ? 'premium' : 'locked';
  return { nextLesson, trialIsland, blocked };
}
