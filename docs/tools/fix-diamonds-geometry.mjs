/* fix-diamonds-geometry.mjs — 29/08/2026
 *
 * Run AFTER fix-diamonds-spacing.mjs. Undoes two compensations that script
 * made, because the real cause has now been measured.
 *
 * MEASURED off live (the T4S theme, custom Liquid panel), 1470px viewport:
 *
 *   .mm-inner--dg   grid  831px 328px   padding 24px 32px 48px
 *   container       1223px
 *
 * v3 was running the Diamonds panel on the shared 1160px / 768px+328px
 * geometry used by the ring panels. Live gives THIS panel a wider container
 * and a 831px main column — 63px more than we had. Every squeeze in the
 * sub-zones traces back to that: the cut grid could not hold 6 x 96px tracks
 * AND a readable aside inside 768px, so fix-diamonds-spacing pinned the aside
 * at 240px and let the tracks flex. Both were workarounds for a track that
 * was simply too narrow.
 *
 * With 831px:  586 (6x96 + 5x2) + 36 gap + 32 pad + 177 aside = 831. The
 * aside is tight at 177, so the sub-zone gap comes down to 28px and the
 * aside takes what remains — Natural / Lab-Grown still fits on one line at
 * 12.5px.
 *
 * Scoped to the tabbed panel via :has(), so the three ring panels keep the
 * 1160 / 768 geometry they measured correctly at.
 *
 * Refuses to write unless every target matches exactly once.
 * Run from the repo root:  node docs/tools/fix-diamonds-geometry.mjs
 * Delete this file once it has run and synced.
 */

import { readFile, writeFile } from 'node:fs/promises';

const FILE = 'sections/header-bottom.liquid';

const PAIRS = [
  {
    what: 'restore 96px cut tracks',
    find: `.fye .mm-dg-col .mm__cuts { grid-template-columns: repeat(6, minmax(0, 1fr)); }`,
    repl: `.fye .mm-dg-col .mm__cuts { grid-template-columns: repeat(6, 96px); }`
  },
  {
    what: 'aside flexes again, tighter sub-zone gap',
    find: `.fye .mm-dg-cols { display: flex; gap: 36px; align-items: flex-start; }
.fye .mm-dg-col { min-width: 0; flex: 1 1 auto; }
.fye .mm-dg-col--aside {
  flex: 0 0 240px;`,
    repl: `.fye .mm-dg-cols { display: flex; gap: 28px; align-items: flex-start; }
.fye .mm-dg-col { min-width: 0; flex: 0 0 auto; }
.fye .mm-dg-col--aside {
  flex: 1 1 auto;`
  },
  {
    what: 'diamonds panel geometry: 1223 container, 831 main',
    find: `.fye .mm-dg-colfoot { padding-top: 16px; }`,
    repl: `.fye .mm-dg-colfoot { padding-top: 16px; }

/* ---- diamonds panel geometry, measured off live 29/08/2026 --------------
   Live gives THIS panel a wider container and a wider main column than the
   ring panels: 1223 / 831 + 328, not 1160 / 768 + 328. Scoped so the ring
   panels are untouched. */
.fye .mega:has(.mm__tab-in) .mega__in {
  max-width: 1223px;
  grid-template-columns: 831px 328px;
  column-gap: 64px;
}`
  }
];

const count = (h, n) => h.split(n).length - 1;

const src = await readFile(FILE, 'utf8');
const problems = [];
for (const p of PAIRS) {
  const n = count(src, p.find);
  if (n !== 1) problems.push(`${n} match(es), expected 1 — ${p.what}`);
}

if (problems.length) {
  console.error(`REFUSED, ${FILE} not written:`);
  problems.forEach(m => console.error('  ' + m));
  process.exit(1);
}

let out = src;
for (const p of PAIRS) {
  out = out.replace(p.find, p.repl);
  console.log('ok  ' + p.what);
}

await writeFile(FILE, out, 'utf8');
console.log(`\nwrote ${FILE}`);
console.log('\nExpect the Diamonds panel to widen to 1223, the cut grid to sit on');
console.log('its proper 96px tracks, and Fancy Coloured to take the remainder.');
