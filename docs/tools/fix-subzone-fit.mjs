/* fix-subzone-fit.mjs — 29/08/2026
 *
 * Run AFTER fix-cuts-placement.mjs. Anchored on that script's CSS so it
 * refuses if the placement fix has not landed yet.
 *
 * Once the cut grid moves inside the first list column it sizes to its content
 * (6 x 80px + 5 x 2px = 491px). With .mm__cols still on an 80px gap the row
 * came to 491 + 80 + 48 + 153 = 772px inside a 768px track — a 4px overflow,
 * which in a flex row silently squeezes the second column instead of showing
 * as a scrollbar.
 *
 * Measured from v3 with the scale fix applied: mega__in tracks are
 * 768.008px / 327.998px with a 64px gap, .mm__col is 153px, .mm__cols gap 80px.
 *
 * Fix: 48px gap on a .mm__cols that contains the cut grid, and let the
 * second column take the remaining space rather than sitting at its 153px
 * content width. Leaves every other panel's 80px gap alone.
 *
 * Refuses to write unless the anchor matches exactly once.
 * Run from the repo root:  node docs/tools/fix-subzone-fit.mjs
 * Delete this file once it has run and synced.
 */

import { readFile, writeFile } from 'node:fs/promises';

const FILE = 'sections/header-bottom.liquid';

const FIND = `.fye .mm__col .mm__cuts-wrap {
  margin-top: 32px;
  padding-top: 0;
  border-top: 0;
}`;

const REPL = `.fye .mm__col .mm__cuts-wrap {
  margin-top: 32px;
  padding-top: 0;
  border-top: 0;
}

/* A row carrying the cut grid is tighter than a plain column row: the grid is
   491px of fixed content, so an 80px gap overflowed the 768px track by 4px and
   quietly crushed the second column. Scoped with :has() so the other panels
   keep their 80px. */
.fye .mm__cols:has(.mm__cuts-wrap) { gap: 48px; }
.fye .mm__col:has(.mm__cuts-wrap) + .mm__col { flex: 1 1 auto; min-width: 0; }`;

const src = await readFile(FILE, 'utf8');
const n = src.split(FIND).length - 1;

if (n !== 1) {
  console.error(`REFUSED, ${FILE} not written: anchor matched ${n} time(s), expected 1.`);
  console.error('fix-cuts-placement.mjs has not been run yet — run that first.');
  process.exit(1);
}

await writeFile(FILE, src.replace(FIND, REPL), 'utf8');
console.log('ok  sub-zone row fits the 768px track');
console.log(`wrote ${FILE}`);
