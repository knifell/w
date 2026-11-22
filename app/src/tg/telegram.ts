// Тонкая обёртка над Telegram WebApp SDK. Работает и в обычном браузере (dev).
type HapticStyle = 'light' | 'medium' | 'heavy';
type Notify = 'error' | 'success' | 'warning';
interface TgWebApp {
  initData: string;
  initDataUnsafe: { user?: { id: number; first_name: string; language_code?: string } };
  colorScheme: 'light' | 'dark';
  themeParams: Record<string, string>;
  ready(): void;
  expand(): void;
  onEvent(e: string, cb: () => void): void;
  HapticFeedback?: { impactOccurred(s: HapticStyle): void; notificationOccurred(t: Notify): void };
  showConfirm?(msg: string, cb: (ok: boolean) => void): void;
  BackButton?: { show(): void; hide(): void; onClick(cb: () => void): void; offClick(cb: () => void): void };
}

export const tg: TgWebApp | undefined = (window as any).Telegram?.WebApp?.initData !== undefined
  ? (window as any).Telegram.WebApp
  : undefined;

export function initTelegram() {
  applyTheme();
  if (!tg) return;
  tg.ready();
  tg.expand();
  tg.onEvent('themeChanged', applyTheme);
}

function applyTheme() {
  const root = document.documentElement;
  const p = tg?.themeParams ?? {};
  const map: Record<string, string> = {
    bg_color: '--tg-bg', secondary_bg_color: '--tg-bg2', text_color: '--tg-text',
    hint_color: '--tg-hint', button_color: '--tg-accent', button_text_color: '--tg-accent-text',
  };
  for (const [k, v] of Object.entries(map)) if (p[k]) root.style.setProperty(v, p[k]);
  root.dataset.theme = tg?.colorScheme ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}

export const haptic = {
  tap: () => tg?.HapticFeedback?.impactOccurred('light'),
  ok: () => tg?.HapticFeedback?.notificationOccurred('success'),
  bad: () => tg?.HapticFeedback?.notificationOccurred('error'),
};

export const ask = (msg: string) =>
  new Promise<boolean>((res) => (tg?.showConfirm ? tg.showConfirm(msg, res) : res(confirm(msg))));
