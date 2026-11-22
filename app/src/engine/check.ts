// Нормализация и проверка ответов: регистр, ё/е, café=cafe, пунктуация, артикли, 1 опечатка.
export const norm = (s: string) =>
  s.toLowerCase().replace(/ё/g, 'е').normalize('NFD').replace(/(?<=[a-z])\p{M}+/gu, '').normalize('NFC').replace(/[’`]/g, "'")
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

/** Опечатку прощаем в словах от 3 букв: в «go», «he», «I» одна буква — уже другое слово. */
export const TYPO_MIN_LEN = 3;

/** Все английские слова курса: опечатка, которая даёт другое настоящее слово (car → cat), — это ошибка. */
let dictionary = new Set<string>();
export const setDictionary = (words: Iterable<string>) => { dictionary = new Set([...words].map(core)); };

/**
 * Проверка ввода. allowTypo=false — опечатка не прощается
 * (игрок уже не раз ошибался в этом слове на одну букву).
 */
export function checkTyped(input: string, answers: string[], allowTypo = true): Verdict {
  const i = core(input);
  if (!i) return 'wrong';
  const ans = answers.map(core);
  if (ans.includes(i)) return 'exact';
  if (!allowTypo || dictionary.has(i)) return 'wrong';
  if (ans.some((a) => a.length >= TYPO_MIN_LEN && lev(i, a) <= 1)) return 'typo';
  return 'wrong';
}

/** Была бы опечатка, если бы её прощали (для подсказки «опять та же буква»). */
export const isTypo = (input: string, answers: string[]) => checkTyped(input, answers, true) === 'typo';

export const sameSentence = (a: string, b: string) => norm(a) === norm(b);
