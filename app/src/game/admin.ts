// Инструменты админа «для себя»: меняют только состояние на этом телефоне (и его облачную копию).
import type { Level, LevelPack } from '../types';
import type { LocalState } from './local';
import { ENERGY, STICKERS } from './config';
import { nowMs } from './clock';
import { today } from './time';

/** Перенос на уровень и остров: уроки предыдущих островов отмечаются пройденными, острова до нужного открываются. */
export function adminJump(s: LocalState, pack: LevelPack, island: number) {
  s.level = pack.level as Level; s.onboarded = true;
  const day = today(), at = nowMs();
  for (const l of pack.lessons) {
    if (l.island < island) { if (!s.done[l.id]) s.done[l.id] = { best: 100, at }; }
    else if (l.island >= island) delete s.done[l.id];
  }
  for (let n = 2; n <= pack.islands.length + 1; n++) {
    const k = `${pack.level}-${n}`;
    if (n <= island) s.unlocks[k] = s.unlocks[k] ?? day; else delete s.unlocks[k];
  }
}

/** Открыть все острова уровня (без отметки уроков). */
export function adminOpenAll(s: LocalState, pack: LevelPack) {
  const day = today();
  for (let n = 2; n <= pack.islands.length; n++) s.unlocks[`${pack.level}-${n}`] ??= day;
}

export function adminCoins(s: LocalState, delta: number) { s.coins = Math.max(0, s.coins + delta); }
export function adminEnergy(s: LocalState) { s.energy = ENERGY.max + ENERGY.bonusCap; s.energyAt = nowMs(); }
export function adminPremium(s: LocalState, on: boolean) {
  s.devPremiumUntil = on ? nowMs() + 365 * 86400000 : 0;
  s.premiumUntil = on ? Math.max(s.premiumUntil, s.devPremiumUntil) : Math.min(s.premiumUntil, nowMs());
  s.premium = on;
}
export function adminStreak(s: LocalState, days: number) {
  s.streak.cur = Math.max(0, days); s.streak.best = Math.max(s.streak.best, s.streak.cur);
  s.streak.last = s.streak.cur ? today() : 0;
}
export function adminAllStickers(s: LocalState) { const at = nowMs(); for (const st of STICKERS) s.stickers[st.id] ??= at; }
