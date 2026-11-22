// Локальное хранилище прогресса. На этапе 4 синхронизируется с Supabase.
import type { Level } from '../types';
import { COINS_LESSON, COINS_PERFECT, COINS_REVIEW, XP_LESSON, XP_PERFECT, XP_REVIEW } from './economy';
import { applyAnswer, type WordMem } from './srs';
import { today } from './time';

export interface LocalState {
  level: Level | null;
  onboarded: boolean;
  premium: boolean;
  xp: number;
  coins: number;
  done: Record<string, { best: number; at: number }>;
  mem: Record<string, WordMem>;
  streak: { cur: number; best: number; last: number };
  storySeen: string[];
  reports: { wordId: string; input: string; at: number }[];
}

const KEY = 'os.v2';
const empty = (): LocalState => ({
  level: null, onboarded: false, premium: false, xp: 0, coins: 0, done: {}, mem: {},
  streak: { cur: 0, best: 0, last: 0 }, storySeen: [], reports: [],
});

export function loadState(): LocalState {
  try { return { ...empty(), ...JSON.parse(localStorage.getItem(KEY) || '{}') }; }
  catch { return empty(); }
}
export function saveState(s: LocalState) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* приватный режим */ }
}
export function update(fn: (s: LocalState) => void): LocalState {
  const s = loadState();
  fn(s);
  saveState(s);
  return s;
}

export interface SessionResult {
  kind: 'lesson' | 'review';
  lessonId?: string;
  accuracy: number;
  seen: string[];
  wrong: string[];
}
export interface Reward {
  xp: number; coins: number; perfect: boolean; firstTime: boolean;
  grown: number;          // сколько слов поднялись на стадию
  streak: number; streakUp: boolean;
}

export function recordSession(res: SessionResult): Reward {
  let reward!: Reward;
  update((s) => {
    const day = today();
    const perfect = res.wrong.length === 0;
    const firstTime = res.kind === 'lesson' && !!res.lessonId && !s.done[res.lessonId];
    const wrong = new Set(res.wrong);
    let grown = 0;
    for (const id of res.seen) {
      const [m, up] = applyAnswer(s.mem[id], !wrong.has(id), day, s.premium);
      s.mem[id] = m;
      if (up) grown++;
    }
    const xp = res.kind === 'lesson' ? XP_LESSON + (perfect ? XP_PERFECT : 0) : XP_REVIEW;
    let coins = res.kind === 'lesson' ? COINS_LESSON + (perfect ? COINS_PERFECT : 0) : COINS_REVIEW;
    if (s.premium) coins *= 2;
    s.xp += xp;
    s.coins += coins;
    if (res.lessonId) s.done[res.lessonId] = { best: Math.max(res.accuracy, s.done[res.lessonId]?.best ?? 0), at: Date.now() };
    const st = s.streak;
    const streakUp = st.last !== day;
    if (streakUp) { st.cur = st.last === day - 1 ? st.cur + 1 : 1; st.last = day; st.best = Math.max(st.best, st.cur); }
    reward = { xp, coins, perfect, firstTime, grown, streak: st.cur, streakUp };
  });
  return reward;
}

/** Серия, которую видит игрок: если вчера не занимался — сгорела. */
export const liveStreak = (s: LocalState) => (s.streak.last >= today() - 1 ? s.streak.cur : 0);

export const reportAnswer = (wordId: string, input: string) =>
  update((s) => { s.reports.push({ wordId, input, at: Date.now() }); });
