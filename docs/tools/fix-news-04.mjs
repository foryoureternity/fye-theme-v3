/* ============================================================================
   fix-news-04.mjs — the lead panel. 27/08/2026
   ----------------------------------------------------------------------------
     cd ~/Dropbox/GIT-repositaries/fye-theme-v3
     node docs/tools/fix-news-04.mjs

   Delete once run and synced.

   The rows and the photograph are right now. What is left is the white panel.

   Measured off live at 1277 CSS px: the panel is about 42% of its column
   (~230px), and it overlaps the photograph by roughly a third of the image's
   height, so the panel's bottom edge finishes close to the image's bottom
   edge. Mine is 74% wide and overlaps by a fifth, so it hangs a long way below
   the photograph and drags the left column past the right.

   Three changes:
   1. width min(74%, 380px) -> min(52%, 300px)
   2. margin-top -16% -> -30% (percentage margins resolve against the
      container's WIDTH, so -30% of a 557px column is ~167px of lift)
   3. padding --s6 -> --s5, in proportion with the narrower panel

   The title will wrap to three or four lines in a panel that narrow. That is
   what live does too — the panel is a caption sitting on the photograph, not a
   card beside it.
   ========================================================================== */

import { readFile, writeFile } from 'node:fs/promises';

const FILE = 'sections/latest-news-EM.liquid';

const edits = [
  {
    label: 'panel width -> min(52%, 300px)',
    find: `  width: min(74%, 380px);`,
    replace: `  /* ~42% of the column, as live. A panel wider than half the photograph
     stops reading as a caption on the image and starts reading as a card
     that has slipped out of position. */
  width: min(52%, 300px);`
  },
  {
    label: 'overlap -16% -> -30%',
    find: `  margin-top: -16%;`,
    replace: `  /* Percentage margins resolve against the container's WIDTH, not height:
     -30% of a ~557px column is ~167px of lift, which lands the panel's
     bottom edge near the photograph's, as live. */
  margin-top: -30%;`
  },
  {
    label: 'panel padding --s6 -> --s5',
    find: `  margin-top: -30%;
  padding: var(--s6);`,
    replace: `  margin-top: -30%;
  padding: var(--s5);`
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
