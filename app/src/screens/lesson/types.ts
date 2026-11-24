import type { Exercise } from '../../engine/generators';

export interface Submit {
  ok: boolean;
  typo?: boolean;
  typoLimit?: boolean; // опечатка в этом слове уже не первый раз — не засчитана
  correct: string;   // что показать как правильный ответ
  input?: string;    // что ввёл игрок (для «Я ответил верно»)
  wrongIds?: string[]; // слова с ошибками (для пар)
  learn?: boolean;     // карточка нового слова, без оценки
  say?: string;        // что озвучить после верного ответа (фраза целиком), иначе correct
}
export interface ViewProps<K extends Exercise['kind']> {
  ex: Extract<Exercise, { kind: K }>;
  locked: boolean;
  onSubmit: (s: Submit) => void;
  quick?: boolean;     // «Шторм»: ответ сразу по нажатию, без кнопки «Проверить»
}
