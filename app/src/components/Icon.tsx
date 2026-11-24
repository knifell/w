// Набор иконок «Острова слов»: одна сетка 24×24, штрих 2px, скруглённые концы.
import type { JSX } from 'preact';

const P: Record<string, JSX.Element> = {
  chest: <><path d="M4 10.5a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4V19H4z" /><path d="M4 12h16M10.5 12v2.5h3V12" /></>,
  beacon: <><path d="M9.5 21 10.5 9h3l1 12M8 21h8M10 9V6.5h4V9M12 4v-1" /><path d="M6 6.5 3.5 5.5M18 6.5l2.5-1M6 9.5H3.5M18 9.5h2.5" /></>,
  storm: <><path d="M7 15.5a4.5 4.5 0 0 1-.4-9 5.5 5.5 0 0 1 10.6 1.4A3.8 3.8 0 0 1 17 15.5" /><path d="m12.5 12-2.5 4.5h4L11.5 21" /></>,
  heart: <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.4a4.3 4.3 0 0 1 7.5 2.4C19.5 15.4 12 20 12 20z" />,
  map: <><path d="M3.5 6.5 9 4.5l6 2 5.5-2v13l-5.5 2-6-2-5.5 2z" /><path d="M9 4.5v13M15 6.5v13" /></>,
  passport: <><rect x="5" y="3" width="14" height="18" rx="2.5" /><circle cx="12" cy="10.5" r="3.5" /><path d="M8.5 10.5h7M12 7c-1 1-1.4 2.2-1.4 3.5S11 13 12 14M9 17.5h6" /></>,
  stall: <><path d="M4 9.5 5.5 4h13L20 9.5a2.7 2.7 0 0 1-5.3 0 2.7 2.7 0 0 1-5.4 0 2.7 2.7 0 0 1-5.3 0z" /><path d="M5.5 12v8h13v-8M10 20v-4.5h4V20" /></>,
  crab: <><path d="M5.5 14.5a6.5 4.5 0 0 0 13 0c0-1.2-1-2.3-2.4-3H7.9c-1.4.7-2.4 1.8-2.4 3z" /><path d="M10 11.5V8.5M14 11.5V8.5" /><circle cx="10" cy="7" r="1.4" /><circle cx="14" cy="7" r="1.4" /><path d="M5.5 13C3.5 12.5 2.5 10.5 3.2 8.4l2.3 1.9M18.5 13c2-.5 3-2.5 2.3-4.6l-2.3 1.9M7 18l-2 2M17 18l2 2" /></>,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  back: <path d="M15 5 8 12l7 7" />,
  chevron: <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />,
  speaker: <><path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" /><path d="M15.5 9.2a4 4 0 0 1 0 5.6M18.2 6.6a7.6 7.6 0 0 1 0 10.8" /></>,
  eye: <><path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="3" /></>,
  lock: <><rect x="5.5" y="10.5" width="13" height="10" rx="2.5" /><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5M12 14.5v2" /></>,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  crown: <><path d="M4.5 17 3.5 8l4.8 3.6L12 5l3.7 6.6L20.5 8l-1 9z" /><path d="M5 20h14" /></>,
  book: <><path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5z" /><path d="M12 6.5v13" /></>,
  swords: <><path d="M4.5 4.5 15 15M19.5 4.5 9 15M13 17.5l4.5-4.5M6.5 13l4.5 4.5M16.2 16.2l3.3 3.3M7.8 16.2l-3.3 3.3" /></>,
  wind: <><path d="M3 9h10.5a3 3 0 1 0-3-3M3 15h14a3 3 0 1 1-3 3M3 12h6" /></>,
  ember: <><path d="m4.4 15.2 12.4-4.6a2 2 0 0 1 1.4 3.8L5.8 19a2 2 0 0 1-1.4-3.8z" /><path d="M13.5 8.5c0-2 2-3 2-5.2 1.6 1.5 2.6 3 2.6 4.6a2.3 2.3 0 0 1-4.6.6z" /></>,
  flask: <><path d="M9.5 3h5M10.5 3v4.2L6 16.3A3 3 0 0 0 8.7 21h6.6a3 3 0 0 0 2.7-4.7L13.5 7.2V3" /><path d="M7.4 14h9.2" /></>,
  compass: <><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5z" /></>,
  fog: <><path d="M6.5 14.5h10a3.6 3.6 0 0 0 .4-7.2 5.5 5.5 0 0 0-10.5 1.4 2.9 2.9 0 0 0 .1 5.8z" /><path d="M4 18h10M9 21h10" /></>,
  anchor: <><circle cx="12" cy="5" r="2" /><path d="M12 7v14M8 10.5h8M4.5 13.5a7.5 7.5 0 0 0 15 0M3 15l1.5-1.5L6 15M18 15l1.5-1.5L21 15" /></>,
  star: <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />,
  refresh: <><path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3L19.5 9" /><path d="M19.5 4.5V9H15" /></>,
  sparkle: <path d="m12 3 1.9 5.6L19.5 10.5l-5.6 1.9L12 18l-1.9-5.6-5.6-1.9 5.6-1.9z" />,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5.5M12 7.6v.1" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2.8v2M12 19.2v2M2.8 12h2M19.2 12h2M5.5 5.5l1.4 1.4M17.1 17.1l1.4 1.4M5.5 18.5l1.4-1.4M17.1 6.9l1.4-1.4" /></>,
  moon: <path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z" />,
  sail: <><path d="M12 3v14M12 4.5l6.5 11H12M10.5 7 6 15.5h4.5M3.5 18h17l-2.2 3H5.7z" /></>,
  palm: <><path d="M12.5 21c.4-4 .2-7.5-1-10.5" /><path d="M11.5 10.5C9.5 7.5 6 7 3.5 8.5c3 .3 5 1.4 6.3 3M11.5 10.5c1-3 4.5-4.5 8-3.5-2.8.6-4.7 1.9-5.8 3.8M11.5 10.5C11.8 7 10 4.5 7 3.5c1.3 2.2 2 4.3 1.8 6.8M3 21h18" /></>,
  flag: <path d="M6 21V4M6 4.5h11l-2.5 4 2.5 4H6" />,
  flame: <path d="M12 21a6 6 0 0 0 6-6c0-4.4-4-6.3-5-11.5-2 2.3-2.4 4.7-2 7-1.2-.5-2-1.6-2.3-3C7.2 9 6 10.9 6 15a6 6 0 0 0 6 6z" />,
  shell: <><path d="M12 20.5 4 11.2a8.4 8.4 0 0 1 16 0z" /><path d="M12 20.5 8 4.6M12 20.5V3.3M12 20.5l4-15.9M12 20.5 5.3 7.2M12 20.5l6.7-13.3" /></>,
  lantern: <><circle cx="12" cy="3.4" r="1.3" /><path d="M8.2 7.5h7.6L14.4 5H9.6zM7.5 7.5h9v11a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2zM12 11.2c1 1.2 1.6 2 1.6 2.9a1.6 1.6 0 0 1-3.2 0c0-.9.6-1.7 1.6-2.9z" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  gift: <><rect x="4" y="9" width="16" height="11.5" rx="2" /><path d="M3 9h18M12 9v11.5M12 9C10.5 5.5 7 5 7 7s3 2 5 2zM12 9c1.5-3.5 5-4 5-2s-3 2-5 2z" /></>,
};

