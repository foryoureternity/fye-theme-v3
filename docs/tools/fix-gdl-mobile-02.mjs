/* ============================================================================
   fix-gdl-mobile-02.mjs — 28/08/2026
   ----------------------------------------------------------------------------
     cd ~/Dropbox/GIT-repositaries/fye-theme-v3
     node docs/tools/fix-gdl-mobile-02.mjs

   Delete once run and synced.

   Ed's target: on mobile the whole band is CENTRED — cover, heading, body and
   a near-full-width button, as one centred column.

   That overrides the judgement I made an hour ago, which kept the body copy
   left-aligned on the grounds that centred paragraphs read worse and the brand
   sets body copy left. Both true in general, and wrong here: this is a single
   short offer, two or three lines, presented as one object. A centred cover
   above left-aligned copy above a left-pinned button reads as three things
   that failed to line up, and the ragged left edge is more distracting than
   the centring.

   Four changes, all inside the existing 900px block:
   - the words column centres, text and all
   - the cover goes back to 240px (my 200px was tuned for a left-aligned cover
     in a half-empty column; centred, it can carry the extra width)
   - the button stretches. `.row .btn { width: auto }` in core exempts button
     rows from the mobile full-width rule, and .gdl__actions is a .row, so it
     needs an explicit override — the same exemption that caught the hero
     buttons earlier tonight.
   - the actions row centres, so a second button sits under the first centred
     rather than left

   The eyebrow is left in place. Ed's screenshot has no "FREE DOWNLOAD" above
   the heading, but that is a per-page setting rather than markup, so removing
   it in CSS would silently override every other page that wants one.
   ========================================================================== */

import { readFile, writeFile } from 'node:fs/promises';

const FILE = 'sections/fye-guide-download.liquid';
let src = await readFile(FILE, 'utf8');

const edits = [
  {
    label: 'cover back to 240px',
    find: `  .fye .gdl__covers { max-width: 200px; margin-inline: auto; align-items: center; }`,
    replace: `  /* 240px. The 200 was tuned for a cover pinned left in a half-empty column;
     as the top of a centred stack it carries the extra width comfortably. */
  .fye .gdl__covers { max-width: 240px; margin-inline: auto; align-items: center; }`
  },
  {
    label: 'words centre; button stretches',
    find: `  /* The words stay left-aligned: centred body copy is harder to read, and the
     brand sets body copy left. Only the art and its labels centre. */
  .fye .gdl__words { align-items: flex-start; }`,
    replace: `  /* Fully centred. Centred body copy is normally worse to read and the brand
     sets copy left — but this is one short offer presented as a single object,
     and a centred cover over left-aligned copy over a left-pinned button reads
     as three things that failed to line up. */
  .fye .gdl__words { align-items: center; text-align: center; }
  .fye .gdl__body { max-width: 40ch; }

  /* Core sets .btn { width: 100% } at 560px but exempts .row .btn so button
     rows do not stretch — and .gdl__actions is a .row. Same exemption that
     caught the hero buttons. Overridden here so the button reads as the band's
     action rather than a small chip under centred text. */
  .fye .gdl__actions { justify-content: center; width: 100%; }
  .fye .gdl__actions .btn,
  .fye .row.gdl__actions .btn { width: 100%; }`
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
