import { sfx } from '../lib/sfx';
import { useState } from 'preact/hooks';
import type { LocalState } from '../game/local';
import { ITEMS, STAR_PACKS } from '../game/config';
import { canBuy } from '../game/shop';
import { haptic } from '../tg/telegram';
import { Icon, Shell } from '../components/Icon';
import { ITEM_ICON } from '../components/Stamp';

export function ShopScreen({ st, onBuy, onBuyStars, onPremium }: { st: LocalState; onBuy: (id: string) => string | null; onBuyStars: (id: string) => void; onPremium: () => void }) {
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
              onClick={() => { const e = onBuy(it.id); if (e) haptic.bad(); else { haptic.ok(); sfx.coin(); } setMsg(e ?? `${it.name} — готово!`); }}>
              <Shell size={18} />{it.price}
            </button>
          </div>
        );
      })}
      {msg && <div class={'toast' + (msg.endsWith('готово!') ? '' : ' err')} role="status"><Icon name={msg.endsWith('готово!') ? 'check' : 'info'} size={20} />{msg}</div>}
      <h2 class="shop-sub">Ракушки за звёзды</h2>
      {STAR_PACKS.map((p) => (
        <div class="card item star-pack" key={p.id}>
          <span class="item-ico shells"><Shell size={30} /></span>
          <div class="item-txt"><b>{p.title}{p.badge && <span class="badge">{p.badge}</span>}</b><div class="hint">{p.desc}</div></div>
          <button class="btn small price stars" aria-label={`Купить за ${p.stars} звёзд`} onClick={() => { haptic.tap(); onBuyStars(p.id); }}>
            <Icon name="star" size={18} />{p.stars}
          </button>
        </div>
      ))}
      <div class="foot-note hint"><Icon name="info" size={20} />Оплата через Telegram Stars. Штампы и острова за звёзды не продаются — только за успехи в учёбе.</div>
      <div class="foot-note hint"><Icon name="gift" size={20} />Раз в неделю Шкипер дарит один уголь бесплатно (если у тебя меньше двух).</div>
      {!st.premium && <button class="btn gold" onClick={onPremium}><Icon name="crown" size={20} />Premium: ×2 ракушки и безлимитная энергия</button>}
    </main>
  );
}