export type IconName = keyof typeof P;

interface Props { name: string; size?: number; class?: string; stroke?: number }

export function Icon({ name, size = 24, class: cls, stroke = 2 }: Props) {
  return (
    <svg class={'ico' + (cls ? ' ' + cls : '')} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width={stroke} stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      {P[name] ?? P.sparkle}
    </svg>
  );
}

/* Цветные значки ресурсов в верхней панели и итогах. */
export function Flame({ size = 22, out = false }: { size?: number; out?: boolean }) {
  return (
    <svg class={'res-ico' + (out ? ' out' : '')} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="var(--fire)" d="M12 22a7 7 0 0 0 7-7c0-5-4.5-7.2-5.7-13-2.4 2.6-2.8 5.4-2.3 8-1.4-.6-2.3-1.8-2.7-3.4C6.4 8.4 5 10.6 5 15a7 7 0 0 0 7 7z" />
      <path fill="var(--fire-core)" d="M12 21a3.6 3.6 0 0 0 3.6-3.6c0-2.6-2.2-3.6-2.9-6.4-1.6 1.6-1.7 3-1.4 4.4-.8-.2-1.4-.8-1.7-1.6-.8.9-1.2 2-1.2 3.6A3.6 3.6 0 0 0 12 21z" />
    </svg>
  );
}

export function Shell({ size = 22 }: { size?: number }) {
  return (
    <svg class="res-ico" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="var(--shell)" d="M12 21.5 3.2 11.2a8.9 8.9 0 0 1 17.6 0z" />
      <path fill="none" stroke="var(--shell-rib)" stroke-width="1.4" stroke-linecap="round" d="M12 21 8 4.8M12 21V3.4M12 21l4-16.2M12 21 5.2 7.4M12 21l6.8-13.6" />
      <path fill="var(--shell-rib)" d="M9.6 19.4h4.8L12 22.2z" />
    </svg>
  );
}

export function Lantern({ size = 22, lit = true }: { size?: number; lit?: boolean }) {
  return (
    <svg class="res-ico" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="none" stroke="var(--lantern-metal)" stroke-width="1.8" d="M12 1.8a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2z" />
      <path fill="var(--lantern-metal)" d="M7.6 7.6h8.8L14.8 4.8H9.2z" />
      <rect x="7" y="7.6" width="10" height="12" rx="2.2" fill={lit ? 'var(--lantern-glow)' : 'var(--lantern-off)'} />
      <path fill={lit ? 'var(--fire)' : 'var(--lantern-metal)'} d="M12 10.4c1.3 1.5 2 2.5 2 3.6a2 2 0 0 1-4 0c0-1.1.7-2.1 2-3.6z" />
      <rect x="6.4" y="19" width="11.2" height="2.6" rx="1.3" fill="var(--lantern-metal)" />
    </svg>
  );
}
