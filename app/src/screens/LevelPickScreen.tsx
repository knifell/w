import type { Level, LevelPack } from '../types';
import { Icon } from '../components/Icon';

const INFO: Record<Level, { title: string; text: string }> = {
  A1: { title: 'Начинаю с нуля', text: 'Знаю буквы и пару слов' },
  A2: { title: 'Знаю основы', text: 'Понимаю простые фразы, могу рассказать о себе' },
  B1: { title: 'Могу поддержать разговор', text: 'Понимаю основное в фильмах и статьях' },
  B2: { title: 'Уверенно говорю', text: 'Спорю, обсуждаю работу, читаю новости' },
};

export function LevelPickScreen({ packs, current, onPick, onBack }: { packs: LevelPack[]; current: Level | null; onPick: (l: Level) => void; onBack?: () => void }) {
  return (
    <main class="pick">
      {onBack && <button class="link back" onClick={onBack}><Icon name="back" size={20} />Назад</button>}
      <h1>Какой у тебя уровень?</h1>
      <p class="hint">Выбери сам. Потом короткий тест из 8 вопросов подскажет, подходит ли уровень. Решать всё равно тебе.</p>
      {packs.map((p) => {
        const sample = p.lessons.slice(0, 3).flatMap((l) => l.words.slice(0, 2)).map((w) => w.en).join(', ');
        return (
          <button class={'card level-card' + (p.level === current ? ' on' : '')} onClick={() => onPick(p.level)}>
            <span class={'lvl ' + p.level}>{p.level}</span>
            <div class="level-txt">
              <b>{INFO[p.level].title}</b>
              <div class="hint">{INFO[p.level].text}</div>
              <div class="hint sample">{sample}…</div>
            </div>
            <Icon name="chevron" size={20} />
          </button>
        );
      })}
    </main>
  );
}
