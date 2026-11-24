// «Бутылка с письмом»: раз в день приплывает фраза из уже выученных слов. Понял смысл — небольшая награда.
import type { Word } from '../types';
import type { LocalState } from './local';
import { REWARDS } from './config';
import { mulberry32, shuffle } from '../engine/rng';
import { knownSentence } from '../engine/vocab';

export interface Bottle { en: string; ru: string; options: string[] }
export const BOTTLE_MIN_WORDS = 10;

/** Фраза дня: детерминирована днём, только из знакомых слов. null — пока мало слов или уже открыта сегодня. */
export function bottleFor(s: LocalState, day: number, learned: Word[], vocab: Set<string>): Bottle | null {
  if (s.bottleDay === day || learned.length < BOTTLE_MIN_WORDS) return null;
  const r = mulberry32(day * 7919 + learned.length);
  const exs = shuffle(learned.flatMap((w) => w.examples), r).filter((e) => knownSentence(e.en, vocab));
  const ex = exs[0];
  if (!ex) return null;
  const others = exs.slice(1).map((e) => e.ru).filter((ru, i, a) => ru !== ex.ru && a.indexOf(ru) === i).slice(0, 2);
  if (others.length < 2) return null;
  return { en: ex.en, ru: ex.ru, options: shuffle([ex.ru, ...others], r) };
}

/** Открыть бутылку: верно — ракушки (Premium ×2), в любом случае до завтра. Возвращает ракушки. */
export function claimBottle(s: LocalState, day: number, ok: boolean): number {
  if (s.bottleDay === day) return 0;
  s.bottleDay = day;
  if (!ok) return 0;
  const coins = REWARDS.bottle.coins * (s.premium ? REWARDS.premiumCoinMult : 1);
  s.coins += coins;
  return coins;
}
