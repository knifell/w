import { useState } from 'preact/hooks';
import type { ContentIndex } from '../types';
import { Icon } from '../components/Icon';

export function AboutScreen({ index, onBack, onReset }: { index: ContentIndex | null; onBack: () => void; onReset: () => void }) {
  const [sure, setSure] = useState(false);
  return (
    <main class="about">
      <button class="link back" onClick={onBack}><Icon name="back" size={20} />Назад</button>
      <h1>О проекте</h1>
      <div class="card banner">
        <span class="banner-ico"><Icon name="compass" /></span>
        <div>
          <b>Честно о контенте</b>
          <p class="hint">«Остров слов» — молодой проект. Уроки, острова и главы сюжета добавляются постепенно. Часть карты пока в тумане — это нормально, мы строим её дальше.</p>
        </div>
      </div>
      <div class="card">
        <b>Что уже готово</b>
        {index?.levels.map((l) => (
          <div class="lvl-row"><span class={'lvl ' + l.level}>{l.level}</span><div><b>{l.title}</b><div class="hint">{l.lessons} ур., {l.words} слов</div></div></div>
        ))}
        {index && <div class="hint">Обновление контента: {new Date(index.builtAt).toLocaleDateString('ru-RU')}</div>}
      </div>
      <div class="card">
        <b>В планах</b>
        <div class="plan-row">Новые острова для всех уровней</div>
        <div class="plan-row">Уровень C1</div>
        <div class="plan-row">Недельные экспедиции и сезонные альбомы</div>
        <div class="plan-row">Новые главы истории Шкипера</div>
      </div>
      <div class="foot-note hint"><Icon name="info" size={20} />Нашёл ошибку в слове? Нажми «Я ответил верно» в уроке — мы проверим.</div>
      {sure ? (
        <div class="card">
          <b>Стереть весь прогресс?</b>
          <p class="hint">Опыт, ракушки, штампы и выученные слова удалятся. Это нельзя отменить.</p>
          <button class="btn bad" onClick={onReset}>Да, начать заново</button>
          <button class="link" onClick={() => setSure(false)}>Отмена</button>
        </div>
      ) : <button class="link danger" onClick={() => setSure(true)}>Начать заново</button>}
    </main>
  );
}
