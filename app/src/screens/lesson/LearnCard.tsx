import { useEffect } from 'preact/hooks';
import { speak } from '../../lib/speech';
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

export function LearnCard({ ex, onSubmit }: ViewProps<'learn'>) {
  const w = ex.word;
  useEffect(() => { speak(w.en); }, [w]);
  return (
    <div class="ex learn">
      <div class="ex-title">Новое слово</div>
      <div class="learn-card">
        <button class="learn-word" onClick={() => speak(w.en)}>🔊 {w.en}</button>
        <div class="hint">{POS[w.pos] ?? w.pos}</div>
        <div class="learn-ru">{w.ru.join(', ')}</div>
        {w.examples.map((e) => (
          <div class="learn-ex" onClick={() => speak(e.en)}>
            <div>{highlight(e.en, [...(w.forms ?? []), w.en])}</div>
            <div class="hint">{e.ru}</div>
          </div>
        ))}
      </div>
      <button class="btn check" onClick={() => onSubmit({ ok: true, correct: '', learn: true })}>Запомнил, дальше</button>
    </div>
  );
}
