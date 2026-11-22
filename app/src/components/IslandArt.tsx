// Иллюстрации островов для карты: 6 сцен по номеру острова. Цвета задаются CSS-переменными (--i-*).
import type { JSX } from 'preact';
const BASE = 'M34 104C52 82 104 70 160 70s108 12 126 34c-28 12-74 16-126 16S62 116 34 104z';

function Palm({ x, y, s = 1, flip = false }: { x: number; y: number; s?: number; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <path d="M0 0C2-16 2-30 6-46" fill="none" stroke="var(--i-wood)" stroke-width="5" stroke-linecap="round" />
      <path fill="var(--i-leaf-deep)" d="M6-46c-10-8-24-8-32 1 10-3 21-2 32-1zM6-46c10-8 24-8 32 1-10-3-21-2-32-1z" />
      <path fill="var(--i-leaf)" d="M6-46c-6-10-18-16-29-13 11 2 21 7 29 13zM6-46c6-10 18-16 29-13-11 2-21 7-29 13zM6-46c-1-9 3-17 10-21-3 7-6 14-10 21z" />
      <circle cx="4" cy="-43" r="3" fill="var(--i-wood-deep)" /><circle cx="9" cy="-42" r="3" fill="var(--i-wood-deep)" />
    </g>
  );
}

function Hut({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-14" y="-20" width="28" height="20" rx="2" fill="var(--i-wall)" />
      <path d="M-21-17 0-38l21 21z" fill="var(--i-roof)" />
      <path d="M-21-17 0-38l21 21" fill="none" stroke="var(--i-roof-deep)" stroke-width="2.5" stroke-linejoin="round" />
      <rect x="-4" y="-12" width="8" height="12" rx="1.5" fill="var(--i-wood-deep)" />
    </g>
  );
}

function Tent({ x, y, c }: { x: number; y: number; c: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-18 0 0-30 18 0z" fill="var(--i-wall)" />
      <path d="M-18 0-9-15 0-30-3 0zM3 0 0-30 9-15 18 0z" fill={c} />
      <path d="M0-30v-7" stroke="var(--i-wood-deep)" stroke-width="2" stroke-linecap="round" />
      <path d="M0-37l8 3-8 3z" fill={c} />
    </g>
  );
}

function Base({ d = BASE }: { d?: string }) {
  return (
    <>
      <path d={d} fill="var(--i-sand-deep)" transform="translate(0 5)" />
      <path d={d} fill="var(--i-sand)" />
    </>
  );
}

