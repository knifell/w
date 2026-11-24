import { useEffect, useState } from 'preact/hooks';
import { speak } from '../../lib/speech';
import { Icon } from '../../components/Icon';
import { haptic } from '../../tg/telegram';
import { sameSentence } from '../../engine/check';
import type { ViewProps } from './types';

export function BuildView({ ex, locked, onSubmit }: ViewProps<'build'>) {
  const [picked, setPicked] = useState<number[]>([]);
  const toggle = (i: number) => {
    if (locked) return;
    haptic.tap();
    setPicked((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));
  };
  const text = picked.map((i) => ex.tokens[i]).join(' ');
  const play = (slow = false) => ex.audio && speak(ex.audio, { slow, force: true });
  useEffect(() => { const t = setTimeout(() => play(), 250); return () => clearTimeout(t); }, [ex]);
  return (
    <div class="ex">
      <div class="ex-title">{ex.audio ? 'Собери, что услышал' : 'Собери предложение'}</div>
      {ex.audio ? (
        <div class="listen-play row-play">
          <button class="play-big" onClick={() => play()} aria-label="Послушать ещё раз"><Icon name="speaker" size={40} /></button>
          <button class="play-slow" onClick={() => play(true)} aria-label="Послушать медленнее">Медленнее</button>
        </div>
      ) : (
        <div class="prompt-row">
          <div class="bubble"><span class="ex-prompt small">{ex.prompt}</span></div>
        </div>
      )}
      <div class="build-line">
        {picked.map((i) => <button class="tok" onClick={() => toggle(i)}>{ex.tokens[i]}</button>)}
      </div>
      <div class="bank">
        {ex.tokens.map((t, i) => (
          <button class={'tok' + (picked.includes(i) ? ' used' : '')} disabled={picked.includes(i) || locked} onClick={() => toggle(i)}>{t}</button>
        ))}
      </div>
      {!locked && (
        <button class="btn check" disabled={!picked.length}
          onClick={() => onSubmit({ ok: sameSentence(text, ex.answer), correct: ex.answer, input: text, say: ex.audio })}>Проверить</button>
      )}
    </div>
  );
}
