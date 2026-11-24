import { useEffect, useRef, useState } from 'preact/hooks';
import { speak } from '../../lib/speech';
import { haptic } from '../../tg/telegram';
import { sfx } from '../../lib/sfx';
import type { ViewProps } from './types';
import { ResidentArt, residentOf } from '../../components/Residents';

/** Переписка с жителем острова: он просит сказать фразу, ты дописываешь ответ выученным словом. */
export function ChatView({ ex, locked, onSubmit }: ViewProps<'chat'>) {
  const [step, setStep] = useState(0);
  const [picks, setPicks] = useState<string[]>([]);
  const wrong = useRef<string[]>([]);
  const end = useRef<HTMLDivElement>(null);
  const who = residentOf(ex.island);
  const cur = ex.steps[step];
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [step, picks.length]);
  const pick = (o: string) => {
    if (locked || picks.length > step) return;
    const ok = o === cur.answer;
    haptic.tap(); if (ok) { sfx.ok(); speak(cur.say); } else { sfx.bad(); wrong.current.push(cur.word.id); }
    setPicks((p) => [...p, o]);
    setTimeout(() => {
      if (step + 1 < ex.steps.length) setStep(step + 1);
      else onSubmit({ ok: !wrong.current.length, correct: ex.steps.map((x) => x.say).join(' '), wrongIds: wrong.current });
    }, ok ? 900 : 1600);
  };
  return (
    <div class="ex chat">
      <div class="ex-title">Переписка</div>
      <div class="chat-head"><ResidentArt island={ex.island} size={40} /><span><b>{who.name}</b><span class="hint">просит помочь с английским</span></span></div>
      <div class="chat-log">
        {ex.steps.slice(0, step + 1).map((st, i) => (
          <>
            <div class="msg them">Как сказать: «{st.ask}»?</div>
            {picks[i] !== undefined ? (
              <div class={'msg me' + (picks[i] === st.answer ? ' ok' : ' bad')} onClick={() => speak(st.say)}>
                {st.before} <b>{picks[i] === st.answer ? st.answer : <><s>{picks[i]}</s> {st.answer}</>}</b>{/^[.?!,]/.test(st.after) ? '' : ' '}{st.after}
              </div>
            ) : (
              <div class="msg me draft">{st.before} <span class="gap">{' '}</span> {st.after}</div>
            )}
          </>
        ))}
        <div ref={end} />
      </div>
      {picks.length === step && !locked && (
        <div class="chat-opts">{cur.options.map((o) => <button class="tok" onClick={() => pick(o)}>{o}</button>)}</div>
      )}
    </div>
  );
}
