/* fix-guide-card.mjs — 29/08/2026
 *
 * Run after fix-guide-rail.mjs.
 *
 * Live's guide card is a wide horizontal block: cover on the left, then title
 * ON ONE LINE, a two-line blurb, and Download PDF beneath — nothing wrapping,
 * nothing overlapping. v3's stacks a four-line title against a cramped words
 * column and the download icon collides with it.
 *
 * The cause is width, not type: at a 400px rail the words column is only
 * ~164px, and "THE ENGAGEMENT RING GUIDE" cannot fit that on one line at any
 * readable size. Live's card gives the words roughly 290px.
 *
 *   rail 480 - 48 gutter - 48 card padding - 128 cover - 24 gap = 232
 *   plus the title dropping 18px -> 15px and its tracking 0.08em -> 0.06em
 *   puts the longest title ("The Diamond & Gemstone Guide") on one line.
 *
 * Also adds the blurb line. If the section has no blurb setting the paragraph
 * simply renders empty and costs nothing — the two ring guides and the
 * diamond guide all carry copy on live.
 *
 * Refuses to write unless every target matches exactly once.
 * Run from the repo root:  node docs/tools/fix-guide-card.mjs
 */

import { readFile, writeFile } from 'node:fs/promises';

const FILE = 'sections/header-bottom.liquid';

const PAIRS = [
  {
    what: 'rail 480 on the ring panels',
    find: `  grid-template-columns: minmax(0, 1fr) 400px;`,
    repl: `  grid-template-columns: minmax(0, 1fr) 480px;`
  },
  {
    what: 'rail 480 on the diamonds panel',
    find: `  grid-template-columns: 831px 400px;`,
    repl: `  grid-template-columns: 831px 480px;`
  },
  {
    what: 'card laid out like live',
    find: `.fye .mm__card { gap: 24px; padding: 24px; }
.fye .mm__card-cover { flex: 0 0 116px; }
.fye .mm__card-cover img { width: 116px; }`,
    repl: `/* Live's card: cover left, title on ONE line, blurb, download beneath. */
.fye .mm__card { gap: 24px; padding: 24px; align-items: flex-start; }
.fye .mm__card-cover { flex: 0 0 128px; }
.fye .mm__card-cover img { width: 128px; height: auto; display: block; }
.fye .mm__card-words {
  flex: 1 1 auto; min-width: 0;
  display: flex; flex-direction: column; align-items: flex-start; gap: 10px;
}
.fye .mm__card-title {
  font-size: 15px;
  letter-spacing: 0.06em;
  line-height: 1.3;
  margin: 0;
  white-space: nowrap;
}
.fye .mm__card-blurb {
  margin: 0;
  font-size: 13px; font-weight: 300;
  letter-spacing: 0;
  line-height: 1.5;
  text-transform: none;
  color: rgba(35, 61, 71, 0.78);
}
.fye .mm__card-dl {
  margin-top: 6px;
  gap: 10px;
  font-size: 13px;
  letter-spacing: 0.12em;
  white-space: nowrap;
}
.fye .mm__card-dl .icon { flex: 0 0 auto; }`
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
  console.error('\nHas fix-guide-rail.mjs been run?');
  process.exit(1);
}

let out = src;
for (const p of PAIRS) { out = out.replace(p.find, p.repl); console.log('ok  ' + p.what); }

await writeFile(FILE, out, 'utf8');
console.log(`\nwrote ${FILE}`);
console.log('\nApplies to every guide card — engagement, both wedding cards,');
console.log('eternity and the diamond guide.');
