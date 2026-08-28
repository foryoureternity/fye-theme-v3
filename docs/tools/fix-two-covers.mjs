/* ============================================================================
   fix-two-covers.mjs — 28/08/2026
   ----------------------------------------------------------------------------
     cd ~/Dropbox/GIT-repositaries/fye-theme-v3
     node docs/tools/fix-two-covers.mjs

   Delete once run and synced.

   The wedding-rings template was already passing `cover2` — the section was
   just doing the wrong thing with it. `cover2` was built as a DECORATIVE cover
   fanned behind the first, rotated -4deg and aria-hidden, because that is what
   the old theme did: it says "there is a set" without naming the second book.

   That is wrong for wedding rings, where the two guides are genuinely
   different products — plain bands and diamond-set — and a customer needs to
   know both exist. A cover peeking out at -4deg does not tell them that.

   So `covers_layout` is added, with two values:

     fan   (default)  existing behaviour, unchanged — every other page keeps
                      exactly what it has, including the 62 guide pages
     side             both covers full size, side by side, each with its own
                      caption and its own real alt text

   In `side` the second cover stops being decorative: it gets `cover2_alt` and
   drops aria-hidden, because it is now a distinct thing a customer can
   identify rather than a texture behind the first.

   The left column widens from 320px to 420px in side mode — two 3:4 covers in
   320px would be 150px each, too small to read a title on.

   Then the wedding-rings template is switched to `side` with a caption per
   cover.
   ========================================================================== */

import { readFile, writeFile } from 'node:fs/promises';

/* ==========================================================================
   1. the section
   ========================================================================== */

const SEC = 'sections/fye-guide-download.liquid';
let sec = await readFile(SEC, 'utf8');

