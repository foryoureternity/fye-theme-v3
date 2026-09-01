// w930-wishlist-css.mjs — saved-heart and header-count styles.
//
// Appended to fye-core.css: a state modifier belongs after the base .wish
// rules it modifies, and appending cannot disturb what is above it.
//
// Idempotent.  node tools/w930-wishlist-css.mjs
// Delete once run and pushed.

import { readFileSync, writeFileSync } from 'node:fs';

const CSS = 'assets/fye-core.css';
const MARKER = 'WISHLIST — 01/09/2026';

const css = readFileSync(CSS, 'utf8');

if (css.includes(MARKER)) {
  console.log('Already applied. Nothing to do.');
  process.exit(0);
}

const block = `

/* ============================================================================
   WISHLIST — 01/09/2026
   ========================================================================== */

/* A saved heart is filled. The outline icon carries no fill of its own, so
   the fill is set here rather than by swapping in a second icon. */
.fye .wish.is-on { color: var(--ink); }
.fye .wish.is-on svg { fill: currentColor; }
.fye .wish:hover { color: var(--sage); }

/* Header count. Hidden at zero — an empty wishlist should not advertise
   itself, and [hidden] keeps it out of the accessibility tree too. */
.fye .wish-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: var(--ink);
  color: var(--white);
  font-size: 11px;
  font-weight: var(--fw-medium);
  line-height: 1;
}
.fye .wish-count[hidden] { display: none; }
`;

const next = css + block;
if (next.length <= css.length) {
  console.error('REFUSED: append did not grow the file.');
  process.exit(1);
}

writeFileSync(CSS, next);
console.log(`  ${CSS}: ${css.length} -> ${next.length} bytes\n`);
