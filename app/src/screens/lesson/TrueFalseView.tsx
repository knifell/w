import { useEffect, useState } from 'preact/hooks';
import { haptic } from '../../tg/telegram';
import { speak } from '../../lib/speech';
import type { ViewProps } from './types';
import { Icon } from '../../components/Icon';

/** Верно или нет: слово и перевод — ответ одним нажатием. */
export function TrueFalseView({ ex, locked, onSubmit }: ViewProps<'tf'>) {
  const [pick, setPick] = useState<boolean | null>(null);
  useEffect(() => { speak(ex.word.en); }, [ex]);
  const answer = (v: boolean) => {
    if (locked) return;
    haptic.tap(); setPick(v);
    onSubmit({ ok: v === ex.truth, correct: `${ex.word.en} — ${ex.word.ru[0]}`, say: ex.word.en });
  };
  const cls = (v: boolean) => 'btn tf-btn ' + (v ? 'ok' : 'bad') + (locked && pick !== v ? ' dim' : '');
  return (
    <div class="ex">
      <div class="ex-title">Перевод верный?</div>
      <div class="tf-card" onClick={() => speak(ex.word.en)}>
        <span class="speak" aria-hidden="true"><Icon name="speaker" size={24} /></span>
        <div class="tf-en">{ex.word.en}</div>
        <div class="tf-eq">=</div>
        <div class="tf-ru">{ex.shown}</div>
      </div>
      <div class="tf-row">
        <button class={cls(false)} disabled={locked} onClick={() => answer(false)}><Icon name="close" size={22} stroke={3} />Неверно</button>
        <button class={cls(true)} disabled={locked} onClick={() => answer(true)}><Icon name="check" size={22} stroke={3} />Верно</button>
      </div>
    </div>
  );
}
