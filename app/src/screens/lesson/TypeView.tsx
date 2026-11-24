import { useEffect, useRef, useState } from 'preact/hooks';
import { checkTyped, isTypo } from '../../engine/check';
import { loadState } from '../../game/local';
import { noteTyping, typoAllowed } from '../../game/typos';
import type { ViewProps } from './types';

export function TypeView({ ex, locked, onSubmit }: ViewProps<'type'>) {
  const [v, setV] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, [ex]);
  const submit = () => {
    if (!v.trim() || locked) return;
    const allow = typoAllowed(loadState(), ex.word.id);
    const r = checkTyped(v, ex.answers, allow);
    noteTyping(ex.word.id, r);
    onSubmit({ ok: r !== 'wrong', typo: r === 'typo', typoLimit: !allow && isTypo(v, ex.answers), correct: ex.word.en, input: v });
  };
  return (
    <div class="ex">
      <div class="ex-title">Напиши по-английски</div>
      <div class="prompt-row">
        <div class="bubble"><span class="ex-prompt">{ex.prompt}</span></div>
      </div>
      <input ref={ref} class="type-input" value={v} disabled={locked} autocomplete="off" autocapitalize="off"
        spellcheck={false} placeholder="Введите слово" onInput={(e) => setV(e.currentTarget.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()} />
      {!locked && <button class="btn check" disabled={!v.trim()} onClick={submit}>Проверить</button>}
    </div>
  );
}
