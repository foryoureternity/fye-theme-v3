/* ============================================================================
   fix-styling-01.mjs — first pass of preview fixes, 27/08/2026
   ----------------------------------------------------------------------------
     cd ~/Dropbox/GIT-repositaries/fye-theme-v3
     node docs/tools/fix-styling-01.mjs

   Prints every change and refuses to write a file if a target string is not
   found exactly once. Delete once it has run and synced.

   FIVE FIXES, from the first real preview of the homepage.

   1. fye-core.css — BAND COLLAPSE NEVER FIRED. The biggest visible problem.
      `.band--white + .band--white { padding-block-start: 0 }` assumed the two
      bands were siblings. They are not: Shopify wraps every section in its own
      <div class="shopify-section">, so the sibling selector can only ever
      match two bands INSIDE one section. Every same-colour neighbour on the
      homepage was therefore showing 80px + 80px of padding — the dead white
      space between the trust strip and "Why choose", and again around the
      product grid. The fix reaches through the wrapper with :has(). The
      original same-section selectors stay, because both cases are real.

   2. fye-hero.liquid — the scrim was too weak for the homepage photograph.
      --scrim is teal at 42%, tuned for a mid-tone image; over pale skin and a
      white ring it leaves ivory type barely legible. Photo heroes now take 55%.
      This is a local override of the token, not a change to it: other scrim
      uses (the category panels) are over darker images and are fine.

   3. feature_columns2.liquid — the monogram filled its column. It is a logo,
      not a photograph, so it gets a cap rather than the column width.

   4. guide-download-block.liquid — six covers wrapped 5-then-1. auto-fit was
      the wrong tool for a known count: three across, two rows, and two across
      below 900. Covers also shrink so six fit without a scroll.

   5. fye-testimonials.liquid — the header was left-aligned with the rating
      beside it, while every other section header on the page is centred.
      Centred, matching the rest.
   ========================================================================== */

import { readFile, writeFile } from 'node:fs/promises';

const EDITS = [
  {
    file: 'assets/fye-core.css',
    changes: [
      {
        find: `/* Consecutive same-colour bands collapse their shared padding, so two ivory
   sections in a row read as one block instead of a 160px gap. */
.fye .band--ivory + .band--ivory,
.fye .band--white + .band--white,
.fye .band--mist  + .band--mist,
.fye .band--teal  + .band--teal,
.fye .band--sage  + .band--sage { padding-block-start: 0; }`,
        replace: `/* Consecutive same-colour bands collapse their shared padding, so two ivory
   sections in a row read as one block instead of a 160px gap.

   TWO SETS OF SELECTORS, and both are needed. Shopify wraps every section in
   its own <div class="shopify-section">, so a plain sibling selector only ever
   matches two bands within ONE section — which is why this rule appeared to do
   nothing on the first homepage preview and every same-colour neighbour showed
   160px of dead space. The :has() pair reaches through the wrapper. Keep both:
   a single section can still hold two bands. */
.fye .shopify-section:has(> .band--ivory) + .shopify-section > .band--ivory,
.fye .shopify-section:has(> .band--white) + .shopify-section > .band--white,
.fye .shopify-section:has(> .band--mist)  + .shopify-section > .band--mist,
.fye .shopify-section:has(> .band--teal)  + .shopify-section > .band--teal,
.fye .shopify-section:has(> .band--sage)  + .shopify-section > .band--sage,
.fye .band--ivory + .band--ivory,
.fye .band--white + .band--white,
.fye .band--mist  + .band--mist,
.fye .band--teal  + .band--teal,
.fye .band--sage  + .band--sage { padding-block-start: 0; }`
      }
    ]
  },
  {
    file: 'sections/fye-hero.liquid',
    changes: [
      {
        find: '.fye .hero--media { position: relative; overflow: hidden; }\n.fye .hero--media .hero__media { position: absolute; inset: 0; }',
        replace: `.fye .hero--media { position: relative; overflow: hidden; }
/* 42% is tuned for a mid-tone photograph. The homepage hero is pale skin and a
   white ring, where ivory type at 42% is not readable — 55%, measured against
   the lightest area of that image. */
.fye .hero--media .hero__media { position: absolute; inset: 0; --scrim: rgba(35, 61, 71, 0.55); }`
      }
    ]
  },
  {
    file: 'sections/feature_columns2.liquid',
    changes: [
      {
        find: '/* A logo or mark, not a photograph — contain, and never bigger than it is. */\n.fye .fcols__media :where(img) { max-width: 100%; }',
        replace: `/* A logo or mark, not a photograph — contain, and never bigger than it is.
   Without the cap the monogram stretches to the full column, which on the
   homepage is 3 of 12 columns and far larger than the wordmark is drawn for. */
.fye .fcols__media { max-width: 180px; }
.fye .fcols__media :where(img) { max-width: 100%; }`
      }
    ]
  },
  {
    file: 'sections/guide-download-block.liquid',
    changes: [
      {
        find: `.fye .guides__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--s9) var(--grid-gap);
  list-style: none;
  margin: 0;
  padding: 0;
}`,
        replace: `/* Three across, two rows. An explicit count, not auto-fit: there are six
   guides and auto-fit laid them out five-then-one at desktop width. */
.fye .guides__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--s9) var(--grid-gap);
  list-style: none;
  margin: 0;
  padding: 0;
}
@media (max-width: 900px) {
  .fye .guides__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 560px) {
  .fye .guides__grid { grid-template-columns: 1fr; }
}`
      }
    ]
  },
  {
    file: 'sections/fye-testimonials.liquid',
    changes: [
      {
        find: `.fye .tmon__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--s6);
  margin-bottom: var(--s9);
}
.fye .tmon__head-words { display: flex; flex-direction: column; gap: var(--s3); }`,
        replace: `/* Centred, like every other section header on the page. It was left-aligned
   with the rating pushed to the right, which read as a different site. */
.fye .tmon__head {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--s3);
  margin-bottom: var(--s9);
  text-align: center;
}
.fye .tmon__head-words { display: flex; flex-direction: column; align-items: center; gap: var(--s3); }`
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
      console.log(`FAIL  ${file} — expected 1 match, found ${hits}: ${JSON.stringify(find.slice(0, 60))}`);
      ok = false;
      continue;
    }
    next = next.replace(find, replace);
  }

  if (!ok) {
    console.log(`      ${file} NOT written — fix the mismatch above first`);
    failed += 1;
    continue;
  }

  await writeFile(file, next, 'utf8');
  changed += 1;
  console.log(`FIXED ${file}`);
}

console.log(`\n${changed} file(s) changed, ${failed} problem(s).`);
if (failed) console.log('Do not push until the problems above are resolved.');