const secEdits = [
  {
    label: 'resolve the layout and the second caption',
    find: `    assign cover2 = s.cover2
    assign caption = s.cover_caption
  endif
-%}`,
    replace: `    assign cover2 = s.cover2
    assign caption = s.cover_caption
  endif

  comment
    Layout and second-cover labelling always come from the SECTION, never the
    guide block: it is a presentation choice for the page, not part of a
    guide's content.
  endcomment
  assign layout = s.covers_layout | default: 'fan'
  assign cover2_alt = s.cover2_alt
  assign caption2 = s.cover2_caption
-%}`
  },
  {
    label: 'markup: side-by-side covers, each labelled',
    find: `    <div class="gdl__covers{% if cover2 != blank %} gdl__covers--pair{% endif %}">
      {%- if cover != blank -%}
        <div class="gdl__cover">
          {{ cover | image_url: width: 800 | image_tag:
             loading: 'lazy', widths: '260,400,600,800', sizes: '(max-width: 900px) 60vw, 300px',
             alt: cover_alt }}
        </div>
        {%- if cover2 != blank -%}
          {%- comment -%} Decorative second cover, fanned behind. {%- endcomment -%}
          <div class="gdl__cover gdl__cover--back" aria-hidden="true">
            {{ cover2 | image_url: width: 800 | image_tag:
               loading: 'lazy', widths: '260,400,600,800', sizes: '(max-width: 900px) 60vw, 300px',
               alt: '' }}
          </div>
        {%- endif -%}
      {%- endif -%}

      {%- if caption != blank -%}
        <p class="fine gdl__caption">{{ caption }}</p>
      {%- endif -%}
    </div>`,
    replace: `    {%- if layout == 'side' and cover2 != blank -%}
      {%- comment -%}
        SIDE BY SIDE. Both guides are real, distinct products, so each cover
        gets its own caption and its own alt — no aria-hidden, no rotation.
      {%- endcomment -%}
      <div class="gdl__covers gdl__covers--side">
        {%- if cover != blank -%}
          <div class="gdl__book">
            <div class="gdl__cover">
              {{ cover | image_url: width: 700 | image_tag:
                 loading: 'lazy', widths: '200,300,450,700', sizes: '(max-width: 900px) 40vw, 186px',
                 alt: cover_alt }}
            </div>
            {%- if caption != blank -%}
              <p class="fine gdl__caption">{{ caption }}</p>
            {%- endif -%}
          </div>
        {%- endif -%}
        <div class="gdl__book">
          <div class="gdl__cover">
            {{ cover2 | image_url: width: 700 | image_tag:
               loading: 'lazy', widths: '200,300,450,700', sizes: '(max-width: 900px) 40vw, 186px',
               alt: cover2_alt }}
          </div>
          {%- if caption2 != blank -%}
            <p class="fine gdl__caption">{{ caption2 }}</p>
          {%- endif -%}
        </div>
      </div>
    {%- else -%}
      <div class="gdl__covers{% if cover2 != blank %} gdl__covers--pair{% endif %}">
        {%- if cover != blank -%}
          <div class="gdl__cover">
            {{ cover | image_url: width: 800 | image_tag:
               loading: 'lazy', widths: '260,400,600,800', sizes: '(max-width: 900px) 60vw, 300px',
               alt: cover_alt }}
          </div>
          {%- if cover2 != blank -%}
            {%- comment -%} Decorative second cover, fanned behind. {%- endcomment -%}
            <div class="gdl__cover gdl__cover--back" aria-hidden="true">
              {{ cover2 | image_url: width: 800 | image_tag:
                 loading: 'lazy', widths: '260,400,600,800', sizes: '(max-width: 900px) 60vw, 300px',
                 alt: '' }}
            </div>
          {%- endif -%}
        {%- endif -%}

        {%- if caption != blank -%}
          <p class="fine gdl__caption">{{ caption }}</p>
        {%- endif -%}
      </div>
    {%- endif -%}`
  },
  {
    label: 'inner grid widens in side mode',
    find: `<section class="gdl band band--{{ band }}" data-screen-label="Guide download">
  <div class="wrap gdl__inner">`,
    replace: `<section class="gdl band band--{{ band }}" data-screen-label="Guide download">
  <div class="wrap gdl__inner{% if layout == 'side' and cover2 != blank %} gdl__inner--side{% endif %}">`
  },
  {
    label: 'side-by-side CSS, appended last',
    find: `@media (max-width: 900px) {
  .fye .gdl__inner { grid-template-columns: 1fr; gap: var(--s7); }
  .fye .gdl__covers { max-width: 240px; }
}`,
    replace: `/* ---- side by side: both guides visible and named ------------------------ */

/* 420px, not 320: two 3:4 covers inside 320px would be ~150px each, too small
   to read a guide's title on. */
.fye .gdl__inner--side { grid-template-columns: 420px 1fr; }
.fye .gdl__covers--side {
  flex-direction: row;
  align-items: flex-start;
  gap: var(--s6);
}
.fye .gdl__book { flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; gap: var(--s4); }

@media (max-width: 900px) {
  .fye .gdl__inner { grid-template-columns: 1fr; gap: var(--s7); }
  .fye .gdl__covers { max-width: 240px; }
  /* Stacked, the pair still sits side by side — two covers in a row is the
     whole point, and at 40vw each they stay legible. The 240px cap above
     would crush them, so it is lifted here. */
  .fye .gdl__inner--side { grid-template-columns: 1fr; }
  .fye .gdl__covers--side { max-width: 100%; gap: var(--s5); }
}`
  },
  {
    label: 'schema: layout choice, real alt, second caption',
    find: `    { "type": "image_picker", "id": "cover2", "label": "Second cover", "info": "Fanned behind the first. Decorative." },
    { "type": "text", "id": "cover2_alt", "label": "Second cover description", "info": "Not used — the second cover is decorative." },`,
    replace: `    { "type": "image_picker", "id": "cover2", "label": "Second cover" },
    { "type": "text", "id": "cover2_alt", "label": "Second cover description", "info": "Used in side-by-side layout only." },
    { "type": "text", "id": "cover2_caption", "label": "Second caption", "info": "Side-by-side layout only." },
    {
      "type": "select", "id": "covers_layout", "label": "Two covers", "default": "fan",
      "info": "Side by side when both guides are distinct and a customer needs to know both exist.",
      "options": [
        { "value": "fan",  "label": "Fanned behind (decorative)" },
        { "value": "side", "label": "Side by side, both labelled" }
      ]
    },`
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
await writeFile(SEC, sec, 'utf8');
console.log(`FIXED ${SEC}`);

/* ==========================================================================
   2. the wedding-rings template
   ========================================================================== */

const TPL = 'templates/page.wedding-rings.json';
const doc = JSON.parse(await readFile(TPL, 'utf8'));
const g = doc.sections.fye_guidedl_wed;

if (!g) {
  console.log(`SKIP  ${TPL} — fye_guidedl_wed not found`);
} else {
  g.settings = {
    ...g.settings,
    covers_layout: 'side',
    cover_caption: 'The Plain Wedding Ring Guide',
    cover2_alt: 'The Diamond & Gem-Set Wedding Ring Guide',
    cover2_caption: 'The Diamond & Gem-Set Guide',
    heading: 'Two wedding ring guides',
    body: '<p>One for plain bands — profiles, metals, widths and sizing. One for diamond and gem-set rings — settings, stone choices and how they wear alongside an engagement ring. Read online or take the free PDFs.</p>'
  };
  await writeFile(TPL, JSON.stringify(doc, null, 2) + '\n', 'utf8');
  console.log(`FIXED ${TPL} — side-by-side covers, one caption each`);
}
