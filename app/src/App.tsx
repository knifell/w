import { useEffect, useMemo, useState } from 'preact/hooks';
import type { ContentIndex, Island, Lesson, Level, LevelPack, Word } from './types';
import { loadIndex, loadLevel } from './api/content';
import { startCloudSync } from './api/cloud';
import { buy, claimReferral, fetchStatus, paymentsReady, shareInvite, startParam, waitForStatus } from './api/payments';
import { applyFriendGift, applyStatus, type ServerStatus } from './game/purchases';
import { hasProgress } from './game/local';
import { STAR_PREMIUM } from './game/config';
import { nowMs } from './game/clock';
import { ask, haptic } from './tg/telegram';
import { canListen } from './lib/speech';
import { sfx } from './lib/sfx';
import { loadState, resetProgress, saveState, update, type LocalState } from './game/local';
import { recordSession, settleAll, type SessionKind } from './game/session';
import { refundEnergy, spendEnergy } from './game/energy';
import { buy as buyItem } from './game/shop';
import { isDue } from './game/srs';
import { today } from './game/time';
import { REVIEW_MAX_WORDS } from './game/config';
import { buildLesson, buildReview, buildStorm, buildTrial, type Exercise } from './engine/generators';
import { isBeacon, openChest } from './game/nodes';
import { bottleFor, claimBottle } from './game/bottle';
import { LogSheet } from './components/LogSheet';
import { vocabOf } from './engine/vocab';
import { setDictionary } from './engine/check';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { AdminScreen } from './screens/AdminScreen';
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
  | { s: 'about' } | { s: 'admin' } | { s: 'premium'; from: Tab }
  | { s: 'session'; kind: SessionKind; lessonId?: string; build: () => Exercise[]; mode?: 'storm' | 'boss' }
  | { s: 'result'; result: ResultData };

