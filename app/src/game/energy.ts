import type { LocalState } from './local';
import { ENERGY } from './config';

const R = ENERGY.regenMinutes * 60000;

/** Пересчитывает восстановленную энергию. */
export function settleEnergy(s: LocalState, now = Date.now()) {
  if (s.energy >= ENERGY.max) { s.energyAt = now; return; }
  const g = Math.floor((now - s.energyAt) / R);
  if (g <= 0) return;
  s.energy = Math.min(ENERGY.max, s.energy + g);
  s.energyAt = s.energy >= ENERGY.max ? now : s.energyAt + g * R;
}

export const energyOf = (s: LocalState) => (s.premium ? Infinity : s.energy);
export const nextEnergyIn = (s: LocalState, now = Date.now()) =>
  s.premium || s.energy >= ENERGY.max ? 0 : Math.max(0, R - (now - s.energyAt));

export function spendEnergy(s: LocalState): boolean {
  if (s.premium) return true;
  settleEnergy(s);
  if (s.energy < ENERGY.lessonCost) return false;
  if (s.energy >= ENERGY.max) s.energyAt = Date.now();
  s.energy -= ENERGY.lessonCost;
  return true;
}

export const addEnergy = (s: LocalState, n: number) => { settleEnergy(s); s.energy = Math.min(ENERGY.bonusCap, s.energy + n); };

/** Возвращает заряд за незавершённый урок. */
export function refundEnergy(s: LocalState) {
  if (s.premium) return;
  settleEnergy(s);
  s.energy = Math.min(ENERGY.bonusCap, s.energy + ENERGY.lessonCost);
}
