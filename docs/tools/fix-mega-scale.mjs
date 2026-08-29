/* fix-mega-scale.mjs — 29/08/2026
 *
 * MEASURED off the live theme with the panel open at a 1470px viewport, via
 * computed styles in the console — not estimated from a screenshot. Live's
 * panel reported w:1223 at x:121 with padding 24px 32px, i.e. an inner content
 * width of 1159px starting at x:153, which matched the section label's own x
 * exactly. That is the number .mega__in was missing.
 *
 * v3 was running the whole panel about 30% oversized, which is why the columns
 * crowded and the right rail's education lists wrapped:
 *
 *                     live            v3 before
 *   content max-w     1160            1500  (never binds at 1470)
 *   panel padding     24 32 48        48 32 64
 *   zone title        19px            26px
 *   section label     11px/.18em/500  13px/.16em/400
 *   list item         12px/.06em/500  16px
 *   cuts grid         6x80, gap 2px,  auto-fill 150px, 40px icon
 *                     26px icon ABOVE beside 14px text
 *                     a 9.5px caption
 *
 * Literal px throughout, deliberately: this is chrome, measured, and the
 * header above it already sets its own measured values rather than tokens.
 * Do not "tidy" these into --s* tokens without re-measuring live.
 *
 * Appended at the end of the stylesheet, per the file's own convention — the
 * .mm__* blocks appear twice verbatim, so a targeted edit cannot be aimed.
 *
 * Refuses to write unless the anchor matches exactly once.
 * Run from the repo root:  node docs/tools/fix-mega-scale.mjs
 * Delete this file once it has run and synced.
 */

import { readFile, writeFile } from 'node:fs/promises';

const FILE = 'sections/header-bottom.liquid';

const FIND = `.fye .mm__shapes {
  grid-auto-flow: row;
  grid-template-columns: repeat(2, max-content);
  grid-auto-columns: auto;
}`;

const REPL = `.fye .mm__shapes {
  grid-auto-flow: row;
  grid-template-columns: repeat(2, max-content);
  grid-auto-columns: auto;
}

/* ============================================================================
   MEGA PANELS — MEASURED SCALE, 29/08/2026
   Live, panel open, 1470px viewport, read from computed styles. See
   docs/tools/fix-mega-scale.mjs for the full before/after table.
   ========================================================================== */

/* Content is 1160px centred, NOT 1500: max-width 1500 never binds at 1470, so
   the panel ran the full viewport less padding — 1406px, 240px too wide. */
.fye .has-mega .mega { padding: 24px 32px 48px; }
.fye .has-mega .mega__in {
  max-width: 1160px;
  grid-template-columns: minmax(0, 1fr) 328px;
  column-gap: 64px;
}

.fye .mm__zone-title { font-size: 19px; letter-spacing: 0.08em; font-weight: 400; }
.fye .mm__viewall { font-size: 12px; letter-spacing: 0.08em; font-weight: 500; }

/* 500, not 400 — at 11px the label needs the extra weight to hold its colour. */
.fye .mm__label {
  font-size: 11px;
  letter-spacing: 0.18em;
  font-weight: 500;
  color: rgba(35, 61, 71, 0.62);
  margin-bottom: 16px;
}

.fye .mm__list a,
.fye .mm__list--caps a { font-size: 12px; letter-spacing: 0.06em; font-weight: 500; }
.fye .mm__shapes a { font-size: 12px; letter-spacing: 0.06em; font-weight: 500; }
.fye .mm__stones a { font-size: 12px; letter-spacing: 0.06em; font-weight: 500; }

/* Cuts grid is a different object from the shape grid: six fixed columns, a
   26px icon stacked ABOVE a centred 9.5px caption, and a 2px gap. Live gives
   it 80px tracks — 6x80 + 5x2 = 491px, which is what live measured. */
.fye .mm__cuts {
  grid-template-columns: repeat(6, 80px);
  gap: 2px;
  justify-content: start;
}
.fye .mm__cuts a {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px 2px;
  font-size: 9.5px;
  letter-spacing: 0.08em;
  font-weight: 500;
  line-height: 1.2;
  text-align: center;
}
.fye .mm__cuts img { width: 26px; height: 26px; }`;

const src = await readFile(FILE, 'utf8');
const n = src.split(FIND).length - 1;

if (n !== 1) {
  console.error(`REFUSED, ${FILE} not written: anchor matched ${n} time(s), expected 1.`);
  console.error('Has fix-shape-grid.mjs been run yet? This script appends after it.');
  process.exit(1);
}

await writeFile(FILE, src.replace(FIND, REPL), 'utf8');
console.log('ok  appended measured mega scale');
console.log(`wrote ${FILE}`);
console.log('\nExpect: panel content 1160px centred, right rail 328px with the');
console.log('education lists no longer wrapping, and the cuts grid as 6 columns');
console.log('of stacked icon-over-caption.');
