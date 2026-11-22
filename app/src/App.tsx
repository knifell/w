import { useEffect, useMemo, useState } from 'preact/hooks';
import type { ContentIndex, Island, Lesson, Level, LevelPack, Word } from './types';
import { loadIndex, loadLevel } from './api/content';
import { emptyState, loadState, saveState, update, type LocalState } from './game/local';
import { recordSession, settleAll, type SessionKind } from './game/session';
import { spendEnergy } from './game/energy';
import { buy } from './game/shop';
import { isDue } from './game/srs';
import { today } from './game/time';
import { REVIEW_MAX_WORDS } from './game/config';
import { buildLesson, buildReview, buildTrial, type Exercise } from './engine/generators';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { LevelPickScreen } from './screens/LevelPickScreen';
import { MiniTestScreen } from './screens/MiniTestScreen';
import { MapScreen } from './screens/MapScreen';
import { StorySheet } from './screens/StorySheet';
import { LessonScreen, type SessionOutcome } from './screens/lesson/LessonScreen';
import { ResultScreen, type ResultData } from './screens/ResultScreen';
import { PassportScreen } from './screens/PassportScreen';
import { ShopScreen } from './screens/ShopScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { AboutScreen } from './screens/AboutScreen';
import { PremiumScreen } from './screens/PremiumScreen';
import { TabBar, type Tab } from './components/TabBar';
import { TopBar } from './components/TopBar';
import { EnergySheet } from './components/EnergySheet';
import { Skipper } from './components/Skipper';
import { Icon } from './components/Icon';

type Route =
  | { s: 'onboarding' } | { s: 'pick' } | { s: 'minitest'; level: Level } | { s: 'tab'; tab: Tab; note?: string }
  | { s: 'about' } | { s: 'premium' }
  | { s: 'session'; kind: SessionKind; lessonId?: string; build: () => Exercise[] }
  | { s: 'result'; result: ResultData };

