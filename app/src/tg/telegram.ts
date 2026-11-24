// Тонкая обёртка над Telegram WebApp SDK. Работает и в обычном браузере (dev).
import { useEffect, useRef } from 'preact/hooks';
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
  setHeaderColor?(c: string): void;
  setBackgroundColor?(c: string): void;
  setBottomBarColor?(c: string): void;
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
  // Цвета у игры свои (фирменный стиль). Из Telegram берём только «светлая/тёмная»
  // и красим шапку и фон Telegram в цвет игры, чтобы не было полос.
  const root = document.documentElement;
  root.dataset.theme = tg?.colorScheme ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const bg = getComputedStyle(root).getPropertyValue('--tg-bg').trim();
  if (bg) {
    try { tg?.setHeaderColor?.(bg); tg?.setBackgroundColor?.(bg); tg?.setBottomBarColor?.(bg); } catch { /* старый клиент */ }
  }
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
  // Обработчик держим в ref: иначе на каждой перерисовке кнопка пряталась бы и показывалась снова (мигание).
  const ref = useRef(onBack);
  ref.current = onBack;
  const has = !!onBack;
  useEffect(() => {
    const bb = tg?.BackButton;
    if (!bb || !has) return;
    const click = () => ref.current?.();
    bb.onClick(click);
    bb.show();
    return () => { bb.offClick(click); bb.hide(); };
  }, [has]);
}
