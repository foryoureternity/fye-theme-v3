/* fix-dot-align.mjs — 29/08/2026
 *
 * Run after fix-diamonds-parity.mjs.
 *
 * The swatch dots are centred against the WHOLE label, so a two-line label
 * ("Yellow Sapphire", "Pink Tourmaline", "Salt & Pepper") drops its dot to the
 * midpoint of both lines and it sits visibly lower than its single-line
 * neighbours — the dots stop reading as a row.
 *
 * Fix: align to the top of the label, then nudge the dot down by half the
 * difference between the first line box and the dot, so it centres on the
 * FIRST line regardless of how many lines follow. Every dot in a row then
 * lands on the same baseline.
 *
 *   offset = (line-height - dot) / 2 = (1.25em at 12px - 18px) / 2 = -1.5px
 *
 * Expressed in em so it survives a type-size change.
 *
 * Applies to the fancy-colour swatches, the gemstone swatches and the older
 * mm__stones grid, which has the same construction.
 *
 * Refuses to write unless every target matches exactly once.
 * Run from the repo root:  node docs/tools/fix-dot-align.mjs
 * Delete this file once it has run and synced.
 */

import { readFile, writeFile } from 'node:fs/promises';

const FILE = 'sections/header-bottom.liquid';

const PAIRS = [
  {
    what: 'swatch dots centre on the first line',
    find: `.fye .mm-dg-swatches a {
  display: inline-flex; align-items: center; gap: 10px;`,
    repl: `/* flex-start, not center: centring against a two-line label drops the dot
   below its single-line neighbours and the row stops lining up. The negative
   nudge re-centres it on the first line only. */
.fye .mm-dg-swatches a {
  display: inline-flex; align-items: flex-start; gap: 10px;`
  },
  {
    what: 'dot nudge',
    find: `.fye .mm-dg-swatches .mm__dot { width: 18px; height: 18px; }`,
    repl: `.fye .mm-dg-swatches .mm__dot {
  width: 18px; height: 18px;
  flex: 0 0 18px;
  margin-top: calc((1.25em - 18px) / 2);
}`
  },
  {
    what: 'same treatment for the mm__stones grid',
    find: `/* Live runs the gemstone grid at 4 columns. At 5 the labels wrapped. */`,
    repl: `/* mm__stones is built the same way and needs the same first-line alignment. */
.fye .mm__stones a { align-items: flex-start; }
.fye .mm__stones .mm__dot {
  flex: 0 0 auto;
  margin-top: calc((1.25em - 18px) / 2);
}

/* Live runs the gemstone grid at 4 columns. At 5 the labels wrapped. */`
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
console.log('\nCheck the rows containing Yellow Sapphire, Pink Tourmaline,');
console.log('Black Diamond and Salt & Pepper — their dots should now sit level');
console.log('with the single-line dots either side.');
