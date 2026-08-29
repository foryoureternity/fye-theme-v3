/* fix-long-list-columns.mjs — 29/08/2026
 *
 * The diamond cut grid was pushed below the fold of the panel.
 *
 * Cause is not the cuts grid. The Diamonds panel's "Coloured Diamonds"
 * linklist has 13 items and rendered as a single column ~800px tall, so the
 * cuts grid — which follows it in source order — started below the visible
 * area of the sheet.
 *
 * Fix: flow a LONG list into two columns. Gated on :has(li:nth-child(11)) so
 * it only catches genuinely long lists:
 *
 *   Diamonds / Coloured Diamonds   13 items  -> 2 columns  (was the problem)
 *   Wedding  / Plain by profile     9 items  -> 1 column   (live is 1 column)
 *   Engagement / Shop by type       6 items  -> 1 column
 *
 * Note the last one: live shows engagement's Type list in TWO columns, so
 * that case still does not match. It is a separate difference and wants
 * live's own numbers rather than a guessed threshold — do not "fix" it by
 * lowering the nth-child count here, or wedding's profile list breaks.
 *
 * This is a holding fix. Live's Diamonds panel is structurally different:
 * two side-by-side sub-zones (WHITE DIAMONDS with Natural/Lab-grown sub-tabs
 * and the 35-cut grid inside it, FANCY COLOURED with two columns of colour
 * dots) divided by a vertical hairline. That needs the tabbed panel rebuilt,
 * not restyled.
 *
 * Refuses to write unless the anchor matches exactly once.
 * Run from the repo root:  node docs/tools/fix-long-list-columns.mjs
 * Delete this file once it has run and synced.
 */

import { readFile, writeFile } from 'node:fs/promises';

const FILE = 'sections/header-bottom.liquid';

const FIND = `.fye .mm__cuts img { width: 26px; height: 26px; }`;

const REPL = `.fye .mm__cuts img { width: 26px; height: 26px; }

/* A list of 11+ flows into two columns. Below that threshold live keeps a
   single column (wedding's nine profiles), so the gate is deliberate. */
.fye .mm__list:has(li:nth-child(11)) {
  column-count: 2;
  column-gap: 48px;
}
.fye .mm__list:has(li:nth-child(11)) li {
  break-inside: avoid;
}`;

const src = await readFile(FILE, 'utf8');
const n = src.split(FIND).length - 1;

if (n !== 1) {
  console.error(`REFUSED, ${FILE} not written: anchor matched ${n} time(s), expected 1.`);
  console.error('Run fix-mega-scale.mjs first — this appends after it.');
  process.exit(1);
}

await writeFile(FILE, src.replace(FIND, REPL), 'utf8');
console.log('ok  long lists flow into two columns');
console.log(`wrote ${FILE}`);
console.log('\nExpect: the Diamonds panel roughly halves in height and the cut');
console.log('grid comes back into view without scrolling.');
