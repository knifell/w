import {continueRender, delayRender, staticFile} from 'remotion';

// Unbounded / Onest: кириллица и латиница лежат в разных файлах — грузим обе половины.
const faces: [string, string, string][] = [
  ['Unbounded', 'unbounded-cyrillic-wght-normal.ttf', 'U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116'],
  ['Unbounded', 'unbounded-latin-wght-normal.ttf', 'U+0000-00FF,U+2000-206F'],
  ['Onest', 'onest-cyrillic-wght-normal.ttf', 'U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116'],
  ['Onest', 'onest-latin-wght-normal.ttf', 'U+0000-00FF,U+2000-206F'],
];
const handle = delayRender('fonts');
Promise.all(
  faces.map(([family, file, range]) => {
    const f = new FontFace(family, `url(${staticFile(file)})`, {weight: '100 900', unicodeRange: range});
    document.fonts.add(f);
    return f.load();
  }),
).then(() => continueRender(handle));
