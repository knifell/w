import { useState } from 'preact/hooks';
import type { LocalState } from '../game/local';
import { ITEMS } from '../game/config';
import { canBuy } from '../game/shop';
import { haptic } from '../tg/telegram';
import { Icon, Shell } from '../components/Icon';
import { ITEM_ICON } from '../components/Stamp';

export function ShopScreen({ st, onBuy, onPremium }: { st: LocalState; onBuy: (id: string) => string | null; onPremium: () => void }) {
  const [msg, setMsg] = useState('');
  return (
    <main>
      <div class="page-head"><h1>Лавка</h1></div>
      <p class="hint">Ракушки зарабатываются в уроках, повторениях и испытаниях. Штампы здесь не продаются.</p>
      {ITEMS.filter((it) => !(it.freeOnly && st.premium)).map((it) => {
        const why = canBuy(st, it);
        const own = st.inventory[it.id];
        return (
          <div class="card item" key={it.id}>
            <span class={'item-ico ' + it.id}><Icon name={ITEM_ICON[it.id] ?? 'gift'} size={30} /></span>
            <div class="item-txt"><b>{it.name}</b><div class="hint">{it.desc}{own ? ` · у тебя: ${own}` : ''}</div>
              {why && <div class="why">{why}</div>}</div>
            <button class="btn small price" disabled={!!why} aria-label={`Купить за ${it.price} ракушек`}
              onClick={() => { const e = onBuy(it.id); e ? haptic.bad() : haptic.ok(); setMsg(e ?? `${it.name} — готово!`); }}>
              <Shell size={18} />{it.price}
            </button>
          </div>
        );
      })}
      {msg && <div class={'toast' + (msg.endsWith('готово!') ? '' : ' err')} role="status"><Icon name={msg.endsWith('готово!') ? 'check' : 'info'} size={20} />{msg}</div>}
      <div class="foot-note hint"><Icon name="gift" size={20} />Раз в неделю Шкипер дарит один уголь бесплатно (если у тебя меньше двух).</div>
      {!st.premium && <button class="btn gold" onClick={onPremium}><Icon name="crown" size={20} />Premium: ×2 ракушки и безлимитная энергия</button>}
    </main>
  );
}
