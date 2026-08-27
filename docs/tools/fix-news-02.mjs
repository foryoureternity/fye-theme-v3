/* ============================================================================
   fix-news-02.mjs — latest news proportions, 27/08/2026
   ----------------------------------------------------------------------------
     cd ~/Dropbox/GIT-repositaries/fye-theme-v3
     node docs/tools/fix-news-02.mjs

   Delete once run and synced.

   Structure is right; the proportions are not. Four changes, measured against
   live:

   1. Thumbnails 42% -> 34%. Live's are narrower, which gives the titles enough
      measure to wrap to two lines instead of three. Three-line titles are what
      make the right column look crowded and unruly.
   2. Row gap --s8 -> --s6. Live's rows sit closer; at --s8 there is a hole
      under each button big enough to read as a missing element.
   3. Lead image 4/3 -> 4/5. The left column was ending well short of the
      right, so the band looked lopsided. A portrait lead also matches live,
      where the photograph is the tallest thing in the section.
   4. Row excerpts 16 -> 13 words, so each is two lines rather than an awkward
      third line of two words. The lead keeps 22 — it has the width for it.
   ========================================================================== */

import { readFile, writeFile } from 'node:fs/promises';

const FILE = 'sections/latest-news-EM.liquid';

const edits = [
  {
    find: `  grid-template-columns: 42% 1fr;
  gap: var(--s6);
  align-items: start;`,
    replace: `  /* 34%, not 42%: narrower thumbnails leave the titles enough measure to
     wrap to two lines. At 42% every title took three and the column read as
     crowded. */
  grid-template-columns: 34% 1fr;
  gap: var(--s6);
  align-items: start;`
  },
  {
    find: `.fye .news__list { display: flex; flex-direction: column; gap: var(--s8); }`,
    replace: `/* --s6, not --s8: at the larger gap the space under each button read as a
   missing element rather than a margin. */
.fye .news__list { display: flex; flex-direction: column; gap: var(--s6); }`
  },
  {
    find: `  aspect-ratio: 4 / 3; object-fit: cover;`,
    replace: `  /* Portrait, so the left column's height matches the three rows opposite.
     At 4/3 the lead ended well short and the band looked lopsided. */
  aspect-ratio: 4 / 5; object-fit: cover;`
  },
  {
    find: `.fye .news__ph--lead { aspect-ratio: 4 / 3; }`,
    replace: `.fye .news__ph--lead { aspect-ratio: 4 / 5; }`
  },
  {
    find: `              assign art_excerpt = article.excerpt_or_content | strip_html | truncatewords: 16`,
    replace: `              assign art_excerpt = article.excerpt_or_content | strip_html | truncatewords: 13`
  }
];

let src = await readFile(FILE, 'utf8');
let ok = 0;

for (const { find, replace } of edits) {
  const n = src.split(find).length - 1;
  if (n !== 1) {
    console.log(`SKIP  ${n} matches — "${find.trim().split('\n')[0].slice(0, 50)}…"`);
    continue;
  }
  src = src.replace(find, replace);
  ok++;
}

await writeFile(FILE, src, 'utf8');
console.log(`FIXED ${FILE} — ${ok} of ${edits.length} edits applied`);
