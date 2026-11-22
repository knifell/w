import { useEffect, useRef, useState } from 'preact/hooks';
import { checkTyped } from '../../engine/check';
import type { ViewProps } from './types';
import { Skipper } from '../../components/Skipper';

export function TypeView({ ex, locked, onSubmit }: ViewProps<'type'>) {
  const [v, setV] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, [ex]);
  const submit = () => {
    if (!v.trim() || locked) return;
    const r = checkTyped(v, ex.answers);
    onSubmit({ ok: r !== 'wrong', typo: r === 'typo', correct: ex.word.en, input: v });
  };
  return (
    <div class="ex">
      <div class="ex-title">Напиши по-английски</div>
      <div class="prompt-row">
        <Skipper size={78} />
        <div class="bubble"><span class="ex-prompt">{ex.prompt}</span></div>
      </div>
      <input ref={ref} class="type-input" value={v} disabled={locked} autocomplete="off" autocapitalize="off"
        spellcheck={false} placeholder="Введите слово" onInput={(e) => setV(e.currentTarget.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()} />
      {!locked && <button class="btn check" disabled={!v.trim()} onClick={submit}>Проверить</button>}
    </div>
  );
}
