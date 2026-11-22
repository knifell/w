import { useState } from 'preact/hooks';
import type { LocalState } from '../game/local';
import { ALBUMS, STICKERS, type Sticker } from '../game/config';
import { condText, stickerProgress } from '../game/stickers';

const RAR: Record<string, string> = { common: 'Обычный', rare: 'Редкий', epic: 'Эпический', legendary: 'Легендарный' };

export function PassportScreen({ st }: { st: LocalState }) {
  const [open, setOpen] = useState<Sticker | null>(null);
  const got = Object.keys(st.stickers).length;
  return (
    <main>
      <h1>📔 Паспорт</h1>
      <p class="hint">Штампы нельзя купить — только заслужить. Собрано {got} из {STICKERS.length}.</p>
      {ALBUMS.map((a) => {
        const list = STICKERS.filter((s) => s.album === a.id);
        const n = list.filter((s) => st.stickers[s.id]).length;
        return (
          <section class="card album" key={a.id}>
            <div class="album-head"><b>{a.name}{a.premium && ' 👑'}</b><span class="hint">{n}/{list.length}</span></div>
            <div class="stamps">
              {list.map((s) => {
                const has = !!st.stickers[s.id];
                return (
                  <button class={`stamp r-${s.rarity}` + (has ? ' got' : '')} onClick={() => setOpen(s)}>
                    <span>{has || !s.hidden ? s.emoji : '❔'}</span>
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
              <span>{st.stickers[open.id] || !open.hidden ? open.emoji : '❔'}</span>
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
