import type { Island, Lesson, LevelPack, Word } from '../types';
import type { LocalState } from '../game/local';
import { islandState, lessonOpen, type IslandState } from '../game/progress';
import { RESCUE_SESSIONS } from '../game/streak';
import { today } from '../game/time';
import { REVIEW_MAX_WORDS } from '../game/config';
import { days, words } from '../lib/format';
import { GrowingBanner } from '../components/GrowingBanner';

interface Props {
  pack: LevelPack;
  st: LocalState;
  due: Word[];
  onLesson: (l: Lesson) => void;
  onReview: (words: Word[]) => void;
  onTrial: (island: Island) => void;
  onStory: (island: Island) => void;
  onRetest: () => void;
  onPremium: () => void;
}

export function MapScreen({ pack, st, due, onLesson, onReview, onTrial, onStory, onRetest, onPremium }: Props) {
  const day = today();
  const nextDue = Math.min(...Object.values(st.mem).map((m) => m.due));
  const current = pack.lessons.find((l) => !st.done[l.id])?.id;

  return (
    <main class="map">
      {st.rescue?.day === day && (
        <div class="card banner rescue">🔥 <b>Костёр гаснет!</b> Позанимайся ещё {RESCUE_SESSIONS - st.rescue.count} раз(а) сегодня, чтобы сохранить серию {days(st.streak.cur)}.</div>
      )}
      <div class="card review">
        {due.length ? (
          <>
            <div><b>Повторение готово</b><div class="hint">{words(due.length)} · без энергии</div></div>
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
          if (isl.n > 1 && islandState(pack, pack.islands[isl.n - 2], st).kind === 'fog') return null;
          const rest = pack.islands.slice(isl.n - 1);
          return (
            <section class="island fog" key={isl.n}>
              <div class="island-head"><div><div class="hint">Острова {isl.n}–{pack.islands.length}</div><h3>В тумане 🌫️</h3></div></div>
              <div class="note">{rest.map((i) => i.name).join(' · ')}<span class="hint">Строим уроки и главы сюжета — появятся в обновлениях.</span></div>
            </section>
          );
        }
        const lessons = pack.lessons.filter((l) => l.island === isl.n);
        const anyDone = lessons.some((l) => st.done[l.id]);
        return (
          <section class={`island ${s.kind}`} key={isl.n}>
            <div class="island-head" onClick={() => (s.kind === 'premium' ? onPremium() : onStory(isl))}>
              <div><div class="hint">Остров {isl.n}</div><h3>{isl.name}</h3></div>
              <span>{s.kind === 'open' ? '📜' : s.kind === 'premium' ? '👑' : '🔒'}</span>
            </div>
            <IslandNote s={s} />
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
            {s.kind === 'open' && anyDone && (
              <button class="btn alt trial" onClick={() => onTrial(isl)}>⚔️ Испытание острова · без энергии</button>
            )}
          </section>
        );
      })}

      <GrowingBanner />
      {Object.keys(st.done).length < 3 && <button class="link" onClick={onRetest}>Не тот уровень? Выбрать другой</button>}
    </main>
  );
}

function IslandNote({ s }: { s: IslandState }) {
  if (s.kind === 'premium') return <div class="note">Остров доступен с Premium 👑</div>;
  if (s.kind !== 'locked') return null;
  if (s.reason === 'lessons') return <div class="note">Пройди все уроки прошлого острова</div>;
  if (s.reason === 'expedition')
    return <div class="note">Слова закреплены! Экспедиция отправится через {days(s.minDays)} — пока повторяй и проходи испытания.</div>;
  const pct = Math.round((s.mastered / s.need) * 100);
  return (
    <div class="note">
      Закрепи {s.need} из {s.total} слов прошлого острова: {s.mastered}/{s.need}
      <div class="bar thin"><div style={{ width: `${Math.min(100, pct)}%` }} /></div>
      {s.minDays > 0 && <span class="hint">При ежедневных повторениях — примерно через {days(s.minDays)}</span>}
    </div>
  );
}
