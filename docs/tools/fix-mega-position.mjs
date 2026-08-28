/* ============================================================================
   fix-mega-position.mjs — 28/08/2026
   ----------------------------------------------------------------------------
     cd ~/Dropbox/GIT-repositaries/fye-theme-v3
     node docs/tools/fix-mega-position.mjs

   Delete once run and synced.

   THE BUG
   I set `.hdr__nav-item.has-mega { position: static }` so the panel could span
   the full width instead of being trapped in one narrow nav item. That part is
   right. What I missed is that it left NO positioned ancestor anywhere above
   the panel — .hdr__nav, .hdr and header are all static.

   An absolutely positioned element with no positioned ancestor resolves
   against the INITIAL containing block, i.e. the viewport. So `top: 100%`
   stopped meaning "just below the nav band" and started meaning "one full
   viewport height down the page" — which is exactly where it appeared: below
   the hero.

   THE FIX
   `position: relative` on `.fye .hdr`. The header is the correct containing
   block for a full-width panel: left/right 0 spans the header's width, which
   is the viewport width, and top: 100% of the NAV BAND now means what it says.

   The panel hangs off `.hdr__nav` rather than `.hdr` for the vertical origin,
   so the nav band gets the relative position and the header gets a z-index
   context. Both are needed: without the nav band being the origin, top: 100%
   would drop the panel below the whole header including the 145px logo row.

   FOURTH CASCADE FAILURE THIS SESSION, and a new species:
     order        — media query above its base rules
     source       — core losing to a section stylesheet
     weight       — a type selector out-specifying a class
     containing block — position resolving against the wrong ancestor
   The first three are about which rule wins. This one is about what a winning
   rule actually measures against.
   ========================================================================== */

import { readFile, writeFile } from 'node:fs/promises';

const FILE = 'sections/header-bottom.liquid';
let src = await readFile(FILE, 'utf8');

const edits = [
  {
    label: 'header becomes the stacking context',
    find: `.fye .hdr { background: var(--white); }`,
    replace: `/* position + z-index are load-bearing for the mega panels: without a
   positioned ancestor an absolute panel resolves against the VIEWPORT, so
   top: 100% put it one screen-height down the page, below the hero. */
.fye .hdr { background: var(--white); position: relative; z-index: 40; }`
  },
  {
    label: 'nav band is the panel origin',
    find: `.fye .hdr__nav { background: var(--ivory); }`,
    replace: `/* The panel's vertical origin. top: 100% must mean "below the nav band", not
   "below the whole header" — the logo row above it is 145px tall. */
.fye .hdr__nav { background: var(--ivory); position: relative; }`
  },
  {
    label: 'panel anchors to the nav band',
    find: `.fye .hdr__nav-item.has-mega { position: static; }`,
    replace: `/* static so the panel is not trapped in one narrow nav item — it spans the
   full width. The containing block then comes from .hdr__nav above. */
.fye .hdr__nav-item.has-mega { position: static; }`
  }
];

for (const { label, find, replace } of edits) {
  const n = src.split(find).length - 1;
  if (n !== 1) {
    console.log(`SKIP  ${label} — ${n} matches`);
    continue;
  }
  src = src.replace(find, replace);
  console.log(`  ok  ${label}`);
}

await writeFile(FILE, src, 'utf8');
console.log(`FIXED ${FILE} — panel now anchors to the nav band`);
