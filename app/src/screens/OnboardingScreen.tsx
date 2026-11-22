import { useState } from 'preact/hooks';

const SLIDES = [
  { icon: '🦀', title: 'Привет, я Шкипер!', text: 'Вместе поплывём по архипелагам английского. Каждый остров — новые слова и глава истории.' },
  { icon: '🏝️', title: 'Острова открываются памятью', text: 'Следующий остров откроется, когда слова закрепятся: повтори их в разные дни. Так слова остаются в голове надолго.' },
  { icon: '🧭', title: 'Мир растёт', text: 'Мы честно говорим: контент и сюжет постоянно дополняются. Новые острова будут появляться.' },
];

export function OnboardingScreen({ onTest, onSkip }: { onTest: () => void; onSkip: () => void }) {
  const [i, setI] = useState(0);
  const s = SLIDES[i];
  const last = i === SLIDES.length - 1;
  return (
    <main class="onb">
      <div class="onb-icon">{s.icon}</div>
      <h1>{s.title}</h1>
      <p>{s.text}</p>
      <div class="dots">{SLIDES.map((_, j) => <span class={j === i ? 'on' : ''} />)}</div>
      {last ? (
        <>
          <button class="btn" onClick={onTest}>Пройти тест уровня (≈2 мин)</button>
          <button class="link" onClick={onSkip}>Пропустить, начать с A2</button>
        </>
      ) : <button class="btn" onClick={() => setI(i + 1)}>Дальше</button>}
    </main>
  );
}
