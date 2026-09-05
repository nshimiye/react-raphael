import { Raphael } from '../src/index.js';

// Original 5×7 pixel alphabet for the Print example; distributed under this repo's MIT license.
const glyphs = {
  V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  C: ['01111', '10000', '10000', '10000', '10000', '10000', '01111'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
};
Raphael.registerFont({
  w: 6,
  face: {
    'font-family': 'Playground Pixel',
    'font-weight': 400,
    'font-stretch': 'normal',
    'units-per-em': 7,
    bbox: '0 0 6 7',
    descent: 0,
  },
  glyphs: Object.fromEntries(
    Object.entries(glyphs).map(([letter, rows]) => [
      letter,
      {
        w: 6,
        d: rows
          .flatMap((row, y) =>
            [...row].map((pixel, x) =>
              pixel === '1' ? `m${x},${y}l${x + 1},${y}l${x + 1},${y + 1}l${x},${y + 1}x` : '',
            ),
          )
          .join('')
          .slice(1),
      },
    ]),
  ),
});
