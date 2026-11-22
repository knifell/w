// Шкипер — краб-капитан, маскот «Острова слов». Своя векторная графика.
export type Mood = 'idle' | 'happy' | 'wave' | 'oops' | 'proud';

const CLAW = 'M0 0C-14-2-20-16-14-28c2-4 4-6 6-7 0 7 2 12 7 15 2-4 5-8 10-11 5 7 5 21-3 29z';

function Claw({ x, y, r, flip, cls }: { x: number; y: number; r: number; flip?: boolean; cls?: string }) {
  return (
    <g class={cls} transform={`translate(${x} ${y}) ${flip ? 'scale(-1 1)' : ''} rotate(${r})`}>
      <path d={CLAW} fill="var(--crab)" stroke="var(--crab-deep)" stroke-width="2.5" stroke-linejoin="round" />
      <ellipse cx="-9" cy="-20" rx="2.6" ry="5" fill="#fff" opacity=".35" transform="rotate(20 -9 -20)" />
    </g>
  );
}

export function Skipper({ mood = 'idle', size = 140, class: cls }: { mood?: Mood; size?: number; class?: string }) {
  const up = mood === 'happy' || mood === 'proud';
  const leftUp = up;
  const rightUp = up || mood === 'wave';
  return (
    <svg class={'skipper m-' + mood + (cls ? ' ' + cls : '')} width={size} height={size * 0.875} viewBox="0 0 160 140" aria-hidden="true">
      <ellipse cx="80" cy="131" rx="44" ry="5" fill="var(--shadow-ink)" opacity=".14" />
      <g fill="none" stroke="var(--crab-deep)" stroke-width="6" stroke-linecap="round">
        <path d="M50 100q-16 2-24 14M54 107q-12 8-14 19M63 111q-5 8-3 17M110 100q16 2 24 14M106 107q12 8 14 19M97 111q5 8 3 17" />
        <path d={leftUp ? 'M48 92Q28 86 22 58' : 'M48 94Q30 90 26 72'} stroke-width="7" />
        <path class="arm-r" d={rightUp ? 'M112 92Q132 86 138 58' : 'M112 94Q130 90 134 72'} stroke-width="7" />
      </g>
      <Claw x={leftUp ? 22 : 26} y={leftUp ? 60 : 74} r={leftUp ? -28 : -12} />
      <Claw x={rightUp ? 138 : 134} y={rightUp ? 60 : 74} r={rightUp ? -28 : -12} flip cls="claw-r" />
      <path d="M70 76 66 52M90 76l4-24" stroke="var(--crab)" stroke-width="6.5" stroke-linecap="round" />
      <ellipse cx="80" cy="97" rx="41" ry="27" fill="var(--crab)" stroke="var(--crab-deep)" stroke-width="2.5" />
      <path d="M42 102c6 14 22 21 38 21s32-7 38-21c-10 8-23 11-38 11s-28-3-38-11z" fill="var(--crab-deep)" opacity=".45" />
      <ellipse cx="80" cy="106" rx="24" ry="10" fill="var(--crab-belly)" opacity=".55" />
      <circle cx="58" cy="86" r="3" fill="var(--crab-deep)" opacity=".5" />
      <circle cx="102" cy="86" r="3" fill="var(--crab-deep)" opacity=".5" />
      <circle cx="51" cy="94" r="2" fill="var(--crab-deep)" opacity=".4" />
      <circle cx="109" cy="94" r="2" fill="var(--crab-deep)" opacity=".4" />
      {/* фуражка */}
      <path d="M65 74c0-13 30-13 30 0z" fill="var(--cap-top)" stroke="var(--ink-fixed)" stroke-width="2" />
      <rect x="65" y="69" width="30" height="5.5" fill="var(--cap)" />
      <path d="M61 75q19 7 38 0l-2 4q-17 6-34 0z" fill="var(--cap)" />
      <circle cx="80" cy="66" r="3.2" fill="var(--gold)" />
      {/* глаза */}
      <circle cx="64" cy="42" r="12.5" fill="#fff" stroke="var(--ink-fixed)" stroke-width="2.5" />
      <circle cx="96" cy="42" r="12.5" fill="#fff" stroke="var(--ink-fixed)" stroke-width="2.5" />
      {mood === 'happy' ? (
        <path d="M57 45q7-8 14 0M89 45q7-8 14 0" fill="none" stroke="var(--ink-fixed)" stroke-width="3.5" stroke-linecap="round" />
      ) : (
        <g class="pupils">
          <circle cx={mood === 'oops' ? 63 : 66} cy={mood === 'oops' ? 46 : 44} r="5.8" fill="var(--ink-fixed)" />
          <circle cx={mood === 'oops' ? 95 : 94} cy={mood === 'oops' ? 46 : 44} r="5.8" fill="var(--ink-fixed)" />
          <circle cx={mood === 'oops' ? 65 : 68} cy={mood === 'oops' ? 44 : 42} r="2" fill="#fff" />
          <circle cx={mood === 'oops' ? 97 : 96} cy={mood === 'oops' ? 44 : 42} r="2" fill="#fff" />
        </g>
      )}
      {mood === 'oops' && <path d="M54 27l12 3M106 27l-12 3" stroke="var(--ink-fixed)" stroke-width="3" stroke-linecap="round" />}
      {mood === 'proud' && <path d="M53 34q11-5 22 0M85 34q11-5 22 0" fill="none" stroke="var(--ink-fixed)" stroke-width="2.5" stroke-linecap="round" />}
      {/* лицо */}
      <ellipse cx="60" cy="98" rx="5.5" ry="3.2" fill="var(--cheek)" opacity=".7" />
      <ellipse cx="100" cy="98" rx="5.5" ry="3.2" fill="var(--cheek)" opacity=".7" />
      {mood === 'happy' || mood === 'proud' ? (
        <path d="M70 94q10 15 20 0z" fill="var(--ink-fixed)" stroke="var(--ink-fixed)" stroke-width="2.5" stroke-linejoin="round" />
      ) : mood === 'oops' ? (
        <path d="M70 101q4.5-4 9 0t9 0" fill="none" stroke="var(--ink-fixed)" stroke-width="3" stroke-linecap="round" />
      ) : (
        <path d="M71 96q9 8 18 0" fill="none" stroke="var(--ink-fixed)" stroke-width="3" stroke-linecap="round" />
      )}
      {mood === 'oops' && <path d="M118 30c4.5 6 4.5 11 0 11s-4.5-5 0-11z" fill="var(--drop)" />}
      {mood === 'happy' && (
        <g fill="var(--gold)">
          <path d="m16 30 2.2 5 5 2.2-5 2.2-2.2 5-2.2-5-5-2.2 5-2.2z" />
          <path d="m146 22 1.6 3.6 3.6 1.6-3.6 1.6-1.6 3.6-1.6-3.6-3.6-1.6 3.6-1.6z" />
          <path d="m134 112 1.4 3 3 1.4-3 1.4-1.4 3-1.4-3-3-1.4 3-1.4z" />
        </g>
      )}
    </svg>
  );
}
