// Начисление покупок за Telegram Stars и бонусов за друзей.
// Источник правды — сервер (worker/): он получает платежи от Telegram. Приложение лишь начисляет то,
// что сервер подтвердил, ровно один раз (по id платежа), и снимает при возврате.
import type { LocalState } from './local';
import { REFERRAL, STAR_PACKS, STAR_PREMIUM } from './config';
import { giveItem } from './shop';

export interface Purchase { id: string; item: string; at: number; refunded?: boolean }
export interface Grant { id: string; at: number; coins?: number; items?: Record<string, number>; premiumDays?: number; note?: string }
export interface ServerStatus { purchases: Purchase[]; premiumUntil: number; referrals: { id: string; at: number }[]; grants?: Grant[]; admin?: boolean }
export interface Applied { coins: number; friends: number; premiumUntil: number; gifts: number }

export const isStarItem = (id: string) => id === STAR_PREMIUM.id || STAR_PACKS.some((p) => p.id === id);

export function applyStatus(s: LocalState, st: ServerStatus): Applied {
  const out: Applied = { coins: 0, friends: 0, premiumUntil: st.premiumUntil, gifts: 0 };
  for (const p of st.purchases) {
    const pack = STAR_PACKS.find((x) => x.id === p.item);
    const was = s.claimed[p.id];
    if (p.refunded) {
      if (was === 'ok' && pack) {
        const minus = Math.min(s.coins, pack.coins); s.coins -= minus; out.coins -= minus;
        s.paidCoins = Math.max(0, (s.paidCoins ?? 0) - pack.coins);
      }
      if (was !== 'refunded') s.claimed[p.id] = 'refunded';
      continue;
    }
    if (was) continue;
    if (pack) { s.coins += pack.coins; out.coins += pack.coins; s.paidCoins = (s.paidCoins ?? 0) + pack.coins; }
    s.claimed[p.id] = 'ok';
  }
  for (const f of st.referrals) {
    if (s.refRewarded.includes(f.id) || s.refRewarded.length >= REFERRAL.maxRewardedFriends) continue;
    s.refRewarded.push(f.id);
    s.coins += REFERRAL.inviterCoins; out.coins += REFERRAL.inviterCoins;
    s.inventory.ember = Math.min(2, (s.inventory.ember ?? 0) + REFERRAL.inviterEmber);
    out.friends++;
  }
  // Подарки от админа — один раз по id (ракушки не считаются купленными: при удалении прогресса сгорают).
  for (const g of st.grants ?? []) {
    const k = `g:${g.id}`;
    if (s.claimed[k]) continue;
    s.claimed[k] = 'ok';
    if (g.coins) { const d = Math.max(-s.coins, g.coins); s.coins += d; out.coins += d; }
    for (const [item, n] of Object.entries(g.items ?? {})) giveItem(s, item, n);
    out.gifts++;
  }
  s.admin = !!st.admin;
  s.premiumUntil = Math.max(s.devPremiumUntil, st.premiumUntil);
  return out;
}

/** Подарок новичку, пришедшему по ссылке друга (выдаётся один раз). */
export function applyFriendGift(s: LocalState): number {
  if (s.refBonusTaken) return 0;
  s.refBonusTaken = true;
  s.coins += REFERRAL.friendCoins;
  return REFERRAL.friendCoins;
}
