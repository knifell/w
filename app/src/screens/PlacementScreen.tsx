import { useMemo, useState } from 'preact/hooks';
import type { Level, LevelPack } from '../types';
import { placementQuestions } from '../engine/generators';
import { ChoiceView } from './lesson/ChoiceView';
import { haptic } from '../tg/telegram';

const ORDER: Level[] = ['A1', 'A2', 'B1', 'B2'];
const PER_LEVEL = 4;
const MAX_WRONG = 1; // 2 ошибки на уровне — уровень не сдан

interface Props { packs: LevelPack[]; onDone: (level: Level, note?: string) => void }

export function PlacementScreen({ packs, onDone }: Props) {
  const tested = useMemo(() => ORDER.filter((l) => packs.some((p) => p.level === l && p.lessons.length)), [packs]);
  const qs = useMemo(() => tested.map((l) => placementQuestions(packs.find((p) => p.level === l)!.lessons.flatMap((x) => x.words), PER_LEVEL)), [tested]);
  const [li, setLi] = useState(0);
  const [qi, setQi] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [locked, setLocked] = useState(false);

  const finish = (failedAt: number | null) => {
    let target: Level;
    if (failedAt !== null) target = tested[failedAt];
    else target = ORDER[Math.min(ORDER.indexOf(tested[tested.length - 1]) + 1, ORDER.length - 1)];
    // если для уровня нет контента — ближайший готовый
    if (!tested.includes(target)) {
      const idx = ORDER.indexOf(target);
      const near = [...tested].sort((a, b) => Math.abs(ORDER.indexOf(a) - idx) - Math.abs(ORDER.indexOf(b) - idx))[0];
      return onDone(near, `Твой уровень — ${target}. Его острова ещё строятся, поэтому начнём с ${near}.`);
    }
    onDone(target);
  };

  const answer = (ok: boolean) => {
    ok ? haptic.ok() : haptic.bad();
    setLocked(true);
    setTimeout(() => {
      setLocked(false);
      const w = wrong + (ok ? 0 : 1);
      if (w > MAX_WRONG) return finish(li);
      if (qi + 1 < PER_LEVEL) { setWrong(w); setQi(qi + 1); return; }
      if (li + 1 < tested.length) { setLi(li + 1); setQi(0); setWrong(0); return; }
      finish(null);
    }, 600);
  };

  const done = li * PER_LEVEL + qi;
  const ex = qs[li][qi];
  if (ex.kind !== 'choice') return null;
  return (
    <div class="lesson">
      <div class="lesson-top"><span class="hint">Тест уровня</span>
        <div class="bar"><div style={{ width: `${(done / (tested.length * PER_LEVEL)) * 100}%` }} /></div></div>
      <ChoiceView key={`${li}-${qi}`} ex={ex} locked={locked} onSubmit={(s) => answer(s.ok)} />
      {!locked && <button class="link idk" onClick={() => answer(false)}>Не знаю</button>}
    </div>
  );
}
