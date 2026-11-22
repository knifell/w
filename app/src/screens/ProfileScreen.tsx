import { useState } from 'preact/hooks';
import type { Level, LevelPack } from '../types';
import type { LocalState } from '../game/local';
import { MASTER_STAGE } from '../game/srs';
import { conqueredCount } from '../game/progress';
import { tg } from '../tg/telegram';
import { Flame, Icon } from '../components/Icon';
import { Skipper } from '../components/Skipper';

interface Props {
  st: LocalState; packs: LevelPack[];
  onLevel: (l: Level) => void; onPremium: () => void; onAbout: () => void; onRetest: () => void;
}

export function ProfileScreen({ st, packs, onLevel, onPremium, onAbout, onRetest }: Props) {
  const [sound, setSound] = useState(() => { try { return localStorage.getItem('sound') !== 'off'; } catch { return true; } });
  const mastered = Object.values(st.mem).filter((m) => m.s >= MASTER_STAGE).length;
  const canSwitch = st.premium || Object.keys(st.done).length < 3;
  const name = tg?.initDataUnsafe.user?.first_name ?? 'Путешественник';
  const toggleSound = () => { const v = !sound; setSound(v); try { localStorage.setItem('sound', v ? 'on' : 'off'); } catch { /* */ } };
  return (
    <main>
      <header class="profile-head">
        <span class="avatar"><Skipper size={62} /></span>
        <div>
          <h1>{name}</h1>
          <span class="plan">{st.premium && <Icon name="crown" size={16} />}{st.premium ? 'Premium' : 'Бесплатный план'} · уровень {st.level}</span>
        </div>
      </header>
      <div class="grid2">
        <div class="stat"><Icon name="star" /><b>{st.xp}</b><span>опыт</span></div>
        <div class="stat"><Flame size={24} /><b>{st.streak.best}</b><span>лучший костёр</span></div>
        <div class="stat"><Icon name="anchor" /><b>{mastered}</b><span>слов закреплено</span></div>
        <div class="stat"><Icon name="palm" /><b>{conqueredCount(st)}</b><span>островов покорено</span></div>
        <div class="stat"><Icon name="book" /><b>{st.counters.lessons ?? 0}</b><span>уроков</span></div>
        <div class="stat"><Icon name="ember" /><b>{st.inventory.ember ?? 0}</b><span>угля</span></div>
      </div>

      <section class="card">
        <b>Архипелаг</b>
        <div class="levels">
          {packs.map((p) => (
            <button class={'chip-btn' + (p.level === st.level ? ' on' : '')} disabled={!canSwitch || p.level === st.level} onClick={() => onLevel(p.level)}>{p.level}</button>
          ))}
        </div>
        <div class="hint">{st.premium ? 'С Premium открыты все уровни.' : canSwitch ? 'Пока пройдено меньше 3 уроков, уровень можно сменить бесплатно.' : 'Сменить уровень можно с Premium.'}</div>
        {canSwitch && <button class="link" onClick={onRetest}>Выбрать уровень и пройти мини-тест</button>}
      </section>

      <section class="card settings">
        <label><span><Icon name="speaker" />Произношение слов</span><input class="switch" type="checkbox" role="switch" checked={sound} onChange={toggleSound} /></label>
      </section>

      {!st.premium && <button class="btn gold" onClick={onPremium}><Icon name="crown" size={20} />Узнать о Premium</button>}
      <button class="link" onClick={onAbout}>О проекте и контенте</button>
    </main>
  );
}
