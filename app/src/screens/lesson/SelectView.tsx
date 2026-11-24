import { useEffect, useState } from 'preact/hooks';
import { haptic } from '../../tg/telegram';
import { speak } from '../../lib/speech';
import type { ViewProps } from './types';
import { Icon } from '../../components/Icon';

const TITLE = { cloze: 'Вставь пропущенное слово', sentence: 'Как сказать по-английски?', meaning: 'Что значит эта фраза?' };

/** Выбор варианта: пропуск в предложении, верный перевод фразы, смысл английской фразы. */
export function SelectView({ ex, locked, onSubmit }: ViewProps<'select'>) {
  const [sel, setSel] = useState<string | null>(null);
  useEffect(() => { if (ex.mode === 'meaning') speak(ex.say); }, [ex]);
  const cls = (o: string) =>
    'opt' + (ex.mode !== 'cloze' ? ' long' : '') + (sel === o ? ' sel' : '') + (locked && o === ex.answer ? ' right' : '') + (locked && sel === o && o !== ex.answer ? ' wrong' : '');
  const parts = ex.mode === 'cloze' ? ex.prompt.split('____') : null;
  return (
    <div class="ex">
      <div class="ex-title">{TITLE[ex.mode]}</div>
      {ex.mode === 'cloze' && parts && (
        <div class="cloze-card">
          <div class="cloze-text">{parts[0]}<span class={'gap' + (sel ? ' filled' : '')}>{sel ?? ' '}</span>{parts[1]}</div>
          {ex.hint && <div class="hint">{ex.hint}</div>}
        </div>
      )}
      {ex.mode === 'sentence' && <div class="bubble"><span class="ex-prompt small">{ex.prompt}</span></div>}
      {ex.mode === 'meaning' && (
        <div class="bubble tap" onClick={() => speak(ex.say)}>
          <span class="speak sm" aria-hidden="true"><Icon name="speaker" size={20} /></span>
          <span class="ex-prompt small">{ex.prompt}</span>
        </div>
      )}
      <div class="opts">
        {ex.options.map((o) => <button class={cls(o)} disabled={locked} onClick={() => { haptic.tap(); setSel(o); }}>{o}</button>)}
      </div>
      {!locked && (
        <button class="btn check" disabled={!sel} onClick={() => onSubmit({ ok: sel === ex.answer, correct: ex.answer, say: ex.say })}>Проверить</button>
      )}
    </div>
  );
}
