// Интервальные повторения. Стадия растёт только при повторении в день «срока» или позже.
import type { Island, Lesson } from '../types';

export interface WordMem { s: number; due: number; seen: number; wrong: number }

export const INTERVALS = { free: [1, 3, 7, 14, 30, 60], premium: [1, 2, 4, 8, 16, 32] } as const;
export const MASTER_STAGE = 3;      // «закреплено» для открытия острова
export const UNLOCK_SHARE = 0.8;    // доля закреплённых слов острова

const gap = (stage: number, premium: boolean) => {
  const a = INTERVALS[premium ? 'premium' : 'free'];
  return a[Math.min(stage, a.length - 1)];
};

/** Обновляет память слова после ответа. Возвращает true, если стадия выросла. */
export function applyAnswer(m: WordMem | undefined, ok: boolean, day: number, premium: boolean): [WordMem, boolean] {
  if (!m) return [{ s: 0, due: day + gap(0, premium), seen: 1, wrong: ok ? 0 : 1 }, false];
  const n = { ...m, seen: m.seen + 1 };
  if (!ok) {
    n.wrong++;
    n.s = Math.max(0, m.s - 1);
    n.due = day + 1;
    return [n, false];
  }
  if (day >= m.due) {
    n.s = m.s + 1;
    n.due = day + gap(n.s, premium);
    return [n, true];
  }
  return [n, false];
}

export const isDue = (m: WordMem, day: number) => m.due <= day;

export function islandMastery(island: Island, lessons: Lesson[], mem: Record<string, WordMem>) {
  const words = lessons.filter((l) => l.island === island.n).flatMap((l) => l.words);
  const mastered = words.filter((w) => (mem[w.id]?.s ?? -1) >= MASTER_STAGE).length;
  return { mastered, total: words.length, need: Math.ceil(words.length * UNLOCK_SHARE) };
}

/** Минимум дней до закрепления слова, если не ошибаться. */
export function daysToMaster(m: WordMem | undefined, day: number, premium: boolean): number {
  if (!m) return Infinity;
  if (m.s >= MASTER_STAGE) return 0;
  let d = Math.max(0, m.due - day);
  for (let s = m.s + 1; s < MASTER_STAGE; s++) d += gap(s, premium);
  return d;
}
