import { useEffect, useMemo, useState } from 'preact/hooks';

const COLORS = ['var(--sun)', 'var(--sea-500)', 'var(--coral)', 'var(--ok)', 'var(--grape)', '#ff5fa2'];

/** Праздничное конфетти: лёгкие CSS-кусочки, сами исчезают. Только для вида. */
export function Confetti({ count = 44 }: { count?: number }) {
  const bits = useMemo(() => Array.from({ length: count }, (_, i) => ({
    x: Math.random() * 100,
    d: 1.6 + Math.random() * 1.4,
    delay: Math.random() * 0.5,
    r: Math.random() * 720 - 360,
    drift: Math.random() * 80 - 40,
    w: 7 + Math.random() * 7,
    round: i % 3 === 0,
    c: COLORS[i % COLORS.length],
  })), [count]);
  const [on, setOn] = useState(true);
  useEffect(() => { const t = setTimeout(() => setOn(false), 3600); return () => clearTimeout(t); }, []);
  if (!on) return null;
  return (
    <div class="confetti" aria-hidden="true">
      {bits.map((b) => (
        <i style={{
          left: `${b.x}%`, width: `${b.w}px`, height: `${b.round ? b.w : b.w * 0.45}px`, background: b.c,
          borderRadius: b.round ? '50%' : '2px', animationDuration: `${b.d}s`, animationDelay: `${b.delay}s`,
          '--r': `${b.r}deg`, '--dx': `${b.drift}px`,
        }} />
      ))}
    </div>
  );
}

/** Число, которое быстро «набегает» от 0 до значения. */
export function CountUp({ to, ms = 900, delay = 300 }: { to: number; ms?: number; delay?: number }) {
  const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [v, setV] = useState(reduce ? to : 0);
  useEffect(() => {
    if (reduce) return;
    let raf = 0; let start = 0;
    const t = setTimeout(() => {
      const step = (now: number) => {
        if (!start) start = now;
        const k = Math.min(1, (now - start) / ms);
        setV(Math.round(to * (1 - Math.pow(1 - k, 3))));
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, delay);
    return () => { clearTimeout(t); cancelAnimationFrame(raf); };
  }, [to]);
  return <>{v}</>;
}
