import { useEffect, useState } from 'preact/hooks';
import { ONB_IMG } from '../components/art';

const SLIDES = [
  { art: 'skipper', title: 'Английский короткими уроками', text: 'Короткие уроки: сначала новые слова, потом задания на них. Проводник по архипелагу — краб Шкипер.' },
  { art: 'island', title: 'Слова, которые остаются', text: 'Интервальные повторения: следующий остров открывается, когда слова закрепились в памяти, а не просто пройдены.' },
  { art: 'fog', title: 'Курс растёт', text: 'Уровни от A1 до B2. Новые уроки и острова добавляются в обновлениях.' },
];

export function OnboardingScreen({ onNext }: { onNext: () => void }) {
  const [i, setI] = useState(0);
  const s = SLIDES[i];
  const last = i === SLIDES.length - 1;
  useEffect(() => { Object.values(ONB_IMG).forEach((u) => { new Image().src = u; }); }, []);
  return (
    <main class="onb">
      <div class="brand" aria-label="Остров слов">Остров <span>слов</span></div>
      <div class="onb-art has-img" key={i}>
        <img src={ONB_IMG[s.art]} alt="" width={720} height={720} decoding="async" />
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
