import { useState } from 'preact/hooks';
import { haptic } from '../../tg/telegram';
import { sfx } from '../../lib/sfx';
import { speak } from '../../lib/speech';
import type { ViewProps } from './types';

/** Письмо с пропусками: нажми слово в банке — оно встанет в первый пустой пропуск; нажми пропуск — вернёшь слово. */
const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
const same = (a?: string | null, b?: string) => !!a && !!b && a.toLowerCase() === b.toLowerCase();

export function LetterView({ ex, locked, onSubmit }: ViewProps<'letter'>) {
  const [fill, setFill] = useState<(number | null)[]>(ex.lines.map(() => null));
  const [checked, setChecked] = useState(false);
  const put = (bi: number) => {
    if (checked || locked) return;
    const i = fill.indexOf(null);
    if (i < 0) return;
    haptic.tap(); setFill(fill.map((x, k) => (k === i ? bi : x)));
  };
  const take = (i: number) => { if (!checked && !locked) setFill(fill.map((x, k) => (k === i ? null : x))); };
  const check = () => {
    setChecked(true);
    const wrongIds = ex.lines.filter((l, i) => !same(ex.bank[fill[i]!], l.answer)).map((l) => l.word.id);
    if (wrongIds.length) sfx.bad(); else { sfx.ok(); speak(ex.lines.map((l) => `${l.before} ${l.answer} ${l.after}`).join(' ')); }
    setTimeout(() => onSubmit({ ok: !wrongIds.length, correct: '', wrongIds }), wrongIds.length ? 2200 : 1400);
  };
  return (
    <div class="ex">
      <div class="ex-title">Письмо с острова</div>
      <div class="letter-card">
        <div class="letter-hi">Hi!</div>
        {ex.lines.map((l, i) => {
          const raw = fill[i] !== null ? ex.bank[fill[i]!] : null;
          const v = raw && !l.before ? cap(raw) : raw; // в начале предложения — с большой буквы
          const st = checked ? (same(raw, l.answer) ? ' ok' : ' bad') : '';
          const sep = /^[.?!,]/.test(l.after) ? '' : ' ';
          return (
            <p class="letter-line">
              {l.before}{l.before && ' '}<button class={'gap' + (v ? ' filled' : '') + st} onClick={() => take(i)}>{v ?? '\u00a0'}</button>{checked && !same(raw, l.answer) && <b class="fix"> {l.answer}</b>}{sep}{l.after}
              <span class="hint">{l.ru}</span>
            </p>
          );
        })}
        <div class="letter-sign">Skipper</div>
      </div>
      <div class="bank">
        {ex.bank.map((t, bi) => <button class={'tok' + (fill.includes(bi) ? ' used' : '')} disabled={fill.includes(bi) || checked || locked} onClick={() => put(bi)}>{t}</button>)}
      </div>
      {!locked && !checked && <button class="btn check" disabled={fill.includes(null)} onClick={check}>Проверить</button>}
    </div>
  );
}
