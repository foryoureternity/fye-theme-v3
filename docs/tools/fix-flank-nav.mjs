/* ============================================================================
   fix-flank-nav.mjs — 27/08/2026
   ----------------------------------------------------------------------------
     cd ~/Dropbox/GIT-repositaries/fye-theme-v3
     node docs/tools/fix-flank-nav.mjs

   Delete once run and synced. The hero padding is already in — that SKIP was
   the script finding its own previous edit, not a failure.

   1. FLANKED HEADING — lines run to the container, not 72px
   Two faults, and the second is the interesting one.
     a. `flex: 0 1 72px` is a fixed 72px line that can only shrink. Now
        `flex: 1 1 0`, so both hairlines share whatever space the heading
        leaves and always reach the edges of the box.
     b. `.heading-flank` sits inside `.sect-head`, which is a column flex with
        `align-items: center`. That makes the heading a flex ITEM, so it
        shrink-to-fits its own text — the lines had nothing to stretch INTO.
        `align-self: stretch` restores full width.
   (b) is the ninth non-negotiable, written this afternoon for the hero, hit
   again here within the hour. A flex parent silently changes how children
   size themselves, and the symptom is never "wrong width" — it is a device
   that looks deliberately small.

   The 560px override becomes a smaller gap instead of a smaller line: with
   `flex: 1 1 0` the lines already yield to the heading, so capping their
   length does nothing, while tightening the gap buys real room.

   2. HEADER NAV — live's type, so eleven items fit one row
   v3 was 15px at 0.10em tracking with an --s7 gap; eleven items could not fit
   and "About us / Contact" wrapped to a second line. Live runs the same menu
   in a single row. Measured off live: 13px, 0.08em, tighter gap. Weight and
   uppercase unchanged — those were right.
   ========================================================================== */

import { readFile, writeFile } from 'node:fs/promises';

const edits = [
  /* ---- 1a + 1b: the flank device ---------------------------------------- */
  {
    file: 'assets/fye-core.css',
    find: `.fye .heading-flank {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--s5);
  text-align: center;
}
.fye .heading-flank::before,
.fye .heading-flank::after {
  content: '';
  flex: 0 1 72px;`,
    replace: `.fye .heading-flank {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--s5);
  text-align: center;
  /* align-self is load-bearing: .sect-head is a centred column flex, which
     makes this heading a flex item that shrink-to-fits its own text. Without
     stretch the hairlines have nothing to extend into and the device reads as
     two short ticks. Ninth non-negotiable. */
  align-self: stretch;
}
.fye .heading-flank::before,
.fye .heading-flank::after {
  content: '';
  /* Grow to fill whatever the heading leaves, so the rules always reach the
     edges of the container instead of being a fixed length. */
  flex: 1 1 0;`
  },
  {
    file: 'assets/fye-core.css',
    find: `  .fye .heading-flank::before,
  .fye .heading-flank::after { flex-basis: 24px; }`,
    replace: `  /* The lines already yield to the heading, so capping their length does
     nothing here. Tightening the gap is what buys room on a narrow screen. */
  .fye .heading-flank { gap: var(--s3); }`
  },

  /* ---- 2: header nav type ----------------------------------------------- */
  {
    file: 'sections/header-bottom.liquid',
    find: `  font-size: 15px;
  font-weight: var(--fw-semi);
  letter-spacing: 0.10em;
  line-height: 1;
  text-transform: uppercase;`,
    replace: `  /* 13px / 0.08em measured off live. At 15px and 0.10em the eleven menu
     items could not fit one row and the last two wrapped. */
  font-size: 13px;
  font-weight: var(--fw-semi);
  letter-spacing: 0.08em;
  line-height: 1;
  text-transform: uppercase;`
  },
  {
    file: 'sections/header-bottom.liquid',
    find: `  gap: var(--s7);`,
    replace: `  gap: var(--s5);`
  },
  {
    file: 'sections/header-bottom.liquid',
    find: `  .fye .hdr__nav-list { gap: var(--s6); }
  .fye .hdr__nav-link { font-size: 14px; letter-spacing: 0.08em; }`,
    replace: `  .fye .hdr__nav-list { gap: var(--s4); }
  .fye .hdr__nav-link { font-size: 12px; letter-spacing: 0.06em; }`
  }
];

for (const { file, find, replace } of edits) {
  const src = await readFile(file, 'utf8');
  const n = src.split(find).length - 1;
  if (n !== 1) {
    console.log(`SKIP  ${file} — ${n} matches for "${find.trim().split('\n')[0].slice(0, 44)}…"`);
    continue;
  }
  await writeFile(file, src.replace(find, replace), 'utf8');
  console.log(`FIXED ${file} — ${find.trim().split('\n')[0].slice(0, 44)}…`);
}
