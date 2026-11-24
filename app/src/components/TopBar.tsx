import { nowMs } from '../game/clock';
import { useEffect, useState } from 'preact/hooks';
import type { LocalState } from '../game/local';
import { liveStreak } from '../game/streak';
import { energyOf } from '../game/energy';
import { activeMult } from '../game/shop';
import { today } from '../game/time';
import { mmss } from '../lib/format';
import { Flame, Icon, Lantern, Shell } from './Icon';

export function TopBar({ st, level, onEnergy }: { st: LocalState; level?: string; onEnergy: () => void }) {
  const [, tick] = useState(0);
  useEffect(() => { const t = setInterval(() => tick((n) => n + 1), 1000); return () => clearInterval(t); }, []);
  const e = energyOf(st);
  const boostLeft = Math.max(0, ...Object.values(st.boosts)) - nowMs();
  const streak = liveStreak(st, today());
  return (
    <div class="topbar">
      {level && <span class="chip">{level}</span>}
      <span class="stats-row">
        <span class={"pill" + (streak ? " fire-on" : "")} title="Костёр" aria-label={`Костёр: ${streak}`}><Flame out={!streak} />{streak}</span>
        <span class="pill" title="Ракушки" aria-label={`Ракушки: ${st.coins}`}><Shell />{st.coins}</span>
        <button class="energy" onClick={onEnergy} title="Энергия" aria-label={`Энергия: ${e === Infinity ? 'безлимит' : e}`}>
          <Lantern lit={e > 0} />{e === Infinity ? '∞' : e}
        </button>
      </span>
      {activeMult(st) > 1 && <div class="boost-pill"><Icon name="wind" size={18} />×{activeMult(st)} опыт · {mmss(boostLeft)}</div>}
    </div>
  );
}
