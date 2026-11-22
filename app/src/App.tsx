import { useState } from 'preact/hooks';
import type { Lesson, LevelPack, Word } from './types';
import type { Reward } from './game/local';
import { HomeScreen } from './screens/HomeScreen';
import { LessonScreen } from './screens/lesson/LessonScreen';
import { ResultScreen } from './screens/ResultScreen';

type Route =
  | { s: 'home' }
  | { s: 'lesson'; lesson: Lesson; pool: Word[] }
  | { s: 'result'; result: Reward & { accuracy: number; wrongWords: Word[] } };

export function App() {
  const [r, go] = useState<Route>({ s: 'home' });
  const home = () => go({ s: 'home' });
  if (r.s === 'lesson')
    return <LessonScreen lesson={r.lesson} pool={r.pool} onExit={home} onDone={(result) => go({ s: 'result', result })} />;
  if (r.s === 'result') return <ResultScreen result={r.result} onNext={home} />;
  return <HomeScreen onStart={(lesson: Lesson, p: LevelPack) => go({ s: 'lesson', lesson, pool: p.lessons.flatMap((l) => l.words) })} />;
}
