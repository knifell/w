// Штамп паспорта в виде чернильной печати. Значок — по смыслу штампа, число — порог условия.
import type { Sticker } from '../game/config';
import { Icon } from './Icon';

function glyph(id: string): string {
  if (id === 'club-fire' || id.startsWith('fire')) return 'flame';
  if (id.startsWith('club')) return id === 'club-30' ? 'compass' : 'flag';
  if (id.startsWith('clean')) return 'sparkle';
  if (id.startsWith('mem')) return 'anchor';
  if (id.startsWith('rev')) return 'refresh';
  if (id.startsWith('island')) return 'palm';
  if (id.startsWith('trial')) return 'swords';
  if (id.startsWith('night')) return 'moon';
  if (id.startsWith('early')) return 'sun';
  if (id === 'ten-lessons') return 'compass';
  if (id === 'fifty-lessons') return 'map';
  if (id === 'hundred-lessons') return 'anchor';
  return 'sail';
}

const WORDS: Record<string, string> = { ten: '10', fifty: '50', hundred: '100' };
function mark(id: string): string {
  const n = id.match(/-(\d+)$/)?.[1];
  if (n) return n;
  return WORDS[id.split('-')[0]] ?? '';
}

/** Небольшой стабильный наклон, как у настоящей печати. */
function tilt(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) | 0;
  return ((Math.abs(h) % 15) - 7);
}

export function StampMark({ s, has, open }: { s: Sticker; has: boolean; open: boolean }) {
  const n = open ? mark(s.id) : '';
  return (
    <svg class="stamp-mark" viewBox="0 0 64 64" style={has ? { transform: `rotate(${tilt(s.id)}deg)` } : undefined} aria-hidden="true">
      <circle cx="32" cy="32" r="29" fill="none" stroke="currentColor" stroke-width="2.4" stroke-dasharray={has ? undefined : '3 4'} />
      <circle cx="32" cy="32" r="24" fill={has ? 'currentColor' : 'none'} fill-opacity=".08" stroke="currentColor" stroke-width="1.2" opacity={has ? 1 : 0.6} />
      {has && s.rarity === 'legendary' && (
        <g fill="currentColor">{[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const a = (i / 8) * Math.PI * 2;
          return <circle cx={32 + Math.cos(a) * 26.5} cy={32 + Math.sin(a) * 26.5} r="1.1" />;
        })}</g>
      )}
      {open ? (
        <g transform={`translate(${n ? 20 : 18} ${n ? 13 : 18}) scale(${n ? 1 : 1.17})`}>
          <Icon name={glyph(s.id)} size={24} stroke={2.2} />
        </g>
      ) : (
        <text x="32" y="40" text-anchor="middle" class="stamp-q">?</text>
      )}
      {n && <text x="32" y="50" text-anchor="middle" class="stamp-n">{n}</text>}
    </svg>
  );
}

/* Значки товаров лавки. */
export const ITEM_ICON: Record<string, string> = { wind: 'wind', ember: 'ember', oil: 'flask', spyglass: 'eye', buoy: 'heart' };
