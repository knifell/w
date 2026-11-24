import { sfx } from '../../lib/sfx';
import { useEffect, useMemo, useState } from 'preact/hooks';
import type { Word } from '../../types';
import { exerciseWords, type Exercise } from '../../engine/generators';
import { haptic, useTgBack } from '../../tg/telegram';
import { prefetchAudio, speak } from '../../lib/speech';
import { reportAnswer } from '../../game/local';
import type { Submit } from './types';
import { ChoiceView } from './ChoiceView';
import { PairsView } from './PairsView';
import { TypeView } from './TypeView';
import { BuildView } from './BuildView';
import { LearnCard } from './LearnCard';
import { ListenView } from './ListenView';
import { SelectView } from './SelectView';
import { TrueFalseView } from './TrueFalseView';
import { SpellView } from './SpellView';
import { Flame, Icon } from '../../components/Icon';

const PRAISE = ['Верно', 'Правильно', 'Отлично', 'Точно'];

export interface SessionOutcome { accuracy: number; seen: Word[]; wrong: Word[] }
interface Props {
  build: () => Exercise[];
  onExit: () => void;
  onDone: (o: SessionOutcome) => void;
  /** storm — 60 секунд на быстрые вопросы; boss — испытание с тремя жизнями. */
  mode?: 'storm' | 'boss';
}
const STORM_SEC = 60;
const LIVES = 3;

