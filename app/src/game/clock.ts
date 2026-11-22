// Время игры, защищённое от подкрутки часов (без сервера).
// 1) Время никогда не идёт назад: запоминаем самое позднее виденное время.
// 2) В Telegram время не может убежать вперёд дальше подписанного времени запуска
//    (auth_date из initData) плюс время, прошедшее с запуска, и небольшой запас.
const KEY = 'os.clock';
const SLACK = 10 * 60000;

let maxSeen = 0;
try { maxSeen = Number(localStorage.getItem(KEY)) || 0; } catch { /* нет хранилища */ }
let tgStart: number | null = null;
let perfStart = 0;
let lastWrite = 0;

/** Время запуска от Telegram (секунды). Вызывается один раз при старте внутри Telegram. */
export function setTrustedStart(authDateSec: number) {
  if (!authDateSec) return;
  tgStart = authDateSec * 1000;
  perfStart = typeof performance !== 'undefined' ? performance.now() : 0;
}

export function nowMs(): number {
  let t = Date.now();
  if (tgStart !== null) {
    const elapsed = (typeof performance !== 'undefined' ? performance.now() : perfStart) - perfStart;
    const upper = tgStart + elapsed + SLACK;
    if (t > upper) t = upper;                 // часы убежали вперёд
    if (t < tgStart - SLACK) t = tgStart;     // часы отведены назад
    if (maxSeen > upper) maxSeen = upper;     // «будущее», сохранённое раньше, не принимаем
  }
  if (t < maxSeen) return maxSeen;
  maxSeen = t;
  if (t - lastWrite > 30000) {
    lastWrite = t;
    try { localStorage.setItem(KEY, String(t)); } catch { /* нет хранилища */ }
  }
  return t;
}

/** Для тестов и «Начать заново». */
export function resetClock() {
  maxSeen = 0; tgStart = null; lastWrite = 0;
  try { localStorage.removeItem(KEY); } catch { /* нет хранилища */ }
}
