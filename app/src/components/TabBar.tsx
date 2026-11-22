import { Icon } from './Icon';

export type Tab = 'map' | 'passport' | 'shop' | 'profile';
const TABS: [Tab, string, string][] = [['map', 'map', 'Карта'], ['passport', 'passport', 'Паспорт'], ['shop', 'stall', 'Лавка'], ['profile', 'crab', 'Профиль']];

export function TabBar({ tab, onTab }: { tab: Tab; onTab: (t: Tab) => void }) {
  return (
    <nav class="tabbar">
      {TABS.map(([id, icon, label]) => (
        <button class={tab === id ? 'on' : ''} aria-current={tab === id ? 'page' : undefined} onClick={() => onTab(id)}>
          <span class="tab-ico"><Icon name={icon} size={26} stroke={tab === id ? 2.3 : 2} /></span>{label}
        </button>
      ))}
    </nav>
  );
}