export function App() {
  const [index, setIndex] = useState<ContentIndex | null>(null);
  const [packs, setPacks] = useState<LevelPack[] | null>(null);
  const [error, setError] = useState('');
  const [st, setSt] = useState<LocalState>(loadState);
  const [r, go] = useState<Route>(() => (st.level ? { s: 'tab', tab: 'map' } : { s: 'onboarding' }));
  const [story, setStory] = useState<{ isl: Island; then?: () => void } | null>(null);
  const [energySheet, setEnergySheet] = useState(false);

  useEffect(() => {
    loadIndex().then((i) => { setIndex(i); return Promise.all(i.levels.map((l) => loadLevel(l.level))); })
      .then((p) => { setPacks(p); setSt(settleAll(p)[0]); }, (e) => setError(String(e)));
  }, []);

  const allWords = useMemo(() => new Map((packs ?? []).flatMap((p) => p.lessons.flatMap((l) => l.words)).map((w) => [w.id, w])), [packs]);

  if (error) return <main class="card">Не удалось загрузить уроки. Проверь интернет и открой снова.<div class="hint">{error}</div></main>;
  if (!packs) return <main class="loading" aria-label="Загрузка"><Skipper size={120} /></main>;

  const pack = packs.find((p) => p.level === st.level) ?? packs[0];
  const pool = pack.lessons.flatMap((l) => l.words);
  const day = today();
  const due = Object.entries(st.mem).filter(([id, m]) => isDue(m, day) && allWords.has(id))
    .sort((a, b) => a[1].due - b[1].due || b[1].wrong - a[1].wrong).map(([id]) => allWords.get(id)!);

  const mutate = <T,>(fn: (s: LocalState) => T): T => { const [s, res] = update(fn); setSt(s); return res; };
  const toMap = (note?: string) => go({ s: 'tab', tab: 'map', note });
  const setLevel = (level: Level, note?: string) => { mutate((s) => { s.level = level; s.onboarded = true; }); toMap(note); };
  const openStory = (isl: Island, then?: () => void) => {
    setStory({ isl, then });
    mutate((s) => { const k = `${pack.level}-${isl.n}`; if (!s.storySeen.includes(k)) s.storySeen.push(k); });
  };
  const startReview = (words: Word[]) => go({ s: 'session', kind: 'review', build: () => buildReview(words, [...allWords.values()]) });

  const startLesson = (l: Lesson) => {
    const start = () => {
      if (!mutate(spendEnergy)) return setEnergySheet(true);
      go({ s: 'session', kind: 'lesson', lessonId: l.id, build: () => buildLesson(l, pool, Date.now(), new Set(Object.keys(st.mem))) });
    };
    if (!st.storySeen.includes(`${pack.level}-${l.island}`)) return openStory(pack.islands[l.island - 1], start);
    start();
  };
  const startTrial = (isl: Island) => {
    const ws = pack.lessons.filter((l) => l.island === isl.n && st.done[l.id]).flatMap((l) => l.words);
    go({ s: 'session', kind: 'trial', build: () => buildTrial(ws, pool) });
  };
  const finish = (kind: SessionKind, lessonId: string | undefined, o: SessionOutcome) => {
    const reward = recordSession({ kind, lessonId, accuracy: o.accuracy, seen: o.seen.map((w) => w.id), wrong: o.wrong.map((w) => w.id) }, packs);
    setSt(loadState());
    go({ s: 'result', result: { ...reward, accuracy: o.accuracy, wrongWords: o.wrong, kind } });
  };

  switch (r.s) {
    case 'onboarding': return <OnboardingScreen onNext={() => go({ s: 'pick' })} />;
    case 'pick': return <LevelPickScreen packs={packs} current={st.level} onPick={(level) => go({ s: 'minitest', level })} />;
    case 'minitest':
      return <MiniTestScreen pack={packs.find((p) => p.level === r.level)!} packs={packs}
        onDone={(l) => setLevel(l)} onBack={() => go({ s: 'pick' })} />;
    case 'session': return <LessonScreen build={r.build} onExit={() => toMap()} onDone={(o) => finish(r.kind, r.lessonId, o)} />;
    case 'result': return <ResultScreen result={r.result} onNext={() => toMap()} />;
    case 'about': return <AboutScreen index={index} onBack={() => go({ s: 'tab', tab: 'profile' })}
      onReset={() => { saveState(emptyState()); setSt(loadState()); go({ s: 'onboarding' }); }} />;
    case 'premium':
      return <PremiumScreen isPremium={st.premium} onBack={() => toMap()}
        onDevToggle={() => { mutate((s) => { s.premium = !s.premium; }); setSt(settleAll(packs)[0]); }} />;
  }

  const tab = r.tab;
  return (
    <>
      <TopBar st={st} level={tab === 'map' ? pack.level : undefined} onEnergy={() => setEnergySheet(true)} />
      {r.note && <div class="card banner note-card"><span class="banner-ico"><Icon name="info" /></span><div>{r.note}</div></div>}
      {tab === 'map' && (
        <MapScreen pack={pack} st={st} due={due} onLesson={startLesson} onReview={startReview} onTrial={startTrial}
          onStory={(isl) => openStory(isl)} onRetest={() => go({ s: 'pick' })} onPremium={() => go({ s: 'premium' })} />
      )}
      {tab === 'passport' && <PassportScreen st={st} />}
      {tab === 'shop' && <ShopScreen st={st} onBuy={(id) => mutate((s) => buy(s, id))} onPremium={() => go({ s: 'premium' })} />}
      {tab === 'profile' && (
        <ProfileScreen st={st} packs={packs} onLevel={(l) => setLevel(l)} onPremium={() => go({ s: 'premium' })}
          onAbout={() => go({ s: 'about' })} onRetest={() => go({ s: 'pick' })} />
      )}
      <TabBar tab={tab} onTab={(t) => go({ s: 'tab', tab: t })} />
      {story && <StorySheet island={story.isl} onClose={() => { setStory(null); story.then?.(); }} />}
      {energySheet && (
        <EnergySheet st={st} onClose={() => setEnergySheet(false)}
          onShop={() => { setEnergySheet(false); go({ s: 'tab', tab: 'shop' }); }}
          onPremium={() => { setEnergySheet(false); go({ s: 'premium' }); }}
          onReview={due.length ? () => { setEnergySheet(false); startReview(due.slice(0, REVIEW_MAX_WORDS)); } : undefined} />
      )}
    </>
  );
}
