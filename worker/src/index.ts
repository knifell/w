// Сервер покупок «Острова слов» для Cloudflare Workers (бесплатный тариф).
// Только оплата Stars и бонусы за друзей; весь остальной прогресс живёт у игрока и в облаке Telegram.
//
// Маршруты:
//   POST /api/status   {initData}            → покупки игрока, срок подписки, приглашённые друзья
//   POST /api/invoice  {initData, item}      → ссылка на счёт Telegram Stars (цена — только из каталога)
//   POST /api/referral {initData, ref}       → новичок пришёл по ссылке друга
//   POST /bot                                 ← вебхук Telegram (pre_checkout_query, successful_payment, refunded_payment, /start)
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

export async function handleStatus(env: Env, uid: number) {
  await markSeen(env, uid);
  await trackFriend(env, uid);
  const purchases = await readJson<StoredPurchase[]>(`pays:${uid}`, env.DB, []);
  const premiumUntil = Number(await env.DB.get(`prem:${uid}`)) || 0;
  const referrals = await readJson<{ id: string; at: number }[]>(`refs:${uid}`, env.DB, []);
  return {
    purchases: purchases.map(({ id, item, at, refunded }) => ({ id, item, at, refunded })),
    premiumUntil, referrals,
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
  // 5) /start — кнопка, открывающая игру.
  if (cmd === '/start' && env.APP_URL) {
    await tgApi(env, 'sendMessage', {
      chat_id: msg.chat.id,
      text: 'Привет! Я Шкипер. Поплыли учить английский 🦀',
      reply_markup: { inline_keyboard: [[{ text: 'Открыть игру', web_app: { url: env.APP_URL } }]] },
    });
  }
}

export async function setupBot(env: Env, origin: string) {
  const r: Record<string, unknown> = {};
  r.webhook = await tgApi(env, 'setWebhook', {
    url: `${origin}/bot`, secret_token: env.WEBHOOK_SECRET,
    allowed_updates: ['message', 'pre_checkout_query'], drop_pending_updates: true,
  });
  r.commands = await tgApi(env, 'setMyCommands', { commands: [
    { command: 'start', description: 'Открыть игру' },
    { command: 'paysupport', description: 'Помощь с оплатой' },
    { command: 'terms', description: 'Условия' },
  ] });
  if (env.APP_URL) r.menu = await tgApi(env, 'setChatMenuButton', { menu_button: { type: 'web_app', text: 'Играть', web_app: { url: env.APP_URL } } });
  r.description = await tgApi(env, 'setMyDescription', { description:
    'Остров слов — игра для изучения английского. Каждый день короткий урок: новые слова, задания, повторение по интервалам. Острова от A1 до B2, костёр серии дней, друзья и штампы. Нажмите «Играть»!' });
  r.short = await tgApi(env, 'setMyShortDescription', { short_description: 'Учим английский играя: острова слов от A1 до B2 🦀' });
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
    if (url.pathname === '/api/status') return json(await handleStatus(env, a.user.id));
    if (url.pathname === '/api/invoice') return json(await handleInvoice(env, a.user.id, String(a.body.item ?? '')));
    if (url.pathname === '/api/referral') return json(await handleReferral(env, a.user.id, String(a.body.ref ?? '')));
    return json({ error: 'not found' }, 404);
  },
};
