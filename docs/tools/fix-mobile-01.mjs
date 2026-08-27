/* ============================================================================
   fix-mobile-01.mjs — 27/08/2026
   ----------------------------------------------------------------------------
     cd ~/Dropbox/GIT-repositaries/fye-theme-v3
     node docs/tools/fix-mobile-01.mjs

   Delete once run and synced.

   Comparing v3 mobile against live mobile, four differences. Two are fixed
   here, one needs a filename I do not have yet (reported at the end), and one
   is data rather than CSS.

   1. HERO BUTTONS — full width, stacked. FIXED.
      v3 renders them at their natural widths, so "Shop Engagement Rings" and
      "Shop Wedding Rings" are different sizes. Live runs both full width.
      Cause: fye-core has `.btn { width: 100% }` at 560px but then
      `.row .btn { width: auto }` to stop button ROWS stretching — and the
      hero's actions use `class="row hero__actions"`, so the exception caught
      them. Overridden for the hero only.

   2. WHY-CHOOSE MONOGRAM — hidden on mobile. FIXED.
      v3 shows it at ~320px, taller than the paragraph beside it. Live's mobile
      drops the mark entirely and leads with the heading. Hiding it is an
      exception worth noting: this section is on 7 templates, and on mobile its
      images are decorative marks in every current use. If a future use needs a
      real photograph here, this rule needs a modifier rather than a delete.

   3. TRUST STRIP — should be 2x2, is a single column. NOT FIXED: I do not have
      the section's class names, so the script prints them at the end instead
      of guessing a selector that silently does nothing.

   4. HEADER LOGO — v3 renders the text fallback ("FOR YOUR ETERNITY" on three
      lines) where live shows the script wordmark. That is a missing image
      setting, not CSS. Reported, not patched.

   Appended rather than edited into place: these override rules that live in
   other files, and at equal specificity the later rule wins.
   ========================================================================== */

import { readFile, writeFile, readdir } from 'node:fs/promises';

const FILE = 'assets/fye-core.css';
let src = await readFile(FILE, 'utf8');

const rules = `

/* ============================================================================
   MOBILE CORRECTIONS — 27/08/2026, measured against live's mobile views
   ========================================================================== */

@media (max-width: 768px) {
  /* The mark is decorative here and live drops it on mobile, leading with the
     heading. NOTE: feature_columns2 is on 7 templates; every current mobile
     use of its image is a decorative mark. A future use with a real
     photograph needs a modifier class, not the removal of this rule. */
  .fye .fcols__media { display: none; }
}

@media (max-width: 560px) {
  /* fye-core sets .btn { width: 100% } at this width, then exempts .row .btn
     so button rows do not stretch. The hero's actions are a .row, so they were
     caught by the exception and rendered at two different widths. Live stacks
     them full width. */
  .fye .hero__actions { flex-direction: column; align-items: stretch; width: 100%; }
  .fye .hero__actions .btn,
  .fye .row.hero__actions .btn { width: 100%; }
}
`;

if (src.includes('MOBILE CORRECTIONS — 27/08/2026')) {
  console.log('SKIP  mobile corrections already appended');
} else {
  src += rules;
  await writeFile(FILE, src, 'utf8');
  console.log(`FIXED ${FILE} — hero buttons stack full width; why-choose mark hidden on mobile`);
}

/* ---- report: the trust strip's real class names -------------------------- */

const names = (await readdir('sections')).filter((n) => /trust/i.test(n));
console.log(`\n---- trust strip section files ----\n  ${names.join('\n  ') || '(none)'}`);

for (const name of names) {
  const s = await readFile(`sections/${name}`, 'utf8');
  const cls = new Set();
  for (const m of s.matchAll(/class="([^"{]*)"/g))
    m[1].split(/\\s+/).forEach((c) => c && cls.add(c));
  console.log(`\n  classes: ${[...cls].join(', ')}`);

  const grid = s
    .split('\n')
    .map((l, i) => [i + 1, l.trim()])
    .filter(([, l]) => /grid-template-columns|@media|repeat\(/.test(l));
  console.log('  grid + breakpoint lines:');
  grid.forEach(([n, l]) => console.log(`    ${n}  ${l}`));
}
