import { useEffect, useMemo, useState } from 'preact/hooks';
import type { ContentIndex, Island, Lesson, Level, LevelPack, Word } from './types';
import { loadIndex, loadLevel } from './api/content';
import { startCloudSync } from './api/cloud';
import { emptyState, loadState, saveState, update, type LocalState } from './game/local';
import { recordSession, settleAll, type SessionKind } from './game/session';
import { refundEnergy, spendEnergy } from './game/energy';
import { buy } from './game/shop';
import { isDue } from './game/srs';
import { today } from './game/time';
import { REVIEW_MAX_WORDS } from './game/config';
import { buildLesson, buildReview, buildTrial, type Exercise } from './engine/generators';
import { vocabOf } from './engine/vocab';
import { setDictionary } from './engine/check';
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

type Route =
  | { s: 'onboarding' } | { s: 'pick' } | { s: 'minitest'; level: Level } | { s: 'tab'; tab: Tab }
  | { s: 'about' } | { s: 'premium'; from: Tab }
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

  // Через полночь или после сна вкладки пересчитываем энергию, костёр и открытие островов.
  useEffect(() => {
    if (!packs) return;
    let last = today();
    const resettle = () => { last = today(); setSt(settleAll(packs)[0]); };
    const onVis = () => { if (document.visibilityState === 'visible') resettle(); };
    const timer = setInterval(() => { if (today() !== last) resettle(); }, 60000);
    document.addEventListener('visibilitychange', onVis);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', onVis); };
  }, [packs]);

  useEffect(() => {
    const content = loadIndex().then((i) => { setIndex(i); return Promise.all(i.levels.map((l) => loadLevel(l.level))); });
    // Прогресс из облака Telegram подтягиваем до первого экрана, чтобы не начать игру «с нуля» на новом телефоне.
    Promise.all([content, startCloudSync()]).then(([p, fromCloud]) => {
      setPacks(p);
      const s = settleAll(p)[0];
      setSt(s);
      if (fromCloud && s.level) go({ s: 'tab', tab: 'map' });
    }, (e) => setError(String(e)));
  }, []);

  const allWords = useMemo(() => {
    const m = new Map((packs ?? []).flatMap((p) => p.lessons.flatMap((l) => l.words)).map((w) => [w.id, w]));
    setDictionary([...m.values()].flatMap((w) => [w.en, ...(w.forms ?? [])]));
    return m;
  }, [packs]);

  if (error) return <main class="card">Не удалось загрузить уроки. Проверь интернет и открой снова.<div class="hint">{error}</div></main>;
  if (!packs) return <main class="loading" aria-label="Загрузка"><Skipper size={120} /></main>;

  const pack = packs.find((p) => p.level === st.level) ?? packs[0];
  const pool = pack.lessons.flatMap((l) => l.words);
  const day = today();
  const due = Object.entries(st.mem).filter(([id, m]) => isDue(m, day) && allWords.has(id))
    .sort((a, b) => a[1].due - b[1].due || b[1].wrong - a[1].wrong).map(([id]) => allWords.get(id)!);

  const mutate = <T,>(fn: (s: LocalState) => T): T => { const [s, res] = update(fn); setSt(s); return res; };
  const toMap = () => go({ s: 'tab', tab: 'map' });
  const setLevel = (level: Level) => { mutate((s) => { s.level = level; s.onboarded = true; }); toMap(); };
  const openPremium = () => go({ s: 'premium', from: r.s === 'tab' ? r.tab : 'map' });
  const openStory = (isl: Island, then?: () => void) => {
    setStory({ isl, then });
    mutate((s) => { const k = `${pack.level}-${isl.n}`; if (!s.storySeen.includes(k)) s.storySeen.push(k); });
  };
  /** Слова, которые игрок уже знает: выученные + все слова уровней ниже текущего. */
  const vocab = (extra: Word[] = []) => {
    const lower = packs.filter((p) => p.level < pack.level).flatMap((p) => p.lessons.flatMap((l) => l.words));
    const learned = Object.keys(st.mem).map((id) => allWords.get(id)).filter((w): w is Word => !!w);
    return vocabOf([...lower, ...learned, ...extra]);
  };
  const startReview = (words: Word[]) => go({ s: 'session', kind: 'review', build: () => buildReview(words, [...allWords.values()], Date.now(),
    Object.keys(st.mem).map((id) => allWords.get(id)).filter((w): w is Word => !!w)) });

  const startLesson = (l: Lesson) => {
    const start = () => {
      if (!mutate(spendEnergy)) return setEnergySheet(true);
      go({ s: 'session', kind: 'lesson', lessonId: l.id, build: () => buildLesson(l, pool, Date.now(), new Set(Object.keys(st.mem)), vocab(l.words)) });
    };
    if (!st.storySeen.includes(`${pack.level}-${l.island}`)) return openStory(pack.islands[l.island - 1], start);
    start();
  };
  const startTrial = (isl: Island) => {
    const ws = pack.lessons.filter((l) => l.island === isl.n && st.done[l.id]).flatMap((l) => l.words);
    go({ s: 'session', kind: 'trial', build: () => buildTrial(ws, pool, Date.now(), vocab(ws)) });
  };
  const finish = (kind: SessionKind, lessonId: string | undefined, o: SessionOutcome) => {
    const reward = recordSession({ kind, lessonId, accuracy: o.accuracy, seen: o.seen.map((w) => w.id), wrong: o.wrong.map((w) => w.id) }, packs);
    setSt(loadState());
    go({ s: 'result', result: { ...reward, accuracy: o.accuracy, wrongWords: o.wrong, kind } });
  };

  switch (r.s) {
    case 'onboarding': return <OnboardingScreen onNext={() => go({ s: 'pick' })} />;
    case 'pick': return <LevelPickScreen packs={packs} current={st.level} onPick={(level) => go({ s: 'minitest', level })}
      onBack={st.level ? () => toMap() : undefined} />;
    case 'minitest':
      return <MiniTestScreen pack={packs.find((p) => p.level === r.level)!} packs={packs}
        onDone={(l) => setLevel(l)} onBack={() => go({ s: 'pick' })} />;
    case 'session': return <LessonScreen build={r.build} onExit={() => { if (r.kind === 'lesson') mutate(refundEnergy); toMap(); }} onDone={(o) => finish(r.kind, r.lessonId, o)} />;
    case 'result': return <ResultScreen result={r.result} onNext={() => toMap()} />;
    case 'about': return <AboutScreen index={index} onBack={() => go({ s: 'tab', tab: 'profile' })}
      onReset={() => { saveState(emptyState()); setSt(loadState()); go({ s: 'onboarding' }); }} />;
    case 'premium':
      return <PremiumScreen isPremium={st.premium} onBack={() => go({ s: 'tab', tab: r.from })}
        onDevToggle={() => { mutate((s) => { s.premium = !s.premium; }); setSt(settleAll(packs)[0]); }} />;
  }

  const tab = r.tab;
  return (
    <>
      <TopBar st={st} level={tab === 'map' ? pack.level : undefined} onEnergy={() => setEnergySheet(true)} />
      {tab === 'map' && (
        <MapScreen pack={pack} st={st} due={due} onLesson={startLesson} onReview={startReview} onTrial={startTrial}
          onStory={(isl) => openStory(isl)} onRetest={() => go({ s: 'pick' })} onPremium={() => openPremium()} />
      )}
      {tab === 'passport' && <PassportScreen st={st} />}
      {tab === 'shop' && <ShopScreen st={st} onBuy={(id) => mutate((s) => buy(s, id))} onPremium={() => openPremium()} />}
      {tab === 'profile' && (
        <ProfileScreen st={st} packs={packs} onLevel={(l) => setLevel(l)} onPremium={() => openPremium()}
          onAbout={() => go({ s: 'about' })} onRetest={() => go({ s: 'pick' })} />
      )}
      <TabBar tab={tab} onTab={(t) => go({ s: 'tab', tab: t })} />
      {story && <StorySheet island={story.isl} onClose={() => setStory(null)} onGo={() => { setStory(null); story.then?.(); }} />}
      {energySheet && (
        <EnergySheet st={st} onClose={() => setEnergySheet(false)}
          onShop={() => { setEnergySheet(false); go({ s: 'tab', tab: 'shop' }); }}
          onPremium={() => { setEnergySheet(false); openPremium(); }}
          onReview={due.length ? () => { setEnergySheet(false); startReview(due.slice(0, REVIEW_MAX_WORDS)); } : undefined} />
      )}
    </>
  );
}