/** Общий экран сессии: урок или повторение. */
export function LessonScreen({ build, onExit, onDone, mode }: Props) {
  const initial = useMemo(build, []);
  const [queue, setQueue] = useState<Exercise[]>(initial);
  const [pos, setPos] = useState(0);
  const [solved, setSolved] = useState(0);
  const [fb, setFb] = useState<Submit | null>(null);
  const [askExit, setAskExit] = useState(false);
  const [combo, setCombo] = useState(0); // серия верных ответов подряд (только для вида)
  useTgBack(() => setAskExit(true));
  const [stats] = useState(() => ({ answers: 0, correct: 0, wrong: new Set<string>(), done: false }));
  const [left, setLeft] = useState(STORM_SEC);
  const [lives, setLives] = useState(LIVES);
  const [flash, setFlash] = useState<'' | 'ok' | 'bad'>('');
  const lost = mode === 'boss' && lives <= 0;
  useEffect(() => { // таймер «Шторма»; пока открыт вопрос «Выйти?» — пауза
    if (mode !== 'storm' || askExit) return;
    if (left <= 0) { finish(); return; }
    const t = setTimeout(() => setLeft((x) => x - 1), 1000);
    return () => clearTimeout(t);
  }, [left, askExit]);

  useEffect(() => { // звук слов и примеров урока — заранее, чтобы не было задержки
    const ws = [...new Map(initial.flatMap(exerciseWords).map((w) => [w.id, w])).values()];
    prefetchAudio(ws.flatMap((w) => [w.en, ...w.examples.slice(0, 1).map((e) => e.en)]));
  }, []);

  const ex = queue[pos];
  const progress = solved / initial.length;

  const submit = (s: Submit) => {
    if (s.learn) { // новое слово: в точность не идёт; ошибка — показать ответ и вернуть слово позже
      if (s.ok) return next(true);
      return setFb(s);
    }
    stats.answers++;
    setCombo((c) => (s.ok ? c + 1 : 0));
    if (s.ok) { stats.correct++; haptic.ok(); sfx.ok(); } else { haptic.bad(); sfx.bad(); }
    s.wrongIds?.forEach((id) => stats.wrong.add(id));
    if (!s.ok) exerciseWords(ex).forEach((w) => stats.wrong.add(w.id));
    if (s.ok && mode !== 'storm' && ex.kind !== 'pairs' && ex.kind !== 'choice' && !(ex.kind === 'select' && ex.mode === 'meaning')) speak(s.say ?? s.correct);
    if (ex.kind === 'pairs') return next(true); // пары сами показывают результат
    if (mode === 'storm') { // без окна ответа: вспышка и сразу следующий вопрос
      setFlash(s.ok ? 'ok' : 'bad');
      setTimeout(() => { setFlash(''); next(true); }, s.ok ? 260 : 650);
      return setFb({ ...s, ok: s.ok });
    }
    if (mode === 'boss' && !s.ok) setLives((n) => n - 1);
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
    if (mode === 'boss') setLives((n) => Math.min(LIVES, n + 1));
    if (ex.kind === 'type' && fb?.input) reportAnswer(ex.word.id, fb.input);
    stats.correct++;
    exerciseWords(ex).forEach((w) => stats.wrong.delete(w.id));
    next(true);
  };

  const finish = () => {
    if (stats.done) return; // таймер «Шторма» и последний ответ могут прийти одновременно
    stats.done = true;
    const accuracy = Math.round((stats.correct / Math.max(1, stats.answers)) * 100);
    const seen = [...new Map(initial.flatMap(exerciseWords).map((w) => [w.id, w])).values()];
    onDone({ accuracy, seen, wrong: seen.filter((w) => stats.wrong.has(w.id)) });
  };

  const key = `${ex.id}#${pos}`;
  const props = { locked: !!fb, onSubmit: submit, quick: mode === 'storm' };
  const example = ex.kind !== 'pairs' ? ex.word.examples[0] : null;

  return (
    <div class={'lesson' + (mode ? ' mode-' + mode : '') + (flash ? ' flash-' + flash : '')}>
      <div class="lesson-top">
        <button class="x" aria-label="Выйти" onClick={() => setAskExit(true)}><Icon name="close" size={26} stroke={2.4} /></button>
        {mode === 'storm' ? (
          <div class={'bar storm-bar' + (left <= 10 ? ' low' : '')}><div style={{ width: `${(left / STORM_SEC) * 100}%` }} /></div>
        ) : <div class="bar"><div style={{ width: `${progress * 100}%` }} /></div>}
        {mode === 'storm' && <span class="timer" aria-label={`Осталось ${left} секунд`}>{left}</span>}
        {mode === 'boss' && (
          <span class="lives" aria-label={`Жизни: ${lives}`}>
            {Array.from({ length: LIVES }, (_, i) => <span class={i < lives ? 'on' : ''}><Icon name="heart" size={22} /></span>)}
          </span>
        )}
        {combo >= 3 && <span class="combo" key={combo} aria-label={`${combo} подряд`}><Flame />{combo}</span>}
      </div>
      {ex.kind === 'learn' && <LearnCard key={key} ex={ex} {...props} />}
      {ex.kind === 'choice' && <ChoiceView key={key} ex={ex} {...props} />}
      {ex.kind === 'pairs' && <PairsView key={key} ex={ex} {...props} />}
      {ex.kind === 'type' && <TypeView key={key} ex={ex} {...props} />}
      {ex.kind === 'listen' && <ListenView key={key} ex={ex} {...props} />}
      {ex.kind === 'build' && <BuildView key={key} ex={ex} {...props} />}
      {ex.kind === 'select' && <SelectView key={key} ex={ex} {...props} />}
      {ex.kind === 'tf' && <TrueFalseView key={key} ex={ex} {...props} />}
      {ex.kind === 'spell' && <SpellView key={key} ex={ex} {...props} />}
      {askExit && (
        <div class="overlay" onClick={() => setAskExit(false)}>
          <div class="sheet story" onClick={(e) => e.stopPropagation()}>
            <h2>Выйти из урока?</h2>
            <p class="hint">Прогресс этого урока не сохранится. Если это урок, заряд фонаря вернётся.</p>
            <button class="btn" onClick={() => setAskExit(false)}>Продолжить урок</button>
            <button class="link" onClick={onExit}>Выйти</button>
          </div>
        </div>
      )}
      {lost && (
        <div class="overlay">
          <div class="sheet story lost" role="alertdialog">
            <h2>Корабль дал течь</h2>
            <p class="hint">Три ошибки — испытание не пройдено. Повтори слова острова и попробуй ещё раз: награды за попытку нет, но и штрафа тоже.</p>
            <button class="btn" onClick={onExit}>На карту</button>
          </div>
        </div>
      )}
      {fb && mode !== 'storm' && !lost && (
        <div class={'sheet ' + (fb.ok ? 'ok' : 'bad')}>
          <div class="fb-head" role="status">
            <span class="fb-mark"><Icon name={fb.ok ? 'check' : 'close'} size={24} stroke={3} /></span>
            {fb.ok ? (fb.typo ? 'Засчитано, но есть опечатка' : combo >= 3 ? `${combo} подряд` : PRAISE[pos % PRAISE.length]) : fb.typoLimit ? 'Снова та же опечатка' : 'Не совсем'}
          </div>
          {(!fb.ok || fb.typo) && <div class="fb-answer">Правильно: <b>{fb.correct}</b>{fb.input && fb.input.trim().toLowerCase() !== fb.correct.toLowerCase() && <> · у тебя: <s>{fb.input.trim()}</s></>}</div>}
          {fb.typoLimit && <div class="hint">В этом слове опечатка уже не первый раз — теперь засчитывается только точное написание.</div>}
          {example && (
            <div class="ex-sent" onClick={() => speak(example.en)}>
              <span class="speak sm" aria-hidden="true"><Icon name="speaker" size={18} /></span>
              <div>{example.en}<div class="hint">{example.ru}</div></div>
            </div>
          )}
          <button class={'btn ' + (fb.ok ? 'ok' : 'bad')} onClick={() => next(fb.ok)}>Дальше</button>
          {!fb.ok && ex.kind === 'type' && <button class="link" onClick={claimRight}>Я ответил верно</button>}
        </div>
      )}
    </div>
  );
}
