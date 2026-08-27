/* ============================================================================
   fix-whychoose.mjs — the "why choose" band. 27/08/2026
   ----------------------------------------------------------------------------
     cd ~/Dropbox/GIT-repositaries/fye-theme-v3
     node docs/tools/fix-whychoose.mjs

   Delete once run and synced.

   Read off live's settings rather than guessed this time:
     cl_bg      #233d47          -> teal band (already done)
     col_dk     3 and 8 of 12    -> already matches
     image_size contain, 1:1     -> the mark fills its 3-column width
     fs_title   35               -> heading one step up
     fs_text    25               -> body at the lead scale, not body scale
     text_align center           -> centred, both columns
     pd         10px 50px        -> a tight strip, not a full band

   FOUR CHANGES

   1. The monogram was capped at 180px. That cap was me guarding against a mark
      stretching to fill a photograph's slot — but live deliberately runs it at
      the full width of its 3-of-12 column, about 300px, and at 180 it reads as
      an afterthought against 25px type. Cap raised to 320px, which is the
      artwork's own drawn size, and centred when the section is centred.

   2. Body copy moves from the body scale to the lead scale. Live sets 25px
      here. I dropped `fs_text` on purpose — four font sizes per section is
      what the rebuild exists to remove — but the intent behind the 25 was
      right: this is a single paragraph carrying the whole brand argument, not
      running text. The lead scale is the design system's answer to that.

   3. A `pad` setting, standard or tight. THIS IS AN EXCEPTION to "--sect-y is
      the only thing controlling padding", so it is justified here: live gives
      this band 10px of vertical padding because its content is one mark and
      one paragraph, and at --sect-y (80px) the band is more than twice as tall
      as it needs to be, which is the "spacing" complaint. Only two values, and
      the default is standard, so nothing else changes.

   4. index.json: text_align -> center, pad -> tight, matching live.
   ========================================================================== */

import { readFile, writeFile } from 'node:fs/promises';

/* ---- 1. the section ----------------------------------------------------- */

const SECTION = 'sections/feature_columns2.liquid';
let sec = await readFile(SECTION, 'utf8');

const secEdits = [
  {
    label: 'root class gains the pad modifier',
    find: `<section class="fcols band band--{{ band }} fcols--{{ align }}" data-screen-label="Feature columns">`,
    replace: `<section class="fcols band band--{{ band }} fcols--{{ align }}{% if s.pad == 'tight' %} fcols--tight{% endif %}" data-screen-label="Feature columns">`
  },
  {
    label: 'monogram cap 180 -> 320, centred with the column',
    find: `.fye .fcols__media { max-width: 180px; }
.fye .fcols__media :where(img) { max-width: 100%; }
.fye .fcols__text { color: var(--ink-soft); }`,
    replace: `/* 320px is the artwork's drawn size. Live runs the mark at the full width of
   its 3-of-12 column — roughly 300px — and at my old 180px cap it read as an
   afterthought beside lead-scale type. */
.fye .fcols__media { width: 100%; max-width: 320px; }
.fye .fcols__media :where(img) { display: block; width: 100%; height: auto; }
.fye .fcols--center .fcols__media { margin-inline: auto; }

/* Lead scale, not body scale. Live sets 25px here. This band is one paragraph
   carrying the whole brand argument, not running text — see the note in
   fix-whychoose.mjs on why the dropped fs_text setting had a point. */
.fye .fcols__text {
  color: var(--ink-soft);
  font-size: var(--fs-lead);
  line-height: 1.55;
  text-wrap: pretty;
}
.fye .band--teal .fcols__text,
.fye .band--sage .fcols__text { color: var(--on-dark); }

/* EXCEPTION to the --sect-y rule, deliberate: a band whose entire content is
   one mark and one paragraph is a strip on live (10px of vertical padding).
   At --sect-y it is more than twice as tall as its content needs. Two values
   only, and the default leaves every other use untouched. */
.fye .fcols--tight { padding-block: var(--s6); }`
  },
  {
    label: 'pad setting in the schema',
    find: `    {
      "type": "select", "id": "band", "label": "Background", "default": "white",`,
    replace: `    {
      "type": "select", "id": "pad", "label": "Vertical space", "default": "standard",
      "info": "Tight suits a band of one mark and one paragraph.",
      "options": [
        { "value": "standard", "label": "Standard" },
        { "value": "tight",    "label": "Tight" }
      ]
    },
    {
      "type": "select", "id": "band", "label": "Background", "default": "white",`
  }
];

for (const { label, find, replace } of secEdits) {
  const n = sec.split(find).length - 1;
  if (n !== 1) {
    console.log(`SKIP  ${label} — ${n} matches`);
    continue;
  }
  sec = sec.replace(find, replace);
  console.log(`  ok  ${label}`);
}
await writeFile(SECTION, sec, 'utf8');
console.log(`FIXED ${SECTION}`);

/* ---- 2. index.json ------------------------------------------------------ */

const TEMPLATE = 'templates/index.json';
const doc = JSON.parse(await readFile(TEMPLATE, 'utf8'));

const key = Object.keys(doc.sections).find(
  (k) => doc.sections[k].type === 'feature_columns2'
);

if (!key) {
  console.log('SKIP  no feature_columns2 section in index.json');
} else {
  const st = doc.sections[key].settings || {};
  st.text_align = 'center';
  st.pad = 'tight';
  doc.sections[key].settings = st;
  await writeFile(TEMPLATE, JSON.stringify(doc, null, 2) + '\n', 'utf8');
  console.log(`FIXED ${TEMPLATE} — ${key}: text_align center, pad tight`);
}
