import { sfx } from '../lib/sfx';
import type { Word } from '../types';
import type { Reward, SessionKind } from '../game/session';
import { speak } from '../lib/speech';
import { days, words } from '../lib/format';
import { Flame, Icon, Shell } from '../components/Icon';
import { Skipper } from '../components/Skipper';
import { StampMark } from '../components/Stamp';
import { useEffect } from 'preact/hooks';
import { haptic } from '../tg/telegram';
import { Confetti, CountUp } from '../components/Confetti';

export type ResultData = Reward & { accuracy: number; wrongWords: Word[]; kind: SessionKind };
const TITLE: Record<SessionKind, string> = { lesson: 'Урок пройден!', review: 'Повторение готово!', trial: 'Испытание пройдено!' };

export function ResultScreen({ result: r, onNext }: { result: ResultData; onNext: () => void }) {
  // Вибрация: штамп — сильнее, обычный итог — короткий «успех».
  useEffect(() => { sfx.win(); if (r.stickers.length) { haptic.reward(); setTimeout(sfx.coin, 600); } else haptic.ok(); }, []);
  return (
    <main class="result">
      <Confetti />
      <div class="result-hero"><Skipper mood={r.perfect ? 'happy' : 'proud'} size={170} /></div>
      <h1>{r.perfect && r.kind === 'lesson' ? 'Без единой ошибки!' : TITLE[r.kind]}</h1>
      <div class="stats">
        <div class="rstat xp"><span>опыт</span><b><Icon name="star" size={22} />+<CountUp to={r.xp} />{r.mult > 1 && <small>×{r.mult}</small>}</b></div>
        <div class="rstat shell"><span>ракушки</span><b><Shell size={22} />+<CountUp to={r.coins} delay={420} /></b></div>
        <div class="rstat acc"><span>точность</span><b><Icon name="check" size={22} stroke={3} /><CountUp to={r.accuracy} delay={540} />%</b></div>
      </div>
      {r.capped && <div class="card hint">Награды за испытания на сегодня закончились — но тренировка всё равно идёт в зачёт штампов.</div>}
      {r.stickers.map((s) => (
        <div class="card event new-stamp">
          <span class={`stamp got r-${s.rarity} event-ico`}><StampMark s={s} has open /></span>
          <div><div class="hint">Новый штамп</div><b>{s.name}</b></div>
        </div>
      ))}
      {r.streakUp && <div class="card event"><span class="event-ico fire"><Flame size={26} /></span><b>Костёр горит: {days(r.streak)} подряд</b></div>}
      {r.grown > 0 && <div class="card event"><span class="event-ico"><Icon name="anchor" /></span><b>Закрепляются: {words(r.grown)}</b></div>}
      {r.wrongWords.length > 0 && (
        <div class="card result-list">
          <b>Повторим позже</b>
          {r.wrongWords.map((w) => (
            <div class="row" onClick={() => speak(w.en)}>
              <span class="speak sm" aria-hidden="true"><Icon name="speaker" size={18} /></span>
              <span><b>{w.en}</b> <span class="hint">— {w.ru[0]}</span></span>
            </div>
          ))}
        </div>
      )}
      <button class="btn" onClick={onNext}>Дальше</button>
    </main>
  );
}
