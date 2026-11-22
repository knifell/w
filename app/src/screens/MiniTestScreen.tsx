import { useMemo, useState } from 'preact/hooks';
import type { Level, LevelPack } from '../types';
import { buildMiniTest } from '../engine/generators';
import { ChoiceView } from './lesson/ChoiceView';
import { TypeView } from './lesson/TypeView';
import { haptic } from '../tg/telegram';
import { Skipper } from '../components/Skipper';
import { Icon } from '../components/Icon';

const ORDER: Level[] = ['A1', 'A2', 'B1', 'B2'];

interface Props { pack: LevelPack; packs: LevelPack[]; onDone: (l: Level) => void; onBack: () => void }

export function MiniTestScreen({ pack, packs, onDone, onBack }: Props) {
  const qs = useMemo(() => buildMiniTest(pack.lessons.flatMap((l) => l.words)), [pack]);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [locked, setLocked] = useState(false);

  const answer = (ok: boolean) => {
    ok ? haptic.ok() : haptic.bad();
    setLocked(true);
    setTimeout(() => { setLocked(false); setScore((s) => s + (ok ? 1 : 0)); setI((n) => n + 1); }, 600);
  };

  if (i >= qs.length) {
    const has = (l: Level) => packs.some((p) => p.level === l);
    const idx = ORDER.indexOf(pack.level);
    const up = ORDER[idx + 1], down = ORDER[idx - 1];
    const tooEasy = score >= 7 && up && has(up);
    const tooHard = score <= 3 && down && has(down);
    return (
      <main class="result">
        <Skipper mood={tooHard ? 'oops' : tooEasy ? 'happy' : 'proud'} size={170} />
        <h1>{score} из {qs.length}</h1>
        <p>{tooHard ? `Уровень ${pack.level} пока сложноват. Советуем начать с ${down}: там слова, на которых строится ${pack.level}.`
          : tooEasy ? `Похоже, ${pack.level} для тебя лёгкий. Можно сразу на ${up}.`
          : score <= 3 ? `Уровень ${pack.level} — хороший старт: все эти слова ты выучишь в уроках.`
          : `Уровень ${pack.level} тебе подходит: часть слов знакома, остальное выучишь в уроках.`}</p>
        {tooHard && <button class="btn" onClick={() => onDone(down)}>Начать с {down}</button>}
        {tooEasy && <button class="btn" onClick={() => onDone(up)}>Перейти на {up}</button>}
        <button class={tooHard || tooEasy ? 'btn alt' : 'btn'} onClick={() => onDone(pack.level)}>
          {tooHard || tooEasy ? `Остаться на ${pack.level}` : 'Поехали!'}
        </button>
      </main>
    );
  }

  const ex = qs[i];
  return (
    <div class="lesson">
      <div class="lesson-top">
        <button class="x" aria-label="Назад" onClick={onBack}><Icon name="back" /></button>
        <div class="bar"><div style={{ width: `${(i / qs.length) * 100}%` }} /></div>
        <span class="hint">{pack.level}</span>
      </div>
      {ex.kind === 'choice' && <ChoiceView key={i} ex={ex} locked={locked} onSubmit={(s) => answer(s.ok)} />}
      {ex.kind === 'type' && <TypeView key={i} ex={ex} locked={locked} onSubmit={(s) => answer(s.ok)} />}
      <div class="test-links">
        {!locked && <button class="link idk" onClick={() => answer(false)}>Не знаю</button>}
        <button class="link skip" onClick={() => onDone(pack.level)}>Начать без теста</button>
      </div>
    </div>
  );
}
