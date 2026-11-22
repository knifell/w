export type Level = 'A1' | 'A2' | 'B1' | 'B2';

export interface Example { en: string; ru: string }
export interface Word {
  id: string;
  en: string;
  ru: string[];
  pos: string;
  forms?: string[];
  examples: Example[];
}
export interface Lesson {
  id: string;
  level: Level;
  day: number;
  island: number;
  title: string;
  topic: string;
  words: Word[];
}
export interface Island { n: number; name: string; days: [number, number]; story: string; free?: boolean }
export interface LevelPack { level: Level; title: string; islands: Island[]; lessons: Lesson[] }
export interface ContentIndex { builtAt: string; levels: { level: Level; title: string; lessons: number; words: number }[] }
