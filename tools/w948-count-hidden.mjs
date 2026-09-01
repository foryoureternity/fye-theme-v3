// w948-count-hidden.mjs — the empty count badge.
//
// The header badge is <span class="hdr__count" data-fye-wish-count hidden>,
// and .hdr__count declares a display — which beats the browser's own
// [hidden] { display: none }. So at zero it rendered as a small filled square
// with no number in it. Exactly the same trap as the wishlist empty state
// earlier today; noted in build-state.md so it stops recurring.
//
// The basket badge never showed this because Liquid omits it entirely at zero.
// The wishlist count cannot do that: the server has no idea what is saved.
//
//     node tools/w948-count-hidden.mjs
// Delete once run and pushed.

import { readFileSync, writeFileSync } from 'node:fs';

const CSS = 'assets/fye-core.css';
const css = readFileSync(CSS, 'utf8');

if (css.includes('.fye .hdr__count[hidden]')) {
  console.log('Already applied. Nothing to do.');
  process.exit(0);
}

const block = `

/* A hidden count is hidden — 01/09/2026. .hdr__count sets a display, which
   out-ranks the browser's [hidden] rule, so an empty wishlist drew a filled
   square with nothing in it. */
.fye .hdr__count[hidden],
.fye [data-fye-wish-count][hidden] { display: none !important; }
`;

writeFileSync(CSS, css + block);
console.log(`  ${CSS}: ${css.length} -> ${(css + block).length} bytes\n`);
