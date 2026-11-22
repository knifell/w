import type { Word } from '../types';
import type { Reward, SessionKind } from '../game/session';
import { speak } from '../lib/speech';
import { days, words } from '../lib/format';

export type ResultData = Reward & { accuracy: number; wrongWords: Word[]; kind: SessionKind };
const TITLE: Record<SessionKind, string> = { lesson: 'Урок пройден!', review: 'Повторение готово!', trial: 'Испытание пройдено!' };

export function ResultScreen({ result: r, onNext }: { result: ResultData; onNext: () => void }) {
  return (
    <main class="result">
      <div class="mascot">{r.perfect ? '🦀✨' : '🦀'}</div>
      <h1>{r.perfect && r.kind === 'lesson' ? 'Без единой ошибки!' : TITLE[r.kind]}</h1>
      <div class="stats">
        <div class="card stat"><b>+{r.xp}{r.mult > 1 && <small> ×{r.mult}</small>}</b><span>опыт</span></div>
        <div class="card stat"><b>+{r.coins} 🐚</b><span>ракушки</span></div>
        <div class="card stat"><b>{r.accuracy}%</b><span>точность</span></div>
      </div>
      {r.capped && <div class="card hint">Награды за испытания на сегодня закончились — но тренировка всё равно идёт в зачёт штампов.</div>}
      {r.stickers.map((s) => <div class="card new-stamp">🎉 Новый штамп: <b>{s.emoji} {s.name}</b></div>)}
      {r.streakUp && <div class="card streak">🔥 Костёр горит: {days(r.streak)} подряд</div>}
      {r.rescueLeft > 0 && <div class="card streak">🔥 Ещё {r.rescueLeft} занятие — и костёр спасён!</div>}
      {r.grown > 0 && <div class="card">🧠 Закрепляются: {words(r.grown)}</div>}
      {r.wrongWords.length > 0 && (
        <div class="card">
          <b>Повторим позже</b>
          {r.wrongWords.map((w) => <div class="row" onClick={() => speak(w.en)}>🔊 {w.en} — <span class="hint">{w.ru[0]}</span></div>)}
        </div>
      )}
      <button class="btn" onClick={onNext}>Дальше</button>
    </main>
  );
}
