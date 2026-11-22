// Локальное состояние игрока. Позже синхронизируется с сервером (сервер — источник истины).
import type { Level } from '../types';
import type { WordMem } from './srs';
import { ENERGY } from './config';

export interface LocalState {
  level: Level | null;
  onboarded: boolean;
  premium: boolean;
  xp: number;
  coins: number;
  energy: number;
  energyAt: number;                       // мс, точка отсчёта восстановления
  inventory: Record<string, number>;
  boosts: Record<string, number>;          // itemId -> активен до (мс)
  done: Record<string, { best: number; at: number }>;
  mem: Record<string, WordMem>;
  streak: { cur: number; best: number; last: number };
  rescue: { day: number; count: number } | null; // спасение костра в течение дня
  emberWeek: number;
  stickers: Record<string, number>;
  counters: Record<string, number>;        // lessons, perfect, reviews, trials, night, early
  trialsToday: { day: number; n: number };
  unlocks: Record<string, number>;         // "A2-2" -> день открытия острова
  storySeen: string[];
  reports: { wordId: string; input: string; at: number }[];
}

const KEY = 'os.v3';
export const emptyState = (): LocalState => ({
  level: null, onboarded: false, premium: false, xp: 0, coins: 0,
  energy: ENERGY.max, energyAt: Date.now(), inventory: {}, boosts: {}, done: {}, mem: {},
  streak: { cur: 0, best: 0, last: 0 }, rescue: null, emberWeek: 0, stickers: {}, counters: {},
  trialsToday: { day: 0, n: 0 }, unlocks: {}, storySeen: [], reports: [],
});

export function loadState(): LocalState {
  try { return { ...emptyState(), ...JSON.parse(localStorage.getItem(KEY) || '{}') }; }
  catch { return emptyState(); }
}
export function saveState(s: LocalState) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* приватный режим */ }
}
export function update<T = void>(fn: (s: LocalState) => T): [LocalState, T] {
  const s = loadState();
  const r = fn(s);
  saveState(s);
  return [s, r];
}
export const reportAnswer = (wordId: string, input: string) =>
  update((s) => { s.reports.push({ wordId, input, at: Date.now() }); });
