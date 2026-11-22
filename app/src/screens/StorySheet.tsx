import type { Island } from '../types';

export function StorySheet({ island, onClose }: { island: Island; onClose: () => void }) {
  return (
    <div class="overlay" onClick={onClose}>
      <div class="sheet story" onClick={(e) => e.stopPropagation()}>
        <div class="hint">Глава {island.n}</div>
        <h2>{island.name}</h2>
        <p>{island.story}</p>
        <p class="hint">Продолжение истории появится в следующих обновлениях.</p>
        <button class="btn" onClick={onClose}>В путь!</button>
      </div>
    </div>
  );
}
