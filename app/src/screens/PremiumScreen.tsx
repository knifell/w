import { tg } from '../tg/telegram';

export const PREMIUM_PRICE_STARS = 250;

export function PremiumScreen({ isPremium, onBack, onDevToggle }: { isPremium: boolean; onBack: () => void; onDevToggle: () => void }) {
  return (
    <main class="premium">
      <button class="link back" onClick={onBack}>← Назад</button>
      <div class="mascot">👑🦀</div>
      <h1>Клуб капитанов</h1>
      <div class="card">
        <div class="row">⚡ Безлимитная энергия</div>
        <div class="row">🗺️ Все острова и все уровни A1–B2</div>
        <div class="row">🧠 Ускоренное закрепление: интервалы 1–2–4 дня вместо 1–3–7</div>
        <div class="row">🐚 ×2 ракушки за занятия</div>
        <div class="row">🏴 Эксклюзивный альбом штампов</div>
      </div>
      <div class="card hint">
        {PREMIUM_PRICE_STARS} ⭐ Telegram Stars в месяц. Подписка продлевается автоматически, отменить можно в любой момент
        в настройках Telegram — доступ сохранится до конца оплаченного месяца.
      </div>
      {isPremium ? <div class="card">Ты уже в клубе 👑</div> : (
        <button class="btn gold" disabled>Оплата появится после подключения к Telegram</button>
      )}
      {!tg && import.meta.env.DEV && <button class="link" onClick={onDevToggle}>[dev] переключить Premium</button>}
    </main>
  );
}
