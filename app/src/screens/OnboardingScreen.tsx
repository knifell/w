import { useState } from 'preact/hooks';
import { Skipper } from '../components/Skipper';
import { FogArt, IslandArt } from '../components/IslandArt';

const SLIDES = [
  { art: 'skipper', title: 'Привет, я Шкипер!', text: 'Вместе поплывём по архипелагам английского. Каждый урок: сначала учишь новые слова, потом применяешь их в заданиях.' },
  { art: 'island', title: 'Острова открываются памятью', text: 'Следующий остров откроется, когда слова закрепятся: повтори их в разные дни. Так слова остаются в голове надолго.' },
  { art: 'fog', title: 'Мир растёт', text: 'Мы честно говорим: контент и сюжет постоянно дополняются. Новые острова будут появляться.' },
];

export function OnboardingScreen({ onNext }: { onNext: () => void }) {
  const [i, setI] = useState(0);
  const s = SLIDES[i];
  const last = i === SLIDES.length - 1;
  return (
    <main class="onb">
      <div class="onb-art" key={i}>
        {s.art === 'skipper' && <Skipper mood="wave" size={200} />}
        {s.art === 'island' && <IslandArt n={2} />}
        {s.art === 'fog' && <FogArt />}
      </div>
      <h1>{s.title}</h1>
      <p>{s.text}</p>
      <div class="onb-foot">
        <div class="dots" aria-hidden="true">{SLIDES.map((_, j) => <span class={j === i ? 'on' : ''} />)}</div>
        {last ? (
          <button class="btn" onClick={onNext}>Выбрать уровень</button>
        ) : <button class="btn" onClick={() => setI(i + 1)}>Дальше</button>}
      </div>
    </main>
  );
}
