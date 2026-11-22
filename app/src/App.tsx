import { useEffect, useState } from 'preact/hooks';
import { loadIndex } from './api/content';
import type { ContentIndex } from './types';
import { GrowingBanner } from './components/GrowingBanner';

// Этап 1: каркас. Экраны (тест, карта, урок) появятся на этапах 2–3.
export function App() {
  const [index, setIndex] = useState<ContentIndex | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { loadIndex().then(setIndex, (e) => setError(String(e))); }, []);

  return (
    <main>
      <h1>🦀 Остров слов</h1>
      <p class="hint">Английский как морское путешествие.</p>
      <GrowingBanner />
      {error && <div class="card">Ошибка загрузки: {error}</div>}
      {index?.levels.map((l) => (
        <div class="card" key={l.level}>
          <h3>{l.level} · {l.title}</h3>
          <div class="hint">Уроков: {l.lessons} · Слов: {l.words}</div>
        </div>
      ))}
    </main>
  );
}
