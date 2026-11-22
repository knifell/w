import { useEffect, useState } from 'preact/hooks';
import type { LocalState } from '../game/local';
import { ENERGY } from '../game/config';
import { nextEnergyIn } from '../game/energy';
import { mmss } from '../lib/format';

interface Props { st: LocalState; onClose: () => void; onShop: () => void; onPremium: () => void; onReview?: () => void }

export function EnergySheet({ st, onClose, onShop, onPremium, onReview }: Props) {
  const [, tick] = useState(0);
  useEffect(() => { const t = setInterval(() => tick((n) => n + 1), 1000); return () => clearInterval(t); }, []);
  const left = nextEnergyIn(st);
  return (
    <div class="overlay" onClick={onClose}>
      <div class="sheet story" onClick={(e) => e.stopPropagation()}>
        <h2>⚡ Фонарь: {st.premium ? '∞' : `${st.energy}/${ENERGY.max}`}</h2>
        {st.premium ? <p>С Premium энергия безлимитна.</p> : (
          <>
            <p class="hint">Новый урок тратит 1 заряд. Повторения и испытания — бесплатно.{left > 0 && <> Следующий заряд через <b>{mmss(left)}</b>.</>}</p>
            {onReview && <button class="btn" onClick={onReview}>Повторить слова (бесплатно)</button>}
            <button class="btn alt" onClick={onShop}>Флакон масла в лавке</button>
            <button class="btn gold" onClick={onPremium}>👑 Безлимит с Premium</button>
          </>
        )}
        <button class="link" onClick={onClose}>Закрыть</button>
      </div>
    </div>
  );
}
