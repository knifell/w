// Сервер покупок «Острова слов» для Cloudflare Workers (бесплатный тариф).
// Только оплата Stars и бонусы за друзей; весь остальной прогресс живёт у игрока и в облаке Telegram.
//
// Маршруты:
//   POST /api/status   {initData}            → покупки игрока, срок подписки, приглашённые друзья
//   POST /api/invoice  {initData, item}      → ссылка на счёт Telegram Stars (цена — только из каталога)
//   POST /api/referral {initData, ref}       → новичок пришёл по ссылке друга
//   POST /bot                                 ← вебхук Telegram (pre_checkout_query, successful_payment, refunded_payment, /paysupport, /terms)
import shop from '../../content/shop.json';
import { verifyInitData, type TgUser } from './auth';

export interface KVLike {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
}
export interface Env {
  DB: KVLike;               // KV-хранилище
  BOT_TOKEN: string;        // секрет: токен бота от @BotFather
  WEBHOOK_SECRET: string;   // секрет: случайная строка, та же, что в setWebhook
  APP_URL: string;          // адрес Mini App (Cloudflare Pages)
  ADMIN_IDS?: string;       // Telegram id админов через запятую
  SUPPORT_CONTACT?: string; // контакт поддержки для /paysupport и /terms (например @username)
}

interface StoredPurchase { id: string; item: string; at: number; stars: number; refunded?: boolean }

const PREMIUM = shop.stars.premium;
const PACKS = shop.stars.packs;
const REF = shop.stars.referral;
const utcDay = (ms = Date.now()) => Math.floor(ms / 86400000);

/** Товар из каталога: цена и описание берутся только отсюда, клиенту не доверяем. */
export function catalogItem(id: string) {
  if (id === PREMIUM.id) return { id, title: PREMIUM.title, desc: PREMIUM.desc, stars: PREMIUM.stars, subscription: true };
  const p = PACKS.find((x) => x.id === id);
  return p ? { id, title: p.title, desc: p.desc, stars: p.stars, subscription: false } : null;
}

const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'content-type',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...cors } });

async function readJson<T>(key: string, db: KVLike, fallback: T): Promise<T> {
  const v = await db.get(key);
  if (!v) return fallback;
  try { return JSON.parse(v) as T; } catch { return fallback; }
}

async function tgApi(env: Env, method: string, body: unknown): Promise<any> {
  const r = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
  });
  return r.json();
}

async function auth(req: Request, env: Env): Promise<{ user: TgUser; body: any } | null> {
  let body: any;
  try { body = await req.json(); } catch { return null; }
  const user = await verifyInitData(String(body?.initData ?? ''), env.BOT_TOKEN, Math.floor(Date.now() / 1000));
  return user ? { user, body } : null;
}

async function markSeen(env: Env, uid: number) {
  if (!(await env.DB.get(`seen:${uid}`))) await env.DB.put(`seen:${uid}`, String(Date.now()));
}

/** Друг засчитывается пригласившему, только когда позанимался в REF.friendActiveDays разных дней. */
async function trackFriend(env: Env, uid: number) {
  const inviter = await env.DB.get(`refby:${uid}`);
  if (!inviter || (await env.DB.get(`refq:${uid}`))) return;
  const days = await readJson<number[]>(`rday:${uid}`, env.DB, []);
  const today = utcDay();
  if (days.includes(today)) return;
  days.push(today);
  if (days.length < REF.friendActiveDays) { await env.DB.put(`rday:${uid}`, JSON.stringify(days)); return; }
  await env.DB.put(`refq:${uid}`, '1');
  const list = await readJson<{ id: string; at: number }[]>(`refs:${inviter}`, env.DB, []);
  if (list.length < REF.maxRewardedFriends && !list.some((x) => x.id === String(uid))) {
    list.push({ id: String(uid), at: Date.now() });
    await env.DB.put(`refs:${inviter}`, JSON.stringify(list));
  }
}

// ---------- Админка ----------
export interface Grant { id: string; at: number; coins?: number; items?: Record<string, number>; premiumDays?: number; note?: string }
interface UserCard { id: number; name: string; username?: string; at: number }

export const isAdmin = (env: Env, uid: number) => (env.ADMIN_IDS ?? '').split(',').map((x) => x.trim()).includes(String(uid));

