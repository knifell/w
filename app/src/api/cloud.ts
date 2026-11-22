// Копия прогресса в облаке Telegram (CloudStorage): бесплатно, без своего сервера.
// Переживает переустановку и смену телефона. Лимиты Telegram: 1024 ключа, значение до 4096 символов.
import type { LocalState } from '../game/local';
import { emptyState, hasProgress, loadState, saveState, setSaveListener } from '../game/local';
import type { WordMem } from '../game/srs';
import { tg } from '../tg/telegram';

export interface KV {
  get(keys: string[]): Promise<Record<string, string>>;
  set(key: string, value: string): Promise<void>;
}

const CHUNK = 4000;
const META = 'meta';

/** Компактная запись: память слов — массивами, без лишних ключей. */
export function pack(s: LocalState): string {
  const mem: Record<string, number[]> = {};
  for (const [id, m] of Object.entries(s.mem)) mem[id] = [m.s, m.due, m.seen, m.wrong];
  return JSON.stringify({ ...s, mem, reports: s.reports.slice(-50) });
}

export function unpack(str: string): LocalState {
  const o = JSON.parse(str);
  const mem: Record<string, WordMem> = {};
  for (const [id, a] of Object.entries(o.mem ?? {}) as [string, number[]][]) mem[id] = { s: a[0], due: a[1], seen: a[2], wrong: a[3] };
  return { ...emptyState(), ...o, mem };
}

interface Meta { v: 1; slot: 'a' | 'b'; n: number; at: number }

async function readMeta(kv: KV): Promise<Meta | null> {
  try { return JSON.parse((await kv.get([META]))[META] || 'null'); } catch { return null; }
}

/** Пишет в свободный слот, потом переключает meta — недописанная копия никогда не станет текущей. */
export async function pushState(kv: KV, s: LocalState) {
  const meta = await readMeta(kv);
  const slot = meta?.slot === 'a' ? 'b' : 'a';
  const data = pack(s);
  const n = Math.max(1, Math.ceil(data.length / CHUNK));
  for (let i = 0; i < n; i++) await kv.set(`${slot}${i}`, data.slice(i * CHUNK, (i + 1) * CHUNK));
  await kv.set(META, JSON.stringify({ v: 1, slot, n, at: s.updatedAt } satisfies Meta));
}

export async function pullState(kv: KV): Promise<LocalState | null> {
  const meta = await readMeta(kv);
  if (!meta) return null;
  const keys = Array.from({ length: meta.n }, (_, i) => `${meta.slot}${i}`);
  const parts: Record<string, string> = {};
  for (let i = 0; i < keys.length; i += 20) Object.assign(parts, await kv.get(keys.slice(i, i + 20)));
  const s = unpack(keys.map((k) => parts[k] ?? '').join(''));
  s.updatedAt = meta.at;
  return s;
}

/** Что взять при запуске: облако, если на телефоне пусто или облачная копия новее. */
export function chooseOnStart(local: LocalState, remote: LocalState | null): 'remote' | 'local' {
  if (!remote) return 'local';
  if (!hasProgress(local) && hasProgress(remote)) return 'remote';
  return remote.updatedAt > local.updatedAt ? 'remote' : 'local';
}

interface TgCloud {
  setItem(k: string, v: string, cb?: (err: unknown, ok?: boolean) => void): void;
  getItems(keys: string[], cb: (err: unknown, values?: Record<string, string>) => void): void;
}

export function telegramKV(): KV | null {
  const cs = (tg as unknown as { CloudStorage?: TgCloud; isVersionAtLeast?: (v: string) => boolean } | undefined);
  if (!cs?.CloudStorage || (cs.isVersionAtLeast && !cs.isVersionAtLeast('6.9'))) return null;
  const c = cs.CloudStorage;
  return {
    get: (keys) => new Promise((res, rej) => c.getItems(keys, (e, v) => (e ? rej(e) : res(v ?? {})))),
    set: (k, v) => new Promise((res, rej) => c.setItem(k, v, (e) => (e ? rej(e) : res()))),
  };
}

/**
 * При запуске: подтянуть прогресс из облака (если он новее) и включить облачное сохранение.
 * Возвращает true, если состояние на телефоне заменено облачным.
 */
export async function startCloudSync(kv: KV | null = telegramKV()): Promise<boolean> {
  if (!kv) return false;
  let replaced = false;
  try {
    const local = loadState();
    const remote = await pullState(kv);
    if (chooseOnStart(local, remote) === 'remote' && remote) { saveState(remote, true); replaced = true; }
    else if (hasProgress(local)) await pushState(kv, local);
  } catch { /* облако недоступно — играем с копией на телефоне */ }
  let timer: ReturnType<typeof setTimeout> | undefined;
  let busy = false;
  setSaveListener(() => {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      if (busy) return;
      busy = true;
      try { await pushState(kv, loadState()); } catch { /* повторим при следующем сохранении */ }
      busy = false;
    }, 2000);
  });
  return replaced;
}
