import { useEffect, useState } from 'preact/hooks';
import { haptic } from '../../tg/telegram';
import { speak } from '../../lib/speech';
import type { ViewProps } from './types';
import { Icon } from '../../components/Icon';

export function ChoiceView({ ex, locked, onSubmit }: ViewProps<'choice'>) {
  const [sel, setSel] = useState<string | null>(null);
  useEffect(() => { if (ex.dir === 'en-ru') speak(ex.word.en); }, [ex]);
  const cls = (o: string) =>
    'opt' + (sel === o ? ' sel' : '') + (locked && o === ex.answer ? ' right' : '') + (locked && sel === o && o !== ex.answer ? ' wrong' : '');
  return (
    <div class="ex">
      <div class="ex-title">{ex.dir === 'en-ru' ? 'Выбери перевод' : 'Как это по-английски?'}</div>
      <div class="prompt-row">
        <div class={'bubble' + (ex.dir === 'en-ru' ? ' tap' : '')} onClick={() => ex.dir === 'en-ru' && speak(ex.word.en)}>
          {ex.dir === 'en-ru' && <span class="speak sm" aria-hidden="true"><Icon name="speaker" size={20} /></span>}
          <span class="ex-prompt">{ex.prompt}</span>
        </div>
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
