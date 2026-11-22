export type Tab = 'map' | 'passport' | 'shop' | 'profile';
const TABS: [Tab, string, string][] = [['map', '🗺️', 'Карта'], ['passport', '📔', 'Паспорт'], ['shop', '🐚', 'Лавка'], ['profile', '🦀', 'Профиль']];

export function TabBar({ tab, onTab }: { tab: Tab; onTab: (t: Tab) => void }) {
  return (
    <nav class="tabbar">
      {TABS.map(([id, icon, label]) => (
        <button class={tab === id ? 'on' : ''} onClick={() => onTab(id)}><span>{icon}</span>{label}</button>
      ))}
    </nav>
  );
}
