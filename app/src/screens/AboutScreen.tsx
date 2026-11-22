import { useState } from 'preact/hooks';
import type { ContentIndex } from '../types';

export function AboutScreen({ index, onBack, onReset }: { index: ContentIndex | null; onBack: () => void; onReset: () => void }) {
  const [sure, setSure] = useState(false);
  return (
    <main>
      <button class="link back" onClick={onBack}>← Назад</button>
      <h1>🧭 О проекте</h1>
      <div class="card banner">
        <b>Честно о контенте</b>
        <p>«Остров слов» — молодой проект. Уроки, острова и главы сюжета добавляются постепенно. Часть карты пока в тумане — это нормально, мы строим её дальше.</p>
      </div>
      <div class="card">
        <b>Что уже готово</b>
        {index?.levels.map((l) => <div class="row">{l.level} · {l.title}: {l.lessons} ур., {l.words} слов</div>)}
        {index && <div class="hint">Обновление контента: {new Date(index.builtAt).toLocaleDateString('ru-RU')}</div>}
      </div>
      <div class="card">
        <b>В планах</b>
        <div class="row">• Новые острова для всех уровней</div>
        <div class="row">• Уровень C1</div>
        <div class="row">• Недельные экспедиции и сезонные альбомы</div>
        <div class="row">• Новые главы истории Шкипера</div>
      </div>
      <div class="hint">Нашёл ошибку в слове? Нажми «Я ответил верно» в уроке — мы проверим.</div>
      {sure ? (
        <div class="card">
          <b>Стереть весь прогресс?</b>
          <div class="hint">Опыт, ракушки, штампы и выученные слова удалятся. Это нельзя отменить.</div>
          <button class="btn alt" onClick={onReset}>Да, начать заново</button>
          <button class="link" onClick={() => setSure(false)}>Отмена</button>
        </div>
      ) : <button class="link" onClick={() => setSure(true)}>Начать заново</button>}
    </main>
  );
}
