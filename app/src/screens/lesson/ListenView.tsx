import { useEffect, useRef, useState } from 'preact/hooks';
import { haptic } from '../../tg/telegram';
import { speak } from '../../lib/speech';
import { checkTyped, isTypo } from '../../engine/check';
import { loadState } from '../../game/local';
import { noteTyping, typoAllowed } from '../../game/typos';
import type { ViewProps } from './types';
import { Icon } from '../../components/Icon';

/** Задание на слух: слово звучит по-английски; выбрать перевод или написать услышанное. */
export function ListenView({ ex, locked, onSubmit, hide }: ViewProps<'listen'>) {
  const [sel, setSel] = useState<string | null>(null);
  const [v, setV] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  const play = (slow = false) => { haptic.tap(); speak(ex.word.en, { slow, force: true }); };
  useEffect(() => { const t = setTimeout(() => speak(ex.word.en, { force: true }), 250); if (ex.mode === 'write') ref.current?.focus(); return () => clearTimeout(t); }, [ex]);

  const submitWrite = () => {
    if (!v.trim() || locked) return;
    const allow = typoAllowed(loadState(), ex.word.id);
    const r = checkTyped(v, ex.answers, allow);
    noteTyping(ex.word.id, r);
    onSubmit({ ok: r !== 'wrong', typo: r === 'typo', typoLimit: !allow && isTypo(v, ex.answers), correct: ex.word.en, input: v });
  };
  const cls = (o: string) =>
    'opt' + (sel === o ? ' sel' : '') + (locked && o === ex.answer ? ' right' : '') + (locked && sel === o && o !== ex.answer ? ' wrong' : '');

  return (
    <div class="ex listen">
      <div class="ex-title">{ex.mode === 'choose' ? 'Что ты услышал?' : 'Напиши, что услышал'}</div>
      <div class="listen-play">
        <button class="play-big" onClick={() => play()} aria-label="Послушать ещё раз"><Icon name="speaker" size={44} /></button>
        <button class="play-slow" onClick={() => play(true)} aria-label="Послушать медленнее">Медленнее</button>
      </div>
      {ex.mode === 'choose' ? (
        <>
          <div class="opts">
            {ex.options.map((o) => <button class={cls(o) + (hide?.includes(o) ? ' gone' : '')} disabled={locked || hide?.includes(o)} onClick={() => { haptic.tap(); setSel(o); }}>{o}</button>)}
          </div>
          {!locked && <button class="btn check" disabled={!sel} onClick={() => onSubmit({ ok: sel === ex.answer, correct: ex.answer })}>Проверить</button>}
        </>
      ) : (
        <>
          <input ref={ref} class="type-input" value={v} disabled={locked} autocomplete="off" autocapitalize="off" spellcheck={false}
            placeholder="Слово по-английски" onInput={(e) => setV(e.currentTarget.value)} onKeyDown={(e) => e.key === 'Enter' && submitWrite()} />
          {!locked && <button class="btn check" disabled={!v.trim()} onClick={submitWrite}>Проверить</button>}
        </>
      )}
    </div>
  );
}
