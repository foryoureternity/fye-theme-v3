/* ============================================================================
   fix-home-02.mjs — guides row and latest-news hierarchy, 27/08/2026
   ----------------------------------------------------------------------------
     cd ~/Dropbox/GIT-repositaries/fye-theme-v3
     node docs/tools/fix-home-02.mjs

   Delete once run and synced.

   Items 12 and 13. Both are the same mistake: I gave a section a layout of my
   own choosing instead of the live one.

   12. GUIDE DOWNLOADS — SIX ACROSS IN ONE ROW.
       I built 3 x 2 with large covers, which takes about three times the
       height and turns a compact shelf of guides into a catalogue. Live runs
       all six in a single row: small covers, a short title, a small button.
       Two across at 900, then one at 560.

   13. LATEST NEWS — ONE LEAD ARTICLE PLUS THREE STACKED.
       I built three equal cards. Live gives the newest article a large image
       on the left and stacks the next three beside it with small thumbnails,
       so the section has a focal point and carries four articles in less
       height than my three took.
   ========================================================================== */

import { readFile, writeFile } from 'node:fs/promises';

const EDITS = [
  {
    file: 'sections/guide-download-block.liquid',
    changes: [
      {
        find: `/* Three across, two rows. An explicit count, not auto-fit: there are six
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
}`,
        replace: `/* SIX ACROSS IN ONE ROW, as live. A compact shelf of guides, not a
   catalogue: my 3 x 2 with large covers took three times the height for the
   same six items. */
.fye .guides__grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: var(--s6) var(--s5);
  list-style: none;
  margin: 0;
  padding: 0;
}
@media (max-width: 1100px) {
  .fye .guides__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 560px) {
  .fye .guides__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}`
      },
      {
        find: `.fye .guides__item {
  display: flex;
  flex-direction: column;
  gap: var(--s5);
  margin: 0;
}
/* Covers are portrait artwork; a fixed ratio keeps six unequal files aligned. */
.fye .guides__cover { max-width: 220px; }`,
        replace: `.fye .guides__item {
  display: flex;
  flex-direction: column;
  gap: var(--s4);
  margin: 0;
}
/* Covers are portrait artwork; a fixed ratio keeps six unequal files aligned.
   No max-width now — the column is the constraint, six to a row. */
.fye .guides__cover { width: 100%; }`
      },
      {
        find: `.fye .guides__title { font-size: var(--fs-h4); }
.fye .guides__blurb {
  margin: 0;
  font-size: var(--fs-small);
  color: var(--ink-soft);
}
.fye .guides__words .btn { margin-top: var(--s2); }`,
        replace: `/* Smaller at six across: the title is a label on a shelf, not a heading. */
.fye .guides__title { font-size: var(--fs-fine); letter-spacing: var(--tr-h2); }
.fye .guides__blurb {
  margin: 0;
  font-size: var(--fs-fine);
  color: var(--ink-soft);
}
.fye .guides__words .btn { margin-top: var(--s1); }

/* The blurb is the first thing to go when six share a row — it is a nice-to-
   have and the title plus cover already say which guide this is. */
@media (min-width: 1101px) {
  .fye .guides__blurb { display: none; }
}`
      }
    ]
  },
  {
    file: 'sections/latest-news-EM.liquid',
    changes: [
      {
        find: `      <ul class="news__grid">
        {%- for article in src.articles limit: 3 -%}
          <li class="news__item">`,
        replace: `      {%- comment -%}
        Four articles: the newest as a lead with a large image, then three
        stacked beside it with thumbnails. Matching live — my first pass was
        three equal cards, which has no focal point and takes more height for
        fewer articles.
      {%- endcomment -%}
      <ul class="news__grid">
        {%- for article in src.articles limit: 4 -%}
          <li class="news__item{% if forloop.first %} news__item--lead{% endif %}">`
      },
      {
        find: `.fye .news__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--s7) var(--grid-gap);
  list-style: none;
  margin: 0;
  padding: 0;
}
.fye .news__item { margin: 0; }
.fye .news__link { display: flex; flex-direction: column; gap: var(--s4); }
.fye .news__img { display: block; overflow: hidden; }
.fye .news__img :where(img) {
  width: 100%;
  aspect-ratio: 3 / 2;
  object-fit: cover;
  transition: transform var(--dur) var(--ease);
}`,
        replace: `/* Lead article left, three stacked right. The lead spans both rows of its
   own column; the rest fill the second column in order. */
.fye .news__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--s6) var(--s10);
  list-style: none;
  margin: 0;
  padding: 0;
}
.fye .news__item { margin: 0; }
.fye .news__item--lead { grid-row: span 3; }

.fye .news__link { display: flex; flex-direction: column; gap: var(--s4); }
.fye .news__img { display: block; overflow: hidden; }
.fye .news__img :where(img) {
  width: 100%;
  aspect-ratio: 3 / 2;
  object-fit: cover;
  transition: transform var(--dur) var(--ease);
}

/* The three stacked ones are a thumbnail beside the headline, not a card. */
.fye .news__item:not(.news__item--lead) .news__link {
  flex-direction: row-reverse;
  align-items: flex-start;
  gap: var(--s5);
  padding-bottom: var(--s5);
  border-bottom: var(--hairline);
}
.fye .news__item:not(.news__item--lead) .news__img { flex: 0 0 96px; }
.fye .news__item:not(.news__item--lead) .news__img :where(img) { aspect-ratio: 1; }
.fye .news__item:not(.news__item--lead) .news__excerpt { display: none; }
.fye .news__item:not(.news__item--lead) .news__title { font-size: var(--fs-small); }`
      },
      {
        find: `@media (max-width: 560px) {
  .fye .news__head { flex-direction: column; align-items: flex-start; gap: var(--s3); margin-bottom: var(--s7); }
}`,
        replace: `@media (max-width: 900px) {
  .fye .news__grid { grid-template-columns: 1fr; gap: var(--s6); }
  .fye .news__item--lead { grid-row: auto; }
}
@media (max-width: 560px) {
  .fye .news__head { flex-direction: column; align-items: flex-start; gap: var(--s3); margin-bottom: var(--s7); }
  .fye .news__item:not(.news__item--lead) .news__img { flex-basis: 72px; }
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
