import { useEffect } from 'preact/hooks';
import { speak } from '../../lib/speech';
import { haptic } from '../../tg/telegram';
import type { ViewProps } from './types';
import { Icon } from '../../components/Icon';

/** Словарик: новые слова группы списком. Нажми слово — услышишь. Дальше — пары на эти слова. */
export function GlossaryView({ ex, locked, onSubmit }: ViewProps<'glossary'>) {
  useEffect(() => { speak(ex.words[0].en); }, [ex]);
  return (
    <div class="ex">
      <div class="ex-title">Новые слова</div>
      <p class="hint gl-tip">Послушай и запомни — сразу после этого проверим.</p>
      <div class="glossary">
        {ex.words.map((w) => (
          <button class="gl-row" onClick={() => { haptic.tap(); speak(w.en); }}>
            <span class="speak sm" aria-hidden="true"><Icon name="speaker" size={18} /></span>
            <span class="gl-txt">
              <b>{w.en}</b><span class="gl-ru">{w.ru.join('; ')}</span>
              {w.examples[0] && <span class="hint">{w.examples[0].en}</span>}
            </span>
          </button>
        ))}
      </div>
      {!locked && <button class="btn check" onClick={() => onSubmit({ ok: true, correct: '', learn: true })}>Запомнил</button>}
    </div>
  );
}
