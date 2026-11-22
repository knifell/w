// Произношение через браузерный TTS ($0). Тихо ничего не делает, если не поддерживается.
let voice: SpeechSynthesisVoice | undefined;
const synth = typeof speechSynthesis !== 'undefined' ? speechSynthesis : undefined;
const pickVoice = () => { voice = synth?.getVoices().find((v) => v.lang.startsWith('en-')); };
synth?.addEventListener?.('voiceschanged', pickVoice);
pickVoice();

export function speak(text: string) {
  let off = false;
  try { off = localStorage.getItem('sound') === 'off'; } catch { /* нет доступа к хранилищу */ }
  if (!synth || off) return;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US'; u.rate = 0.9;
  if (voice) u.voice = voice;
  synth.speak(u);
}
