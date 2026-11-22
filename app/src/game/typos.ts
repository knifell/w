// Опечатки в словах: одна неверная буква прощается, но не бесконечно.
// После TYPO_LIMIT прощённых опечаток в одном слове следующие уже не засчитываются,
// пока игрок не напишет это слово без ошибок.
import { update, type LocalState } from './local';
import type { Verdict } from '../engine/check';

export const TYPO_LIMIT = 2;

export const typoAllowed = (s: LocalState, wordId: string) => (s.typos[wordId] ?? 0) < TYPO_LIMIT;

/** Запоминает результат ввода слова: опечатка — +1, верно без ошибок — счётчик обнуляется. */
export const noteTyping = (wordId: string, v: Verdict) => update((s) => {
  if (v === 'typo') s.typos[wordId] = (s.typos[wordId] ?? 0) + 1;
  else if (v === 'exact') delete s.typos[wordId];
});
