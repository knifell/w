export const plural = (n: number, f: [string, string, string]) =>
  f[n % 10 === 1 && n % 100 !== 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2];
export const days = (n: number) => `${n} ${plural(n, ['день', 'дня', 'дней'])}`;
export const words = (n: number) => `${n} ${plural(n, ['слово', 'слова', 'слов'])}`;
export const mmss = (ms: number) => {
  const t = Math.ceil(ms / 1000);
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
};
