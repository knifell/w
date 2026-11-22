// Короткие звуки игры, синтезируются Web Audio прямо в телефоне (без файлов, $0).
// Выключаются в профиле («Звуки игры»), отдельно от произношения слов.
let ctx: AudioContext | null = null;

export const sfxOn = () => { try { return localStorage.getItem('sfx') !== 'off'; } catch { return true; } };
export const setSfx = (on: boolean) => { try { localStorage.setItem('sfx', on ? 'on' : 'off'); } catch { /* нет хранилища */ } };

function audio(): AudioContext | null {
  if (!sfxOn()) return null;
  try {
    ctx ??= new (window.AudioContext || (window as any).webkitAudioContext)();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch { return null; }
}

/** Одна нота: частота, начало (с), длительность (с), громкость, форма волны. */
function note(a: AudioContext, freq: number, at: number, dur: number, vol = 0.18, type: OscillatorType = 'sine') {
  const o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.value = freq;
  const t = a.currentTime + at;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t); o.stop(t + dur + 0.02);
}

export const sfx = {
  /** верный ответ: два светлых тона вверх */
  ok() { const a = audio(); if (!a) return; note(a, 784, 0, 0.12); note(a, 1175, 0.09, 0.22); },
  /** ошибка: мягкий низкий звук, не наказывающий */
  bad() { const a = audio(); if (!a) return; note(a, 220, 0, 0.22, 0.12, 'triangle'); note(a, 175, 0.12, 0.26, 0.1, 'triangle'); },
  /** пара найдена: короткий щелчок */
  tick() { const a = audio(); if (!a) return; note(a, 1046, 0, 0.08, 0.1); },
  /** итог урока: маленькие фанфары */
  win() { const a = audio(); if (!a) return; [523, 659, 784, 1046].forEach((f, i) => note(a, f, i * 0.1, 0.28, 0.16)); },
  /** награда (штамп, покупка): звон ракушек */
  coin() { const a = audio(); if (!a) return; note(a, 1319, 0, 0.1, 0.14); note(a, 1760, 0.07, 0.24, 0.14); },
};
