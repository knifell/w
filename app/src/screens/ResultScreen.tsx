import type { Word } from '../types';
import type { Reward } from '../game/local';
import { speak } from '../lib/speech';

export type ResultData = Reward & { accuracy: number; wrongWords: Word[]; kind: 'lesson' | 'review' };

export function ResultScreen({ result: r, onNext }: { result: ResultData; onNext: () => void }) {
  return (
    <main class="result">
      <div class="mascot">{r.perfect ? '🦀✨' : '🦀'}</div>
      <h1>{r.perfect ? 'Без единой ошибки!' : r.kind === 'review' ? 'Повторение готово!' : 'Урок пройден!'}</h1>
      <div class="stats">
        <div class="card stat"><b>+{r.xp}</b><span>опыт</span></div>
        <div class="card stat"><b>+{r.coins} 🐚</b><span>ракушки</span></div>
        <div class="card stat"><b>{r.accuracy}%</b><span>точность</span></div>
      </div>
      {r.streakUp && <div class="card streak">🔥 Костёр горит: {r.streak} {r.streak === 1 ? 'день' : 'дн.'} подряд</div>}
      {r.grown > 0 && <div class="card">🧠 Закрепляются слова: {r.grown}</div>}
      {r.wrongWords.length > 0 && (
        <div class="card">
          <b>Повторим позже</b>
          {r.wrongWords.map((w) => (
            <div class="row" onClick={() => speak(w.en)}>🔊 {w.en} — <span class="hint">{w.ru[0]}</span></div>
          ))}
        </div>
      )}
      <button class="btn" onClick={onNext}>Дальше</button>
    </main>
  );
}
