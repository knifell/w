import { useEffect, useState } from 'preact/hooks';
import type { LocalState } from '../game/local';
import { liveStreak } from '../game/streak';
import { energyOf } from '../game/energy';
import { activeMult } from '../game/shop';
import { today } from '../game/time';
import { mmss } from '../lib/format';

export function TopBar({ st, level, onEnergy }: { st: LocalState; level?: string; onEnergy: () => void }) {
  const [, tick] = useState(0);
  useEffect(() => { const t = setInterval(() => tick((n) => n + 1), 1000); return () => clearInterval(t); }, []);
  const e = energyOf(st);
  const boostLeft = Math.max(0, ...Object.values(st.boosts)) - Date.now();
  return (
    <div class="topbar">
      {level && <span class="chip">{level}</span>}
      <span class="stats-row">
        <span title="Костёр">🔥 {liveStreak(st, today())}</span>
        <span title="Ракушки">🐚 {st.coins}</span>
        <button class="energy" onClick={onEnergy} title="Энергия">⚡ {e === Infinity ? '∞' : e}</button>
      </span>
      {activeMult(st) > 1 && <div class="boost-pill">🌬️ ×{activeMult(st)} опыт · {mmss(boostLeft)}</div>}
    </div>
  );
}
