import { useState } from 'preact/hooks';
import type { Island, Word } from '../types';
import { speak } from '../lib/speech';
import { knownSentence } from '../engine/vocab';
import { Icon } from './Icon';

/** «Журнал капитана»: короткий текст из примеров выученных слов острова. Нажми строку — услышишь, ещё раз — перевод. */
export function LogSheet({ island, words, vocab, onClose }: { island: Island; words: Word[]; vocab: Set<string>; onClose: () => void }) {
  const lines = words.flatMap((w) => w.examples.slice(0, 1)).filter((e) => knownSentence(e.en, vocab))
    .filter((e, i, a) => a.findIndex((x) => x.en === e.en) === i).slice(0, 8);
  const [taps, setTaps] = useState<Record<number, number>>({}); // 1 нажатие — звук, 2-е — перевод
  return (
    <div class="overlay" onClick={onClose}>
      <div class="sheet story log" role="dialog" aria-label="Журнал капитана" onClick={(e) => e.stopPropagation()}>
        <div class="hint">Журнал капитана · остров {island.n}</div>
        <h2>{island.name}</h2>
        <p class="hint">Всё здесь — из слов, которые ты уже знаешь. Нажми на строку, чтобы услышать, ещё раз — перевод.</p>
        <ol class="log-lines">
          {lines.map((e, i) => (
            <li onClick={() => { speak(e.en); setTaps((t) => ({ ...t, [i]: (t[i] ?? 0) + 1 })); }}>
              <span class="log-en"><Icon name="speaker" size={16} />{e.en}</span>
              {(taps[i] ?? 0) >= 2 && <span class="hint">{e.ru}</span>}
            </li>
          ))}
        </ol>
        <button class="btn" onClick={onClose}>Закрыть журнал</button>
      </div>
    </div>
  );
}
