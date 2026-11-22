import type { Island } from '../types';
import { IslandArt } from '../components/IslandArt';

/** Глава острова. Нажатие мимо окна только закрывает его; урок стартует по кнопке «В путь!». */
export function StorySheet({ island, onClose, onGo }: { island: Island; onClose: () => void; onGo: () => void }) {
  return (
    <div class="overlay" onClick={onClose}>
      <div class="sheet story" role="dialog" aria-label={`Глава ${island.n}`} onClick={(e) => e.stopPropagation()}>
        <div class="sheet-art"><IslandArt n={island.n} /></div>
        <div class="hint">Глава {island.n}</div>
        <h2>{island.name}</h2>
        <p class="story-text">{island.story}</p>
        <p class="hint">Продолжение истории появится в следующих обновлениях.</p>
        <button class="btn" onClick={onGo}>В путь!</button>
      </div>
    </div>
  );
}
