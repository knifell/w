import { useState } from 'preact/hooks';
import type { Bottle } from '../game/bottle';
import { speak } from '../lib/speech';
import { haptic } from '../tg/telegram';
import { Icon } from './Icon';

/** «Бутылка с письмом» на карте: фраза дня из выученных слов, выбрать смысл. */
export function BottleCard({ b, onAnswer }: { b: Bottle; onAnswer: (ok: boolean) => void }) {
  const [open, setOpen] = useState(false);
  const [pick, setPick] = useState<string | null>(null);
  const choose = (o: string) => {
    if (pick) return;
    haptic.tap(); setPick(o);
    setTimeout(() => onAnswer(o === b.ru), 1200); // показать результат, потом карточка уплывает
  };
  if (!open) return (
    <button class="card bottle" onClick={() => { setOpen(true); speak(b.en); haptic.tap(); }}>
      <span class="bottle-ico" aria-hidden="true"><Icon name="flask" size={26} /></span>
      <span class="bottle-txt"><b>Бутылка с письмом</b><span class="hint">Фраза дня из твоих слов · открыть</span></span>
      <Icon name="chevron" size={20} />
    </button>
  );
  return (
    <div class="card bottle open" role="region" aria-label="Бутылка с письмом">
      <div class="bottle-head"><span class="bottle-ico" aria-hidden="true"><Icon name="flask" size={22} /></span><b>Что значит фраза?</b></div>
      <button class="bottle-en" onClick={() => speak(b.en)}><span class="speak sm" aria-hidden="true"><Icon name="speaker" size={18} /></span>{b.en}</button>
      <div class="opts">
        {b.options.map((o) => (
          <button class={'opt long' + (pick && o === b.ru ? ' right' : '') + (pick === o && o !== b.ru ? ' wrong' : '')} disabled={!!pick} onClick={() => choose(o)}>{o}</button>
        ))}
      </div>
    </div>
  );
}
