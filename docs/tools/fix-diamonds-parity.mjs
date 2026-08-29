/* fix-diamonds-parity.mjs — 29/08/2026
 *
 * Run AFTER fix-diamonds-spacing.mjs. Anchored on its CSS so it refuses if
 * that has not landed.
 *
 * Closes the remaining CONTENT divergences between v3's Diamonds &
 * Gemstones panel and live. Spacing was the previous script; this is the
 * words and the structure.
 *
 * 1. GEMSTONES TAB. Live is a head row (Shop by type + View all loose
 *    gemstones), a hairline, then "Shop by stone" over a 4-column grid of
 *    THIRTEEN stones. v3 rendered a stacked three-item type list on a loose
 *    rhythm, then 17 stones in 5 columns, linked to -engagement-rings rather
 *    than -gemstones. Replaced wholesale by snippets/mm-gemstones.liquid.
 *
 *    Dropped, because live does not have them: Pink Sapphire, Yellow
 *    Sapphire, Blue Topaz, Fire Opal, Black Diamond.
 *
 * 2. THE SIDE RAIL HAS NO ZONE TITLE ON LIVE. v3 prints "The Diamond &
 *    Gemstone Guide" as an h2 above the card AND again as the card title, so
 *    it wrapped over four lines and pushed the Learn list down. Live starts
 *    straight at the card. Suppressed on the tabbed panel only.
 *
 * 3. CUT COUNT LABEL. Live reads "all 35 cuts". Both themes render 25, so
 *    live's label is wrong — but the brief is parity with live, word for
 *    word, so 35 it is. Flagged here because it WILL look like a bug later:
 *    if live's copy is ever corrected to 25, change it back here too.
 *
 * 4. The 4-column swatch grid needs its own rule; --2col was diamonds-only.
 *
 * Refuses to write unless every target matches exactly once.
 * Run from the repo root:  node docs/tools/fix-diamonds-parity.mjs
 * Delete this file once it has run and synced.
 */

import { readFile, writeFile } from 'node:fs/promises';

const CSS = 'sections/header-bottom.liquid';
const DIA = 'snippets/mm-diamonds.liquid';

const cssPairs = [
  {
    what: 'gemstones tab -> mm-gemstones',
    find: `                    <div class="mm__tab-body mm__tab-body--2">
                      <div class="mm__cols">`,
    repl: `                    <div class="mm__tab-body mm__tab-body--2">
                      {%- comment -%}
                        Live's gemstones pane is a head row and a 4-column
                        stone grid — not a column loop. See mm-gemstones.
                      {%- endcomment -%}
                      {%- if tabbed and b.show_cuts -%}
                        {%- render 'mm-gemstones' -%}
                      {%- else -%}
                      <div class="mm__cols">`
  },
  {
    what: 'close the gemstones branch',
    find: `                        {%- render 'mm-stones', set: b.stone_set -%}
                      </div>`,
    repl: `                        {%- render 'mm-stones', set: b.stone_set -%}
                      </div>
                      {%- endif -%}`
  },
  {
    what: '4-column swatch grid + no zone title on the tabbed rail',
    find: `/* Live runs the gemstone grid at 4 columns. At 5 the labels wrapped. */
.fye .mm__main:has(.mm__tab-in) .mm__stones {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}`,
    repl: `/* Live runs the gemstone grid at 4 columns. At 5 the labels wrapped. */
.fye .mm__main:has(.mm__tab-in) .mm__stones {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}
.fye .mm-dg-swatches--4col {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 4px 20px;
}
.fye .mm-gem .mm-col-label { margin-top: 14px; }

/* Live's diamonds rail has no zone title — it starts at the card. Ours
   printed the guide name twice, wrapped it over four lines and shoved the
   Learn list down the page. */
.fye .mega:has(.mm__tab-in) .mm__side .mm__row-head--major { display: none; }`
  }
];

const diaPairs = [
  {
    what: 'cut label to live wording',
    find: `label: 'Shop by shape — all 25 cuts'`,
    repl: `label: 'Shop by shape — all 35 cuts'`
  },
  {
    what: 'update the cut-count note',
    find: `  NOTE on the cut count: live's label reads "all 35 cuts" but live renders the
  same 25 this theme has. The label is wrong on live; 25 is correct here.`,
    repl: `  NOTE on the cut count: live's label reads "all 35 cuts" and live renders 25.
  The label is wrong, but the brief is word-for-word parity with live, so we
  say 35 too. If live's copy is ever corrected, correct it here as well.`
  }
];

const count = (h, n) => h.split(n).length - 1;

const files = [[CSS, cssPairs], [DIA, diaPairs]];
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
  console.error('\nHas fix-diamonds-spacing.mjs been run?');
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

console.log('\nRequires snippets/mm-gemstones.liquid, already written.');
console.log('\nStill EDITOR-side, not code — the rail card on live reads');
console.log('"Free Buying Guide" with the blurb "The 4Cs, lab-grown versus');
console.log('natural, colour and ethical sourcing." Ours says "The Diamond &');
console.log('Gemstone Guide" with no blurb.');
