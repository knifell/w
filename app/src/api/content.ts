import type { ContentIndex, Level, LevelPack } from '../types';

const cache = new Map<string, Promise<unknown>>();
const get = <T,>(path: string): Promise<T> => {
  if (!cache.has(path)) {
    cache.set(path, fetch(`${import.meta.env.BASE_URL}content/${path}`).then((r) => {
      if (!r.ok) throw new Error(`content ${path}: ${r.status}`);
      return r.json();
    }));
  }
  return cache.get(path) as Promise<T>;
};

export const loadIndex = () => get<ContentIndex>('index.json');
export const loadLevel = (l: Level) => get<LevelPack>(`${l.toLowerCase()}.json`);
