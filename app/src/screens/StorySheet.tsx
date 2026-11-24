import type { Island } from '../types';
import { IslandArt } from '../components/IslandArt';
import { ResidentArt, residentOf } from '../components/Residents';
import { coverOf } from '../components/art';

/** Глава острова. Нажатие мимо окна только закрывает его; урок стартует по кнопке «В путь!». */
export function StorySheet({ island, onClose, onGo }: { island: Island; onClose: () => void; onGo: () => void }) {
  return (
    <div class="overlay" onClick={onClose}>
      <div class="sheet story" role="dialog" aria-label={`Глава ${island.n}`} onClick={(e) => e.stopPropagation()}>
        {coverOf(island.name)
          ? <div class="sheet-art img"><img src={coverOf(island.name)!} alt="" width={960} height={540} decoding="async" /></div>
          : <div class="sheet-art"><IslandArt n={island.n} /></div>}
        <div class="hint">Глава {island.n}</div>
        <h2>{island.name}</h2>
        <p class="story-text">{island.story}</p>
        <div class="resident-row">
          <ResidentArt island={island.n} size={84} />
          <div class="resident-say"><b>{residentOf(island.n).name}</b><span>{residentOf(island.n).line}</span></div>
        </div>
        <p class="hint">Продолжение истории появится в следующих обновлениях.</p>
        <button class="btn" onClick={onGo}>В путь!</button>
      </div>
    </div>
  );
}
