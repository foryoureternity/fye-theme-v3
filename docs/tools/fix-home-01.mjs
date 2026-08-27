/* ============================================================================
   fix-home-01.mjs — Ed's homepage review, mechanical fixes, 27/08/2026
   ----------------------------------------------------------------------------
     cd ~/Dropbox/GIT-repositaries/fye-theme-v3
     node docs/tools/fix-home-01.mjs

   Delete once run and synced.

   Items 2, 3, 8, 9 and 11 from the review. The layout rebuilds (category
   panels, gallery, guides, latest news, still-unsure) are separate work —
   they need the live LAYOUT, not a tweak.

   STANDING INSTRUCTION FROM THIS REVIEW, recorded because I got it wrong four
   times on one page: **match the live layout.** Where a live section's
   structure differs from what the old settings imply, live wins. Do not
   redesign a section while porting it.

   1. HERO — the enormous left margin. `.hero__in` is `.wrap`, so on a
      full-bleed photo hero the copy started 124px in from the viewport edge at
      1568px wide. Live runs it near the edge (max 1368 + 24px padding). Only
      applies to the left-aligned variant; centred heroes are unaffected.

   2. TRUST STRIP — vertical rules between the four points. I added them; live
      has none. Gone.

   3. PRODUCT CARD — "Setting from £X", not "From £X", when the price varies.
      On a ring where the stone is chosen separately these are different
      claims, and "From" understates what the number covers.

   4. SPLIT SECTIONS — no vertical padding when an image runs full-bleed to the
      edge. The band's --sect-y was leaving a white strip above and below the
      photograph on both `fye-media-text` full-bleed instances (Designed with
      you, and the Guarantee). Live has none: the image meets the neighbouring
      sections. Set as the variable, not as a padding declaration.
   ========================================================================== */

import { readFile, writeFile } from 'node:fs/promises';

const EDITS = [
  {
    file: 'sections/fye-hero.liquid',
    changes: [
      {
        find: '.fye .hero--left .hero__in { align-items: flex-start; text-align: left; }',
        replace: `/* Left-aligned heroes run wide: on a full-bleed photograph the centred 1320px
   measure left a 124px gap before the copy at laptop width, which reads as a
   mistake rather than a margin. Live uses 1368 plus the gutter. */
.fye .hero--left .hero__in {
  align-items: flex-start;
  text-align: left;
  max-width: var(--maxw-wide);
}`
      }
    ]
  },
  {
    file: 'sections/fye-trust-strip.liquid',
    changes: [
      {
        find: `/* Hairlines between, not around — the divider does the work a card would. */
.fye .tstrip__item + .tstrip__item { border-inline-start: var(--hairline); }`,
        replace: `/* No dividers. Live separates these four points with whitespace alone; the
   rules I added made a four-column table out of a quiet reassurance strip. */`
      },
      {
        find: `/* The dividers only make sense while the items are in one row. */
@media (max-width: 900px) {
  .fye .tstrip__item + .tstrip__item { border-inline-start: 0; }
}`,
        replace: ''
      }
    ]
  },
  {
    file: 'snippets/product-card.liquid',
    changes: [
      {
        find: '          <span class="pcard__now">From {{ product.price_min | money }}</span>',
        replace: '          <span class="pcard__now">Setting from {{ product.price_min | money }}</span>'
      },
      {
        find: `    varies by variant   → "From <lowest>"`,
        replace: `    varies by variant   → "Setting from <lowest>" — the stone is chosen
                          separately, so "From" understates what it covers`
      }
    ]
  },
  {
    file: 'sections/fye-media-text.liquid',
    changes: [
      {
        find: `/* Full bleed: the image runs to the viewport edge, the words keep the gutter.
   The grid gap goes too — the colour change is the join. */
.fye .mtext--bleed .media-text { gap: 0; align-items: stretch; }`,
        replace: `/* Full bleed: the image runs to the viewport edge, the words keep the gutter.
   The grid gap goes too — the colour change is the join.

   AND NO VERTICAL PADDING. A full-bleed image with --sect-y above and below it
   leaves a strip of band colour top and bottom, so the photograph floats in a
   box instead of meeting the sections either side. Live has none. Set as the
   variable, never as a padding declaration. */
.fye .mtext--bleed { --sect-y: 0; }
.fye .mtext--bleed .media-text { gap: 0; align-items: stretch; }`
      }
    ]
  }
];

let failed = 0;
let changed = 0;

for (const { file, changes } of EDITS) {
  let text;
  try {
    text = await readFile(file, 'utf8');
  } catch {
    console.log(`SKIP  ${file} — not found`);
    failed += 1;
    continue;
  }

  let next = text;
  let ok = true;

  for (const { find, replace } of changes) {
    const hits = next.split(find).length - 1;
    if (hits !== 1) {
      console.log(`FAIL  ${file} — expected 1 match, found ${hits}`);
      ok = false;
      continue;
    }
    next = next.replace(find, replace);
  }

  if (!ok) {
    console.log(`      ${file} NOT written`);
    failed += 1;
    continue;
  }

  await writeFile(file, next, 'utf8');
  changed += 1;
  console.log(`FIXED ${file}`);
}

console.log(`\n${changed} file(s) changed, ${failed} problem(s).`);
