import { sfx } from '../lib/sfx';
import { useState } from 'preact/hooks';
import type { LocalState } from '../game/local';
import { ITEMS, STAR_PACKS } from '../game/config';
import { canBuy } from '../game/shop';
import { haptic } from '../tg/telegram';
import { Icon, Shell } from '../components/Icon';
import { ITEM_ICON } from '../components/Stamp';

/** Мини-парус для превью. */
const Sail = () => (
  <svg viewBox="0 0 44 40" width="44" height="40"><path d="M21 4v24" stroke="#6e4826" stroke-width="2.5" stroke-linecap="round" /><path d="M23 6l14 18H23z" fill="var(--sail1)" stroke="#14263a" stroke-width="2" stroke-linejoin="round" /><path d="M19 10 8 24h11z" fill="var(--sail2)" stroke="#14263a" stroke-width="2" stroke-linejoin="round" /><path d="M21 4l7 3-7 3z" fill="var(--flag)" /><path d="M4 28h36l-6 8H10z" fill="#ff6b4a" stroke="#14263a" stroke-width="2" stroke-linejoin="round" /></svg>
);

export function ShopScreen({ st, onBuy, onBuyStars, onPremium, onEquip }: { st: LocalState; onBuy: (id: string) => string | null; onBuyStars: (id: string) => void; onPremium: () => void; onEquip: (id: string) => void }) {
  const [msg, setMsg] = useState('');
  return (
    <main>
      <div class="page-head"><h1>Лавка</h1></div>
      <p class="hint">Ракушки зарабатываются в уроках, повторениях и испытаниях. Штампы здесь не продаются.</p>
      <h2 class="shop-sub first">Полезное</h2>
      {ITEMS.filter((it) => it.effect.type !== 'cosmetic' && !(it.freeOnly && st.premium)).map((it) => {
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
      <h2 class="shop-sub">Для красоты</h2>
      <p class="hint shop-note">Не влияют на учёбу — просто твой стиль.</p>
      <div class="cosmetics">
        {ITEMS.filter((it) => it.effect.type === 'cosmetic').map((it) => {
          const e = it.effect.type === 'cosmetic' ? it.effect : null!;
          const owned = st.owned.includes(it.id);
          const on = st.equip[e.slot] === it.id;
          const why = owned ? null : canBuy(st, it);
          return (
            <div class={'card cosmetic' + (on ? ' on' : '')} key={it.id}>
              <span class={`swatch ${e.slot} ${e.slot}-${e.value}`} aria-hidden="true">{e.slot === 'flag' ? <Sail /> : <span class="ring" />}</span>
              <b>{it.name}</b>
              <span class="hint">{it.desc}</span>
              {owned ? (
                <button class={'btn small ' + (on ? 'sea' : 'alt')} onClick={() => { haptic.tap(); onEquip(it.id); }}>{on ? 'Надето' : 'Надеть'}</button>
              ) : (
                <button class="btn small price" disabled={!!why} aria-label={`Купить за ${it.price} ракушек`}
                  onClick={() => { const er = onBuy(it.id); if (er) haptic.bad(); else { haptic.ok(); sfx.coin(); } setMsg(er ?? `${it.name} — готово!`); }}>
                  <Shell size={18} />{it.price}
                </button>
              )}
            </div>
          );
        })}
      </div>
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
