// Нормализация и проверка ответов: регистр, ё/е, пунктуация, артикли, 1 опечатка.
export const norm = (s: string) =>
  s.toLowerCase().replace(/ё/g, 'е').replace(/[’`]/g, "'")
    .replace(/[^\p{L}\p{N}' ]+/gu, ' ').replace(/\s+/g, ' ').trim();

const core = (s: string) => norm(s).replace(/^(a|an|the|to) /, '');

export function lev(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 1) return 2;
  const d = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = d[0]; d[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = d[j];
      d[j] = Math.min(d[j] + 1, d[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return d[b.length];
}

export type Verdict = 'exact' | 'typo' | 'wrong';

export function checkTyped(input: string, answers: string[]): Verdict {
  const i = core(input);
  if (!i) return 'wrong';
  const ans = answers.map(core);
  if (ans.includes(i)) return 'exact';
  if (ans.some((a) => a.length >= 6 && lev(i, a) <= 1)) return 'typo';
  return 'wrong';
}

export const sameSentence = (a: string, b: string) => norm(a) === norm(b);
