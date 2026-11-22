import { useEffect, useState } from 'preact/hooks';
import type { LocalState } from '../game/local';
import { ENERGY } from '../game/config';
import { nextEnergyIn } from '../game/energy';
import { mmss } from '../lib/format';
import { Icon, Lantern } from './Icon';

interface Props { st: LocalState; onClose: () => void; onShop: () => void; onPremium: () => void; onReview?: () => void }

export function EnergySheet({ st, onClose, onShop, onPremium, onReview }: Props) {
  const [, tick] = useState(0);
  useEffect(() => { const t = setInterval(() => tick((n) => n + 1), 1000); return () => clearInterval(t); }, []);
  const left = nextEnergyIn(st);
  return (
    <div class="overlay" onClick={onClose}>
      <div class="sheet story" role="dialog" aria-label="Энергия" onClick={(e) => e.stopPropagation()}>
        <div class="sheet-hero">
          <Lantern size={56} lit={st.premium || st.energy > 0} />
          <div>
            <h2>Фонарь: {st.premium ? '∞' : `${st.energy}/${ENERGY.max}`}</h2>
            {!st.premium && left > 0 && <div class="hint">Следующий заряд через <b>{mmss(left)}</b></div>}
          </div>
        </div>
        {st.premium ? <p>С Premium энергия безлимитна.</p> : (
          <>
            <div class="charges" style={{ '--n': ENERGY.max }}>
              {Array.from({ length: ENERGY.max }, (_, i) => <span class={i < st.energy ? 'on' : ''} />)}
            </div>
            <p class="hint">Новый урок тратит 1 заряд. Повторения и испытания — бесплатно.</p>
            {onReview && <button class="btn" onClick={onReview}><Icon name="refresh" size={20} />Повторить слова (бесплатно)</button>}
            <button class="btn alt" onClick={onShop}><Icon name="flask" size={20} />Флакон масла в лавке</button>
            <button class="btn gold" onClick={onPremium}><Icon name="crown" size={20} />Безлимит с Premium</button>
          </>
        )}
        <button class="link" onClick={onClose}>Закрыть</button>
      </div>
    </div>
  );
}
