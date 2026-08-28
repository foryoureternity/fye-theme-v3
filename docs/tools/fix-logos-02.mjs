/* ============================================================================
   fix-logos-02.mjs — 28/08/2026
   ----------------------------------------------------------------------------
     cd ~/Dropbox/GIT-repositaries/fye-theme-v3
     node docs/tools/fix-logos-02.mjs

   Delete once run and synced.

   1. TWO LOGOS IN THE HEADER — a specificity collision, not an ordering one.
      The pre-existing rule is `.fye .hdr__logo img` = two classes + one TYPE
      selector, specificity (0,2,1). My hide rule was `.fye .hdr__logo-img--m`
      = two classes, (0,2,0). The older, more specific rule forced
      display: block back on, so both images rendered.

      Putting the override last did nothing, because order only decides ties.
      The fix is to match specificity: `.fye .hdr__logo img.hdr__logo-img--m`
      is (0,3,1) and wins properly.

      This is the third distinct cascade failure this session, and the three
      are worth telling apart:
        - order   (media query above its base rules — the guides row)
        - source  (core cannot beat a section stylesheet — the trust strip)
        - weight  (a type selector out-specifying a class — this one)
      "Append it last" fixes only the first.

   2. NO MONOGRAM IN THE FOOTER — a dead condition.
      The img sits inside `{%- if section.settings.monogram != blank -%}`, the
      OLD image_picker setting, which is empty and always will be: the whole
      point of moving to a URL was that a picker cannot render an SVG. So the
      new img was correct and simply never reached.

      Now gated on `mono_url`, and the dead image_picker setting is removed
      rather than left as a trap for whoever reads this next.

      Also dropping my `.ftr__mono-img { width: 140px }` rule: the file already
      has `.ftr__mark img { width: 94px }`, which is the measured live size and
      more specific anyway. Two rules disagreeing about one width is how the
      next hour gets lost.
   ========================================================================== */

import { readFile, writeFile } from 'node:fs/promises';

/* ---- 1. header ---------------------------------------------------------- */

const HDR = 'sections/header-bottom.liquid';
let hdr = await readFile(HDR, 'utf8');

const hdrFind = `/* Which logo shows. Appended at the END: a media query adds a condition, not
   specificity, so an override placed above the base rules only half-applies. */
.fye .hdr__logo-img { display: block; height: 96px; width: auto; }
.fye .hdr__logo-img--m { display: none; }

@media (max-width: 900px) {
  /* The mobile mark is 571x320 — a wide lockup. Capped by height to fit the
     62px row; raise this if it reads small on a real phone. */
  .fye .hdr__logo-img--d { display: none; }
  .fye .hdr__logo-img--m { display: block; height: 40px; width: auto; }
}`;

const hdrReplace = `/* Which logo shows. The img TYPE selector is load-bearing: the base rule
   .fye .hdr__logo img is (0,2,1), so a two-class override loses to it however
   late it appears — order only breaks ties. These are (0,3,1). */
.fye .hdr__logo img.hdr__logo-img--d { display: block; height: 96px; width: auto; }
.fye .hdr__logo img.hdr__logo-img--m { display: none; }

@media (max-width: 900px) {
  /* The mobile mark is 571x320 — a wide lockup — so it is capped by height to
     fit the 62px row. Raise if it reads small on a real phone. */
  .fye .hdr__logo img.hdr__logo-img--d { display: none; }
  .fye .hdr__logo img.hdr__logo-img--m { display: block; height: 40px; width: auto; }
}`;

if (hdr.includes(hdrFind)) {
  hdr = hdr.replace(hdrFind, hdrReplace);
  await writeFile(HDR, hdr, 'utf8');
  console.log(`FIXED ${HDR} — logo swap rules now out-specify .hdr__logo img`);
} else {
  console.log(`SKIP  ${HDR} — logo swap block not found in its expected form`);
}

/* ---- 2. footer ---------------------------------------------------------- */

const FTR = 'sections/footer.liquid';
let ftr = await readFile(FTR, 'utf8');

const ftrEdits = [
  {
    label: 'monogram gated on mono_url, not the dead image_picker',
    find: `      <div class="ftr__mark">
        {%- if section.settings.monogram != blank -%}
          <img class="ftr__mono-img" src="{{ section.settings.mono_url | default: 'https://cdn.shopify.com/s/files/1/0972/5391/7056/files/FYE-initial-logo.svg?v=1771578232' }}" alt="{{ shop.name | escape }}" width="100" height="100" loading="lazy">
        {%- endif -%}
      </div>`,
    replace: `      <div class="ftr__mark">
        {%- comment -%}
          Gated on mono_url. It used to be gated on the monogram image_picker,
          which is empty and always will be — a picker cannot render an SVG,
          which is the whole reason this moved to a URL.
        {%- endcomment -%}
        {%- assign mono = section.settings.mono_url | default: 'https://cdn.shopify.com/s/files/1/0972/5391/7056/files/FYE-initial-logo.svg?v=1771578232' -%}
        {%- if mono != blank -%}
          <img class="ftr__mono-img" src="{{ mono }}" alt="{{ shop.name | escape }}" width="100" height="100" loading="lazy">
        {%- endif -%}
      </div>`
  },
  {
    label: 'drop the conflicting 140px width',
    find: `/* Monogram. Appended last, per the media-query ordering rule. */
.fye .ftr__mono-img { display: block; width: 140px; height: auto; }
@media (max-width: 768px) {
  .fye .ftr__mono-img { width: 96px; margin-inline: auto; }
}`,
    replace: `/* Width comes from .ftr__mark img above — 94px, the measured live size. Do not
   add a second width here; two rules disagreeing about one number is a trap. */
@media (max-width: 768px) {
  .fye .ftr__mark { display: flex; justify-content: center; margin-bottom: var(--s6); }
}`
  },
  {
    label: 'remove the dead image_picker setting',
    find: `    { "type": "image_picker", "id": "monogram", "label": "Monogram" },
`,
    replace: ''
  }
];

for (const { label, find, replace } of ftrEdits) {
  const n = ftr.split(find).length - 1;
  if (n !== 1) {
    console.log(`SKIP  ${label} — ${n} matches`);
    continue;
  }
  ftr = ftr.replace(find, replace);
  console.log(`  ok  ${label}`);
}
await writeFile(FTR, ftr, 'utf8');
console.log(`FIXED ${FTR}`);
