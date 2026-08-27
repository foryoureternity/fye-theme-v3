/* ============================================================================
   fix-trust-mobile.mjs — 27/08/2026
   ----------------------------------------------------------------------------
     cd ~/Dropbox/GIT-repositaries/fye-theme-v3
     node docs/tools/fix-trust-mobile.mjs

   Delete once run and synced.

   The trust strip is `.tstrip__list` with:

     grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));

   auto-fit with a 200px floor gives four across on desktop, which is right,
   and exactly ONE column on a phone — 200px will not fit twice in a ~330px
   content width, so it collapses all the way. Live shows 2 x 2, which is what
   makes the four points scannable without scrolling past them.

   So: two explicit columns below 768px. minmax(0, 1fr) rather than a floor,
   because the whole problem was a floor wider than the space available.

   Appended to fye-core.css with the evening's other mobile corrections. It
   belongs in the section, but the section's stylesheet has no anchor I can
   match on reliably without re-reading the file, and a later rule at equal
   specificity wins either way. Worth folding back into the section next time
   it is open.
   ========================================================================== */

import { readFile, writeFile } from 'node:fs/promises';

const FILE = 'assets/fye-core.css';
let src = await readFile(FILE, 'utf8');

const anchor = `@media (max-width: 768px) {
  /* The mark is decorative here and live drops it on mobile, leading with the`;

const addition = `@media (max-width: 768px) {
  /* Two across, not one. auto-fit with a 200px floor cannot fit two 200px
     tracks in a phone's ~330px content width, so it collapsed to a single
     column and the four points ran down the page. Live shows 2 x 2.
     minmax(0, 1fr) because a floor is what caused this. */
  .fye .tstrip__list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 768px) {
  /* The mark is decorative here and live drops it on mobile, leading with the`;

if (src.includes('.fye .tstrip__list { grid-template-columns: repeat(2')) {
  console.log('SKIP  trust strip rule already present');
} else if (!src.includes(anchor)) {
  console.log('SKIP  could not find the mobile corrections block');
} else {
  src = src.replace(anchor, addition);
  await writeFile(FILE, src, 'utf8');
  console.log(`FIXED ${FILE} — trust strip 2 x 2 below 768px`);
}
