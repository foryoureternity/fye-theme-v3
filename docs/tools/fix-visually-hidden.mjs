/* ============================================================================
   fix-visually-hidden.mjs — 27/08/2026
   ----------------------------------------------------------------------------
     cd ~/Dropbox/GIT-repositaries/fye-theme-v3
     node docs/tools/fix-visually-hidden.mjs

   Delete once run and synced.

   THE BUG
   The page had ~845px of horizontal scroll with nothing in it. Console said:

     visually-hidden: position absolute, width 1px, clip NONE, left 0
     html overflowX visible, body overflowX visible

   A screen-reader-only element is meant to be a 1px box with its content
   clipped away. Ours had the 1px box but no clipping — no overflow: hidden, no
   clip, no clip-path — so the text inside rendered at its natural width,
   overflowed the box visibly, and OVERFLOWING INLINE CONTENT COUNTS TOWARD THE
   DOCUMENT'S SCROLLABLE WIDTH. Hence a page nearly twice as wide as its
   content, with the extra space empty.

   The gpromo and testimonial hits in the same console output were red herrings:
   both sit inside tracks with overflow-x: auto (clientW 733, scrollW 2198), so
   they are clipped and contribute nothing to the page's width.

   THE FIX
   The full recipe, appended so it wins over whatever is there now, and written
   twice — scoped and unscoped — because this class gets used inside sections
   that are not always inside the .fye wrapper (the header renders above it).

   Belt and braces: overflow: hidden AND clip AND clip-path. clip is deprecated
   but still the only thing some older Safari honours; clip-path is the modern
   one; overflow: hidden is what actually stops the scroll contribution. All
   three, because the failure mode is invisible until someone screenshots a
   page with 845px of nothing on the right.
   ========================================================================== */

import { readFile, writeFile } from 'node:fs/promises';

const FILE = 'assets/fye-core.css';
const src = await readFile(FILE, 'utf8');

const rule = `

/* ============================================================================
   SCREEN-READER-ONLY TEXT
   Appended 27/08/2026. The previous rule set width/height to 1px but did NOT
   clip the content, so the text overflowed its 1px box visibly and added ~845px
   of empty horizontal scroll to every page carrying a rating or an aria label.
   Overflowing inline content counts toward the document's scrollable width.

   Scoped and unscoped, because the header renders outside the .fye wrapper.
   overflow + clip + clip-path together: clip-path is the modern rule, clip is
   what older Safari honours, and overflow: hidden is the one that actually
   stops the scroll contribution.
   ========================================================================== */

.visually-hidden,
.fye .visually-hidden {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  margin: -1px !important;
  padding: 0 !important;
  border: 0 !important;
  overflow: hidden !important;
  clip: rect(0 0 0 0) !important;
  clip-path: inset(50%) !important;
  white-space: nowrap !important;
}
`;

if (src.includes('SCREEN-READER-ONLY TEXT')) {
  console.log('SKIP  the appended rule is already in fye-core.css');
} else {
  await writeFile(FILE, src + rule, 'utf8');
  console.log(`FIXED ${FILE} — screen-reader-only rule appended (${src.length} -> ${src.length + rule.length} bytes)`);
}
