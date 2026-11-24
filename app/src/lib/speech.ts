// Произношение ($0). Основной голос — заранее озвученные нейросетью Kokoro файлы app/public/audio/<key>.mp3
// (scripts/tts/generate.py). Если файла нет (например, свой ввод игрока) — встроенный синтез речи телефона.
// Только английский.

// ---------- ключ файла: та же функция, что в scripts/tts/generate.py ----------
export const normText = (t: string) => t.toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9'é]+/g, ' ').trim();

function cyrb53(str: string, seed = 0): number {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}
export const audioKey = (text: string) => cyrb53(normText(text)).toString(36);
const audioUrl = (text: string) => `${import.meta.env.BASE_URL}audio/${audioKey(text)}.mp3`;

// ---------- запасной голос: синтез речи телефона ----------
let voice: SpeechSynthesisVoice | undefined;
const synth = typeof speechSynthesis !== 'undefined' ? speechSynthesis : undefined;

/** Чем выше, тем лучше: «натуральные» и известные качественные голоса, затем en-US/en-GB. */
function score(v: SpeechSynthesisVoice): number {
  if (!/^en[-_]/i.test(v.lang)) return -1;
  let s = 0;
  if (/natural|neural|enhanced|premium|online/i.test(v.name)) s += 50;
  if (/google|samantha|daniel|karen|moira|serena|aria|jenny|guy|libby|sonia/i.test(v.name)) s += 30;
  if (/en[-_](us|gb)/i.test(v.lang)) s += 10;
  if (/compact|espeak|robot/i.test(v.name)) s -= 40;
  if (v.localService) s += 2;
  return s;
}
const pickVoice = () => {
  const vs = (synth?.getVoices() ?? []).filter((v) => score(v) >= 0).sort((a, b) => score(b) - score(a));
  voice = vs[0];
};
synth?.addEventListener?.('voiceschanged', pickVoice);
pickVoice();

function synthSpeak(text: string, slow?: boolean) {
  if (!synth) return;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = voice?.lang ?? 'en-US';
  u.rate = slow ? 0.6 : 0.9;
  if (voice) u.voice = voice;
  synth.speak(u);
}

// ---------- основной голос: готовые файлы ----------
// Один <audio> на всё приложение: iOS/Telegram разрешают звук только после касания,
// поэтому «разблокируем» его при первом касании, дальше он играет и из useEffect.
const el: HTMLAudioElement | undefined = typeof Audio !== 'undefined' ? new Audio() : undefined;
if (el) { el.preload = 'auto'; (el as any).preservesPitch = true; (el as any).webkitPreservesPitch = true; }
let unlocked = false;
const SILENT = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=';
function unlock() {
  if (unlocked || !el || !el.paused) return; // не мешаем звучащему слову
  unlocked = true;
  if (!el.getAttribute('src')) el.src = SILENT;
  el.muted = true;                            // беззвучный «пинок» внутри касания
  el.play()
    .then(() => { if (el.muted) { el.pause(); el.currentTime = 0; } })
    .catch((e: DOMException) => { if (e?.name === 'NotAllowedError') unlocked = false; })
    .finally(() => { el.muted = false; });
}
if (typeof window !== 'undefined') {
  window.addEventListener('pointerdown', unlock, { capture: true, passive: true });
  window.addEventListener('touchend', unlock, { capture: true, passive: true });
}

export const soundOn = () => { try { return localStorage.getItem('sound') !== 'off'; } catch { return true; } };

/** Можно ли давать задания на слух: звук включён (озвучка есть всегда — файлы или голос телефона). */
export const canListen = () => soundOn() && (!!el || (!!synth && !!voice));

let token = 0;
export function speak(text: string, opts: { slow?: boolean; force?: boolean } = {}) {
  if (!soundOn() && !opts.force) return;
  synth?.cancel();
  if (!el) return synthSpeak(text, opts.slow);
  const my = ++token;
  const fallback = () => { if (my === token) { token++; synthSpeak(text, opts.slow); } };
  el.pause();
  el.muted = false;
  el.onerror = fallback;
  el.src = audioUrl(text);
  el.playbackRate = opts.slow ? 0.72 : 1;
  el.play().catch((e: DOMException) => { if (e?.name !== 'AbortError') fallback(); });
}

/** Тихо подгружает звук заранее (начало урока), чтобы слово звучало без задержки. */
const warmed = new Set<string>();
export function prefetchAudio(texts: string[]) {
  if (typeof fetch === 'undefined') return;
  for (const t of texts.slice(0, 60)) {
    const u = audioUrl(t);
    if (warmed.has(u)) continue;
    warmed.add(u);
    fetch(u, { priority: 'low' } as RequestInit).catch(() => warmed.delete(u));
  }
}