/** Запоминает игрока (имя, @ник), чтобы админ мог найти его. Пишет в KV только при первом входе или смене данных. */
async function rememberUser(env: Env, u: TgUser) {
  const card: UserCard = { id: u.id, name: [u.first_name, u.last_name].filter(Boolean).join(' ') || 'Игрок', username: u.username, at: Date.now() };
  const old = await readJson<UserCard | null>(`user:${u.id}`, env.DB, null);
  if (old && old.name === card.name && old.username === card.username) return;
  await env.DB.put(`user:${u.id}`, JSON.stringify(card));
  if (card.username) await env.DB.put(`uname:${card.username.toLowerCase()}`, String(u.id));
  const list = await readJson<UserCard[]>('users', env.DB, []);
  await env.DB.put('users', JSON.stringify([card, ...list.filter((x) => x.id !== u.id)].slice(0, 300)));
}

async function findUser(env: Env, q: string): Promise<number | null> {
  const t = q.trim().replace(/^@/, '');
  if (/^\d+$/.test(t)) return Number(t);
  const id = await env.DB.get(`uname:${t.toLowerCase()}`);
  return id ? Number(id) : null;
}

export async function handleAdmin(env: Env, path: string, body: any) {
  if (path === '/api/admin/users') return { users: await readJson<UserCard[]>('users', env.DB, []) };
  const uid = await findUser(env, String(body.q ?? body.to ?? ''));
  if (!uid) return { error: 'Игрок не найден. Он должен хоть раз открыть игру.' };
  if (path === '/api/admin/find') {
    return {
      user: await readJson<UserCard | null>(`user:${uid}`, env.DB, null) ?? { id: uid, name: 'Игрок', at: 0 },
      premiumUntil: Number(await env.DB.get(`prem:${uid}`)) || 0,
      purchases: await readJson<StoredPurchase[]>(`pays:${uid}`, env.DB, []),
      grants: await readJson<Grant[]>(`grants:${uid}`, env.DB, []),
    };
  }
  if (path === '/api/admin/grant') {
    const g: Grant = { id: crypto.randomUUID(), at: Date.now() };
    const coins = Math.trunc(Number(body.coins) || 0);
    if (coins) g.coins = Math.max(-1_000_000, Math.min(1_000_000, coins));
    const items: Record<string, number> = {};
    for (const [k, v] of Object.entries(body.items ?? {})) { const n = Math.trunc(Number(v) || 0); if (n && /^[a-z_]{1,24}$/.test(k)) items[k] = Math.max(-99, Math.min(99, n)); }
    if (Object.keys(items).length) g.items = items;
    const days = Math.trunc(Number(body.premiumDays) || 0);
    if (days) {
      g.premiumDays = Math.max(-3650, Math.min(3650, days));
      const cur = Number(await env.DB.get(`prem:${uid}`)) || 0;
      await env.DB.put(`prem:${uid}`, String(Math.max(Date.now(), cur) + g.premiumDays * 86400000));
    }
    if (typeof body.note === 'string' && body.note) g.note = body.note.slice(0, 100);
    if (!g.coins && !g.items && !g.premiumDays) return { error: 'Нечего выдавать' };
    const list = await readJson<Grant[]>(`grants:${uid}`, env.DB, []);
    list.push(g);
    await env.DB.put(`grants:${uid}`, JSON.stringify(list.slice(-200)));
    return { ok: true, grant: g, to: uid };
  }
  return { error: 'not found' };
}

export async function handleStatus(env: Env, uid: number, user?: TgUser) {
  await markSeen(env, uid);
  if (user) await rememberUser(env, user);
  await trackFriend(env, uid);
  const purchases = await readJson<StoredPurchase[]>(`pays:${uid}`, env.DB, []);
  const premiumUntil = Number(await env.DB.get(`prem:${uid}`)) || 0;
  const referrals = await readJson<{ id: string; at: number }[]>(`refs:${uid}`, env.DB, []);
  return {
    purchases: purchases.map(({ id, item, at, refunded }) => ({ id, item, at, refunded })),
    premiumUntil, referrals,
    grants: await readJson<Grant[]>(`grants:${uid}`, env.DB, []),
    admin: isAdmin(env, uid),
  };
}

export async function handleInvoice(env: Env, uid: number, itemId: string) {
  const item = catalogItem(itemId);
  if (!item) return { error: 'unknown item' };
  const res = await tgApi(env, 'createInvoiceLink', {
    title: item.title,
    description: item.desc,
    payload: JSON.stringify({ u: uid, i: item.id }),
    currency: 'XTR',
    prices: [{ label: item.title, amount: item.stars }],
    ...(item.subscription ? { subscription_period: 2592000 } : {}),
  });
  return res?.ok ? { link: res.result as string } : { error: 'invoice failed' };
}

