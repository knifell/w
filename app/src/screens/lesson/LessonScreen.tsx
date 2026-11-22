import { useMemo, useState } from 'preact/hooks';
import type { Word } from '../../types';
import { exerciseWords, type Exercise } from '../../engine/generators';
import { haptic } from '../../tg/telegram';
import { speak } from '../../lib/speech';
import { reportAnswer } from '../../game/local';
import type { Submit } from './types';
import { ChoiceView } from './ChoiceView';
import { PairsView } from './PairsView';
import { TypeView } from './TypeView';
import { BuildView } from './BuildView';
import { LearnCard } from './LearnCard';

export interface SessionOutcome { accuracy: number; seen: Word[]; wrong: Word[] }
interface Props {
  build: () => Exercise[];
  onExit: () => void;
  onDone: (o: SessionOutcome) => void;
}

/** Общий экран сессии: урок или повторение. */
export function LessonScreen({ build, onExit, onDone }: Props) {
  const initial = useMemo(build, []);
  const [queue, setQueue] = useState<Exercise[]>(initial);
  const [pos, setPos] = useState(0);
  const [solved, setSolved] = useState(0);
  const [fb, setFb] = useState<Submit | null>(null);
  const [askExit, setAskExit] = useState(false);
  const [stats] = useState(() => ({ answers: 0, correct: 0, wrong: new Set<string>() }));

  const ex = queue[pos];
  const progress = solved / initial.length;

  const submit = (s: Submit) => {
    if (s.learn) return next(true); // карточка слова не оценивается
    stats.answers++;
    if (s.ok) { stats.correct++; haptic.ok(); } else haptic.bad();
    s.wrongIds?.forEach((id) => stats.wrong.add(id));
    if (!s.ok) exerciseWords(ex).forEach((w) => stats.wrong.add(w.id));
    if (s.ok && ex.kind !== 'pairs' && ex.kind !== 'choice') speak(s.correct);
    if (ex.kind === 'pairs') return next(true); // пары сами показывают результат
    setFb(s);
  };

  const next = (ok: boolean) => {
    setFb(null);
    const q = ok ? queue : [...queue, ex]; // ошибка → задание в конец очереди
    if (ok) setSolved((n) => n + 1);
    if (pos + 1 >= q.length) return finish();
    setQueue(q);
    setPos(pos + 1);
  };

  const claimRight = () => {
    if (ex.kind === 'type' && fb?.input) reportAnswer(ex.word.id, fb.input);
    stats.correct++;
    exerciseWords(ex).forEach((w) => stats.wrong.delete(w.id));
    next(true);
  };

  const finish = () => {
    const accuracy = Math.round((stats.correct / Math.max(1, stats.answers)) * 100);
    const seen = [...new Map(initial.flatMap(exerciseWords).map((w) => [w.id, w])).values()];
    onDone({ accuracy, seen, wrong: seen.filter((w) => stats.wrong.has(w.id)) });
  };

  const key = `${ex.id}#${pos}`;
  const props = { locked: !!fb, onSubmit: submit };
  const example = ex.kind !== 'pairs' && ex.kind !== 'learn' ? ex.word.examples[0] : null;

  return (
    <div class="lesson">
      <div class="lesson-top">
        <button class="x" aria-label="Выйти" onClick={() => setAskExit(true)}>✕</button>
        <div class="bar"><div style={{ width: `${progress * 100}%` }} /></div>
      </div>
      {ex.kind === 'learn' && <LearnCard key={key} ex={ex} {...props} />}
      {ex.kind === 'choice' && <ChoiceView key={key} ex={ex} {...props} />}
      {ex.kind === 'pairs' && <PairsView key={key} ex={ex} {...props} />}
      {ex.kind === 'type' && <TypeView key={key} ex={ex} {...props} />}
      {ex.kind === 'build' && <BuildView key={key} ex={ex} {...props} />}
      {askExit && (
        <div class="overlay" onClick={() => setAskExit(false)}>
          <div class="sheet story" onClick={(e) => e.stopPropagation()}>
            <h2>Выйти из урока?</h2>
            <p class="hint">Прогресс этого урока не сохранится.</p>
            <button class="btn" onClick={() => setAskExit(false)}>Продолжить урок</button>
            <button class="link" onClick={onExit}>Выйти</button>
          </div>
        </div>
      )}
      {fb && (
        <div class={'sheet ' + (fb.ok ? 'ok' : 'bad')}>
          <b>{fb.ok ? (fb.typo ? 'Почти! Есть опечатка' : 'Верно!') : 'Не совсем'}</b>
          {(!fb.ok || fb.typo) && <div>Правильно: <b>{fb.correct}</b></div>}
          {example && <div class="hint ex-sent" onClick={() => speak(example.en)}>🔊 {example.en}<br />{example.ru}</div>}
          <button class="btn" onClick={() => next(fb.ok)}>Дальше</button>
          {!fb.ok && ex.kind === 'type' && <button class="link" onClick={claimRight}>Я ответил верно</button>}
        </div>
      )}
    </div>
  );
}
