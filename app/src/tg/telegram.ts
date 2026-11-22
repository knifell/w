// Тонкая обёртка над Telegram WebApp SDK. Работает и в обычном браузере (dev).
import { useEffect } from 'preact/hooks';
import { setTrustedStart } from '../game/clock';
type HapticStyle = 'light' | 'medium' | 'heavy';
type Notify = 'error' | 'success' | 'warning';
interface TgWebApp {
  initData: string;
  initDataUnsafe: { user?: { id: number; first_name: string; language_code?: string }; auth_date?: number; start_param?: string };
  colorScheme: 'light' | 'dark';
  themeParams: Record<string, string>;
  ready(): void;
  expand(): void;
  onEvent(e: string, cb: () => void): void;
  HapticFeedback?: { impactOccurred(s: HapticStyle): void; notificationOccurred(t: Notify): void; selectionChanged?(): void };
  openInvoice?(url: string, cb: (status: 'paid' | 'cancelled' | 'failed' | 'pending') => void): void;
  openTelegramLink?(url: string): void;
  showConfirm?(msg: string, cb: (ok: boolean) => void): void;
  BackButton?: { show(): void; hide(): void; onClick(cb: () => void): void; offClick(cb: () => void): void };
}

// Вне Telegram скрипт тоже создаёт WebApp, но с пустым initData — считаем, что Telegram нет.
export const tg: TgWebApp | undefined = typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.initData
  ? (window as any).Telegram.WebApp
  : undefined;

export function initTelegram() {
  applyTheme();
  if (!tg) return;
  setTrustedStart(Number(tg.initDataUnsafe.auth_date) || 0);
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
  select: () => tg?.HapticFeedback?.selectionChanged?.(),
  reward: () => tg?.HapticFeedback?.impactOccurred('heavy'),
};

export const ask = (msg: string) =>
  new Promise<boolean>((res) => (tg?.showConfirm ? tg.showConfirm(msg, res) : res(confirm(msg))));

/** Системная кнопка «Назад» Telegram: показывается, пока экран открыт и обработчик задан. */
export function useTgBack(onBack?: () => void) {
  useEffect(() => {
    const bb = tg?.BackButton;
    if (!bb || !onBack) return;
    bb.onClick(onBack);
    bb.show();
    return () => { bb.offClick(onBack); bb.hide(); };
  }, [onBack]);
}
