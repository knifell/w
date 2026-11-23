// Админка: «себе» (мгновенно, на этом телефоне) и «другим» (через сервер, игрок получит при следующем входе).
import { useEffect, useState } from 'preact/hooks';
import type { LevelPack } from '../types';
import type { LocalState } from '../game/local';
import type { Grant } from '../game/purchases';
import { ITEMS } from '../game/config';
import { giveItem } from '../game/shop';
import { adminAllStickers, adminCoins, adminEnergy, adminJump, adminOpenAll, adminPremium, adminStreak } from '../game/admin';
import { adminCall } from '../api/payments';
import { tg, useTgBack } from '../tg/telegram';
import { Icon } from '../components/Icon';

interface UserCard { id: number; name: string; username?: string; at: number }
interface Found { user: UserCard; premiumUntil: number; purchases: { item: string; stars: number; refunded?: boolean }[]; grants: Grant[] }

interface Props { st: LocalState; packs: LevelPack[]; mutate: (fn: (s: LocalState) => void) => void; onBack: () => void; onRefresh: () => void }

const date = (ms: number) => (ms ? new Date(ms).toLocaleDateString('ru-RU') : '—');

export function AdminScreen({ st, packs, mutate, onBack, onRefresh }: Props) {
  useTgBack(onBack);
  const [lvl, setLvl] = useState(st.level ?? packs[0].level);
  const pack = packs.find((p) => p.level === lvl) ?? packs[0];
  const [streak, setStreak] = useState(String(st.streak.cur));

  // ---- другим ----
  const [q, setQ] = useState('');
  const [found, setFound] = useState<Found | null>(null);
  const [users, setUsers] = useState<UserCard[]>([]);
  const [coins, setCoins] = useState('');
  const [days, setDays] = useState('');
  const [items, setItems] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState('');
  const fail = (e: unknown) => setMsg(e instanceof Error ? e.message : String(e));

  useEffect(() => { adminCall<{ users: UserCard[] }>('users').then((r) => setUsers(r.users ?? [])).catch(fail); }, []);
  const find = async (query = q) => {
    setMsg(''); setFound(null);
    try { const r = await adminCall<Found & { error?: string }>('find', { q: query }); if (r.error) setMsg(r.error); else setFound(r); } catch (e) { fail(e); }
  };
  const grant = async () => {
    if (!found) return;
    const it: Record<string, number> = {};
    for (const [k, v] of Object.entries(items)) if (Number(v)) it[k] = Number(v);
    try {
      const r = await adminCall<{ ok?: boolean; error?: string }>('grant', { to: String(found.user.id), coins: Number(coins) || 0, premiumDays: Number(days) || 0, items: it });
      if (r.error) { setMsg(r.error); return; }
      setMsg(`Выдано ✔ ${found.user.name} получит при следующем входе в игру.`);
      setCoins(''); setDays(''); setItems({});
      if (found.user.id === tg?.initDataUnsafe.user?.id) onRefresh();
      void find(String(found.user.id));
    } catch (e) { fail(e); }
  };

  return (
    <main class="about admin">
      <button class="link back" onClick={onBack}><Icon name="back" size={20} />Назад</button>
      <h1>Админка</h1>

      <section class="card">
        <b>Себе: уровень и острова</b>
        <div class="levels">
          {packs.map((p) => <button class={'chip-btn' + (p.level === lvl ? ' on' : '')} onClick={() => setLvl(p.level)}>{p.level}</button>)}
        </div>
        <div class="hint">Прыгнуть на остров (уроки до него засчитаются пройденными):</div>
        <div class="admin-row">
          {pack.islands.map((isl) => <button class="btn small alt" onClick={() => mutate((s) => adminJump(s, pack, isl.n))}>{isl.n}</button>)}
        </div>
        <div class="admin-row">
          <button class="btn small alt" onClick={() => mutate((s) => adminOpenAll(s, pack))}>Открыть все острова {pack.level}</button>
          <button class="btn small alt" onClick={() => mutate((s) => adminJump(s, pack, pack.islands.length + 1))}>Пройти весь {pack.level}</button>
        </div>
      </section>

      <section class="card">
        <b>Себе: ракушки, вещи, энергия</b>
        <div class="hint">Ракушки: {st.coins}</div>
        <div class="admin-row">
          {[100, 1000, 10000].map((n) => <button class="btn small alt" onClick={() => mutate((s) => adminCoins(s, n))}>+{n}</button>)}
          <button class="btn small alt" onClick={() => mutate((s) => adminCoins(s, -s.coins))}>Обнулить</button>
        </div>
        <div class="admin-row">
          {ITEMS.map((it) => <button class="btn small alt" onClick={() => mutate((s) => giveItem(s, it.id, 1))}>{it.emoji} +1</button>)}
          <button class="btn small alt" onClick={() => mutate(adminEnergy)}>⚡ Полная энергия</button>
        </div>
        <div class="admin-row">
          <button class="btn small alt" onClick={() => mutate((s) => adminPremium(s, !s.premium))}>{st.premium ? 'Выключить Premium' : 'Включить Premium'}</button>
          <button class="btn small alt" onClick={() => mutate(adminAllStickers)}>Все штампы</button>
        </div>
        <div class="admin-row">
          <input class="type-input admin-input" inputMode="numeric" value={streak} onInput={(e) => setStreak((e.target as HTMLInputElement).value)} aria-label="Дней костра" />
          <button class="btn small alt" onClick={() => mutate((s) => adminStreak(s, Number(streak) || 0))}>🔥 Задать костёр</button>
        </div>
      </section>

      <section class="card">
        <b>Другим игрокам</b>
        <div class="hint">Введи @ник или Telegram id. Игрок должен хоть раз открыть игру.</div>
        <div class="admin-row">
          <input class="type-input admin-input wide" value={q} placeholder="@ник или id" autocapitalize="off" onInput={(e) => setQ((e.target as HTMLInputElement).value)} />
          <button class="btn small" onClick={() => find()}>Найти</button>
        </div>
        {found && (
          <div class="admin-found">
            <b>{found.user.name}{found.user.username ? ` (@${found.user.username})` : ''}</b>
            <div class="hint">id {found.user.id} · Premium до {date(found.premiumUntil)} · покупок {found.purchases.length} · подарков {found.grants.length}</div>
            <label class="admin-field">Ракушки (можно минус)<input class="type-input admin-input" inputMode="numeric" value={coins} onInput={(e) => setCoins((e.target as HTMLInputElement).value)} /></label>
            <label class="admin-field">Premium, дней<input class="type-input admin-input" inputMode="numeric" value={days} onInput={(e) => setDays((e.target as HTMLInputElement).value)} /></label>
            {ITEMS.map((it) => (
              <label class="admin-field">{it.emoji} {it.name}<input class="type-input admin-input" inputMode="numeric" value={items[it.id] ?? ''}
                onInput={(e) => setItems({ ...items, [it.id]: (e.target as HTMLInputElement).value })} /></label>
            ))}
            <button class="btn" onClick={grant}>Выдать</button>
          </div>
        )}
        {msg && <div class="hint admin-msg">{msg}</div>}
      </section>

      {users.length > 0 && (
        <section class="card">
          <b>Игроки ({users.length})</b>
          {users.map((u) => (
            <button class="admin-user" onClick={() => { const v = u.username ? `@${u.username}` : String(u.id); setQ(v); void find(v); }}>
              <span>{u.name}{u.username ? ` @${u.username}` : ''}</span><span class="hint">{date(u.at)}</span>
            </button>
          ))}
        </section>
      )}
    </main>
  );
}

