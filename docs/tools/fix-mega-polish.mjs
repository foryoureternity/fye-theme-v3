/* ============================================================================
   fix-mega-polish.mjs — 28/08/2026
   ----------------------------------------------------------------------------
     cd ~/Dropbox/GIT-repositaries/fye-theme-v3
     node docs/tools/fix-mega-polish.mjs

   Delete once run and synced.

   Three faults in the screenshots, all mine.

   1. "THE ETERNITY RING G…" cut off. I put white-space: nowrap on
      .mm__zone-title to stop the LEFT zone's heading wrapping mid-phrase. The
      right zone is 380px and its headings are longer, so nowrap overflowed the
      column. nowrap now applies only inside .mm__main.

   2. "DIAMOND EDUCATIQNJEWELLERY GUIDE" overlapping. Same cause on .mm__label:
      two labels in a 190px grid track, both refusing to wrap, so they ran
      straight over each other. Labels wrap inside .mm__side-cols.

   3. The eternity guide cover was a broken image. I guessed
      Eternity_Ring_Cover.png; the real file is Eternity_Ring_Guide_Cover_v3.png.
      Guessing a filename was avoidable — the Files list is one query away.

   Also tightening the panel: shape icons 44px -> 38px and the row gap one step
   down. The eternity and wedding panels currently run past the bottom of the
   viewport and the stone grid gets clipped.
   ========================================================================== */

import { readFile, writeFile } from 'node:fs/promises';

/* ---- CSS ---------------------------------------------------------------- */

const FILE = 'sections/header-bottom.liquid';
let src = await readFile(FILE, 'utf8');

const css = `
/* ---- polish, 28/08/2026 -------------------------------------------------
   nowrap belongs to the LEFT zone only: the 380px right column has longer
   headings and overflowed, and two non-wrapping labels in one narrow grid
   track overlapped outright. */
.fye .mm__side .mm__zone-title { white-space: normal; }
.fye .mm__side-cols .mm__label { white-space: normal; line-height: 1.35; }
.fye .mm__main .mm__zone-title { white-space: nowrap; }

/* The panel was running past the bottom of the viewport and clipping the
   stone grid. */
.fye .mm__shapes img { width: 38px; height: 38px; }
.fye .mm__shapes { gap: var(--s3) var(--s8); }
.fye .mm__shapes a { gap: var(--s4); }
`;

if (src.includes('polish, 28/08/2026')) {
  console.log('SKIP  polish CSS already present');
} else {
  const at = src.lastIndexOf('{% endstylesheet %}');
  src = src.slice(0, at) + css + src.slice(at);
  await writeFile(FILE, src, 'utf8');
  console.log(`FIXED ${FILE} — heading and label wrapping, tighter shape grid`);
}

/* ---- the real eternity cover -------------------------------------------- */

const TPL = 'sections/header-group.json';
const doc = JSON.parse(await readFile(TPL, 'utf8'));
const etr = doc.sections.header.blocks.nav_eternity;

if (etr) {
  etr.settings.guide1_cover =
    'https://cdn.shopify.com/s/files/1/0972/5391/7056/files/Eternity_Ring_Guide_Cover_v3.png?v=1786444086';
  await writeFile(TPL, JSON.stringify(doc, null, 2) + '\n', 'utf8');
  console.log(`FIXED ${TPL} — eternity cover corrected`);
}
