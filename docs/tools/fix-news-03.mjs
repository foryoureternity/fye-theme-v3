/* ============================================================================
   fix-news-03.mjs — latest news proportions, second pass. 27/08/2026
   ----------------------------------------------------------------------------
     cd ~/Dropbox/GIT-repositaries/fye-theme-v3
     node docs/tools/fix-news-03.mjs

   Delete once run and synced.

   I overcorrected. Measuring live's screenshot properly this time, at 1277 CSS
   px wide: the two columns are equal halves, the lead photograph is 4/3 (not
   portrait), its thumbnails are 38% of the right column, and the three rows
   fill the same height as the lead because each row is TALLER than mine, not
   because the lead is shorter.

   So, five changes:
   1. Lead back to 4/3. Portrait made the left column half again as tall as the
      right, which is the imbalance now on screen. My reasoning last pass was
      backwards — I lengthened the long column instead of the short one.
   2. Thumbnails 34% -> 38%, matching live.
   3. Thumbnail aspect 3/2 -> 16/9. Live's are wider and shorter, which is what
      lets the title sit on two lines beside them.
   4. Row gap --s6 -> --s7, so three rows reach the depth of the lead.
   5. Row excerpts 13 -> 15 words, filling the extra width.

   The lead panel also narrows to 380px: at 420 it was crowding the ring in the
   photograph behind it.
   ========================================================================== */

import { readFile, writeFile } from 'node:fs/promises';

const FILE = 'sections/latest-news-EM.liquid';

const edits = [
  {
    label: 'lead aspect back to 4/3',
    find: `  /* Portrait, so the left column's height matches the three rows opposite.
     At 4/3 the lead ended well short and the band looked lopsided. */
  aspect-ratio: 4 / 5; object-fit: cover;`,
    replace: `  /* 4/3, as live. A portrait lead makes the left column half again as tall as
     the right — the fix for a short column is taller rows, not a longer lead. */
  aspect-ratio: 4 / 3; object-fit: cover;`
  },
  {
    label: 'lead placeholder aspect',
    find: `.fye .news__ph--lead { aspect-ratio: 4 / 5; }`,
    replace: `.fye .news__ph--lead { aspect-ratio: 4 / 3; }`
  },
  {
    label: 'thumbnails 34% -> 38%',
    find: `  grid-template-columns: 34% 1fr;`,
    replace: `  grid-template-columns: 38% 1fr;`
  },
  {
    label: 'thumbnail aspect 3/2 -> 16/9',
    find: `.fye .news__row-img :where(img) {
  display: block; width: 100%; height: auto;
  aspect-ratio: 3 / 2; object-fit: cover;
}`,
    replace: `.fye .news__row-img :where(img) {
  display: block; width: 100%; height: auto;
  /* Wider and shorter than the lead, as live — it is what lets the title sit
     on two lines beside the thumbnail rather than three. */
  aspect-ratio: 16 / 9; object-fit: cover;
}`
  },
  {
    label: 'row gap --s6 -> --s7',
    find: `.fye .news__list { display: flex; flex-direction: column; gap: var(--s6); }`,
    replace: `/* --s7: three rows then reach the same depth as the lead photograph. */
.fye .news__list { display: flex; flex-direction: column; gap: var(--s7); }`
  },
  {
    label: 'row excerpts 13 -> 15 words',
    find: `truncatewords: 13`,
    replace: `truncatewords: 15`
  },
  {
    label: 'lead panel 420 -> 380',
    find: `  width: min(78%, 420px);`,
    replace: `  width: min(74%, 380px);`
  }
];

let src = await readFile(FILE, 'utf8');
let ok = 0;

for (const { label, find, replace } of edits) {
  const n = src.split(find).length - 1;
  if (n !== 1) {
    console.log(`SKIP  ${label} — ${n} matches`);
    continue;
  }
  src = src.replace(find, replace);
  console.log(`  ok  ${label}`);
  ok++;
}

await writeFile(FILE, src, 'utf8');
console.log(`FIXED ${FILE} — ${ok} of ${edits.length}`);
