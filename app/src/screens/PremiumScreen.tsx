import { useTgBack } from '../tg/telegram';
import { tg } from '../tg/telegram';
import { Icon } from '../components/Icon';
import { Skipper } from '../components/Skipper';

import { STAR_PREMIUM } from '../game/config';

export const PREMIUM_PRICE_STARS = STAR_PREMIUM.stars;

const PERKS: [string, string, string?][] = [
  ['lantern', 'Безлимитная энергия'],
  ['map', 'Все острова и все уровни A1–B2'],
  ['anchor', 'Ускоренное закрепление', 'Интервалы 1–2–4 дня вместо 1–3–7'],
  ['shell', '×2 ракушки за занятия'],
  ['flag', 'Эксклюзивный альбом штампов'],
];

export function PremiumScreen({ isPremium, until, onBack, onSubscribe, onDevToggle }: { isPremium: boolean; until: number; onBack: () => void; onSubscribe: () => void; onDevToggle: () => void }) {
  useTgBack(onBack);
  return (
    <main class="premium">
      <button class="link back" onClick={onBack}><Icon name="back" size={20} />Назад</button>
      <header class="premium-hero">
        <Skipper mood="proud" size={150} />
        <h1>Клуб капитанов</h1>
        <p>Плыви без ограничений</p>
      </header>
      <div class="card">
        {PERKS.map(([ico, title, sub]) => (
          <div class="perk"><span class="perk-ico"><Icon name={ico} /></span><span>{title}{sub && <small>{sub}</small>}</span></div>
        ))}
      </div>
      <div class="card price-card hint">
        <Icon name="star" size={20} />
        <span><b>{PREMIUM_PRICE_STARS} Telegram Stars в месяц.</b> Подписка продлевается автоматически, отменить можно в любой момент
        в настройках Telegram — доступ сохранится до конца оплаченного месяца.</span>
      </div>
      {isPremium ? (
        <div class="card member"><Icon name="crown" />Ты в клубе{until > 0 && ` до ${new Date(until).toLocaleDateString('ru-RU')}`}</div>
      ) : (
        <button class="btn gold" onClick={onSubscribe}><Icon name="star" size={20} />Вступить за {PREMIUM_PRICE_STARS} ⭐ в месяц</button>
      )}
      {!tg && import.meta.env.DEV && <button class="link" onClick={onDevToggle}>[dev] переключить Premium</button>}
    </main>
  );
}
