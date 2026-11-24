// Особые точки на тропе острова: уроки-«Маяки» (на слух) и сундук посередине острова.
import type { Lesson, LevelPack } from '../types';
import type { LocalState } from './local';
import { REWARDS } from './config';

/** Номер урока внутри острова (1…10). */
const placeOf = (pack: LevelPack, l: Lesson) => pack.lessons.filter((x) => x.island === l.island).indexOf(l) + 1;

/** Уроки 4 и 8 каждого острова — «Маяк»: больше заданий на слух и диктант. */
export const isBeacon = (pack: LevelPack, l: Lesson) => [4, 8].includes(placeOf(pack, l));

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
