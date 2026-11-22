import type { ContentIndex } from '../types';

export function AboutScreen({ index, onBack }: { index: ContentIndex | null; onBack: () => void }) {
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
        <div class="row">• По 60 уроков на A1 и B2</div>
        <div class="row">• Новые острова для всех уровней</div>
        <div class="row">• Недельные экспедиции и сезонные альбомы</div>
        <div class="row">• Новые главы истории Шкипера</div>
      </div>
      <div class="hint">Нашёл ошибку в слове? Нажми «Я ответил верно» в уроке — мы проверим.</div>
    </main>
  );
}
