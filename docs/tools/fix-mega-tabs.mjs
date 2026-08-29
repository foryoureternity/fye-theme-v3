/* fix-mega-tabs.mjs — 29/08/2026
 *
 * The mega panels render their zone head and nothing else: every
 * .mm__tab-body stays display:none.
 *
 * Two faults, one root cause — the CSS-only radio/label tab pattern needs the
 * inputs to be SIBLINGS of the things they reveal, and they were not:
 *
 *   1. The radios were nested inside .mm__tab-bar, inside
 *      .mm__row-head--major. So ".mm__tab-in:checked ~ .mm__tab-body--1"
 *      could never match, and the blanket ".mm__tab-body { display: none }"
 *      won unopposed. Fix: hoist the inputs to be the first children of
 *      .mm__main, ahead of the row head and both bodies. Labels stay where
 *      they are — <label for> reaches across the DOM, siblings do not.
 *
 *   2. The blanket hide also caught panels with NO tabs, which have no radio
 *      to un-hide them. Those panels could never show their only body. Fix:
 *      only hide bodies in a panel that actually has tabs, via :has().
 *
 * Also: with the inputs hoisted, .mm__tab-bar is no longer a sibling of them
 * but a descendant of the row head, so the label-styling and focus selectors
 * have to reach through .mm__row-head.
 *
 * Refuses to write unless every target matches exactly once.
 * Run from the repo root:  node docs/tools/fix-mega-tabs.mjs
 * Delete this file once it has run and synced.
 */

import { readFile, writeFile } from 'node:fs/promises';

const FILE = 'sections/header-bottom.liquid';

const PAIRS = [
  // ---- 1. hoist the radios out of the row head -----------------------------
  {
    what: 'hoist tab radios to direct children of .mm__main',
    find: `                  <div class="mm__main">
                    <div class="mm__row-head mm__row-head--major">
                      {%- if tabbed -%}
                        <div class="mm__tab-bar">
                          <input class="mm__tab-in" type="radio" name="mmtab-{{ block.id }}" id="mmtab-{{ block.id }}-1" checked>
                          <input class="mm__tab-in" type="radio" name="mmtab-{{ block.id }}" id="mmtab-{{ block.id }}-2">
                          <label class="mm__tab" for="mmtab-{{ block.id }}-1">{{ b.tab1_label | default: 'Diamonds' }}</label>`,
    repl: `                  <div class="mm__main">
                    {%- comment -%}
                      The radios MUST be direct children of .mm__main, ahead of
                      the row head and both tab bodies: every rule that reveals
                      a body or marks the active tab is a sibling selector, and
                      a sibling selector cannot climb out of .mm__tab-bar. This
                      cost a full panel-blank bug on 28/08. The labels stay in
                      the bar — <label for> works across the whole document.
                    {%- endcomment -%}
                    {%- if tabbed -%}
                      <input class="mm__tab-in" type="radio" name="mmtab-{{ block.id }}" id="mmtab-{{ block.id }}-1" checked>
                      <input class="mm__tab-in" type="radio" name="mmtab-{{ block.id }}" id="mmtab-{{ block.id }}-2">
                    {%- endif -%}
                    <div class="mm__row-head mm__row-head--major">
                      {%- if tabbed -%}
                        <div class="mm__tab-bar">
                          <label class="mm__tab" for="mmtab-{{ block.id }}-1">{{ b.tab1_label | default: 'Diamonds' }}</label>`
  },

  // ---- 2. only hide bodies in a panel that HAS tabs ------------------------
  {
    what: 'scope the tab-body hide to tabbed panels only',
    find: `.fye .mm__tab-body { display: none; }`,
    repl: `/* Scoped with :has() deliberately. An unscoped hide also caught the panels
   with no tabs, which have no radio to reveal their single body — so those
   panels rendered their heading and nothing else. */
.fye .mm__main:has(.mm__tab-in) .mm__tab-body { display: none; }`
  },

  // ---- 3. reach the labels through the row head ---------------------------
  {
    what: 'active-tab selectors reach through .mm__row-head',
    find: `.fye .mm__tab-in:nth-of-type(1):checked ~ .mm__tab-bar .mm__tab:nth-of-type(1),
.fye .mm__tab-in:nth-of-type(2):checked ~ .mm__tab-bar .mm__tab:nth-of-type(2) {`,
    repl: `.fye .mm__tab-in:nth-of-type(1):checked ~ .mm__row-head .mm__tab:nth-of-type(1),
.fye .mm__tab-in:nth-of-type(2):checked ~ .mm__row-head .mm__tab:nth-of-type(2) {`
  },
  {
    what: 'focus-visible selector reaches through .mm__row-head',
    find: `.fye .mm__tab-in:focus-visible ~ .mm__tab-bar .mm__tab {`,
    repl: `.fye .mm__tab-in:focus-visible ~ .mm__row-head .mm__tab {`
  }
];

const count = (hay, needle) => hay.split(needle).length - 1;

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
  process.exit(1);
}

for (const p of PAIRS) {
  out = out.replace(p.find, p.repl);
  console.log('ok  ' + p.what);
}

await writeFile(FILE, out, 'utf8');
console.log(`\nwrote ${FILE}  (${src.length} -> ${out.length} bytes)`);
console.log('\nCommit, then hard-reload the preview and hover each of the four');
console.log('mega panels. Expect: Engagement/Wedding/Eternity show their columns,');
console.log('shape grid and stone grid; Diamonds shows the Diamonds tab active');
console.log('with the 25-cut grid, and the Gemstones tab switches on click.');
