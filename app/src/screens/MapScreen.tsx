import type { Island, Lesson, LevelPack, Word } from '../types';
import type { LocalState } from '../game/local';
import { islandState, lessonOpen, nextSteps, type IslandState } from '../game/progress';
import { today } from '../game/time';
import { REVIEW_MAX_WORDS } from '../game/config';
import { days, plural, words } from '../lib/format';
import { Flame, Icon } from '../components/Icon';
import { FogArt, IslandArt } from '../components/IslandArt';
import { ResidentArt } from '../components/Residents';

const ROW = 88;

/** Кораблик Шкипера у текущего урока. */
function Boat({ left }: { left: boolean }) {
  return (
    <svg class={'boat' + (left ? ' l' : '')} viewBox="0 0 44 40" aria-hidden="true">
      <path d="M21 4v24" stroke="#6e4826" stroke-width="2.5" stroke-linecap="round" />
      <path d="M23 6l14 18H23z" fill="#fff" stroke="#14263a" stroke-width="2" stroke-linejoin="round" />
      <path d="M19 10 8 24h11z" fill="#ffc83d" stroke="#14263a" stroke-width="2" stroke-linejoin="round" />
      <path d="M21 4l7 3-7 3z" fill="#ff6b4a" />
      <path d="M4 28h36l-6 8H10z" fill="#ff6b4a" stroke="#14263a" stroke-width="2" stroke-linejoin="round" />
      <path d="M2 38c4-2 8-2 12 0s8 2 12 0 8-2 12 0" fill="none" stroke="#7fd0f5" stroke-width="2" stroke-linecap="round" />
    </svg>
  );
}
const xAt = (i: number) => 50 + Math.sin(i * 1.1) * 28;

/** Пунктир маршрута между уроками острова. */
function Route({ n }: { n: number }) {
  let d = `M${xAt(0)} ${ROW / 2}`;
  for (let i = 1; i < n; i++) {
    const y0 = (i - 1) * ROW + ROW / 2, y1 = i * ROW + ROW / 2;
    d += ` C${xAt(i - 1)} ${y0 + ROW / 2} ${xAt(i)} ${y1 - ROW / 2} ${xAt(i)} ${y1}`;
  }
  return <svg class="route" viewBox={`0 0 100 ${n * ROW}`} preserveAspectRatio="none" aria-hidden="true"><path d={d} /></svg>;
}

interface Props {
  pack: LevelPack;
  st: LocalState;
  due: Word[];
  hard: Word[];
  onLesson: (l: Lesson) => void;
  onReview: (words: Word[]) => void;
  onTrial: (island: Island) => void;
  onStory: (island: Island) => void;
  onRetest: () => void;
  onPremium: () => void;
}

