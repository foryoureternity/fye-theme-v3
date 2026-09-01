#!/usr/bin/env node
/* ============================================================================
   w923-sticky-gallery.js — patch for sections/main-product.liquid
   ----------------------------------------------------------------------------
   Run once, from the repo root:

       node tools/w923-sticky-gallery.js

   WHAT — Ed, 01/09/2026

   Scrolling the product page keeps the ring visible while the buy box moves,
   until the gallery reaches the foot of the two-column block and stops there.

   HOW, AND WHY THERE IS NO JAVASCRIPT

   `position: sticky` on the gallery, inside the existing .pdp__top grid. A
   sticky element stops at the bottom of its CONTAINING BLOCK, which here is
   .pdp__top — so it can never ride over the section below, which is exactly
   the behaviour asked for, and it costs no scroll listener.

   This only works because .pdp__top already sets `align-items: start`. With
   the default `stretch` the gallery would be as tall as the buy box and would
   have nothing to slide within. Do not change that line.

   THE OFFSET is plain breathing room, not a header allowance: this theme has
   no sticky header (confirmed with Ed, 01/09/2026). If one is ever added, this
   `top` is the single place to account for it.

   THE WIDTH CAP is the part that is easy to get wrong. A gallery taller than
   the viewport would have its foot — the thumbnail row — permanently below
   the fold while stuck, unreachable at any scroll position. So the gallery is
   bounded by WIDTH: the stage keeps aspect-ratio 1, so bounding width bounds
   height, and the photograph shrinks rather than being cropped. A ring cropped
   to fit is worse than a ring shown smaller. On a tall window the cap exceeds
   the column width and does nothing at all.

   DESKTOP ONLY. Below 901px the layout is a single column, where a sticky
   gallery would sit on top of the buy box it is meant to accompany.

   IDEMPOTENT: running it twice is safe.
   ========================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');

const FILE = path.join(process.cwd(), 'sections', 'main-product.liquid');
const MARKER = 'pdp__gallery';

function die(msg) {
  console.error('REFUSED: ' + msg);
  console.error('main-product.liquid has NOT been modified.');
  process.exit(1);
}

if (!fs.existsSync(FILE)) die('sections/main-product.liquid not found — run from the repo root.');

let src = fs.readFileSync(FILE, 'utf8');
const before = Buffer.byteLength(src, 'utf8');

if (src.indexOf('position: sticky') !== -1 && src.indexOf(MARKER + ' {') !== -1) {
  console.log('Already applied. Nothing written.');
  process.exit(0);
}

/* The grid must still be top-aligned or sticky has no room to move. */
if (src.indexOf('align-items: start;') === -1) {
  die('.pdp__top no longer sets align-items: start — sticky would not work. Check the grid first.');
}

const CSS = `
/* --- sticky gallery — Ed, 01/09/2026 -------------------------------------
   The ring stays visible while the buy box scrolls, and stops of its own
   accord at the foot of .pdp__top: a sticky element cannot leave its
   containing block, so nothing can ride over the section below. No JS.

   Depends on .pdp__top keeping \`align-items: start\` — with the default
   stretch the gallery is as tall as the buy box and has nowhere to slide.

   The offset is breathing room, not a header allowance: this theme has no
   sticky header. If one is added, change it here.

   The width cap keeps the WHOLE gallery — thumbnails included — on screen
   while it is stuck. A gallery taller than the viewport would have its foot
   permanently below the fold and unreachable. Bounding width bounds height
   because the stage is square, so the photograph shrinks instead of being
   cropped; on a tall window the cap exceeds the column and does nothing.

   Desktop only: below 901px the layout is one column and a sticky gallery
   would sit over the buy box it accompanies. */
@media (min-width: 901px) {
  .fye .pdp__gallery {
    position: sticky;
    top: var(--s5);
    max-width: calc(100vh - 180px);
  }
}
{% endstylesheet %}`;

const ANCHOR = '{% endstylesheet %}';
const n = src.split(ANCHOR).length - 1;
if (n !== 1) die('expected 1 occurrence of {% endstylesheet %}, found ' + n);

src = src.replace(ANCHOR, CSS);

const after = Buffer.byteLength(src, 'utf8');
if (after <= before) die('patched file is not larger (' + before + ' -> ' + after + ')');

fs.writeFileSync(FILE, src, 'utf8');

console.log('Patched sections/main-product.liquid');
console.log('  ' + before + ' -> ' + after + ' bytes (+' + (after - before) + ')');
console.log('  the gallery is sticky above 900px.');
console.log('');
console.log('Verify with a resolved property, not a screenshot:');
console.log('  getComputedStyle(document.querySelector(".pdp__gallery")).position  // "sticky"');
