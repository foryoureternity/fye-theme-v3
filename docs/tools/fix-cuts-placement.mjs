/* fix-cuts-placement.mjs — 29/08/2026
 *
 * The cut grid rendered as a full-width band BELOW the panel's list columns,
 * so it sat at the bottom of the sheet and ran off it. Live puts it inside the
 * left sub-zone, alongside the coloured-diamond list, with a vertical hairline
 * between the two zones:
 *
 *   WHITE DIAMONDS            |  FANCY COLOURED
 *   Natural / Lab-grown       |  Natural / Lab-grown
 *   Shop by shape - all cuts  |  Shop by colour
 *   [ 6-column cut grid ]     |  [ 2 columns of colour dots ]
 *
 * The existing menus already map onto that: the "Shop by type" column is
 * live's White Diamonds zone and "Coloured Diamonds" is Fancy Coloured. So the
 * cuts move into the FIRST column of the loop rather than sitting after it.
 *
 * Two edits: the render moves inside the loop, and the second column gains the
 * dividing hairline.
 *
 * Still not matched to live after this, deliberately left alone:
 *   - live shows 35 cuts, mm-cuts.liquid hardcodes 25 (missing Salt & Pepper,
 *     Orange and eight others). Data, and it needs live's collection handles.
 *   - the cuts_label setting still reads "all 25 cuts".
 *   - live has Natural / Lab-grown as an inline sub-tab row; here they are
 *     stacked list items.
 *
 * Refuses to write unless each target matches exactly once.
 * Run from the repo root:  node docs/tools/fix-cuts-placement.mjs
 * Delete this file once it has run and synced.
 */

import { readFile, writeFile } from 'node:fs/promises';

const FILE = 'sections/header-bottom.liquid';

const PAIRS = [
  {
    what: 'render the cut grid inside the first list column',
    find: `                              {%- endfor -%}
                            </ul>
                          </div>
                        {%- endfor -%}`,
    repl: `                              {%- endfor -%}
                            </ul>
                            {%- comment -%}
                              The cut grid belongs to the FIRST column, not to
                              the panel. Rendered after the loop it became a
                              full-width band under every column and fell off
                              the bottom of the sheet.
                            {%- endcomment -%}
                            {%- if b.show_cuts and forloop.first -%}
                              {%- render 'mm-cuts', label: b.cuts_label -%}
                            {%- endif -%}
                          </div>
                        {%- endfor -%}`
  },
  {
    what: 'drop the old full-width cut grid render',
    find: `                      {%- if b.show_cuts -%}
                        {%- render 'mm-cuts', label: b.cuts_label -%}
                      {%- endif -%}

`,
    repl: ``
  },
  {
    what: 'hairline between the two sub-zones',
    find: `.fye .mm__list:has(li:nth-child(11)) li {
  break-inside: avoid;
}`,
    repl: `.fye .mm__list:has(li:nth-child(11)) li {
  break-inside: avoid;
}

/* Sub-zone divider. The column holding the cut grid is the left zone; the one
   after it is the right zone and carries the rule, mirroring the main
   left/right divider on .mm__side. */
.fye .mm__col:has(.mm__cuts-wrap) { flex: 0 0 auto; }
.fye .mm__col:has(.mm__cuts-wrap) + .mm__col {
  padding-left: 48px;
  border-left: 1px solid rgba(35, 61, 71, 0.18);
  align-self: stretch;
}

/* Inside a column the grid is no longer a band, so it loses the band's own
   top rule and full-width margin. */
.fye .mm__col .mm__cuts-wrap {
  margin-top: 32px;
  padding-top: 0;
  border-top: 0;
}`
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
  console.error('Run the earlier fix-*.mjs scripts first.');
  process.exit(1);
}

for (const p of PAIRS) {
  out = out.replace(p.find, p.repl);
  console.log('ok  ' + p.what);
}

await writeFile(FILE, out, 'utf8');
console.log(`\nwrote ${FILE}  (${src.length} -> ${out.length} bytes)`);
console.log('\nExpect: cuts sit under Shop by type on the left, coloured');
console.log('diamonds to their right behind a hairline, nothing off the bottom.');
