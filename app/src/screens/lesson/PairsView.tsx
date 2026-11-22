import { useState } from 'preact/hooks';
import { haptic } from '../../tg/telegram';
import { speak } from '../../lib/speech';
import type { ViewProps } from './types';

export function PairsView({ ex, onSubmit }: ViewProps<'pairs'>) {
  const [left, setLeft] = useState<number | null>(null);
  const [right, setRight] = useState<number | null>(null);
  const [done, setDone] = useState<Set<number>>(new Set());
  const [bad, setBad] = useState<number[] | null>(null);
  const [wrong] = useState(() => new Set<string>());

  const tryMatch = (l: number | null, r: number | null) => {
    if (l === null || r === null) return;
    if (l === r) {
      haptic.ok();
      const d = new Set(done).add(l);
      setDone(d); setLeft(null); setRight(null);
      if (d.size === ex.words.length)
        setTimeout(() => onSubmit({ ok: true, correct: '', wrongIds: [...wrong] }), 250);
    } else {
      haptic.bad();
      wrong.add(ex.words[l].id);
      setBad([l, r]);
      setTimeout(() => { setBad(null); setLeft(null); setRight(null); }, 450);
    }
  };
  const cls = (i: number, side: 'l' | 'r') => {
    const s = side === 'l' ? left : right;
    return 'opt pair' + (done.has(i) ? ' gone' : '') + (s === i ? ' sel' : '') +
      (bad && bad[side === 'l' ? 0 : 1] === i ? ' wrong shake' : '');
  };
  return (
    <div class="ex">
      <div class="ex-title">Собери пары</div>
      <div class="pairs">
        <div>{ex.left.map((i) => (
          <button class={cls(i, 'l')} disabled={done.has(i) || !!bad}
            onClick={() => { haptic.tap(); speak(ex.words[i].en); setLeft(i); tryMatch(i, right); }}>{ex.words[i].en}</button>
        ))}</div>
        <div>{ex.right.map((i) => (
          <button class={cls(i, 'r')} disabled={done.has(i) || !!bad}
            onClick={() => { haptic.tap(); setRight(i); tryMatch(left, i); }}>{ex.words[i].ru[0]}</button>
        ))}</div>
      </div>
    </div>
  );
}
