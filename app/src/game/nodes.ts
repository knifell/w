// Особые точки на тропе острова: уроки-«Маяки» (на слух) и сундук посередине острова.
import type { Lesson, LevelPack } from '../types';
import type { LocalState } from './local';
import { REWARDS } from './config';

/** Номер урока внутри острова (1…10). */
const placeOf = (pack: LevelPack, l: Lesson) => pack.lessons.filter((x) => x.island === l.island).indexOf(l) + 1;

export type LessonFormat = 'normal' | 'listen' | 'chat' | 'letter';
export type IntroStyle = 'cards' | 'glossary' | 'guess';
/** Чередование на острове (номер урока → формат и способ знакомства с новыми словами).
 *  Маяк (4, 8) — на слух; Переписка (3, 9) и Письмо (6) — выученные слова применяются в тексте. */
const PLAN: Record<number, [LessonFormat, IntroStyle]> = {
  1: ['normal', 'cards'], 2: ['normal', 'glossary'], 3: ['chat', 'glossary'], 4: ['listen', 'cards'], 5: ['normal', 'guess'],
  6: ['letter', 'glossary'], 7: ['normal', 'cards'], 8: ['listen', 'guess'], 9: ['chat', 'cards'], 10: ['normal', 'guess'],
};
export const lessonPlan = (pack: LevelPack, l: Lesson): [LessonFormat, IntroStyle] => PLAN[placeOf(pack, l)] ?? ['normal', 'cards'];
export const isBeacon = (pack: LevelPack, l: Lesson) => lessonPlan(pack, l)[0] === 'listen';

/** Сундук стоит после 5-го урока острова. */
export const CHEST_AFTER = 5;
export const chestKey = (pack: LevelPack, island: number) => `${pack.level}-${island}`;

/** Можно открыть сундук: первые 5 уроков острова пройдены, сундук ещё не открыт. */
export function chestReady(s: LocalState, pack: LevelPack, island: number): boolean {
  if (s.chests.includes(chestKey(pack, island))) return false;
  const ls = pack.lessons.filter((l) => l.island === island).slice(0, CHEST_AFTER);
  return ls.length === CHEST_AFTER && ls.every((l) => s.done[l.id]);
}

/** Открыть сундук: небольшая награда ракушками (Premium ×2), один раз на остров. Возвращает ракушки. */
export function openChest(s: LocalState, pack: LevelPack, island: number): number {
  if (!chestReady(s, pack, island)) return 0;
  const coins = REWARDS.chest.coins * (s.premium ? REWARDS.premiumCoinMult : 1);
  s.coins += coins;
  s.chests.push(chestKey(pack, island));
  return coins;
}