export function MapScreen({ pack, st, due, hard, onLesson, onReview, onTrial, onStory, onRetest, onPremium }: Props) {
  const day = today();
  const nextDue = Math.min(...Object.values(st.mem).map((m) => m.due));
  const current = pack.lessons.find((l) => !st.done[l.id])?.id;
  const steps = nextSteps(pack, st);
  const anyDone = pack.lessons.some((l) => st.done[l.id]);
  const streakToday = st.streak.last === day;
  // «Трудные слова»: где игрок ошибался чаще всего. Скромная ссылка, чтобы не перегружать карту.
  const hardLink = hard.length >= 3 && (
    <button class="link hard-link" onClick={() => onReview(hard)}>Трудные слова: {hard.length} — потренировать</button>
  );

  return (
    <main class="map">
      <div class="card review">
        <span class="banner-ico"><Icon name="refresh" /></span>
        {due.length ? (
          <>
            <div class="review-txt"><b>Повторение готово</b><div class="hint">{words(due.length)} · без энергии</div>{hardLink}</div>
            <button class="btn small" onClick={() => onReview(due.slice(0, REVIEW_MAX_WORDS))}>Повторить</button>
          </>
        ) : (
          <div class="review-txt"><b>Повторений пока нет</b><div class="hint">
            {Number.isFinite(nextDue) ? `Следующие слова созреют ${nextDue - day <= 1 ? 'завтра' : `через ${days(nextDue - day)}`}` : 'Пройди первый урок — слова появятся здесь'}
          </div>{hardLink}</div>
        )}
      </div>

      {!steps.nextLesson && anyDone && (
        <div class="card next-steps" role="region" aria-label="Что дальше">
          <b>{steps.blocked === 'premium' ? 'Бесплатные острова пройдены!' : steps.blocked === 'end' ? 'Все уроки пройдены!' : 'Новых уроков пока нет'}</b>
          <div class="hint">
            {steps.blocked === 'premium' ? 'Дальше острова с Premium. А пока закрепляй слова: повторения и испытания бесплатны и без энергии.'
              : steps.blocked === 'end' ? 'Новые острова появятся в обновлениях. Повторяй слова, чтобы они не забылись.'
              : 'Следующий остров откроется, когда закрепятся слова. Повторяй их в разные дни.'}
          </div>
          {!due.length && !streakToday && steps.trialIsland && (
            <div class="hint streak-tip"><Flame size={18} />Сегодня повторений нет — пройди испытание острова, и костёр не погаснет.</div>
          )}
          <div class="next-actions">
            {due.length > 0 && <button class="btn small" onClick={() => onReview(due.slice(0, REVIEW_MAX_WORDS))}>Повторить слова</button>}
            {steps.trialIsland && <button class="btn small alt" onClick={() => onTrial(steps.trialIsland!)}>Испытание острова</button>}
            {!st.premium && steps.blocked === 'premium' && <button class="btn small gold" onClick={onPremium}>Открыть все острова</button>}
          </div>
        </div>
      )}

      <h2 class="arch">{pack.title}</h2>
      {pack.islands.map((isl) => {
        const s = islandState(pack, isl, st);
        if (s.kind === 'fog') {
          if (isl.n > 1 && islandState(pack, pack.islands[isl.n - 2], st).kind === 'fog') return null;
          return (
            <section class="island fog" key={isl.n} aria-label={`Острова ${isl.n}–${pack.islands.length} скрыты в тумане`}>
              <FogArt trail />
            </section>
          );
        }
        const lessons = pack.lessons.filter((l) => l.island === isl.n);
        const islandDone = lessons.some((l) => st.done[l.id]);
        return (
          <section class={`island ${s.kind}`} key={isl.n}>
            <button class="island-head" onClick={() => (s.kind === 'premium' ? onPremium() : onStory(isl))}
              aria-label={s.kind === 'premium' ? `${isl.name}: доступен с Premium` : `${isl.name}: глава сюжета`}>
              <ResidentArt island={isl.n} size={44} />
              <div><div class="hint">Остров {isl.n}</div><h3>{isl.name}</h3></div>
              <span class="island-badge"><Icon name={s.kind === 'open' ? 'book' : s.kind === 'premium' ? 'crown' : 'lock'} /></span>
            </button>
            <IslandArt n={isl.n} />
            <IslandNote s={s} />
            <div class="path">
              <Route n={lessons.length} />
              {lessons.map((l, i) => {
                const open = lessonOpen(pack, l.day, st, s);
                const done = !!st.done[l.id];
                const cur = l.id === current && open;
                return (
                  <div class="stop" key={l.id} style={{ '--x': `${xAt(i)}%` }}>
                    {cur && <Boat left={xAt(i) > 55} />}
                    {cur && <span class="node-tag">{st.done[pack.lessons[0].id] ? 'Дальше' : 'Начать'}</span>}
                    <button class={'node' + (done ? ' done' : '') + (cur ? ' cur' : '')}
                      disabled={!open} onClick={() => onLesson(l)} title={l.title}
                      aria-label={`Урок ${l.day}: ${l.title}${done ? ', пройден' : open ? '' : ', закрыт'}`}>
                      {done ? <Icon name="check" size={30} stroke={3.2} /> : open ? l.day : <Icon name="lock" size={24} />}
                    </button>
                  </div>
                );
              })}
            </div>
            {s.kind === 'open' && islandDone && (
              <button class="btn alt trial" onClick={() => onTrial(isl)}><Icon name="swords" size={20} />Испытание острова · без энергии</button>
            )}
          </section>
        );
      })}

      {!pack.islands.some((isl) => islandState(pack, isl, st).kind === 'fog') && (
        <section class="island fog" aria-label="Дальше карта скрыта в тумане">
          <FogArt trail from={xAt(pack.lessons.filter((l) => l.island === pack.islands.length).length - 1)} />
        </section>
      )}
      {Object.keys(st.done).length < 3 && <button class="link" onClick={onRetest}>Не тот уровень? Выбрать другой</button>}
    </main>
  );
}

function IslandNote({ s }: { s: IslandState }) {
  if (s.kind === 'premium') return <div class="note">Остров доступен с Premium</div>;
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
