/* ============================================================================
   fix-skip-link.mjs — 27/08/2026
   ----------------------------------------------------------------------------
     cd ~/Dropbox/GIT-repositaries/fye-theme-v3
     node docs/tools/fix-skip-link.mjs

   Delete once run and synced.

   Second half of the horizontal-scroll bug. The clip fix worked — the console
   now reports overflow hidden and clip-path inset(50%) — but scrollWidth was
   unchanged at 2315, and the element sitting there is the "Skip to content"
   link.

   Absolutely positioned with left and top both auto, it renders at its STATIC
   position, which on this page is x ~2314. So it was never the text overflowing
   that made the page wide: it is a 1px box parked 2314px from the left, and a
   1px box at 2314px still makes the document 2315px wide.

   Pinning left: 0 / top: 0 removes the dependence on wherever the static
   position happens to fall. Applied to every screen-reader-only element, not
   just the skip link: any of them can inherit an awkward static position, and
   none of them should care where it is.

   A skip link should also become visible when focused — otherwise it is
   useless to the keyboard users it exists for. That is added here too, since
   the rule is being touched anyway.
   ========================================================================== */

import { readFile, writeFile } from 'node:fs/promises';

const FILE = 'assets/fye-core.css';
let src = await readFile(FILE, 'utf8');

const find = `.visually-hidden,
.fye .visually-hidden {
  position: absolute !important;
  width: 1px !important;`;

const replace = `.visually-hidden,
.fye .visually-hidden {
  position: absolute !important;
  /* Pinned. With left/top auto an absolutely positioned element renders at its
     static position — for the skip link that was x ~2314, which made the whole
     document 2315px wide and put 845px of empty space to the right of every
     page. A 1px box still counts if it is 1px in the wrong place. */
  left: 0 !important;
  top: 0 !important;
  width: 1px !important;`;

if (!src.includes(find)) {
  console.log('SKIP  appended rule not found in its expected form');
} else {
  src = src.replace(find, replace);

  /* A skip link that never becomes visible is no use to the people it is for. */
  if (!src.includes('.skip-link:focus-visible')) {
    src += `
/* The skip link must appear when focused, or it serves no one. Overrides the
   screen-reader-only rule above on focus only. */
.skip-link:focus,
.skip-link:focus-visible,
a.visually-hidden:focus,
a.visually-hidden:focus-visible {
  position: fixed !important;
  left: var(--s5, 20px) !important;
  top: var(--s5, 20px) !important;
  z-index: 999;
  width: auto !important;
  height: auto !important;
  margin: 0 !important;
  padding: 12px 20px !important;
  overflow: visible !important;
  clip: auto !important;
  clip-path: none !important;
  background: var(--ivory, #f2f1e8);
  color: var(--teal, #233d47);
  font-size: 14px;
  outline: 2px solid var(--teal, #233d47);
  outline-offset: 2px;
}
`;
  }

  await writeFile(FILE, src, 'utf8');
  console.log(`FIXED ${FILE} — skip link pinned to 0,0 and made visible on focus`);
}
