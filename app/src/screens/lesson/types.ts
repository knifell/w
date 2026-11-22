import type { Exercise } from '../../engine/generators';

export interface Submit {
  ok: boolean;
  typo?: boolean;
  correct: string;   // что показать как правильный ответ
  input?: string;    // что ввёл игрок (для «Я ответил верно»)
  wrongIds?: string[]; // слова с ошибками (для пар)
  learn?: boolean;     // карточка нового слова, без оценки
}
export interface ViewProps<K extends Exercise['kind']> {
  ex: Extract<Exercise, { kind: K }>;
  locked: boolean;
  onSubmit: (s: Submit) => void;
}
