/* ============================================================================
   fix-mega-overflow.mjs — 28/08/2026
   ----------------------------------------------------------------------------
     cd ~/Dropbox/GIT-repositaries/fye-theme-v3
     node docs/tools/fix-mega-overflow.mjs

   Delete once run and synced.

   THE BUG
   The screenshot shows the guide card on the LEFT and the tab bar off to the
   right, with the panel far wider than the window. Both symptoms come from one
   cause: .mm__main has no min-width: 0.

   A grid item's default min-width is auto, meaning "at least as wide as my
   content". The 25-cut grid is five fixed-ish columns of a 40px icon plus
   "TAPERED BAGUETTE" in tracked uppercase, so its natural width is enormous.
   minmax(0, 1fr) on the TRACK cannot help while the ITEM refuses to shrink —
   the track grows to fit, the row overflows the panel, and the second column
   is pushed off-screen. What is visible on the left is the overflow, not a
   reordering.

   THE FIX, three parts
   1. min-width: 0 on .mm__main and .mm__side, so both may shrink.
   2. Explicit grid-column on each, so their placement cannot depend on
      source order or on a stray child appearing between them.
   3. The cuts grid becomes auto-fill with a 150px floor rather than a hard
      five columns, so it reflows instead of demanding width. Same for the
      stones grid, which had the identical hard-coded five.

   This is the second time today an implicit minimum has driven a layout: the
   containing-block bug was about what a rule measures against, this one about
   what a grid item is allowed to become. Worth adding min-width: 0 to any grid
   item that holds a wide grid of its own.
   ========================================================================== */

import { readFile, writeFile } from 'node:fs/promises';

const FILE = 'sections/header-bottom.liquid';
let src = await readFile(FILE, 'utf8');

const edits = [
  {
    label: 'main + side may shrink, placement pinned',
    find: `.fye .mm__side {
  padding-left: var(--s10);
  border-left: 1px solid rgba(35, 61, 71, 0.18);
}`,
    replace: `/* min-width: 0 is load-bearing. A grid item defaults to min-width: auto —
   "at least as wide as my content" — and the 25-cut grid's natural width is
   enormous, so the track grew, the row overflowed, and the second column was
   pushed off-screen. grid-column is pinned so placement cannot depend on
   source order or on a stray child. */
.fye .mm__main { min-width: 0; grid-column: 1; }
.fye .mm__side {
  min-width: 0;
  grid-column: 2;
  padding-left: var(--s10);
  border-left: 1px solid rgba(35, 61, 71, 0.18);
}
.fye .mega__in--wide .mm__side { grid-column: 1; border-left: 0; padding-left: 0; }`
  },
  {
    label: 'cuts grid reflows',
    find: `.fye .mm__cuts {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));`,
    replace: `.fye .mm__cuts {
  display: grid;
  /* auto-fill with a floor, not a hard five: a fixed count makes the grid
     demand width, which is what overflowed the panel. */
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));`
  },
  {
    label: 'stones grid reflows',
    find: `.fye .mm__stones {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));`,
    replace: `.fye .mm__stones {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(165px, 1fr));`
  },
  {
    label: 'shape and menu columns may shrink too',
    find: `.fye .mm__cols { display: flex; gap: var(--s11); align-items: flex-start; }
.fye .mm__col { min-width: 0; }`,
    replace: `.fye .mm__cols { display: flex; flex-wrap: wrap; gap: var(--s9) var(--s11); align-items: flex-start; }
.fye .mm__col { min-width: 0; }
.fye .mm__col--shapes { flex: none; }`
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

/* The 1280 override still hard-codes four; drop it so auto-fill governs. */
src = src.replace(
  `  .fye .mm__cuts { grid-template-columns: repeat(4, minmax(0, 1fr)); }\n`,
  ''
);
src = src.replace(
  `  .fye .mm__stones { grid-template-columns: repeat(4, minmax(0, 1fr)); }\n`,
  ''
);

await writeFile(FILE, src, 'utf8');
console.log(`FIXED ${FILE}`);
