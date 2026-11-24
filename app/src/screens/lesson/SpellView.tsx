import { useState } from 'preact/hooks';
import { haptic } from '../../tg/telegram';
import type { ViewProps } from './types';

/** Собери слово из букв: нажимай буквы по порядку, нажатие на собранную букву возвращает её. */
export function SpellView({ ex, locked, onSubmit }: ViewProps<'spell'>) {
  const [picked, setPicked] = useState<number[]>([]);
  const toggle = (i: number) => {
    if (locked) return;
    haptic.tap();
    setPicked((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));
  };
  const text = picked.map((i) => ex.letters[i]).join('');
  return (
    <div class="ex">
      <div class="ex-title">Собери слово из букв</div>
      <div class="bubble"><span class="ex-prompt">{ex.prompt}</span></div>
      <div class="spell-line" aria-live="polite">
        {Array.from({ length: ex.answer.length }, (_, k) => (
          <button class={'slot' + (picked[k] !== undefined ? ' on' : '')} disabled={picked[k] === undefined || locked}
            onClick={() => picked[k] !== undefined && toggle(picked[k])}>{picked[k] !== undefined ? ex.letters[picked[k]] : ''}</button>
        ))}
      </div>
      <div class="bank letters">
        {ex.letters.map((c, i) => (
          <button class={'tok letter' + (picked.includes(i) ? ' used' : '')} disabled={picked.includes(i) || locked || picked.length >= ex.answer.length}
            onClick={() => toggle(i)}>{c}</button>
        ))}
      </div>
      {!locked && (
        <button class="btn check" disabled={picked.length !== ex.answer.length}
          onClick={() => onSubmit({ ok: text === ex.answer, correct: ex.word.en, input: text, say: ex.word.en })}>Проверить</button>
      )}
    </div>
  );
}
