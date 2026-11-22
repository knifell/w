// Состояние игрока. Хранится на телефоне (localStorage) и копируется в облако Telegram (api/cloud.ts).
import { nowMs } from './clock';
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
  typos: Record<string, number>;           // wordId -> сколько раз подряд прощена опечатка
  updatedAt: number;                       // когда состояние менялось (для синхронизации)
}

const KEY = 'os.v3';
export const emptyState = (): LocalState => ({
  level: null, onboarded: false, premium: false, xp: 0, coins: 0,
  energy: ENERGY.max, energyAt: nowMs(), inventory: {}, boosts: {}, done: {}, mem: {},
  streak: { cur: 0, best: 0, last: 0 }, rescue: null, emberWeek: 0, stickers: {}, counters: {},
  trialsToday: { day: 0, n: 0 }, unlocks: {}, storySeen: [], reports: [], typos: {}, updatedAt: 0,
});

export function loadState(): LocalState {
  try { return { ...emptyState(), ...JSON.parse(localStorage.getItem(KEY) || '{}') }; }
  catch { return emptyState(); }
}
let onSave: ((s: LocalState) => void) | null = null;
/** Подписка на сохранения (облачная копия). */
export const setSaveListener = (fn: typeof onSave) => { onSave = fn; };

/** Сохраняет изменения игрока. fromCloud — состояние пришло из облака, обратно его не отправляем. */
export function saveState(s: LocalState, fromCloud = false) {
  if (!fromCloud) s.updatedAt = nowMs();
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* приватный режим */ }
  if (!fromCloud) onSave?.(s);
}

/** Есть ли у игрока хоть какой-то прогресс. */
export const hasProgress = (s: LocalState) => !!s.level || s.xp > 0 || Object.keys(s.done).length > 0;
export function update<T = void>(fn: (s: LocalState) => T): [LocalState, T] {
  const s = loadState();
  const r = fn(s);
  saveState(s);
  return [s, r];
}
export const reportAnswer = (wordId: string, input: string) =>
  update((s) => { s.reports.push({ wordId, input, at: nowMs() }); });
