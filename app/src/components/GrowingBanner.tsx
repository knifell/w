import { Icon } from './Icon';

// Честная пометка: контент и сюжет дополняются.
export function GrowingBanner() {
  return (
    <div class="card banner">
      <span class="banner-ico"><Icon name="compass" /></span>
      <div>
        <b>Мир растёт</b>
        <div class="hint">Новые острова, слова и главы сюжета добавляются регулярно. Часть карты пока в тумане.</div>
      </div>
    </div>
  );
}
