// Картинки-сцены (Nano Banana → WebP в app/public/img). Нет картинки — показывается SVG.
const url = (f: string) => `${import.meta.env.BASE_URL}img/${f}.webp`;

/** Обложки островов по названию (названия уникальны во всех уровнях). Добавлять по мере готовности. */
const COVERS: Record<string, string> = {
  'Песчаный берег': 'a1-1',
};
export const coverOf = (islandName: string) => (COVERS[islandName] ? url(COVERS[islandName]) : null);

/** Слайды приветствия. */
export const ONB_IMG: Record<string, string> = { skipper: url('onb-1'), island: url('onb-2'), fog: url('onb-3') };
