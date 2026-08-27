/* ============================================================================
   fix-guides-mobile.mjs — 27/08/2026
   ----------------------------------------------------------------------------
     cd ~/Dropbox/GIT-repositaries/fye-theme-v3
     node docs/tools/fix-guides-mobile.mjs

   Delete once run and synced.

   Mobile guides become tappable LIST ROWS, not a grid of covers. Read from
   live's section, which documents the values as coming from the responsive
   handoff mockup:

     row     flex, gap 16px, padding 12px 4px, min-height 68px,
             border-bottom 1px solid rgba(242,241,232,.2)
     cover   50px wide, aspect-ratio 634/895, shadow 0 4px 12px rgba(0,0,0,.4)
     title   display font, 14px, .07em, uppercase, line-height 1.45
     arrow   16px, drawn with a CSS mask so it inherits the band's text colour
     hidden  the blurb and the per-guide button are desktop-only

   68px and a 16px arrow matter: that is the tap target. A 2-column grid of
   covers with buttons under each — what I had — gives two small targets per
   row and pushes the section to twice the height on a phone.

   Breakpoints also brought in line with live:
     >= 1101   six across (mine already)
     769-1100  three across
     <= 768    the list

   I have NOT re-added live's mobile-only "View All N Guides" button: you asked
   for the all-guides button gone this evening, and that is the same control.
   Say the word and it comes back as a mobile-only 48px bar.

   The arrow is a mask on ::after rather than an icon render, because the row is
   a single anchor and the arrow is decoration — it must not be a second focus
   stop or read out to a screen reader.
   ========================================================================== */

import { readFile, writeFile } from 'node:fs/promises';

const FILE = 'sections/guide-download-block.liquid';
let src = await readFile(FILE, 'utf8');

const find = `@media (max-width: 1100px) {
  .fye .guides__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 560px) {
  .fye .guides__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}`;

const replace = `/* 769-1100: three across. Six covers below ~1180 are too small to read. */
@media (min-width: 769px) and (max-width: 1100px) {
  .fye .guides__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

/* ============================================================================
   MOBILE (<=768px) — tappable list rows, per live and the responsive handoff.
   A grid of covers gives two small tap targets per row and doubles the
   section's height on a phone. Values are live's: 68px rows, 50px cover,
   14px display title, 16px arrow, hairline between.
   ========================================================================== */
@media (max-width: 768px) {
  .fye .guides__grid { display: block; }

  .fye .guides__item {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 16px;
    padding: 12px 4px;
    min-height: 68px;
    border-bottom: 1px solid rgba(242, 241, 232, 0.2);
  }
  .fye .band--ivory .guides__item,
  .fye .band--white .guides__item,
  .fye .band--mist .guides__item { border-bottom-color: rgba(35, 61, 71, 0.18); }

  .fye .guides__cover { flex: 0 0 50px; width: 50px; }
  .fye .guides__cover :where(img) {
    width: 50px;
    aspect-ratio: 634 / 895;
    object-fit: cover;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }
  .fye .guides__ph { width: 50px; aspect-ratio: 634 / 895; }

  .fye .guides__words { flex: 1; min-width: 0; gap: 0; }
  .fye .guides__title {
    font-family: var(--font-display);
    font-size: 14px;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    line-height: 1.45;
  }
  /* Desktop-only: on a row there is no space, and the row itself is the link. */
  .fye .guides__blurb,
  .fye .guides__words .btn { display: none; }

  /* Decoration, so a mask rather than an icon — it must not become a second
     focus stop or be announced. */
  .fye .guides__item::after {
    content: "";
    flex: 0 0 16px;
    width: 16px;
    height: 16px;
    opacity: 0.8;
    background: currentColor;
    -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='1.5' stroke-linecap='square'%3E%3Cpath d='M4 12h15'/%3E%3Cpath d='M13.5 6l6 6-6 6'/%3E%3C/svg%3E") center / 16px 16px no-repeat;
    mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='1.5' stroke-linecap='square'%3E%3Cpath d='M4 12h15'/%3E%3Cpath d='M13.5 6l6 6-6 6'/%3E%3C/svg%3E") center / 16px 16px no-repeat;
  }
}`;

const n = src.split(find).length - 1;
if (n !== 1) {
  console.log(`SKIP  ${FILE} — ${n} matches for the breakpoint block`);
} else {
  src = src.replace(find, replace);
  await writeFile(FILE, src, 'utf8');
  console.log(`FIXED ${FILE} — mobile list rows at <=768px, 3-up to 1100, 6-up above`);
}
