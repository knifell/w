// Проверка initData из Telegram Mini App: подпись HMAC-SHA256 ключом, выведенным из токена бота.
// https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
const enc = new TextEncoder();

async function hmac(key: BufferSource, data: string): Promise<ArrayBuffer> {
  const k = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return crypto.subtle.sign('HMAC', k, enc.encode(data));
}
const hex = (b: ArrayBuffer) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');

/** Строка для проверки: все поля, кроме hash, отсортированы, через перевод строки. */
export function dataCheckString(initData: string): { check: string; hash: string | null; params: URLSearchParams } {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  params.delete('hash');
  const check = [...params.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)).map(([k, v]) => `${k}=${v}`).join('\n');
  return { check, hash, params };
}

export async function signInitData(fields: Record<string, string>, botToken: string): Promise<string> {
  const p = new URLSearchParams(fields);
  const { check } = dataCheckString(p.toString());
  const secret = await hmac(enc.encode("WebAppData") as Uint8Array<ArrayBuffer>, botToken);
  p.set('hash', hex(await hmac(secret, check)));
  return p.toString();
}

export interface TgUser { id: number; first_name?: string; last_name?: string; username?: string }

/** Возвращает пользователя, если подпись верна и данные не старше maxAgeSec. */
export async function verifyInitData(initData: string, botToken: string, nowSec: number, maxAgeSec = 86400): Promise<TgUser | null> {
  if (!initData || !botToken) return null;
  const { check, hash, params } = dataCheckString(initData);
  if (!hash) return null;
  const secret = await hmac(enc.encode("WebAppData") as Uint8Array<ArrayBuffer>, botToken);
  const calc = hex(await hmac(secret, check));
  if (calc.length !== hash.length) return null;
  let diff = 0;
  for (let i = 0; i < calc.length; i++) diff |= calc.charCodeAt(i) ^ hash.charCodeAt(i);
  if (diff !== 0) return null;
  const authDate = Number(params.get('auth_date'));
  if (!authDate || nowSec - authDate > maxAgeSec) return null;
  try {
    const user = JSON.parse(params.get('user') ?? 'null');
    return user && typeof user.id === 'number' ? user : null;
  } catch { return null; }
}
