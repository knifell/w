// Время игры, защищённое от подкрутки часов (без сервера).
// 1) Время никогда не идёт назад: запоминаем самое позднее виденное время.
// 2) В Telegram при запуске сверяемся с подписанным временем запуска (auth_date из initData):
//    если часы телефона убежали вперёд или отстали — поправка держится до конца сессии.
// Внутри сессии время идёт по часам телефона: performance.now() на телефонах стоит на паузе,
// пока экран заблокирован, и по нему свёрнутое на ночь приложение застряло бы во вчерашнем дне.
const KEY = 'os.clock';
const SLACK = 10 * 60000;

let maxSeen = 0;
try { maxSeen = Number(localStorage.getItem(KEY)) || 0; } catch { /* нет хранилища */ }
let offset = 0;
let lastWrite = 0;

/** Время запуска от Telegram (секунды). Вызывается один раз при старте внутри Telegram. */
export function setTrustedStart(authDateSec: number) {
  if (!authDateSec) return;
  const start = authDateSec * 1000;
  const now = Date.now();
  if (now > start + SLACK) offset = start - now;        // часы убежали вперёд
  else if (now < start - SLACK) offset = start - now;   // часы отведены назад
  else offset = 0;
  if (maxSeen > start + SLACK) maxSeen = start;         // «будущее», сохранённое раньше, не принимаем
}

export function nowMs(): number {
  const t = Date.now() + offset;
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
  maxSeen = 0; offset = 0; lastWrite = 0;
  try { localStorage.removeItem(KEY); } catch { /* нет хранилища */ }
}
