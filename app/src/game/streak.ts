// Костёр: серия дней подряд. Пропущенный день спасает только уголь (как заморозка серии в других играх).
import type { LocalState } from './local';

const week = (day: number) => Math.floor((day + 3) / 7);

/** Вызывать при запуске и перед записью занятия. */
export function settleStreak(s: LocalState, day: number) {
  // бесплатный уголь раз в неделю
  if (s.emberWeek !== week(day)) {
    s.emberWeek = week(day);
    if ((s.inventory.ember ?? 0) < 2) s.inventory.ember = (s.inventory.ember ?? 0) + 1;
  }
  const st = s.streak;
  if (st.cur === 0) return;
  const missed = day - st.last - 1;
  if (missed <= 0) return;
  const shields = s.inventory.ember ?? 0;
  if (missed <= shields) { s.inventory.ember = shields - missed; st.last = day - 1; return; }
  st.cur = 0;
}

/** Засчитывает занятие сегодня. Возвращает true, если костёр вырос. */
export function bumpStreak(s: LocalState, day: number): boolean {
  const st = s.streak;
  if (st.last === day) return false;
  st.cur = st.last === day - 1 && st.cur > 0 ? st.cur + 1 : 1;
  st.last = day;
  st.best = Math.max(st.best, st.cur);
  return true;
}

export const liveStreak = (s: LocalState, day: number) => (s.streak.last >= day - 1 ? s.streak.cur : 0);