export async function handleReferral(env: Env, uid: number, ref: string) {
  const inviter = /^ref_(\d{1,20})$/.exec(ref)?.[1];
  if (!inviter || inviter === String(uid)) return { ok: false };
  if (await env.DB.get(`seen:${uid}`)) return { ok: false }; // уже играл раньше — не новичок
  await env.DB.put(`seen:${uid}`, String(Date.now()));
  await env.DB.put(`refby:${uid}`, inviter);                 // пригласившему — позже, когда друг позанимается 2 дня
  await env.DB.put(`rday:${uid}`, JSON.stringify([utcDay()]));
  return { ok: true };
}

function parsePayload(s: string): { u: number; i: string } | null {
  try { const o = JSON.parse(s); return typeof o?.u === 'number' && typeof o?.i === 'string' ? o : null; } catch { return null; }
}

export async function handleUpdate(env: Env, update: any) {
  // 1) Перед оплатой Telegram спрашивает, можно ли провести платёж. Проверяем товар и сумму.
  if (update.pre_checkout_query) {
    const q = update.pre_checkout_query;
    const p = parsePayload(q.invoice_payload);
    const item = p && catalogItem(p.i);
    const ok = !!item && q.currency === 'XTR' && q.total_amount === item.stars && p!.u === q.from?.id;
    await tgApi(env, 'answerPreCheckoutQuery', ok
      ? { pre_checkout_query_id: q.id, ok: true }
      : { pre_checkout_query_id: q.id, ok: false, error_message: 'Товар недоступен. Попробуйте ещё раз из приложения.' });
    return;
  }
  const msg = update.message;
  if (!msg) return;
  // 2) Платёж прошёл: записываем покупку (без дублей по id платежа).
  if (msg.successful_payment) {
    const sp = msg.successful_payment;
    const p = parsePayload(sp.invoice_payload);
    const item = p && catalogItem(p.i);
    if (!p || !item) return;
    const key = `pays:${p.u}`;
    const list = await readJson<StoredPurchase[]>(key, env.DB, []);
    if (!list.some((x) => x.id === sp.telegram_payment_charge_id)) {
      list.push({ id: sp.telegram_payment_charge_id, item: item.id, at: Date.now(), stars: sp.total_amount });
      await env.DB.put(key, JSON.stringify(list));
    }
    if (item.subscription) {
      const until = sp.subscription_expiration_date ? sp.subscription_expiration_date * 1000 : Date.now() + PREMIUM.periodDays * 86400000;
      const cur = Number(await env.DB.get(`prem:${p.u}`)) || 0;
      await env.DB.put(`prem:${p.u}`, String(Math.max(cur, until)));
    }
    return;
  }
  // 3) Возврат звёзд: помечаем покупку, подписку прекращаем.
  if (msg.refunded_payment) {
    const rp = msg.refunded_payment;
    const p = parsePayload(rp.invoice_payload);
    if (!p) return;
    const key = `pays:${p.u}`;
    const list = await readJson<StoredPurchase[]>(key, env.DB, []);
    const hit = list.find((x) => x.id === rp.telegram_payment_charge_id);
    if (hit && !hit.refunded) {
      hit.refunded = true;
      await env.DB.put(key, JSON.stringify(list));
      if (hit.item === PREMIUM.id) await env.DB.put(`prem:${p.u}`, String(Date.now()));
    }
    return;
  }
  // Видео/файлы от админа (или от любого, пока админ не назначен) — в «почтовый ящик» KV, чтобы забрать через getFile.
  const media = msg.video ?? msg.document ?? msg.animation ?? msg.video_note;
  if (media?.file_id && (!env.ADMIN_IDS || isAdmin(env, msg.from?.id))) {
    const inbox = await readJson<unknown[]>('inbox', env.DB, []);
    inbox.unshift({ file_id: media.file_id, name: media.file_name ?? '', size: media.file_size ?? 0, from: msg.from?.id, at: Date.now() });
    await env.DB.put('inbox', JSON.stringify(inbox.slice(0, 20)));
    await tgApi(env, 'sendMessage', { chat_id: msg.chat.id, text: 'Видео получено ✔' });
    return;
  }
  // 4) /paysupport и /terms — их требуют правила Telegram для оплаты звёздами.
  const cmd = typeof msg.text === 'string' ? msg.text.split(/[\s@]/)[0] : '';
  const contact = env.SUPPORT_CONTACT ? ` Пишите: ${env.SUPPORT_CONTACT}.` : '';
  if (cmd === '/paysupport') {
    await tgApi(env, 'sendMessage', { chat_id: msg.chat.id, text:
      'Помощь с оплатой. Опишите, что купили, когда и что пошло не так.' + contact +
      ' Если покупка не пришла в игру, мы проверим платёж и при ошибке вернём звёзды. Telegram не помогает с покупками в ботах — по оплате обращайтесь только к нам.' });
    return;
  }
  if (cmd === '/terms') {
    await tgApi(env, 'sendMessage', { chat_id: msg.chat.id, text:
      'Условия «Острова слов».\n' +
      '• Игра бесплатная. За звёзды Telegram можно купить ракушки (внутриигровая валюта) и Premium (подписка на месяц, продлевается сама, отменить можно в любой момент в настройках Telegram).\n' +
      '• Покупки — цифровые товары, начисляются сразу. Возврат — по запросу в /paysupport, если покупка не пришла или была ошибка.\n' +
      '• Прогресс хранится на вашем телефоне и в облаке Telegram. Мы храним только список покупок и приглашённых друзей по вашему Telegram id.\n' +
      '• Ракушки и Premium нельзя обменять на деньги или передать другому.' + contact });
    return;
  }
  // /start ничего не отвечает: в боте только мини-приложение (кнопка «Играть» в меню).
}

