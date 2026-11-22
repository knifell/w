// Покупки за Telegram Stars и приглашения друзей — через свой сервер (worker/, Cloudflare).
// Адрес сервера задаётся при сборке: VITE_API_URL. Без него (и вне Telegram) покупки выключены.
import { tg } from '../tg/telegram';
import type { ServerStatus } from '../game/purchases';

const API = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '');
/** Ссылка на мини-приложение для приглашений, например https://t.me/OstrovSlovBot/app */
export const APP_LINK = (import.meta.env.VITE_APP_LINK as string | undefined) ?? '';

export const paymentsReady = () => !!(API && tg?.initData && tg.openInvoice);

async function call<T>(path: string, body: Record<string, unknown> = {}): Promise<T> {
  const r = await fetch(`${API}${path}`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ...body, initData: tg!.initData }),
  });
  if (!r.ok) throw new Error(`api ${path}: ${r.status}`);
  return r.json() as Promise<T>;
}

export async function fetchStatus(): Promise<ServerStatus | null> {
  if (!paymentsReady()) return null;
  try { return await call<ServerStatus>('/api/status'); } catch { return null; }
}

export type BuyResult = 'paid' | 'cancelled' | 'failed' | 'pending' | 'unavailable';

/** Открывает окно оплаты Telegram. Начисление — после подтверждения сервером (fetchStatus). */
export async function buy(itemId: string): Promise<BuyResult> {
  if (!paymentsReady()) return 'unavailable';
  let link: string | undefined;
  try { link = (await call<{ link?: string }>('/api/invoice', { item: itemId })).link; } catch { return 'failed'; }
  if (!link) return 'failed';
  return new Promise((res) => tg!.openInvoice!(link!, (status) => res(status)));
}

/** Telegram сообщает серверу о платеже чуть позже, чем закрывается окно — немного подождём. */
export async function waitForStatus(ok: (s: ServerStatus) => boolean, tries = 6): Promise<ServerStatus | null> {
  let last: ServerStatus | null = null;
  for (let i = 0; i < tries; i++) {
    last = await fetchStatus();
    if (last && ok(last)) return last;
    await new Promise((r) => setTimeout(r, 1500));
  }
  return last;
}

export async function claimReferral(ref: string): Promise<boolean> {
  if (!paymentsReady()) return false;
  try { return (await call<{ ok: boolean }>('/api/referral', { ref })).ok; } catch { return false; }
}

export const startParam = () => tg?.initDataUnsafe.start_param ?? '';
export const myRefCode = () => (tg?.initDataUnsafe.user ? `ref_${tg.initDataUnsafe.user.id}` : '');

/** Открывает окно «Поделиться» Telegram со ссылкой-приглашением. */
export function shareInvite(text: string): boolean {
  const code = myRefCode();
  if (!APP_LINK || !code || !tg?.openTelegramLink) return false;
  const link = `${APP_LINK}?startapp=${code}`;
  tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`);
  return true;
}
