// Какие слова игрок уже видел: выученные слова курса (и их формы) + имена и названия.
// Служебные слова (I, is, the…) курс проходит в первых уроках A1, поэтому отдельной поблажки для них нет.
// Нужно, чтобы в активных заданиях (сборка предложения) не требовались незнакомые слова.
import type { Word } from '../types';

/** Имена людей и географические названия: в примерах их не нужно изучать. */
export const NAMES = new Set(`anna tom max kate ben mia london paris moscow spain france rome italy japan canada england scotland
berlin egypt mars africa asia europe pacific arctic india dubai seoul new york everest oxford orion milky way victorian roman
earth moon`.split(/\s+/));

/** Разбивает текст на слова (нижний регистр, апострофы внутри слова сохраняются). */
export const tokens = (s: string) => s.toLowerCase().replace(/[’`]/g, "'").split(/[^a-z']+/).map((t) => t.replace(/^'+|'+$/g, '')).filter(Boolean);

/** Возможные основы словоформы: cats→cat, liked→like, going→go, it's→it, don't→do. */
const stems = (t: string) => [
  t, t.replace(/'(s|ll|d|ve|re|m)$/, ''), t.replace(/n't$/, ''),
  t.replace(/s$/, ''), t.replace(/es$/, ''), t.replace(/ies$/, 'y'), t.replace(/ied$/, 'y'),
  t.replace(/ed$/, ''), t.replace(/d$/, ''), t.replace(/(.)\1ed$/, '$1'),
  t.replace(/ing$/, ''), t.replace(/ing$/, 'e'), t.replace(/(.)\1ing$/, '$1'),
  t.replace(/er$/, ''), t.replace(/r$/, ''), t.replace(/est$/, ''), t.replace(/st$/, ''), t.replace(/ly$/, ''),
  t.replace(/(.)\1er$/, '$1'), t.replace(/(.)\1est$/, '$1'), t.replace(/ier$/, 'y'), t.replace(/iest$/, 'y'), t.replace(/ily$/, 'y'),
];

export function vocabOf(words: Iterable<Word>): Set<string> {
  const v = new Set(NAMES);
  for (const w of words) for (const s of [w.en, ...(w.forms ?? [])]) tokens(s).forEach((t) => v.add(t));
  return v;
}

export const knownToken = (t: string, v: Set<string>) => stems(t.toLowerCase()).some((s) => v.has(s));
export const knownSentence = (s: string, v: Set<string>) => tokens(s).every((t) => knownToken(t, v));
