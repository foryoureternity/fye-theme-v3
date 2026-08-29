/* fix-guide-rail.mjs — 29/08/2026
 *
 * The guide rail is too tight: at 328px with 64px of left padding it leaves
 * 263px of content, so the card title wraps to three or four lines, the cover
 * is a 84px stamp, and the Learn lists sit in two 115px columns that wrap
 * nearly every link.
 *
 * Widen the rail to 400px, drop the gutter to 48px (content 352px), give the
 * card more room and a larger cover, and let the two Learn columns breathe.
 *
 * Applies to every panel; the diamonds panel keeps its own wider main column
 * from fix-diamonds-geometry and just inherits the new rail width.
 *
 * Refuses to write unless every target matches exactly once.
 * Run from the repo root:  node docs/tools/fix-guide-rail.mjs
 */

import { readFile, writeFile } from 'node:fs/promises';

const FILE = 'sections/header-bottom.liquid';

const PAIRS = [
  {
    what: 'rail 400px on the ring panels',
    find: `.fye .has-mega .mega__in {
  max-width: 1160px;
  grid-template-columns: minmax(0, 1fr) 328px;
  column-gap: 64px;
}`,
    repl: `.fye .has-mega .mega__in {
  max-width: 1232px;
  grid-template-columns: minmax(0, 1fr) 400px;
  column-gap: 64px;
}`
  },
  {
    what: 'rail 400px on the diamonds panel',
    find: `  grid-template-columns: 831px 328px;`,
    repl: `  grid-template-columns: 831px 400px;`
  },
  {
    what: 'wider rail interior, bigger card, roomier learn columns',
    find: `.fye .mm-dg-colfoot { padding-top: 16px; }`,
    repl: `.fye .mm-dg-colfoot { padding-top: 16px; }

/* ---- guide rail, widened 29/08/2026 -------------------------------------
   328px with a 64px gutter left only 263px of content: the card title wrapped
   to four lines and the Learn links wrapped in 115px columns. */
.fye .mm__side { padding-left: 48px; }
.fye .mm__card { gap: 24px; padding: 24px; }
.fye .mm__card-cover { flex: 0 0 116px; }
.fye .mm__card-cover img { width: 116px; }
.fye .mm__side-cols { gap: 40px; }`
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
for (const p of PAIRS) { out = out.replace(p.find, p.repl); console.log('ok  ' + p.what); }

await writeFile(FILE, out, 'utf8');
console.log(`\nwrote ${FILE}`);
