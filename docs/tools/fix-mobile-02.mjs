/* ============================================================================
   fix-mobile-02.mjs — 27/08/2026
   ----------------------------------------------------------------------------
     cd ~/Dropbox/GIT-repositaries/fye-theme-v3
     node docs/tools/fix-mobile-02.mjs

   Delete once run and synced.

   1. TRUST STRIP — the core override never stood a chance.
      Section {% stylesheet %} blocks are bundled and served AFTER fye-core.css,
      so at equal specificity the SECTION wins. My appended
      `.fye .tstrip__list { grid-template-columns: ... }` was overridden by the
      section's own `repeat(auto-fit, minmax(200px, 1fr))` every time.

      This is a rule worth writing down: core cannot override a section, only
      supply what the section does not set. Anything competing with a section's
      own declaration has to live in that section.

      So the two-column rule moves into fye-trust-strip.liquid, and the dead
      core rule is removed rather than left to confuse the next person.

   2. LATEST NEWS on mobile — the caption is still out of flow, sitting over the
      next article's photograph. The stacked rules are in the section, so load
      order is not the cause; the desktop mechanic is. On desktop the lead image
      fills the column with height: 100% and the caption is absolute. Stacked,
      BOTH of those need standing down, and my mobile block only stood down the
      caption's position — leaving height: 100% on an image whose container no
      longer has a definite height, and flex: 1 rows inside a list still asked
      to be height: 100%.

      Every desktop-only mechanic is now explicitly reversed at 900px: the
      caption's position, the image heights, the list height and the row flex.
      Written out rather than relying on one property, because that is what
      failed the first time.
   ========================================================================== */

import { readFile, writeFile } from 'node:fs/promises';

/* ---- 1a. remove the dead core rule -------------------------------------- */

const CORE = 'assets/fye-core.css';
let core = await readFile(CORE, 'utf8');

const deadRule = `@media (max-width: 768px) {
  /* Two across, not one. auto-fit with a 200px floor cannot fit two 200px
     tracks in a phone's ~330px content width, so it collapsed to a single
     column and the four points ran down the page. Live shows 2 x 2.
     minmax(0, 1fr) because a floor is what caused this. */
  .fye .tstrip__list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

`;

if (core.includes(deadRule)) {
  core = core.replace(deadRule, '');
  await writeFile(CORE, core, 'utf8');
  console.log(`FIXED ${CORE} — removed the trust-strip rule that section CSS was overriding`);
} else {
  console.log('SKIP  core trust-strip rule not found (already removed?)');
}

/* ---- 1b. put it in the section ------------------------------------------ */

const TRUST = 'sections/fye-trust-strip.liquid';
let trust = await readFile(TRUST, 'utf8');

const trustFind = `  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));`;
const trustReplace = `  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));`;

if (!trust.includes(trustFind)) {
  console.log(`SKIP  ${TRUST} — grid declaration not found`);
} else if (trust.includes('tstrip 2 x 2 below 768')) {
  console.log(`SKIP  ${TRUST} — mobile rule already present`);
} else {
  /* Appended at the end of the section's stylesheet block, so it wins over the
     auto-fit rule above it without touching that rule's desktop behaviour. */
  const marker = `{% endstylesheet %}`;
  const addition = `
/* tstrip 2 x 2 below 768. auto-fit with a 200px floor cannot fit two tracks in
   a phone's ~330px content width, so it collapsed to one column and the four
   points ran down the page. Live shows two across. This has to live in the
   section: section stylesheets load after fye-core.css, so a core rule
   competing with the declaration above would always lose. */
@media (max-width: 768px) {
  .fye .tstrip__list { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--s6) var(--s4); }
  .fye .tstrip__sub { font-size: var(--fs-fine); }
}
${marker}`;

  trust = trust.replace(marker, addition);
  await writeFile(TRUST, trust, 'utf8');
  console.log(`FIXED ${TRUST} — 2 x 2 below 768px`);
}

/* ---- 2. news mobile: stand down every desktop mechanic ------------------ */

const NEWS = 'sections/latest-news-EM.liquid';
let news = await readFile(NEWS, 'utf8');

const newsFind = `@media (max-width: 900px) {
  .fye .news__grid { grid-template-columns: 1fr; gap: var(--s7); }
  /* Stacked, the caption becomes an ordinary block under the photograph —
     absolute positioning would just crop the image. */
  .fye .news__lead-words,
  .fye .band--white .news__lead-words {
    position: static;
    max-width: 100%;
    padding: var(--s4) 0 0;
    background: transparent;
  }`;

const newsReplace = `@media (max-width: 900px) {
  .fye .news__grid { grid-template-columns: 1fr; gap: var(--s7); }

  /* EVERY desktop mechanic has to stand down here, not just the caption's
     position. On desktop the right column sets the height, the lead image
     fills it with height: 100%, and the caption is absolute inside it. Stacked,
     there is no definite height to fill, so height: 100% resolves to auto in
     some places and collapses in others — which is how the caption ended up
     over the next article's photograph even with position: static.
     Spelled out property by property, because relying on one of them is what
     failed the first time. */
  .fye .news__lead { position: static; }
  .fye .news__lead-img { height: auto; }
  .fye .news__lead-img :where(img) { height: auto; }
  .fye .news__list { height: auto; }
  .fye .news__row { flex: 0 0 auto; }
  .fye .news__row-img :where(img) { height: auto; }

  .fye .news__lead-words,
  .fye .band--white .news__lead-words {
    position: static;
    max-width: 100%;
    padding: var(--s4) 0 0;
    background: transparent;
  }`;

if (!news.includes(newsFind)) {
  console.log(`SKIP  ${NEWS} — mobile block not found in its expected form`);
} else {
  news = news.replace(newsFind, newsReplace);
  await writeFile(NEWS, news, 'utf8');
  console.log(`FIXED ${NEWS} — desktop height mechanics stood down below 900px`);
}
