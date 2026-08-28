/* ============================================================================
   fix-logo-mobile.mjs — 28/08/2026
   ----------------------------------------------------------------------------
     cd ~/Dropbox/GIT-repositaries/fye-theme-v3
     node docs/tools/fix-logo-mobile.mjs

   Delete once run and synced.

   TWO FAULTS, one cause each.

   1. NOT CENTRED. The mobile row is `grid-template-columns: auto 1fr auto`, so
      the logo sits in a middle track that spans whatever is left between a
      ~40px burger and a ~160px icon row. `justify-self: center` centres it
      inside that track, and the track is not centred on the page — hence the
      logo sitting left of true centre by roughly half the difference.
      Back to `1fr auto 1fr`: equal side tracks, so the middle one is centred
      on the row and the logo with it.

   2. TOO SMALL. 40px was chosen to fit the 62px row, but this lockup is 571
      wide by 320 tall, so 40px of height gives only ~71px of width — a mark
      that reads as an afterthought next to 22px icons. Row goes to 72px and
      the mark to 52px (~93px wide), which is proportionate to the icons beside
      it and still well inside a comfortable header height.

   The wide `fye-brand-mark.webp` is doing this because it is a full lockup, not
   a monogram. If the mobile header ever needs to be shorter, the square
   FYE-initial-logo.svg is the mark to use — it would give the same optical
   weight at half the width.
   ========================================================================== */

import { readFile, writeFile } from 'node:fs/promises';

const FILE = 'sections/header-bottom.liquid';
let src = await readFile(FILE, 'utf8');

const edits = [
  {
    label: 'mobile row back to equal side tracks',
    find: `  .fye .hdr__main-in { grid-template-columns: auto 1fr auto; min-height: 62px; gap: var(--s3); }`,
    replace: `  /* 1fr auto 1fr, not auto 1fr auto: with unequal side tracks the middle track
     is not centred on the row, so a centred logo inside it still sits off to
     one side by half the difference between burger and icon row. */
  .fye .hdr__main-in { grid-template-columns: 1fr auto 1fr; min-height: 72px; gap: var(--s3); }`
  },
  {
    label: 'mobile mark 40px -> 52px',
    find: `  .fye .hdr__logo img.hdr__logo-img--m { display: block; height: 40px; width: auto; }`,
    replace: `  /* 52px. The mark is a 571x320 lockup, so height drives a much smaller width
     than it would for a square monogram — at 40px it was ~71px wide and read
     as an afterthought beside the 22px icons. */
  .fye .hdr__logo img.hdr__logo-img--m { display: block; height: 52px; width: auto; }`
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
console.log(`FIXED ${FILE}`);
