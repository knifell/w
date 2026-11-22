// Штампы выдаются только за достижения — купить нельзя.
import { nowMs } from './clock';
import type { LocalState } from './local';
import { STICKERS, type Sticker } from './config';
import { MASTER_STAGE } from './srs';

function metric(s: LocalState, type: string): number {
  switch (type) {
    case 'streak': return s.streak.best;
    case 'mastered': return Object.values(s.mem).filter((m) => m.s >= MASTER_STAGE).length;
    case 'islands': return Object.keys(s.unlocks).length;
    case 'premium': return s.premium ? 1 : 0;
    default: return s.counters[type] ?? 0;
  }
}

export const stickerProgress = (s: LocalState, st: Sticker) => Math.min(1, metric(s, st.cond.type) / st.cond.n);

/** Выдаёт новые штампы, возвращает их список. */
export function awardStickers(s: LocalState): Sticker[] {
  const got: Sticker[] = [];
  for (const st of STICKERS) {
    if (s.stickers[st.id] || (st.premium && !s.premium)) continue;
    if (metric(s, st.cond.type) >= st.cond.n) { s.stickers[st.id] = nowMs(); got.push(st); }
  }
  return got;
}

const LABEL: Record<string, string> = {
  lessons: 'Пройди уроков', perfect: 'Уроков без ошибок', streak: 'Костёр, дней подряд', mastered: 'Закрепи слов',
  reviews: 'Повторений', islands: 'Покори островов', trials: 'Пройди испытаний', night: 'Занятий с 0 до 5 утра',
  early: 'Занятий с 5 до 8 утра', premium: 'Вступи в клуб капитанов',
};
export const condText = (st: Sticker) => `${LABEL[st.cond.type] ?? st.cond.type}: ${st.cond.n}`;
