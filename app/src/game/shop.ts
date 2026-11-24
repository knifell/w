import { nowMs } from './clock';
import type { LocalState } from './local';
import { ITEMS, type ShopItem } from './config';
import { addEnergy } from './energy';
import { ENERGY } from './config';

export const activeMult = (s: LocalState, now = nowMs()) =>
  ITEMS.reduce((m, it) => (it.effect.type === 'boost' && (s.boosts[it.id] ?? 0) > now ? m * it.effect.xpMult : m), 1);

export function canBuy(s: LocalState, it: ShopItem): string | null {
  if (it.freeOnly && s.premium) return 'С Premium энергия безлимитна';
  if (it.effect.type === 'energy' && s.energy >= ENERGY.bonusCap) return 'Фонарь и так полон';
  if (it.effect.type === 'cosmetic' && s.owned.includes(it.id)) return 'Уже есть';
  if (it.effect.type === 'tool' && (s.inventory[it.id] ?? 0) >= it.effect.max) return `Максимум ${it.effect.max}`;
  if (s.coins < it.price) return 'Не хватает ракушек';
  if (it.effect.type === 'shield' && (s.inventory[it.id] ?? 0) >= it.effect.max) return `Максимум ${it.effect.max}`;
  return null;
}

/** Покупка сразу применяет эффект (зелья и масло) или кладёт в инвентарь (уголь). */
export function buy(s: LocalState, id: string): string | null {
  const it = ITEMS.find((i) => i.id === id);
  if (!it) return 'Нет такого товара';
  const why = canBuy(s, it);
  if (why) return why;
  s.coins -= it.price;
  const e = it.effect;
  if (e.type === 'boost') s.boosts[id] = Math.max(nowMs(), s.boosts[id] ?? 0) + e.minutes * 60000;
  else if (e.type === 'energy') addEnergy(s, e.amount);
  else if (e.type === 'cosmetic') { s.owned.push(id); s.equip[e.slot] = id; }
  else s.inventory[id] = (s.inventory[id] ?? 0) + 1;
  return null;
}

/** Надеть украшение (или снять, если уже надето). */
export function equip(s: LocalState, id: string) {
  const it = ITEMS.find((i) => i.id === id);
  if (!it || it.effect.type !== 'cosmetic' || !s.owned.includes(id)) return;
  const slot = it.effect.slot;
  s.equip[slot] = s.equip[slot] === id ? undefined : id;
}

/** Потратить инструмент из запаса (труба, круг). true — был и потрачен. */
export function useTool(s: LocalState, id: string): boolean {
  if ((s.inventory[id] ?? 0) <= 0) return false;
  s.inventory[id] -= 1;
  return true;
}

/** Значение надетого украшения слота (например, 'sunset' для паруса). */
export const equipped = (s: LocalState, slot: 'flag' | 'frame') => {
  const it = ITEMS.find((i) => i.id === s.equip[slot]);
  return it && it.effect.type === 'cosmetic' ? it.effect.value : undefined;
};

/** Выдать товар бесплатно (подарок админа). n < 0 — забрать (только то, что лежит в запасах). */
export function giveItem(s: LocalState, id: string, n: number) {
  const it = ITEMS.find((i) => i.id === id);
  if (!it || !n) return;
  const e = it.effect;
  if (n < 0) { s.inventory[id] = Math.max(0, (s.inventory[id] ?? 0) + n); return; }
  if (e.type === 'cosmetic') { if (!s.owned.includes(id)) s.owned.push(id); return; }
  if (e.type === 'boost') s.boosts[id] = Math.max(nowMs(), s.boosts[id] ?? 0) + e.minutes * 60000 * n;
  else if (e.type === 'energy') addEnergy(s, e.amount * n);
  else s.inventory[id] = (s.inventory[id] ?? 0) + n;
}
