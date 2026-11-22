import type { Island } from '../types';
import { IslandArt } from '../components/IslandArt';

export function StorySheet({ island, onClose }: { island: Island; onClose: () => void }) {
  return (
    <div class="overlay" onClick={onClose}>
      <div class="sheet story" role="dialog" aria-label={`Глава ${island.n}`} onClick={(e) => e.stopPropagation()}>
        <div class="sheet-art"><IslandArt n={island.n} /></div>
        <div class="hint">Глава {island.n}</div>
        <h2>{island.name}</h2>
        <p class="story-text">{island.story}</p>
        <p class="hint">Продолжение истории появится в следующих обновлениях.</p>
        <button class="btn" onClick={onClose}>В путь!</button>
      </div>
    </div>
  );
}
