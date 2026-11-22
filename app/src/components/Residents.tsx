// Жители островов: у каждого из 6 островов архипелага свой персонаж. Свои рисунки (SVG), без чужих персонажей.
import type { JSX } from 'preact';

export interface Resident { name: string; line: string }

/** По номеру острова (1–6): имя и реплика при встрече. */
export const RESIDENTS: Resident[] = [
  { name: 'Черепаха Мира', line: 'Я живу здесь сто лет и знаю: слова любят, когда их повторяют. Не спеши!' },
  { name: 'Чайка Кира', line: 'Я летаю над всеми островами и подслушиваю разговоры моряков. Учи, пригодится!' },
  { name: 'Осьминог Окто', line: 'У меня восемь рук, и каждая держит новое слово. Сколько удержишь ты?' },
  { name: 'Тюлень Бо', line: 'Ошибаться не страшно. Я тоже сначала плавал хуже всех!' },
  { name: 'Попугай Риф', line: 'Повторяй за мной! Повторяй за мной! Так слова и запоминаются.' },
  { name: 'Кит Гром', line: 'Ты уже далеко заплыл. Вижу горизонт — дальше будет ещё интереснее.' },
];

export const residentOf = (island: number): Resident => RESIDENTS[(island - 1) % RESIDENTS.length];

const OUT = '#14263a';
const eyes = (x1: number, x2: number, y: number, r = 6) => (
  <g>
    <circle cx={x1} cy={y} r={r} fill="#fff" stroke={OUT} stroke-width="2" /><circle cx={x2} cy={y} r={r} fill="#fff" stroke={OUT} stroke-width="2" />
    <circle cx={x1 + 1.2} cy={y + 0.8} r={r * 0.45} fill={OUT} /><circle cx={x2 + 1.2} cy={y + 0.8} r={r * 0.45} fill={OUT} />
  </g>
);

const ART: (() => JSX.Element)[] = [
  // 1. Черепаха
  () => (
    <g stroke={OUT} stroke-width="2.5" stroke-linejoin="round">
      <ellipse cx="34" cy="92" rx="10" ry="7" fill="#7cc576" /><ellipse cx="86" cy="92" rx="10" ry="7" fill="#7cc576" />
      <path d="M22 84c0-26 18-40 38-40s38 14 38 40z" fill="#3f9a5a" />
      <path d="M40 60l20-8 20 8-4 20H44z" fill="#5dbb6e" />
      <path d="M22 84h76" fill="none" />
      <circle cx="60" cy="40" r="17" fill="#7cc576" />
      {eyes(53, 67, 37, 5.5)}
      <path d="M54 48q6 5 12 0" fill="none" stroke-linecap="round" />
    </g>
  ),
  // 2. Чайка
  () => (
    <g stroke={OUT} stroke-width="2.5" stroke-linejoin="round">
      <path d="M46 100l-4 10M74 100l4 10" stroke="#f2a33a" stroke-width="4" stroke-linecap="round" />
      <ellipse cx="60" cy="74" rx="28" ry="26" fill="#fff" />
      <path d="M36 70c-14 2-22 12-24 22 14-2 24-8 30-16z" fill="#b8c7d1" />
      <path d="M84 70c14 2 22 12 24 22-14-2-24-8-30-16z" fill="#b8c7d1" />
      <circle cx="60" cy="40" r="18" fill="#fff" />
      {eyes(53, 67, 37, 5)}
      <path d="M54 46l6 10 6-10z" fill="#ffc83d" />
    </g>
  ),
  // 3. Осьминог
  () => (
    <g stroke={OUT} stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">
      {[24, 38, 52, 68, 82, 96].map((x, i) => (
        <path d={`M${x} 78c${i % 2 ? 6 : -6} 12 ${i % 2 ? -4 : 4} 22 ${i % 2 ? 4 : -4} 30`} fill="none" stroke="#8a5bd6" stroke-width="9" />
      ))}
      <path d="M26 78c0-30 15-48 34-48s34 18 34 48z" fill="#a77ae8" />
      {eyes(50, 70, 58, 7)}
      <circle cx="44" cy="44" r="4" fill="#c9a8f5" stroke="none" /><circle cx="76" cy="46" r="3" fill="#c9a8f5" stroke="none" />
      <path d="M54 70q6 4 12 0" fill="none" />
    </g>
  ),
  // 4. Тюлень
  () => (
    <g stroke={OUT} stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">
      <path d="M24 104c4-30 16-52 36-52s32 22 36 52z" fill="#9aaab6" />
      <path d="M28 98c-10 0-14 6-12 10 8 0 14-2 18-6zM92 98c10 0 14 6 12 10-8 0-14-2-18-6z" fill="#7f909c" />
      <circle cx="60" cy="44" r="22" fill="#a9b8c3" />
      {eyes(51, 69, 40, 5.5)}
      <ellipse cx="60" cy="51" rx="5" ry="3.5" fill={OUT} />
      <path d="M48 54h-12M48 57l-11 4M72 54h12M72 57l11 4" fill="none" stroke-width="1.8" />
    </g>
  ),
  // 5. Попугай
  () => (
    <g stroke={OUT} stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">
      <path d="M54 100l-6 14h10zM66 100l6 14h-10z" fill="#2f9be0" />
      <ellipse cx="60" cy="76" rx="22" ry="28" fill="#e8463b" />
      <path d="M40 74c-8 8-8 22 0 30 6-8 8-20 4-30zM80 74c8 8 8 22 0 30-6-8-8-20-4-30z" fill="#3fb56f" />
      <circle cx="60" cy="40" r="18" fill="#e8463b" />
      <path d="M50 22c4-8 12-10 18-6-6 0-10 2-12 6z" fill="#ffc83d" />
      {eyes(53, 67, 38, 5)}
      <path d="M58 44c8-2 12 4 8 10-2-4-5-6-8-6z" fill="#ffc83d" />
    </g>
  ),
  // 6. Кит
  () => (
    <g stroke={OUT} stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">
      <path d="M58 30c-4-8-12-10-16-8M62 30c4-8 12-10 16-8M60 32V18" fill="none" stroke="#7fd0f5" stroke-width="3" />
      <path d="M14 76c0-24 20-40 46-40s46 16 46 34c0 10 6 16 10 20-8 2-14 0-18-4-8 14-22 22-38 22-26 0-46-12-46-32z" fill="#3b8fd8" />
      <path d="M22 88c10 12 24 18 38 18s26-6 32-14" fill="#a8d6f7" />
      {eyes(46, 62, 66, 5.5)}
      <path d="M44 80q10 6 20 0" fill="none" />
    </g>
  ),
];

export function ResidentArt({ island, size = 96 }: { island: number; size?: number }) {
  const Art = ART[(island - 1) % ART.length];
  return (
    <svg class="resident" width={size} height={size} viewBox="0 0 120 120" aria-hidden="true">
      <ellipse cx="60" cy="114" rx="34" ry="4" fill="#0b2233" opacity=".12" />
      <Art />
    </svg>
  );
}
