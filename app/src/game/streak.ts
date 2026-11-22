// Костёр: серия дней. Уголь спасает пропущенный день, без угля — можно спасти за 2 занятия в течение дня.
import type { LocalState } from './local';

export const RESCUE_SESSIONS = 2;
const week = (day: number) => Math.floor((day + 3) / 7);

/** Вызывать при запуске и перед записью занятия. */
export function settleStreak(s: LocalState, day: number) {
  // бесплатный уголь раз в неделю
  if (s.emberWeek !== week(day)) {
    s.emberWeek = week(day);
    if ((s.inventory.ember ?? 0) < 2) s.inventory.ember = (s.inventory.ember ?? 0) + 1;
  }
  const st = s.streak;
  if (s.rescue && s.rescue.day < day) { s.rescue = null; st.cur = 0; }
  if (st.cur === 0 || s.rescue) return;
  const missed = day - st.last - 1;
  if (missed <= 0) return;
  const shields = s.inventory.ember ?? 0;
  if (missed <= shields) { s.inventory.ember = shields - missed; st.last = day - 1; return; }
  if (missed === 1) { s.rescue = { day, count: 0 }; return; }
  st.cur = 0;
}

/** Засчитывает занятие сегодня. Возвращает true, если костёр вырос. */
export function bumpStreak(s: LocalState, day: number): boolean {
  const st = s.streak;
  if (s.rescue?.day === day) {
    if (++s.rescue.count < RESCUE_SESSIONS) return false;
    s.rescue = null;
  } else if (st.last === day) return false;
  st.cur = st.last >= day - 2 && st.cur > 0 ? st.cur + 1 : 1;
  st.last = day;
  st.best = Math.max(st.best, st.cur);
  return true;
}

export const liveStreak = (s: LocalState, day: number) =>
  s.streak.last >= day - 1 || s.rescue?.day === day ? s.streak.cur : 0;