export function App() {
  const [index, setIndex] = useState<ContentIndex | null>(null);
  const [packs, setPacks] = useState<LevelPack[] | null>(null);
  const [error, setError] = useState('');
  const [st, setSt] = useState<LocalState>(loadState);
  const [r, go] = useState<Route>(() => (st.level ? { s: 'tab', tab: 'map' } : { s: 'onboarding' }));
  const [story, setStory] = useState<{ isl: Island; then?: () => void } | null>(null);
  const [energySheet, setEnergySheet] = useState(false);
  const [toast, setToast] = useState<{ text: string; err?: boolean } | null>(null);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 3500); return () => clearTimeout(t); }, [toast]);

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
      void syncPurchases(p);
    }, (e) => setError(String(e)));
  }, []);

  /** Подарок по ссылке друга (до первого запроса статуса!) и начисление подтверждённых покупок. */
  async function syncPurchases(p: LevelPack[]) {
    if (!paymentsReady()) return;
    const ref = startParam();
    if (ref.startsWith('ref_') && !hasProgress(loadState()) && !loadState().refBonusTaken && (await claimReferral(ref))) {
      const [, got] = update(applyFriendGift);
      if (got) setToast({ text: `Подарок от друга: +${got} ракушек!` });
    }
    const status = await fetchStatus();
    if (status) applyServer(status, p);
  }
  function applyServer(status: ServerStatus, p: LevelPack[]) {
    const [, a] = update((s) => applyStatus(s, status));
    setSt(settleAll(p)[0]);
    if (a.gifts > 0 && !a.friends) { haptic.reward(); sfx.coin(); setToast({ text: a.coins > 0 ? `Подарок от капитана: +${a.coins} ракушек!` : 'Подарок от капитана!' }); return a; }
    if (a.coins > 0 || a.friends > 0) {
      haptic.reward(); sfx.coin();
      setToast({ text: a.friends > 0 ? `Друзья приплыли: +${a.friends}! Начислено ${a.coins} ракушек.` : `+${a.coins} ракушек!` });
    }
    return a;
  }

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
  /** Слова, в которых ошибались 2+ раза (чаще всего — первыми), до 12 штук. */
  const hard = Object.entries(st.mem).filter(([id, m]) => m.wrong >= 2 && allWords.has(id))
    .sort((a, b) => b[1].wrong - a[1].wrong).slice(0, REVIEW_MAX_WORDS).map(([id]) => allWords.get(id)!);

  const mutate = <T,>(fn: (s: LocalState) => T): T => { const [s, res] = update(fn); setSt(s); return res; };
  const toMap = () => go({ s: 'tab', tab: 'map' });
  const setLevel = (level: Level) => { mutate((s) => { s.level = level; s.onboarded = true; }); toMap(); };
  const nextLevel = packs[packs.findIndex((p) => p.level === pack.level) + 1]?.level;
  const goNextLevel = () => { if (nextLevel) setLevel(nextLevel); };
  const resetAll = async () => {
    if (!(await ask('Удалить весь прогресс? Уроки, слова, костёр и штампы пропадут, уровень выберешь заново. Заработанные ракушки сгорят. Останутся только купленные за звёзды ракушки и Premium.'))) return;
    const s = resetProgress(loadState()); saveState(s); setSt(s); go({ s: 'onboarding' });
  };
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
  const learnedWords = useMemo(() => Object.keys(st.mem).map((id) => allWords.get(id)).filter((w): w is Word => !!w), [st.mem, allWords]);
  const bottle = useMemo(() => bottleFor(st, day, learnedWords, vocab()), [day, st.bottleDay, learnedWords.length, pack.level]);
  const answerBottle = (ok: boolean) => {
    const got = mutate((s) => claimBottle(s, today(), ok));
    if (ok) { haptic.reward(); sfx.coin(); }
    setToast({ text: ok ? `Верно! +${got} ракушек` : 'Не угадал. Завтра приплывёт новая бутылка.', err: !ok });
  };
  const [log, setLog] = useState<Island | null>(null);
  const buyStars = async (id: string) => {
    const res = await buy(id);
    if (res === 'unavailable') return setToast({ text: 'Покупки за звёзды заработают после запуска в Telegram.', err: true });
    if (res === 'cancelled') return;
    if (res === 'failed') return setToast({ text: 'Не получилось открыть оплату. Попробуй ещё раз.', err: true });
    const isPremium = id === STAR_PREMIUM.id;
    const status = await waitForStatus((x) => isPremium
      ? x.premiumUntil > nowMs()
      : x.purchases.some((p) => p.item === id && !p.refunded && !loadState().claimed[p.id]));
    const got = status ? applyServer(status, packs) : null;
    if (isPremium && got && got.premiumUntil > nowMs()) { haptic.reward(); setToast({ text: 'Добро пожаловать в клуб капитанов!' }); }
    else if (!got || (!isPremium && got.coins <= 0)) setToast({ text: 'Платёж обрабатывается — покупка появится в течение минуты.' });
  };
  const invite = () => {
    if (!shareInvite('Учу английский в игре «Остров слов» — присоединяйся, получишь подарок!'))
      setToast({ text: 'Приглашения заработают после запуска в Telegram.', err: true });
  };
  const startReview = (words: Word[]) => go({ s: 'session', kind: 'review', build: () => buildReview(words, [...allWords.values()], Date.now(),
    Object.keys(st.mem).map((id) => allWords.get(id)).filter((w): w is Word => !!w), canListen(), vocab(words)) });

  /** Слова прошлых уроков для разминки: сначала те, кому пора повториться, потом самые «слабые». */
  const recallFor = (l: Lesson) => Object.entries(st.mem)
    .filter(([id]) => !l.words.some((w) => w.id === id) && allWords.has(id))
    .sort(([, a], [, b]) => a.due - b.due || a.s - b.s)
    .slice(0, 3).map(([id]) => allWords.get(id)!);

  const startLesson = (l: Lesson) => {
    const start = () => {
      if (!mutate(spendEnergy)) return setEnergySheet(true);
      go({ s: 'session', kind: 'lesson', lessonId: l.id, build: () => buildLesson(l, pool, Date.now(), new Set(Object.keys(st.mem)), vocab(l.words), canListen(), recallFor(l), isBeacon(pack, l) ? 'listen' : undefined) });
    };
    if (!st.storySeen.includes(`${pack.level}-${l.island}`)) return openStory(pack.islands[l.island - 1], start);
    start();
  };
  const startTrial = (isl: Island) => {
    const ws = pack.lessons.filter((l) => l.island === isl.n && st.done[l.id]).flatMap((l) => l.words);
    go({ s: 'session', kind: 'trial', mode: 'boss', build: () => buildTrial(ws, pool, Date.now(), vocab(ws), canListen()) });
  };
  /** «Шторм»: 60 секунд быстрых вопросов по словам острова. Награда как у испытания (общий дневной лимит). */
  const startStorm = (isl: Island) => {
    const ws = pack.lessons.filter((l) => l.island === isl.n && st.done[l.id]).flatMap((l) => l.words);
    go({ s: 'session', kind: 'trial', mode: 'storm', build: () => buildStorm(ws, pool, Date.now()) });
  };
  const chest = (isl: Island) => {
    const got = mutate((s) => openChest(s, pack, isl.n));
    if (got) { haptic.reward(); sfx.coin(); setToast({ text: `Сундук открыт: +${got} ракушек` }); }
  };
  const finish = (kind: SessionKind, lessonId: string | undefined, o: SessionOutcome) => {
    const reward = recordSession({ kind, lessonId, accuracy: o.accuracy, seen: o.seen.map((w) => w.id), wrong: o.wrong.map((w) => w.id) }, packs);
    setSt(loadState());
    go({ s: 'result', result: { ...reward, accuracy: o.accuracy, wrongWords: o.wrong, kind } });
  };

  const toastEl = toast && <div class={'toast app-toast' + (toast.err ? ' err' : '')} role="status">{toast.text}</div>;

  switch (r.s) {
    case 'onboarding': return <><OnboardingScreen onNext={() => go({ s: 'pick' })} />{toastEl}</>;
    case 'pick': return <LevelPickScreen packs={packs} current={st.level} onPick={(level) => go({ s: 'minitest', level })}
      onBack={st.level ? () => toMap() : undefined} />;
    case 'minitest':
      return <MiniTestScreen pack={packs.find((p) => p.level === r.level)!} packs={packs}
        onDone={(l) => setLevel(l)} onBack={() => go({ s: 'pick' })} />;
    case 'session': return <LessonScreen build={r.build} mode={r.mode} onExit={() => { if (r.kind === 'lesson') mutate(refundEnergy); toMap(); }} onDone={(o) => finish(r.kind, r.lessonId, o)} />;
    case 'result': return <ResultScreen result={r.result} onNext={() => toMap()} />;
    case 'admin': return <><AdminScreen st={st} packs={packs} onBack={() => go({ s: 'tab', tab: 'profile' })}
      mutate={(fn) => { mutate(fn); setSt(settleAll(packs)[0]); }}
      onRefresh={() => { void fetchStatus().then((x) => x && applyServer(x, packs)); }} />{toastEl}</>;
    case 'about': return <AboutScreen index={index} onBack={() => go({ s: 'tab', tab: 'profile' })} />;
    case 'premium':
      return <><PremiumScreen isPremium={st.premium} until={st.premiumUntil} onBack={() => go({ s: 'tab', tab: r.from })}
        onSubscribe={() => buyStars(STAR_PREMIUM.id)}
        onDevToggle={() => { mutate((s) => { s.devPremiumUntil = s.premium ? 0 : nowMs() + 365 * 86400000; }); setSt(settleAll(packs)[0]); }} />
        {toastEl}</>;
  }

  const tab = r.tab;
  return (
    <>
      <TopBar st={st} level={tab === 'map' ? pack.level : undefined} onEnergy={() => setEnergySheet(true)} />
      {tab === 'map' && (
        <MapScreen pack={pack} st={st} due={due} hard={hard} onLesson={startLesson} onReview={startReview} onTrial={startTrial} onStorm={startStorm} onChest={chest}
          bottle={bottle} onBottle={answerBottle} onLog={setLog}
          onStory={(isl) => openStory(isl)} nextLevel={nextLevel} onNextLevel={goNextLevel} onPremium={() => openPremium()} />
      )}
      {tab === 'passport' && <PassportScreen st={st} />}
      {tab === 'shop' && <ShopScreen st={st} onBuy={(id) => mutate((s) => buyItem(s, id))} onBuyStars={buyStars} onPremium={() => openPremium()} />}
      {tab === 'profile' && (
        <ProfileScreen st={st} onPremium={() => openPremium()}
          onAbout={() => go({ s: 'about' })} onReset={resetAll} onInvite={invite} onAdmin={() => go({ s: 'admin' })} />
      )}
      {toastEl}
      <TabBar tab={tab} onTab={(t) => { haptic.select(); go({ s: 'tab', tab: t }); }} />
      {log && (() => { const ws = pack.lessons.filter((l) => l.island === log.n).flatMap((l) => l.words);
        return <LogSheet island={log} words={ws} vocab={vocab(ws)} onClose={() => setLog(null)} />; })()}
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
