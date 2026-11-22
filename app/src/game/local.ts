// Локальное хранилище прогресса (этап 2). На этапе 4 синхронизируется с Supabase.
import { COINS_LESSON, COINS_PERFECT, XP_LESSON, XP_PERFECT } from './economy';

export interface LocalState {
  xp: number;
  coins: number;
  done: Record<string, { best: number; at: number }>;
  words: Record<string, { seen: number; wrong: number; at: number }>;
  reports: { wordId: string; input: string; at: number }[];
}

const KEY = 'os.v1';
const empty = (): LocalState => ({ xp: 0, coins: 0, done: {}, words: {}, reports: [] });

export function loadState(): LocalState {
  try { return { ...empty(), ...JSON.parse(localStorage.getItem(KEY) || '{}') }; }
  catch { return empty(); }
}
const save = (s: LocalState) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* приватный режим */ } };

export interface LessonResult { lessonId: string; accuracy: number; seen: string[]; wrong: string[] }
export interface Reward { xp: number; coins: number; perfect: boolean; firstTime: boolean }

export function recordLesson(res: LessonResult): Reward {
  const s = loadState();
  const now = Date.now();
  const perfect = res.wrong.length === 0;
  const firstTime = !s.done[res.lessonId];
  const reward: Reward = {
    xp: XP_LESSON + (perfect ? XP_PERFECT : 0),
    coins: COINS_LESSON + (perfect ? COINS_PERFECT : 0),
    perfect, firstTime,
  };
  s.xp += reward.xp;
  s.coins += reward.coins;
  const best = Math.max(res.accuracy, s.done[res.lessonId]?.best ?? 0);
  s.done[res.lessonId] = { best, at: now };
  for (const id of res.seen) {
    const w = (s.words[id] ??= { seen: 0, wrong: 0, at: 0 });
    w.seen++; w.at = now;
  }
  for (const id of res.wrong) s.words[id].wrong++;
  save(s);
  return reward;
}

export function reportAnswer(wordId: string, input: string) {
  const s = loadState();
  s.reports.push({ wordId, input, at: Date.now() });
  save(s);
}
