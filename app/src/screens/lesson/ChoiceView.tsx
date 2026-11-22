import { useEffect, useState } from 'preact/hooks';
import { haptic } from '../../tg/telegram';
import { speak } from '../../lib/speech';
import type { ViewProps } from './types';

export function ChoiceView({ ex, locked, onSubmit }: ViewProps<'choice'>) {
  const [sel, setSel] = useState<string | null>(null);
  useEffect(() => { if (ex.dir === 'en-ru') speak(ex.word.en); }, [ex]);
  const cls = (o: string) =>
    'opt' + (sel === o ? ' sel' : '') + (locked && o === ex.answer ? ' right' : '') + (locked && sel === o && o !== ex.answer ? ' wrong' : '');
  return (
    <div class="ex">
      <div class="ex-title">{ex.dir === 'en-ru' ? 'Выбери перевод' : 'Как это по-английски?'}</div>
      <div class="ex-prompt" onClick={() => ex.dir === 'en-ru' && speak(ex.word.en)}>
        {ex.dir === 'en-ru' && <span class="speaker">🔊</span>}{ex.prompt}
      </div>
      <div class="opts">
        {ex.options.map((o) => (
          <button class={cls(o)} disabled={locked} onClick={() => { haptic.tap(); setSel(o); }}>{o}</button>
        ))}
      </div>
      {!locked && (
        <button class="btn check" disabled={!sel} onClick={() => onSubmit({ ok: sel === ex.answer, correct: ex.answer })}>
          Проверить
        </button>
      )}
    </div>
  );
}
