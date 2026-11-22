import { useEffect, useMemo, useState } from 'preact/hooks';
import type { Island, Level, LevelPack, Word } from './types';
import { loadIndex, loadLevel } from './api/content';
import { loadState, recordSession, update, type LocalState } from './game/local';
import { buildLesson, buildReview, type Exercise } from './engine/generators';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { PlacementScreen } from './screens/PlacementScreen';
import { MapScreen } from './screens/MapScreen';
import { StorySheet } from './screens/StorySheet';
import { LessonScreen, type SessionOutcome } from './screens/lesson/LessonScreen';
import { ResultScreen, type ResultData } from './screens/ResultScreen';

type Route =
  | { s: 'onboarding' }
  | { s: 'placement' }
  | { s: 'map'; note?: string }
  | { s: 'session'; kind: 'lesson' | 'review'; lessonId?: string; build: () => Exercise[] }
  | { s: 'result'; result: ResultData };

export function App() {
  const [packs, setPacks] = useState<LevelPack[] | null>(null);
  const [error, setError] = useState('');
  const [st, setSt] = useState<LocalState>(loadState);
  const [r, go] = useState<Route>(() => (st.level ? { s: 'map' } : { s: 'onboarding' }));
  const [story, setStory] = useState<{ isl: Island; then?: () => void } | null>(null);

  useEffect(() => {
    loadIndex().then((i) => Promise.all(i.levels.map((l) => loadLevel(l.level)))).then(setPacks, (e) => setError(String(e)));
  }, []);

  const allWords = useMemo(() => new Map((packs ?? []).flatMap((p) => p.lessons.flatMap((l) => l.words)).map((w) => [w.id, w])), [packs]);

  if (error) return <main class="card">Не удалось загрузить уроки. Проверь интернет и открой снова.<div class="hint">{error}</div></main>;
  if (!packs) return <main class="loading">🦀</main>;

  const pack = packs.find((p) => p.level === st.level) ?? packs[0];
  const pool = (p: LevelPack) => p.lessons.flatMap((l) => l.words);

  const setLevel = (level: Level, note?: string) => { setSt(update((s) => { s.level = level; s.onboarded = true; })); go({ s: 'map', note }); };
  const openStory = (isl: Island, then?: () => void) => { setStory({ isl, then }); setSt(update((s) => { const k = `${pack.level}-${isl.n}`; if (!s.storySeen.includes(k)) s.storySeen.push(k); })); };

  const finish = (kind: 'lesson' | 'review', lessonId: string | undefined, o: SessionOutcome) => {
    const reward = recordSession({ kind, lessonId, accuracy: o.accuracy, seen: o.seen.map((w) => w.id), wrong: o.wrong.map((w) => w.id) });
    setSt(loadState());
    go({ s: 'result', result: { ...reward, accuracy: o.accuracy, wrongWords: o.wrong, kind } });
  };

  switch (r.s) {
    case 'onboarding':
      return <OnboardingScreen onTest={() => go({ s: 'placement' })} onSkip={() => setLevel('A2')} />;
    case 'placement':
      return <PlacementScreen packs={packs} onDone={setLevel} />;
    case 'session':
      return <LessonScreen build={r.build} onExit={() => go({ s: 'map' })} onDone={(o) => finish(r.kind, r.lessonId, o)} />;
    case 'result':
      return <ResultScreen result={r.result} onNext={() => go({ s: 'map' })} />;
    default:
      return (
        <>
          {r.note && <div class="card banner">{r.note}</div>}
          <MapScreen pack={pack} allWords={allWords} st={st}
            onLesson={(l) => {
              const start = () => go({ s: 'session', kind: 'lesson', lessonId: l.id, build: () => buildLesson(l, pool(pack)) });
              if (!st.storySeen.includes(`${pack.level}-${l.island}`)) return openStory(pack.islands[l.island - 1], start);
              start();
            }}
            onReview={(words) => go({ s: 'session', kind: 'review', build: () => buildReview(words, [...allWords.values()]) })}
            onStory={(isl) => openStory(isl)}
            onRetest={() => go({ s: 'placement' })} />
          {story && <StorySheet island={story.isl} onClose={() => { setStory(null); story.then?.(); }} />}
        </>
      );
  }
}
