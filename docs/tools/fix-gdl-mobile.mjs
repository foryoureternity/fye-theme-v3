/* ============================================================================
   fix-gdl-mobile.mjs — 28/08/2026
   ----------------------------------------------------------------------------
     cd ~/Dropbox/GIT-repositaries/fye-theme-v3
     node docs/tools/fix-gdl-mobile.mjs

   Delete once run and synced.

   The guide band stacks correctly on mobile but the cover column is still
   built for a two-column desktop grid, so on a phone it reads badly:

   1. The cover is left-aligned in a full-width column, leaving a large empty
      area to its right that looks like a missing element. Once the grid is one
      column, a 240px cover pinned left is just a hole.
      -> the cover block centres, and its caption centres with it.

   2. 240px of a ~330px content width is nearly three-quarters of the screen,
      so the cover dominates the band it is meant to introduce.
      -> 200px, which reads as a book being offered rather than the subject.

   3. In the new side-by-side pair the two covers stretch to half the screen
      each with a --s5 gap, so on a narrow phone they end up ~150px wide — the
      exact size I widened the desktop column to avoid.
      -> the pair is capped at 300px overall and centred, giving ~140px covers
      that sit as a matched pair rather than two large competing books.

   4. Captions were left-aligned under centred art.
      -> centred on mobile, in both layouts.

   All four are mobile-only. Desktop is untouched.
   ========================================================================== */

import { readFile, writeFile } from 'node:fs/promises';

const FILE = 'sections/fye-guide-download.liquid';
let src = await readFile(FILE, 'utf8');

const find = `@media (max-width: 900px) {
  .fye .gdl__inner { grid-template-columns: 1fr; gap: var(--s7); }
  .fye .gdl__covers { max-width: 240px; }
  /* Stacked, the pair still sits side by side — two covers in a row is the
     whole point, and at 40vw each they stay legible. The 240px cap above
     would crush them, so it is lifted here. */
  .fye .gdl__inner--side { grid-template-columns: 1fr; }
  .fye .gdl__covers--side { max-width: 100%; gap: var(--s5); }
}`;

const replace = `@media (max-width: 900px) {
  .fye .gdl__inner { grid-template-columns: 1fr; gap: var(--s7); }

  /* Centred, and 200px rather than 240. In a one-column layout a cover pinned
     left leaves an empty half-width beside it that reads as a missing element,
     and 240px of a ~330px content width makes the cover the subject of the
     band instead of the thing being offered. */
  .fye .gdl__covers { max-width: 200px; margin-inline: auto; align-items: center; }
  .fye .gdl__caption { text-align: center; }

  /* The pair stays side by side — two covers in a row is the whole point — but
     capped and centred. Left to stretch, each cover would land near 150px,
     which is the size the desktop column was widened to avoid. */
  .fye .gdl__inner--side { grid-template-columns: 1fr; }
  .fye .gdl__covers--side {
    max-width: 300px;
    margin-inline: auto;
    gap: var(--s5);
    align-items: flex-start;
  }
  .fye .gdl__book { align-items: center; }

  /* The words stay left-aligned: centred body copy is harder to read, and the
     brand sets body copy left. Only the art and its labels centre. */
  .fye .gdl__words { align-items: flex-start; }
}`;

const n = src.split(find).length - 1;
if (n !== 1) {
  console.log(`SKIP  ${FILE} — ${n} matches for the mobile block`);
} else {
  src = src.replace(find, replace);
  await writeFile(FILE, src, 'utf8');
  console.log(`FIXED ${FILE} — mobile: covers centred, 200px single / 300px pair`);
}
