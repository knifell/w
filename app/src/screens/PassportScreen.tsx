import { useState } from 'preact/hooks';
import type { LocalState } from '../game/local';
import { ALBUMS, STICKERS, type Sticker } from '../game/config';
import { condText, stickerProgress } from '../game/stickers';
import { Icon } from '../components/Icon';
import { StampMark } from '../components/Stamp';

const RAR: Record<string, string> = { common: 'Обычный', rare: 'Редкий', epic: 'Эпический', legendary: 'Легендарный' };

export function PassportScreen({ st }: { st: LocalState }) {
  const [open, setOpen] = useState<Sticker | null>(null);
  const got = Object.keys(st.stickers).length;
  return (
    <main>
      <header class="cover">
        <span class="cover-crest"><Icon name="passport" size={28} /></span>
        <h1>Паспорт</h1>
        <p>Штампы нельзя купить — только заслужить.</p>
        <div class="cover-count"><b>{got}</b>из {STICKERS.length} штампов</div>
        <div class="bar"><div style={{ width: `${(got / STICKERS.length) * 100}%` }} /></div>
      </header>
      {ALBUMS.map((a) => {
        const list = STICKERS.filter((s) => s.album === a.id);
        const n = list.filter((s) => st.stickers[s.id]).length;
        return (
          <section class="card album" key={a.id}>
            <div class="album-head"><b>{a.name}{a.premium && <Icon name="crown" size={18} />}</b><span class="count">{n}/{list.length}</span></div>
            <div class="stamps">
              {list.map((s) => {
                const has = !!st.stickers[s.id];
                return (
                  <button class={`stamp r-${s.rarity}` + (has ? ' got' : '')} onClick={() => setOpen(s)}
                    aria-label={has || !s.hidden ? s.name : 'Тайный штамп'}>
                    <StampMark s={s} has={has} open={has || !s.hidden} />
                    {!has && <i style={{ width: `${stickerProgress(st, s) * 100}%` }} />}
                  </button>
                );
              })}
            </div>
            {a.premium && !st.premium && <div class="hint">Эксклюзивные штампы для участников Premium</div>}
          </section>
        );
      })}
      {open && (
        <div class="overlay" onClick={() => setOpen(null)}>
          <div class="sheet story" onClick={(e) => e.stopPropagation()}>
            <div class={`stamp big r-${open.rarity}` + (st.stickers[open.id] ? ' got' : '')}>
              <StampMark s={open} has={!!st.stickers[open.id]} open={!!st.stickers[open.id] || !open.hidden} />
            </div>
            <h2>{st.stickers[open.id] || !open.hidden ? open.name : 'Тайный штамп'}</h2>
            <div class="hint">{RAR[open.rarity]}{open.premium && ' · Premium'}</div>
            <p>{st.stickers[open.id]
              ? `Получен ${new Date(st.stickers[open.id]).toLocaleDateString('ru-RU')}`
              : open.hidden ? 'Условие откроется, когда подберёшься ближе.' : `${condText(open)} · ${Math.round(stickerProgress(st, open) * 100)}%`}</p>
            <button class="btn" onClick={() => setOpen(null)}>Ок</button>
          </div>
        </div>
      )}
    </main>
  );
}
