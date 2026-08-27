/* ============================================================================
   fix-ringpages-02.mjs — invisible text, 27/08/2026
   ----------------------------------------------------------------------------
     cd ~/Dropbox/GIT-repositaries/fye-theme-v3
     node docs/tools/fix-ringpages-02.mjs

   Delete once run and synced.

   TWO BUGS, both the same mistake in different places: LIGHT TYPE ON A LIGHT
   GROUND, because a band's colour rules were applied to content sitting on a
   card that has its own ground.

   1. about-columns-four — the ten ring styles rendered as white cards with NO
      VISIBLE TEXT. `.band--teal` sets every descendant's type to ivory, which
      is right for content directly on the band and wrong for content inside a
      white card on that band. Titles and buttons were ivory on white.
      The card now restores the ink colours for its own contents.

      This is a general trap, not a one-off: any section that puts a light card
      on a dark band has to opt its contents back out. fye-cards and fye-related
      avoid it by making the card transparent on dark bands instead — a
      different answer to the same question.

   2. feature_columns2 on the homepage — the FYE monogram is a LIGHT outline
      drawing, and the section was on a white band, so it was nearly invisible.
      It needs a dark ground. Teal, matching the live site.
   ========================================================================== */

import { readFile, writeFile } from 'node:fs/promises';

const EDITS = [
  {
    file: 'sections/about-columns-four.liquid',
    changes: [
      {
        find: `@media (max-width: 900px) {
  .fye .acf__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}`,
        replace: `/* The card carries its own white ground, so its contents must opt OUT of the
   band's type colours. On a teal or sage band .band--teal :where(...) sets
   everything to ivory — which on a white card is invisible. This is the whole
   reason the style tiles rendered as blank cards. */
.fye .band--teal .acf__link,
.fye .band--sage .acf__link,
.fye .band--teal .acf__title,
.fye .band--sage .acf__title { color: var(--ink); }
.fye .band--teal .acf__cta,
.fye .band--sage .acf__cta { color: var(--ink); border-color: var(--line); }
.fye .band--teal .acf__link:hover .acf__title,
.fye .band--sage .acf__link:hover .acf__title,
.fye .band--teal .acf__link:hover .acf__cta,
.fye .band--sage .acf__link:hover .acf__cta { color: var(--sage-deep); }
.fye .band--teal .acf__link:hover .acf__cta,
.fye .band--sage .acf__link:hover .acf__cta { border-color: var(--sage-deep); }

@media (max-width: 900px) {
  .fye .acf__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}`
      }
    ]
  },
  {
    file: 'templates/index.json',
    changes: [
      {
        find: `      "block_order": ["text_block_VY9JKk", "text_block_P8TPry"],
      "settings": {
        "text_align": "left",
        "band": "white"
      }`,
        replace: `      "block_order": ["text_block_VY9JKk", "text_block_P8TPry"],
      "settings": {
        "text_align": "left",
        "band": "teal"
      }`
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
