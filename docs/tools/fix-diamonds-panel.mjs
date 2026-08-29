/* fix-diamonds-panel.mjs — 29/08/2026
 *
 * Rebuilds the Diamonds tab to live's actual structure, read from live's DOM.
 *
 * Live does not stack lists with a cut grid under them. Tab 1 is two
 * sub-zones side by side, divided by a hairline:
 *
 *   White Diamonds  [View all ->]   |  Fancy Coloured
 *   Natural / Lab-Grown             |  Natural / Lab-Grown
 *   Shop by shape - all cuts        |  Shop by colour
 *   [ 6-col cut grid ]              |  [ 2-col swatches ]
 *                                   |  View all colours ->
 *
 * Markup moves into snippets/mm-diamonds.liquid (static, same reasoning as
 * mm-cuts: fixed taxonomy, one collection each). This script swaps it in for
 * the generic column loop whenever a panel is tabbed AND shows cuts, and adds
 * the mm-dg-* styles.
 *
 * MEASURED off live, 1470px viewport, computed styles:
 *   .mm-dg-cols      flex, gap 36
 *   .mm-dg-col       588px  /  --aside 248px, border-left, padding-left 32
 *   .mm-dg-colhead   flex, gap 20, padding-bottom 14
 *   .mm-dg-coltitle  13px / 1.82px / 400
 *   .mm-viewall-link 11.5px / 2.07px / 500, gap 9
 *   .mm-dg-sublinks  flex, gap 22; links 12.5px / 1px / 500
 *   .mm-col-label    11px
 *   shapes grid      6 x 96px, gap 2px   <- NOT the 80px used elsewhere
 *   swatches 2col    2 x 94px, gap 4px 28px
 *   .mm-dg-colfoot   padding-top 16
 *
 * Two things live gets wrong or differs on, deliberately not copied:
 *   - live's label says "all 35 cuts" and renders 25. We say 25.
 *   - live's Gemstones pane links to /collections/*-gemstones; v3's tab 2
 *     still points at *-engagement-rings via mm-stones. Separate fix.
 *
 * Guessed handles, worth checking: fancy-salt-and-pepper-diamonds and
 * fancy-orange-diamonds. Live's dump truncated before those two.
 *
 * Refuses to write unless each target matches exactly once.
 * Run from the repo root:  node docs/tools/fix-diamonds-panel.mjs
 * Delete this file once it has run and synced.
 */

import { readFile, writeFile } from 'node:fs/promises';

const FILE = 'sections/header-bottom.liquid';

const PAIRS = [
  {
    what: 'branch tab 1 to the diamonds sub-zones',
    find: `                    <div class="mm__tab-body mm__tab-body--1">
                      <div class="mm__cols">`,
    repl: `                    <div class="mm__tab-body mm__tab-body--1">
                      {%- comment -%}
                        A tabbed panel that shows cuts IS the diamonds panel,
                        and live gives it a structure of its own: two sub-zones
                        rather than a column loop with a grid underneath.
                      {%- endcomment -%}
                      {%- if tabbed and b.show_cuts -%}
                        {%- render 'mm-diamonds' -%}
                      {%- else -%}
                      <div class="mm__cols">`
  },
  {
    what: 'close the branch',
    find: `                        {%- unless b.shapes_first -%}
                          {%- render 'mm-shapes', set: b.shape_set, label: b.shape_label -%}
                        {%- endunless -%}
                      </div>`,
    repl: `                        {%- unless b.shapes_first -%}
                          {%- render 'mm-shapes', set: b.shape_set, label: b.shape_label -%}
                        {%- endunless -%}
                      </div>
                      {%- endif -%}`
  },
  {
    what: 'mm-dg-* styles at live measurements',
    find: `.fye .mm__cols:has(.mm__cuts-wrap) { gap: 48px; }`,
    repl: `.fye .mm__cols:has(.mm__cuts-wrap) { gap: 48px; }

/* ---- diamonds panel sub-zones, measured off live 29/08/2026 ------------- */

.fye .mm-dg-cols { display: flex; gap: 36px; align-items: flex-start; }
.fye .mm-dg-col { min-width: 0; flex: 0 0 auto; }
.fye .mm-dg-col--aside {
  flex: 1 1 auto;
  padding-left: 32px;
  border-left: 1px solid rgba(35, 61, 71, 0.18);
  align-self: stretch;
}

.fye .mm-dg-colhead {
  display: flex; align-items: baseline; justify-content: space-between;
  gap: 20px;
  padding-bottom: 14px;
}
.fye .mm-dg-coltitle {
  margin: 0;
  font-family: var(--font-display);
  font-size: 13px; font-weight: 400;
  letter-spacing: 0.14em; text-transform: uppercase;
  white-space: nowrap;
}
.fye .mm-viewall-link {
  display: inline-flex; align-items: center; gap: 9px;
  font-size: 11.5px; font-weight: 500;
  letter-spacing: 0.18em; text-transform: uppercase;
  white-space: nowrap;
}

.fye .mm-dg-sublinks { display: flex; gap: 22px; margin: 0 0 16px; }
.fye .mm-dg-sublinks a {
  font-size: 12.5px; font-weight: 500;
  letter-spacing: 0.08em; text-transform: uppercase;
}

.fye .mm-col-label {
  display: block;
  margin: 0 0 16px;
  font-size: 11px; font-weight: 500;
  letter-spacing: 0.18em; text-transform: uppercase;
  color: rgba(35, 61, 71, 0.62);
}

/* Inside a sub-zone the cut grid is not a band: no rule, no band margin, and
   96px tracks rather than the 80px used when it stood alone. */
.fye .mm-dg-col .mm__cuts-wrap { margin: 0; padding: 0; border: 0; }
.fye .mm-dg-col .mm__cuts { grid-template-columns: repeat(6, 96px); }

.fye .mm-dg-swatches {
  display: grid;
  margin: 0; padding: 0; list-style: none;
}
.fye .mm-dg-swatches--2col {
  grid-template-columns: repeat(2, 94px);
  gap: 4px 28px;
  grid-auto-flow: column;
  grid-template-rows: repeat(5, auto);
}
.fye .mm-dg-swatches li { margin: 0; }
.fye .mm-dg-swatches a {
  display: inline-flex; align-items: center; gap: 10px;
  font-size: 12px; font-weight: 500;
  letter-spacing: 0.06em; text-transform: uppercase;
  line-height: 1.25;
  padding: 4px 0;
}
.fye .mm-dg-swatches .mm__dot { width: 18px; height: 18px; }

.fye .mm-dg-colfoot { padding-top: 16px; }`
  }
];

const count = (h, n) => h.split(n).length - 1;

const src = await readFile(FILE, 'utf8');
let out = src;
const problems = [];

for (const p of PAIRS) {
  const n = count(out, p.find);
  if (n !== 1) problems.push(`${n} match(es), expected 1 — ${p.what}`);
}

if (problems.length) {
  console.error(`REFUSED, ${FILE} not written:`);
  problems.forEach(m => console.error('  ' + m));
  console.error('Run fix-cuts-placement.mjs and fix-subzone-fit.mjs first.');
  process.exit(1);
}

for (const p of PAIRS) {
  out = out.replace(p.find, p.repl);
  console.log('ok  ' + p.what);
}

await writeFile(FILE, out, 'utf8');
console.log(`\nwrote ${FILE}  (${src.length} -> ${out.length} bytes)`);
console.log('\nRequires snippets/mm-diamonds.liquid, already written.');
