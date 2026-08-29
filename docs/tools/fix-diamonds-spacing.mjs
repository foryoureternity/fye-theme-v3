/* fix-diamonds-spacing.mjs — 29/08/2026
 *
 * Run AFTER fix-diamonds-panel.mjs. Anchored on that script's CSS so it
 * refuses if the rebuild has not landed.
 *
 * Compared v3's Diamonds tab against live side by side. The structure is now
 * right; the spacing is not. Five faults, all in the sub-zones:
 *
 * 1. THE ASIDE IS TOO NARROW — "NATURAL / LAB-GROWN" wraps mid-word in v3 and
 *    sits on one line in live. Cause: .mm-dg-col is flex 0 0 auto around a
 *    fixed 6 x 96px grid = 586px, so inside a 768px track the aside was left
 *    768 - 586 - 36 - 32 = 114px. Fix: pin the aside at 240px and let the cut
 *    grid flex into what remains. The grid's tracks give up a few px each;
 *    the aside stops wrapping. (Live gives the cut grid 96px tracks in a
 *    wider main track — matching that needs the per-panel 928/231 split,
 *    which is a separate change and not this one.)
 *
 * 2. SWATCHES READ DOWN, NOT ACROSS — v3 shows Yellow/Cognac on row one,
 *    live shows Yellow/Pink. The array is already interleaved for row-major;
 *    grid-auto-flow: column fought it. Dropping the flow and the row pin
 *    makes the markup order the reading order. The snippet's comment claiming
 *    column-major is corrected too — it described what the CSS did, not what
 *    live does.
 *
 * 3. NO HAIRLINE UNDER THE SUB-ZONE HEADS. Live rules both "White Diamonds /
 *    View all" and "Fancy Coloured" the full column width.
 *
 * 4. VERTICAL RHYTHM ~10px LOOSE THROUGHOUT. Live sits the shape label almost
 *    on top of the Natural/Lab-Grown row; v3 has a 16px gap under each.
 *    Measured off live: colhead 10px, sublinks 12px above / 6px below,
 *    col-label 12px below.
 *
 * 5. STONES ARE 5 COLUMNS, LIVE IS 4 — which is why v3's gemstone labels wrap
 *    and live's do not.
 *
 * Refuses to write unless every target matches exactly once.
 * Run from the repo root:  node docs/tools/fix-diamonds-spacing.mjs
 * Delete this file once it has run and synced.
 */

import { readFile, writeFile } from 'node:fs/promises';

const CSS = 'sections/header-bottom.liquid';
const SNIP = 'snippets/mm-diamonds.liquid';

const cssPairs = [
  {
    what: 'aside pinned to 240px, cut grid flexes',
    find: `.fye .mm-dg-col { min-width: 0; flex: 0 0 auto; }
.fye .mm-dg-col--aside {
  flex: 1 1 auto;
  padding-left: 32px;
  border-left: 1px solid rgba(35, 61, 71, 0.18);
  align-self: stretch;
}`,
    repl: `/* The cut grid flexes and the aside is pinned, not the other way round: with
   the grid fixed at 6 x 96px the aside was squeezed to ~114px and its
   Natural / Lab-Grown row wrapped mid-word. */
.fye .mm-dg-col { min-width: 0; flex: 1 1 auto; }
.fye .mm-dg-col--aside {
  flex: 0 0 240px;
  padding-left: 32px;
  border-left: 1px solid rgba(35, 61, 71, 0.18);
  align-self: stretch;
}`
  },
  {
    what: 'hairline + tighter sub-zone head',
    find: `.fye .mm-dg-colhead {
  display: flex; align-items: baseline; justify-content: space-between;
  gap: 20px;
  padding-bottom: 14px;
}`,
    repl: `.fye .mm-dg-colhead {
  display: flex; align-items: baseline; justify-content: space-between;
  gap: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(35, 61, 71, 0.18);
}`
  },
  {
    what: 'tighter sublinks rhythm, no wrap',
    find: `.fye .mm-dg-sublinks { display: flex; gap: 22px; margin: 0 0 16px; }`,
    repl: `/* Live sits the shape label almost on top of this row — 6px, not 16px. */
.fye .mm-dg-sublinks { display: flex; gap: 22px; margin: 12px 0 6px; flex-wrap: nowrap; }
.fye .mm-dg-sublinks a { white-space: nowrap; }`
  },
  {
    what: 'tighter col-label',
    find: `.fye .mm-col-label {
  display: block;
  margin: 0 0 16px;`,
    repl: `.fye .mm-col-label {
  display: block;
  margin: 0 0 12px;`
  },
  {
    what: 'cut grid tracks flex inside the sub-zone',
    find: `.fye .mm-dg-col .mm__cuts { grid-template-columns: repeat(6, 96px); }`,
    repl: `.fye .mm-dg-col .mm__cuts { grid-template-columns: repeat(6, minmax(0, 1fr)); }`
  },
  {
    what: 'swatches read across, not down',
    find: `.fye .mm-dg-swatches--2col {
  grid-template-columns: repeat(2, 94px);
  gap: 4px 28px;
  grid-auto-flow: column;
  grid-template-rows: repeat(5, auto);
}`,
    repl: `/* Row-major: the snippet's array is interleaved (Yellow, Pink, Blue, Green…)
   so markup order IS live's reading order. grid-auto-flow: column fought it
   and produced Yellow/Cognac on row one. */
.fye .mm-dg-swatches--2col {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px 20px;
}`
  },
  {
    what: 'stones 4 columns in the tabbed panel',
    find: `.fye .mm-dg-colfoot { padding-top: 16px; }`,
    repl: `.fye .mm-dg-colfoot { padding-top: 16px; }

/* Live runs the gemstone grid at 4 columns. At 5 the labels wrapped. */
.fye .mm__main:has(.mm__tab-in) .mm__stones {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}`
  }
];

const snipPairs = [
  {
    what: 'correct the swatch-order comment',
    find: `      Column-major order, as live: Yellow/Blue/Champagne/Grey/Salt &amp; Pepper
      down the first column, Pink/Green/Cognac/Black/Orange down the second.`,
    repl: `      Row-major, as live: Yellow/Pink on the first row, then Blue/Green,
      Champagne/Cognac, Grey/Black, Salt &amp; Pepper/Orange. Keep this array
      interleaved — the CSS relies on markup order being reading order.`
  }
];

const count = (h, n) => h.split(n).length - 1;

const files = [[CSS, cssPairs], [SNIP, snipPairs]];
const loaded = [];
const problems = [];

for (const [path, pairs] of files) {
  const src = await readFile(path, 'utf8');
  loaded.push([path, src, pairs]);
  for (const p of pairs) {
    const n = count(src, p.find);
    if (n !== 1) problems.push(`${path}: ${n} match(es), expected 1 — ${p.what}`);
  }
}

if (problems.length) {
  console.error('REFUSED, nothing written:');
  problems.forEach(m => console.error('  ' + m));
  console.error('\nHas fix-diamonds-panel.mjs been run?');
  process.exit(1);
}

for (const [path, src, pairs] of loaded) {
  let out = src;
  for (const p of pairs) {
    out = out.replace(p.find, p.repl);
    console.log('ok  ' + p.what);
  }
  await writeFile(path, out, 'utf8');
  console.log(`    wrote ${path}`);
}

console.log('\nExpect: hairlines under both sub-zone heads, Natural / Lab-Grown on');
console.log('one line in the aside, swatches reading Yellow|Pink across, tighter');
console.log('gaps above the cut grid, and gemstones in 4 columns.');