export async function setupBot(env: Env, origin: string) {
  const r: Record<string, unknown> = {};
  r.webhook = await tgApi(env, 'setWebhook', {
    url: `${origin}/bot`, secret_token: env.WEBHOOK_SECRET,
    allowed_updates: ['message', 'pre_checkout_query'], drop_pending_updates: true,
  });
  // Список команд пустой: /paysupport и /terms работают, но в меню не показываются.
  r.commands = await tgApi(env, 'deleteMyCommands', {});
  if (env.APP_URL) r.menu = await tgApi(env, 'setChatMenuButton', { menu_button: { type: 'web_app', text: 'Играть', web_app: { url: env.APP_URL } } });
  r.name = await tgApi(env, 'setMyName', { name: 'Остров слов | English' });
  r.description = await tgApi(env, 'setMyDescription', { description:
    'Остров слов — английский как игра.\n\n🎯 Тест подберёт уровень A1–B2\n🔊 Новые слова с озвучкой\n⚡ Короткие задания на скорость\n🏝️ Открывай новые острова\n🔥 Держи серию дней и собирай ачивки\n\nЖми «Играть» 👇' });
  r.short = await tgApi(env, 'setMyShortDescription', { short_description: 'Английский без зубрёжки 🏝️ 5 минут в день. Бесплатно.' });
  return r;
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (req.method !== 'POST') return json({ error: 'not found' }, 404);

    if (url.pathname === '/bot') {
      if (req.headers.get('x-telegram-bot-api-secret-token') !== env.WEBHOOK_SECRET) return new Response('forbidden', { status: 403 });
      try { await handleUpdate(env, await req.json()); } catch { /* Telegram повторит, если вернуть ошибку; отвечаем 200 */ }
      return new Response('ok');
    }

    // Разовая настройка бота (вебхук, команды, кнопка меню, описание) — чтобы токен бота не покидал сервер.
    if (url.pathname === '/setup') {
      if (!env.WEBHOOK_SECRET || req.headers.get('x-setup-secret') !== env.WEBHOOK_SECRET) return new Response('forbidden', { status: 403 });
      return json(await setupBot(env, url.origin));
    }

    const a = await auth(req, env);
    if (!a) return json({ error: 'unauthorized' }, 401);
    if (url.pathname === '/api/status') return json(await handleStatus(env, a.user.id, a.user));
    if (url.pathname.startsWith('/api/admin/')) {
      if (!isAdmin(env, a.user.id)) return json({ error: 'forbidden' }, 403);
      return json(await handleAdmin(env, url.pathname, a.body));
    }
    if (url.pathname === '/api/invoice') return json(await handleInvoice(env, a.user.id, String(a.body.item ?? '')));
    if (url.pathname === '/api/referral') return json(await handleReferral(env, a.user.id, String(a.body.ref ?? '')));
    return json({ error: 'not found' }, 404);
  },
};
