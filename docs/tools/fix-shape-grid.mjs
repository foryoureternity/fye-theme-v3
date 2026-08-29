/* fix-shape-grid.mjs — 29/08/2026
 *
 * The shape grids laid all ten shapes out in ONE row: overflowing the panel
 * on engagement and eternity (Asscher clipped mid-word at the sheet edge) and
 * running straight over the profile and metal columns on wedding.
 *
 * Cause: .mm__shapes is `grid-auto-flow: column` + `grid-auto-columns:
 * max-content` with NO row count. The rule's own comment says the row count
 * "comes from the snippet as an inline style" — mm-shapes.liquid never emits
 * one, so the grid was free to run as a single row forever.
 *
 * Fix: two explicit columns, normal row flow. That also matches the snippet's
 * data order, which is authored in READING PAIRS — Round/Pear,
 * Princess/Emerald, Oval/Asscher — i.e. row-major. The existing comment
 * claims column-major and contradicts the very order it cites.
 *
 * Appended at the end of the stylesheet, per the file's own convention: the
 * .mm__shapes block appears twice verbatim (the v1 and v2 mega blocks), so a
 * targeted edit cannot be aimed unambiguously. Later wins at equal
 * specificity.
 *
 * Refuses to write unless the anchor matches exactly once.
 * Run from the repo root:  node docs/tools/fix-shape-grid.mjs
 * Delete this file once it has run and synced.
 */

import { readFile, writeFile } from 'node:fs/promises';

const FILE = 'sections/header-bottom.liquid';

const FIND = `/* The tab bar sits in the zone head, so it must not carry the head's own
   bottom rule twice. */
.fye .mm__row-head--major .mm__tab-bar { border: 0; margin: 0; gap: var(--s7); }`;

const REPL = `/* The tab bar sits in the zone head, so it must not carry the head's own
   bottom rule twice. */
.fye .mm__row-head--major .mm__tab-bar { border: 0; margin: 0; gap: var(--s7); }

/* ---- shape grid, 29/08/2026 ---------------------------------------------
   grid-auto-flow: column with no row count put all ten shapes in ONE row.
   The grid overflowed the sheet, clipped Asscher mid-word, and on the wedding
   panel ran over the profile and metal columns — OVAL printed on top of
   TRADITIONAL COURT.

   Two explicit columns, normal row flow. This also matches how mm-shapes
   authors its arrays: reading PAIRS (Round/Pear, Princess/Emerald,
   Oval/Asscher), which is row-major. Do not restore grid-auto-flow: column
   without also reordering the snippet's arrays and pinning a row count. */
.fye .mm__shapes {
  grid-auto-flow: row;
  grid-template-columns: repeat(2, max-content);
  grid-auto-columns: auto;
}`;

const src = await readFile(FILE, 'utf8');
const n = src.split(FIND).length - 1;

if (n !== 1) {
  console.error(`REFUSED, ${FILE} not written: anchor matched ${n} time(s), expected 1.`);
  process.exit(1);
}

const out = src.replace(FIND, REPL);
await writeFile(FILE, out, 'utf8');
console.log(`ok  appended shape-grid override`);
console.log(`wrote ${FILE}  (${src.length} -> ${out.length} bytes)`);
console.log('\nExpect after reload: engagement 2x5, wedding and eternity 2x4,');
console.log('nothing clipped at the sheet edge, and the wedding profile and');
console.log('metal columns clear of the shapes.');
