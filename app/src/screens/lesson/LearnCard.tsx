import { useEffect, useState } from 'preact/hooks';
import { speak } from '../../lib/speech';
import { haptic } from '../../tg/telegram';
import type { ViewProps } from './types';

const POS: Record<string, string> = {
  noun: 'существительное', verb: 'глагол', adjective: 'прилагательное', adverb: 'наречие',
  phrase: 'выражение', preposition: 'предлог', pronoun: 'местоимение', conjunction: 'союз', other: 'слово',
};

/** Подсвечивает изучаемое слово (или его форму) в примере. */
function highlight(sentence: string, variants: string[]) {
  const low = sentence.toLowerCase();
  for (const v of variants) {
    const i = low.indexOf(v.toLowerCase());
    if (i >= 0) return <>{sentence.slice(0, i)}<mark>{sentence.slice(i, i + v.length)}</mark>{sentence.slice(i + v.length)}</>;
  }
  return sentence;
}

/**
 * Новое слово: видишь слово и пример, выбираешь перевод.
 * Не знаешь — нажми на слово (или «Показать перевод»), подсмотри и выбери.
 */
export function LearnCard({ ex, locked, onSubmit }: ViewProps<'learn'>) {
  const w = ex.word;
  const [shown, setShown] = useState(false);
  const [sel, setSel] = useState<string | null>(null);
  useEffect(() => { speak(w.en); }, [w]);

  const reveal = () => { setShown(true); speak(w.en); haptic.tap(); };
  const pick = (o: string) => {
    if (sel || locked) return;
    setSel(o);
    const ok = o === ex.answer;
    ok ? haptic.ok() : haptic.bad();
    setShown(true);
    setTimeout(() => onSubmit({ ok, correct: ex.answer, learn: true }), ok ? 650 : 250);
  };
  const cls = (o: string) =>
    'opt' + (sel && o === ex.answer ? ' right' : '') + (sel === o && o !== ex.answer ? ' wrong' : '');

  return (
    <div class="ex learn">
      <div class="ex-title">Новое слово</div>
      <div class="learn-card">
        <button class="learn-word" onClick={reveal} title="Нажми, чтобы увидеть перевод">🔊 {w.en}</button>
        <div class="hint">{POS[w.pos] ?? w.pos}</div>
        {shown
          ? <div class="learn-ru">{w.ru.join(', ')}</div>
          : <button class="peek" onClick={reveal}>👀 Показать перевод</button>}
        {w.examples.map((e) => (
          <div class="learn-ex" onClick={() => speak(e.en)}>
            <div>{highlight(e.en, [...(w.forms ?? []), w.en])}</div>
            {shown && <div class="hint">{e.ru}</div>}
          </div>
        ))}
      </div>
      <div class="hint">Выбери перевод. Не знаешь — нажми на слово.</div>
      <div class="opts">
        {ex.options.map((o) => <button class={cls(o)} disabled={!!sel || locked} onClick={() => pick(o)}>{o}</button>)}
      </div>
    </div>
  );
}