const SCENES: Record<number, () => JSX.Element> = {
  1: () => (
    <>
      <Base />
      <Palm x={118} y={92} s={1.05} />
      <Palm x={136} y={96} s={0.75} flip />
      <path d="m206 92 2.6 5.4 5.9.6-4.4 4 1.2 5.8-5.3-2.9-5.2 3 1.1-5.9-4.4-4 5.9-.7z" fill="var(--coral)" />
      <ellipse cx="238" cy="99" rx="11" ry="6" fill="var(--i-rock)" />
      <ellipse cx="252" cy="102" rx="7" ry="4.5" fill="var(--i-rock-deep)" />
      <path d="M176 104c3-5 9-5 12 0z" fill="var(--i-shell)" />
    </>
  ),
  2: () => (
    <>
      <Base />
      <path d="M66 96c20-20 64-28 94-28s72 8 94 28c-34 8-154 8-188 0z" fill="var(--i-leaf-deep)" />
      <Palm x={104} y={92} s={0.95} />
      <Palm x={160} y={84} s={1.2} />
      <Palm x={214} y={92} s={0.95} flip />
      <Palm x={134} y={98} s={0.7} flip />
      <Palm x={188} y={98} s={0.72} />
    </>
  ),
  3: () => (
    <>
      <Base />
      <Hut x={124} y={94} />
      <Hut x={170} y={90} s={1.15} />
      <Palm x={94} y={98} s={0.85} />
      <path d="M250 100h40" stroke="var(--i-wood)" stroke-width="4" stroke-linecap="round" />
      <path d="M262 100v12M280 100v12" stroke="var(--i-wood-deep)" stroke-width="3" />
      <path d="M266 118h34l-6 7h-22z" fill="var(--i-wood)" />
      <path d="M283 118V96l11 18z" fill="var(--i-wall)" />
    </>
  ),
  4: () => (
    <>
      <Base d="M40 106c12-18 40-26 64-26s46 8 54 26c-16 8-36 10-60 10s-48-2-58-10z" />
      <Base d="M168 106c10-18 38-28 64-28s50 10 56 28c-16 8-38 10-62 10s-48-2-58-10z" />
      <Palm x={82} y={98} s={0.9} />
      <Palm x={238} y={96} s={1} flip />
      <path d="M138 94q32 22 64 0" fill="none" stroke="var(--i-wood-deep)" stroke-width="2.5" />
      <path d="M138 86q32 22 64 0" fill="none" stroke="var(--i-leaf-deep)" stroke-width="2" />
      <g stroke="var(--i-wood)" stroke-width="4" stroke-linecap="round">
        <path d="M146 98v-6M156 103v-6M166 105v-6M176 105v-6M186 103v-6M196 98v-6" />
      </g>
    </>
  ),
  5: () => (
    <>
      <Base />
      <path d="M96 66q64 18 128 0" fill="none" stroke="var(--i-wood-deep)" stroke-width="1.5" />
      <g>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <path d={`M${104 + i * 17} ${69 + Math.sin((i / 6) * Math.PI) * 9}l5 9 5-9z`}
            fill={i % 2 ? 'var(--sun)' : 'var(--coral)'} />
        ))}
      </g>
      <Tent x={118} y={98} c="var(--coral)" />
      <Tent x={160} y={94} c="var(--sea-500)" />
      <Tent x={202} y={98} c="var(--sun-deep)" />
      <Palm x={248} y={100} s={0.8} flip />
    </>
  ),
  6: () => (
    <>
      <Base />
      <path d="M104 98 160 26l58 72z" fill="var(--i-rock)" />
      <path d="M160 26l58 72h-30z" fill="var(--i-rock-deep)" />
      <path d="M160 26l-15 19 7 4 8-6 9 6 6-4z" fill="var(--i-foam)" />
      <path d="M160 26V10" stroke="var(--i-wood-deep)" stroke-width="2.5" stroke-linecap="round" />
      <path d="M160 10l14 4-14 5z" fill="var(--coral)" />
      <g fill="none" stroke="var(--i-foam)" stroke-width="3" stroke-linecap="round" opacity=".9">
        <path d="M56 46h34a8 8 0 1 0-8-8M232 34h30a7 7 0 1 1-7 7M70 62h20" />
      </g>
      <Palm x={98} y={100} s={0.75} />
    </>
  ),
};

export function IslandArt({ n, class: cls }: { n: number; class?: string }) {
  const Scene = SCENES[((n - 1) % 6) + 1];
  return (
    <svg class={'island-art' + (cls ? ' ' + cls : '')} viewBox="0 0 320 130" aria-hidden="true">
      <ellipse cx="160" cy="112" rx="136" ry="12" fill="var(--i-shadow)" />
      <path d="M26 110c30 14 82 18 134 18s104-4 134-18" fill="none" stroke="var(--i-foam)" stroke-width="3" stroke-linecap="round" opacity=".75" />
      <Scene />
    </svg>
  );
}

/* Туман для неоткрытых островов. */
export function FogArt() {
  return (
    <svg class="island-art fog-art" viewBox="0 0 320 110" aria-hidden="true">
      <path d="M60 96c10-14 40-22 70-22s58 8 66 22c-30 8-106 8-136 0z" fill="var(--i-sand)" opacity=".35" />
      <path d="M190 98c8-10 26-16 46-16s38 6 44 16c-20 6-70 6-90 0z" fill="var(--i-sand)" opacity=".3" />
      <g fill="var(--fog)">
        <path d="M40 70h120a20 20 0 0 0 2-40 30 30 0 0 0-56-6 22 22 0 0 0-30 12 17 17 0 0 0-36 34z" />
        <path d="M150 92h130a18 18 0 0 0 0-36 26 26 0 0 0-48-8 20 20 0 0 0-34 14 15 15 0 0 0-48 30z" opacity=".85" />
      </g>
    </svg>
  );
}
