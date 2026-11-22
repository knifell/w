// Временный список уроков (этап 2). На этапе 3 заменится картой островов.
import { useEffect, useState } from 'preact/hooks';
import { loadIndex, loadLevel } from '../api/content';
import type { Lesson, LevelPack } from '../types';
import { GrowingBanner } from '../components/GrowingBanner';
import { loadState } from '../game/local';

export function HomeScreen({ onStart }: { onStart: (lesson: Lesson, pack: LevelPack) => void }) {
  const [packs, setPacks] = useState<LevelPack[]>([]);
  const [error, setError] = useState('');
  const st = loadState();
  useEffect(() => {
    loadIndex().then((i) => Promise.all(i.levels.map((l) => loadLevel(l.level)))).then(setPacks, (e) => setError(String(e)));
  }, []);
  return (
    <main>
      <div class="topbar"><h1>🦀 Остров слов</h1><span>⭐ {st.xp} · 🐚 {st.coins}</span></div>
      <GrowingBanner />
      {error && <div class="card">Ошибка загрузки: {error}</div>}
      {packs.map((p) => (
        <section key={p.level}>
          <h3>{p.level} · {p.title}</h3>
          {p.lessons.map((l) => (
            <button class="card lesson-row" onClick={() => onStart(l, p)}>
              <span>День {l.day}. {l.title}</span>
              <span>{st.done[l.id] ? `✓ ${st.done[l.id].best}%` : '▶'}</span>
            </button>
          ))}
        </section>
      ))}
    </main>
  );
}
