import { useState } from 'preact/hooks';
import type { LocalState } from '../game/local';
import { ITEMS } from '../game/config';
import { canBuy } from '../game/shop';
import { haptic } from '../tg/telegram';

export function ShopScreen({ st, onBuy, onPremium }: { st: LocalState; onBuy: (id: string) => string | null; onPremium: () => void }) {
  const [msg, setMsg] = useState('');
  return (
    <main>
      <h1>🐚 Лавка</h1>
      <p class="hint">Ракушки зарабатываются в уроках, повторениях и испытаниях. Штампы здесь не продаются.</p>
      {ITEMS.filter((it) => !(it.freeOnly && st.premium)).map((it) => {
        const why = canBuy(st, it);
        const own = st.inventory[it.id];
        return (
          <div class="card item" key={it.id}>
            <span class="item-ico">{it.emoji}</span>
            <div class="item-txt"><b>{it.name}</b><div class="hint">{it.desc}{own ? ` · у тебя: ${own}` : ''}</div></div>
            <button class="btn small" disabled={!!why} title={why ?? ''}
              onClick={() => { const e = onBuy(it.id); e ? haptic.bad() : haptic.ok(); setMsg(e ?? `${it.emoji} ${it.name} — готово!`); }}>
              {it.price} 🐚
            </button>
          </div>
        );
      })}
      {msg && <div class="card hint">{msg}</div>}
      <p class="hint">Раз в неделю Шкипер дарит один уголь бесплатно (если у тебя меньше двух).</p>
      {!st.premium && <button class="btn gold" onClick={onPremium}>👑 Premium: ×2 ракушки и безлимитная энергия</button>}
    </main>
  );
}
