import { useState } from 'preact/hooks';
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
  return (
    <div class="ex">
      <div class="ex-title">Собери предложение</div>
      <div class="ex-prompt small">{ex.prompt}</div>
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
          onClick={() => onSubmit({ ok: sameSentence(text, ex.answer), correct: ex.answer, input: text })}>Проверить</button>
      )}
    </div>
  );
}
