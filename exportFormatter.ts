
import { Citation } from '../types';

export const generateRIS = (citations: Citation[]): string => {
  return citations.map(c => {
    return [
      'TY  - BOOK',
      `AU  - ${c.authors.join('; ')}`,
      `TI  - ${c.title}`,
      `PY  - ${c.year}`,
      `PB  - ${c.publisher}`,
      `SP  - ${c.page}`,
      `N1  - ${c.snippet}`,
      `UR  - ${c.sourceUrl}`,
      'ER  - '
    ].join('\r\n');
  }).join('\r\n');
};

export const generateBibTeX = (citations: Citation[]): string => {
  return citations.map((c, index) => {
    const citeKey = `ref${index + 1}_${c.year}`;
    return `@book{${citeKey},
  author = {${c.authors.join(' and ')}},
  title = {${c.title}},
  year = {${c.year}},
  publisher = {${c.publisher}},
  note = {Halaman: ${c.page}. ${c.snippet}},
  url = {${c.sourceUrl}}
}`;
  }).join('\n\n');
};
