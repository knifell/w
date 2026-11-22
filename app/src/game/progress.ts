// Что открыто на карте: уроки по порядку внутри острова, острова — по закреплению слов.
import type { Island, LevelPack } from '../types';
import type { LocalState } from './local';
import { daysToMaster, islandMastery } from './srs';
import { today } from './time';

export type IslandState =
  | { kind: 'open' }
  | { kind: 'premium' }
  | { kind: 'locked'; mastered: number; need: number; total: number; minDays: number }
  | { kind: 'fog' };   // контента ещё нет

export function islandState(pack: LevelPack, island: Island, s: LocalState): IslandState {
  const lessons = pack.lessons.filter((l) => l.island === island.n);
  if (!lessons.length) return { kind: 'fog' };
  if (!island.free && !s.premium) return { kind: 'premium' };
  if (island.n === 1) return { kind: 'open' };
  const prev = pack.islands[island.n - 2];
  const prevLessons = pack.lessons.filter((l) => l.island === prev.n);
  const allDone = prevLessons.length > 0 && prevLessons.every((l) => s.done[l.id]);
  const m = islandMastery(prev, pack.lessons, s.mem);
  if (allDone && m.mastered >= m.need) return { kind: 'open' };
  const day = today();
  const left = prevLessons.flatMap((l) => l.words).map((w) => daysToMaster(s.mem[w.id], day, s.premium)).sort((a, b) => a - b);
  const minDays = allDone ? left[m.need - 1] ?? 0 : Infinity;
  return { kind: 'locked', ...m, minDays };
}

/** Урок открыт, если открыт остров и пройден предыдущий урок острова. */
export function lessonOpen(pack: LevelPack, day: number, s: LocalState, isl: IslandState) {
  if (isl.kind !== 'open') return false;
  const prev = pack.lessons.find((l) => l.day === day - 1);
  const l = pack.lessons.find((x) => x.day === day)!;
  return !prev || prev.island !== l.island || !!s.done[prev.id];
}
