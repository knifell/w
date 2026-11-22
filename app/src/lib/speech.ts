// Произношение через встроенный в телефон синтез речи ($0). Только английский.
// Выбираем самый естественный английский голос; если английского голоса нет — задания на слух не показываем.
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

export const soundOn = () => { try { return localStorage.getItem('sound') !== 'off'; } catch { return true; } };

/** Можно ли давать задания на слух: есть синтез речи, английский голос и звук не выключен. */
export const canListen = () => !!synth && !!voice && soundOn();

export function speak(text: string, opts: { slow?: boolean; force?: boolean } = {}) {
  if (!synth || (!soundOn() && !opts.force)) return;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = voice?.lang ?? 'en-US';
  u.rate = opts.slow ? 0.6 : 0.9;
  if (voice) u.voice = voice;
  synth.speak(u);
}
