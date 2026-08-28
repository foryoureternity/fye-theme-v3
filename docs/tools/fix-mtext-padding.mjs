/* ============================================================================
   fix-mtext-padding.mjs — 28/08/2026
   ----------------------------------------------------------------------------
     cd ~/Dropbox/GIT-repositaries/fye-theme-v3
     node docs/tools/fix-mtext-padding.mjs

   Delete once run and synced.

   THE BUG, and it is mine from earlier today.

     @media (max-width: 900px) {
       .fye .mtext--bleed .mtext__body { padding-block: var(--s7) 0; }
     }

   That trailing 0 is zero BOTTOM padding. The full-bleed variant also sets
   `--sect-y: 0` — deliberately, so a full-bleed photograph meets the sections
   either side instead of floating in a strip of band colour. Those two
   together mean the text column has nothing below it at all, so the last
   element in it sits flush against the panel's bottom edge. On every page
   where that last element is a button, the button looks clipped — which is
   exactly what the wedding-rings and eternity-rings screenshots show.

   I wrote the 0 to let the words meet the next section, which was the right
   instinct for the IMAGE and wrong for the WORDS. An image meeting the next
   band is a deliberate join; a button doing it is a mistake.

   THE FIX
   Symmetrical --s7 top and bottom on mobile. The image keeps its full bleed
   because --sect-y: 0 is untouched — only the text column gets its inset back.

   Also raising the mobile inline padding from --pad-x (20px) to --s6 (24px) on
   this variant only. A coloured panel needs a visibly larger inset than white
   ground for the same optical margin: the eye reads the colour edge as the
   container edge, so 20px against sage looks tighter than 20px against white.

   AFFECTS 13 USES of fye-media-text, all of them for the better — every
   full-bleed instance currently has a bottom edge flush against its content.
   ========================================================================== */

import { readFile, writeFile } from 'node:fs/promises';

const FILE = 'sections/fye-media-text.liquid';
let src = await readFile(FILE, 'utf8');

const find = `@media (max-width: 900px) {
  .fye .mtext--bleed .mtext__body { padding-block: var(--s7) 0; }
  .fye .mtext--bleed .media-text:not(.media-text--reverse) .mtext__body,
  .fye .mtext--bleed .media-text--reverse .mtext__body { padding-inline: var(--pad-x); }
}`;

const replace = `@media (max-width: 900px) {
  /* SYMMETRICAL. This was \`var(--s7) 0\` — zero bottom padding — and because
     the bleed variant also sets --sect-y: 0, the text column had nothing at
     all beneath it. The last element sat flush against the panel's bottom
     edge, which on most of these pages is a button and looks clipped.
     The image still bleeds: --sect-y: 0 is untouched, only the words are
     re-inset. */
  .fye .mtext--bleed .mtext__body { padding-block: var(--s7); }

  /* 24px, not 20: against a coloured panel the eye reads the colour edge as
     the container edge, so the same number looks tighter than it does on
     white. This variant is always a coloured panel on mobile. */
  .fye .mtext--bleed .media-text:not(.media-text--reverse) .mtext__body,
  .fye .mtext--bleed .media-text--reverse .mtext__body { padding-inline: var(--s6); }
}`;

const n = src.split(find).length - 1;
if (n !== 1) {
  console.log(`SKIP  ${FILE} — ${n} matches for the mobile bleed block`);
} else {
  src = src.replace(find, replace);
  await writeFile(FILE, src, 'utf8');
  console.log(`FIXED ${FILE} — full-bleed text column has bottom padding again`);
  console.log('  affects all 13 uses of fye-media-text');
}
