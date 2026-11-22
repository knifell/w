import { useState } from 'preact/hooks';
import type { Island, Lesson, LevelPack, Word } from '../types';
import { liveStreak, type LocalState } from '../game/local';
import { islandState, lessonOpen, type IslandState } from '../game/progress';
import { isDue } from '../game/srs';
import { today } from '../game/time';
import { REVIEW_MAX_WORDS } from '../game/economy';
import { GrowingBanner } from '../components/GrowingBanner';

interface Props {
  pack: LevelPack;
  allWords: Map<string, Word>;
  st: LocalState;
  onLesson: (l: Lesson) => void;
  onReview: (words: Word[]) => void;
  onStory: (island: Island) => void;
  onRetest: () => void;
}

const plural = (n: number, f: [string, string, string]) =>
  f[n % 10 === 1 && n % 100 !== 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2];
const days = (n: number) => `${n} ${plural(n, ['день', 'дня', 'дней'])}`;

export function MapScreen({ pack, allWords, st, onLesson, onReview, onStory, onRetest }: Props) {
  const day = today();
  const due = Object.entries(st.mem)
    .filter(([id, m]) => isDue(m, day) && allWords.has(id))
    .sort((a, b) => a[1].due - b[1].due || b[1].wrong - a[1].wrong)
    .map(([id]) => allWords.get(id)!);
  const nextDue = Math.min(...Object.values(st.mem).map((m) => m.due));
  const lessonsDone = Object.keys(st.done).length;
  const [current] = useState(() => pack.lessons.find((l) => !st.done[l.id])?.id);

  return (
    <main class="map">
      <div class="topbar">
        <span class="chip">{pack.level}</span>
        <span class="stats-row">🔥 {liveStreak(st)} · ⭐ {st.xp} · 🐚 {st.coins}</span>
      </div>

      <div class="card review">
        {due.length ? (
          <>
            <div><b>Повторение готово</b><div class="hint">{due.length} {plural(due.length, ['слово', 'слова', 'слов'])} · без энергии</div></div>
            <button class="btn small" onClick={() => onReview(due.slice(0, REVIEW_MAX_WORDS))}>Повторить</button>
          </>
        ) : (
          <div><b>Повторений пока нет</b><div class="hint">
            {Number.isFinite(nextDue) ? `Следующие слова созреют ${nextDue - day <= 1 ? 'завтра' : `через ${days(nextDue - day)}`}` : 'Пройди первый урок — слова появятся здесь'}
          </div></div>
        )}
      </div>

      <h2 class="arch">{pack.title}</h2>
      {pack.islands.map((isl) => {
        const s = islandState(pack, isl, st);
        if (s.kind === 'fog') {
          const prevFog = isl.n > 1 && islandState(pack, pack.islands[isl.n - 2], st).kind === 'fog';
          if (prevFog) return null;
          const rest = pack.islands.slice(isl.n - 1);
          return (
            <section class="island fog" key={isl.n}>
              <div class="island-head"><div><div class="hint">Острова {isl.n}–{pack.islands.length}</div>
                <h3>В тумане 🌫️</h3></div></div>
              <div class="note">{rest.map((i) => i.name).join(' · ')}<span class="hint">Строим уроки и главы сюжета — появятся в обновлениях.</span></div>
            </section>
          );
        }
        const lessons = pack.lessons.filter((l) => l.island === isl.n);
        return (
          <section class={`island ${s.kind}`} key={isl.n}>
            <div class="island-head" onClick={() => onStory(isl)}>
              <div><div class="hint">Остров {isl.n}</div><h3>{isl.name}</h3></div>
              <span>{s.kind === 'open' ? '📜' : s.kind === 'premium' ? '👑' : '🔒'}</span>
            </div>
            <IslandNote s={s} />
            {(
              <div class="path">
                {lessons.map((l, i) => {
                  const open = lessonOpen(pack, l.day, st, s);
                  const done = !!st.done[l.id];
                  return (
                    <button key={l.id} class={'node' + (done ? ' done' : '') + (l.id === current && open ? ' cur' : '')}
                      style={{ marginLeft: `${50 + Math.sin(i * 1.1) * 28}%` }} disabled={!open}
                      onClick={() => onLesson(l)} title={l.title}>
                      {done ? '✓' : open ? l.day : '🔒'}
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}

      <GrowingBanner />
      {lessonsDone < 3 && <button class="link" onClick={onRetest}>Не тот уровень? Пройти тест заново</button>}
    </main>
  );
}

function IslandNote({ s }: { s: IslandState }) {
  if (s.kind === 'premium') return <div class="note">Остров доступен с Premium</div>;
  if (s.kind !== 'locked') return null;
  const pct = s.total ? Math.round((s.mastered / s.need) * 100) : 0;
  return (
    <div class="note">
      Откроется, когда закрепишь {s.need} из {s.total} слов прошлого острова: {s.mastered}/{s.need}
      <div class="bar thin"><div style={{ width: `${Math.min(100, pct)}%` }} /></div>
      {Number.isFinite(s.minDays) ? (s.minDays > 0 ? <span class="hint">Минимум через {days(s.minDays)} повторений</span> : null)
        : <span class="hint">Сначала пройди все уроки прошлого острова</span>}
    </div>
  );
}
