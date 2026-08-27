/* ============================================================================
   fix-ringpages-01.mjs — first pass on the three ring pages, 27/08/2026
   ----------------------------------------------------------------------------
     cd ~/Dropbox/GIT-repositaries/fye-theme-v3
     node docs/tools/fix-ringpages-01.mjs

   Prints every change and refuses to write a file if a target string is not
   found exactly once. Delete once run and synced.

   FOUR DIFFERENCES against the live pages, found by comparing screenshots.

   1. fye-hero — THE LOGO GOES BELOW THE HEADING.
      The live hero reads "Wedding Rings by" and then the wordmark underneath,
      so the sentence completes into the logo. The old section's block order
      said so (heading, then logo) and I rendered the logo first, which reads
      as a stray mark above an orphaned "Wedding rings by".

   2. fye-guide-download — THE SECOND COVER WAS INVISIBLE.
      `z-index: -1` on the fanned back cover put it behind the band's own
      background, so the wedding page showed one cover where live shows two.
      Fixed by giving the container a stacking context and layering inside it
      (0 behind, 1 in front) instead of going negative.

   3. accordion — THE COLUMNS WERE THE WRONG WAY ROUND.
      Live puts the questions on the left, where a reader starts, and the
      "have more questions?" panel on the right as a teal card. I had the panel
      leading, which pushes the actual content right and makes the section read
      as an advert with an FAQ attached.

   4. about-columns-four — THE TILES NEED TO BE CARDS.
      Live runs the ten ring styles as white cards on a teal band, each with a
      visible button. Mine were bare images on white, which loses the tile
      edges entirely — ring photographs are cut out on white, so on a white
      band there is nothing to see but floating rings. The section now gives
      each tile a ground, and the engagement template switches to the teal
      band to match.
   ========================================================================== */

import { readFile, writeFile } from 'node:fs/promises';

const EDITS = [
  {
    file: 'sections/fye-hero.liquid',
    changes: [
      {
        find: `  <div class="wrap hero__in">
    {%- if s.logo_url != blank -%}
      <img class="hero__logo" src="{{ s.logo_url }}" alt="{{ s.logo_alt | default: shop.name | escape }}"
        style="--logo-w: {{ s.logo_width | default: 250 }}px;" loading="eager">
    {%- endif -%}

    {%- if s.eyebrow != blank -%}
      <p class="eyebrow">{{ s.eyebrow }}</p>
    {%- endif -%}

    {%- if s.heading != blank -%}
      <h1 class="hero__title hero__title--{{ hstyle }}">{{ s.heading }}</h1>
    {%- endif -%}
`,
        replace: `  <div class="wrap hero__in">
    {%- if s.eyebrow != blank -%}
      <p class="eyebrow">{{ s.eyebrow }}</p>
    {%- endif -%}

    {%- if s.heading != blank -%}
      <h1 class="hero__title hero__title--{{ hstyle }}">{{ s.heading }}</h1>
    {%- endif -%}

    {%- comment -%}
      The wordmark sits BELOW the heading, because the heading is written to
      run into it — "Wedding Rings by" / [FOR YOUR ETERNITY]. Above the
      heading it reads as a stray mark and the sentence dangles.
    {%- endcomment -%}
    {%- if s.logo_url != blank -%}
      <img class="hero__logo" src="{{ s.logo_url }}" alt="{{ s.logo_alt | default: shop.name | escape }}"
        style="--logo-w: {{ s.logo_width | default: 250 }}px;" loading="eager">
    {%- endif -%}
`
      },
      {
        find: '.fye .hero__logo { width: var(--logo-w, 250px); height: auto; }',
        replace: `/* Tightened against the heading it completes, not floated in the stack. */
.fye .hero__logo { width: var(--logo-w, 250px); height: auto; margin-top: calc(var(--s5) * -0.5); }`
      }
    ]
  },
  {
    file: 'sections/fye-guide-download.liquid',
    changes: [
      {
        find: `/* The pair: the second cover sits behind and slightly out, so the front one
   still reads as the guide being offered. */
.fye .gdl__covers--pair .gdl__cover--back {
  position: absolute;
  inset-block-start: 0;
  inset-inline-start: 0;
  width: 100%;
  z-index: -1;
  transform: rotate(-4deg) translate(-6%, 2%);
}
.fye .gdl__covers--pair { padding-inline-start: var(--s6); }`,
        replace: `/* The pair: the second cover sits behind and slightly out, so the front one
   still reads as the guide being offered.

   NOT z-index: -1 — that puts it behind the BAND's background rather than
   behind its sibling, and the second cover vanished completely. The wrapper
   makes the stacking context; the two covers layer inside it. */
.fye .gdl__covers--pair { padding-inline-start: var(--s6); isolation: isolate; }
.fye .gdl__covers--pair .gdl__cover { position: relative; z-index: 1; }
.fye .gdl__covers--pair .gdl__cover--back {
  position: absolute;
  inset-block-start: 0;
  inset-inline-start: 0;
  width: 100%;
  z-index: 0;
  transform: rotate(-4deg) translate(-6%, 2%);
}`
      }
    ]
  },
  {
    file: 'sections/accordion.liquid',
    changes: [
      {
        find: `    <div class="acc__cols{% unless has_left %} acc__cols--single{% endunless %}">
      {%- if has_left -%}
        <div class="acc__aside">
          {%- if s.left_heading != blank -%}
            <h3 class="acc__aside-heading">{{ s.left_heading }}</h3>
          {%- endif -%}
          {%- if s.left_text != blank -%}
            <div class="acc__aside-text">{{ s.left_text }}</div>
          {%- endif -%}
          {%- if s.left_btn != blank and s.left_url != blank -%}
            <a class="btn btn--outline" href="{{ s.left_url }}">{{ s.left_btn }}</a>
          {%- endif -%}
        </div>
      {%- endif -%}

      {%- if section.blocks.size > 0 -%}`,
        replace: `    {%- comment -%}
      Questions first in the source AND on the page: a reader starts here, and
      the panel is a follow-up. The panel led on my first pass, which read as
      an advert with an FAQ attached to it.
    {%- endcomment -%}
    <div class="acc__cols{% unless has_left %} acc__cols--single{% endunless %}">
      {%- if section.blocks.size > 0 -%}`
      },
      {
        find: `          {%- endfor -%}
        </div>
      {%- endif -%}
    </div>
  </div>
</section>`,
        replace: `          {%- endfor -%}
        </div>
      {%- endif -%}

      {%- if has_left -%}
        <div class="acc__aside">
          {%- if s.left_heading != blank -%}
            <h3 class="acc__aside-heading">{{ s.left_heading }}</h3>
          {%- endif -%}
          {%- if s.left_text != blank -%}
            <div class="acc__aside-text">{{ s.left_text }}</div>
          {%- endif -%}
          {%- if s.left_btn != blank and s.left_url != blank -%}
            <a class="btn" href="{{ s.left_url }}">{{ s.left_btn }}</a>
          {%- endif -%}
        </div>
      {%- endif -%}
    </div>
  </div>
</section>`
      },
      {
        find: `.fye .acc__cols {
  display: grid;
  grid-template-columns: 5fr 7fr;
  gap: var(--s10);
  align-items: start;
}`,
        replace: `.fye .acc__cols {
  display: grid;
  grid-template-columns: 7fr 5fr;
  gap: var(--s10);
  align-items: start;
}`
      },
      {
        find: `.fye .acc__aside {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--s4);
  position: sticky;
  top: var(--s7);
}
.fye .acc__aside-heading { font-size: var(--fs-h3); }
.fye .acc__aside-text { color: var(--ink-soft); }`,
        replace: `/* A teal card, as on the live pages — it is an offer, so it gets a ground
   rather than sitting as loose text beside the questions. On teal the band
   rules invert the type roles, so nothing here restates a colour. */
.fye .acc__aside {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--s4);
  position: sticky;
  top: var(--s7);
  padding: var(--s7);
  background: var(--teal);
  color: var(--on-dark);
  --ink-soft: var(--on-dark-soft);
}
.fye .acc__aside-heading { font-size: var(--fs-h4); color: var(--on-dark); }
.fye .acc__aside-text { color: var(--ink-soft); }
.fye .acc__aside .btn {
  background: var(--ivory);
  border-color: var(--ivory);
  color: var(--teal);
}
.fye .acc__aside .btn:hover { background: var(--sage); border-color: var(--sage); }`
      }
    ]
  },
  {
    file: 'sections/about-columns-four.liquid',
    changes: [
      {
        find: `/* Ring cut-outs on white, so contain rather than cover — cropping a ring
   photograph to a square edge cuts the shoulders off the setting. */
.fye .acf__media { display: block; width: 100%; background: var(--ivory); }`,
        replace: `/* Each tile gets a ground. The photographs are ring cut-outs on white, so on
   a white band there is no tile at all — just rings floating in space, which
   is what my first pass produced. The live page runs them as light cards on a
   teal band; this works on any band because the card brings its own ground.

   contain rather than cover: cropping a ring photograph to a square edge cuts
   the shoulders off the setting. */
.fye .acf__link {
  background: var(--white);
  padding: var(--s4) var(--s4) var(--s5);
}
.fye .acf__media { display: block; width: 100%; background: var(--white); }`
      },
      {
        find: '.fye .acf__cta { margin-top: auto; border-bottom: 0; font-size: var(--fs-eyebrow); }',
        replace: `/* A real button on the tile, matching live — the link text alone disappeared
   against ten photographs. */
.fye .acf__cta {
  margin-top: auto;
  border-bottom: 0;
  font-size: var(--fs-eyebrow);
  padding: var(--s2) var(--s4);
  border: 1px solid var(--line);
  transition: border-color var(--dur) var(--ease), color var(--dur) var(--ease);
}
.fye .acf__link:hover .acf__cta { border-color: var(--sage); }`
      }
    ]
  },
  {
    file: 'templates/page.engagement-rings.json',
    changes: [
      {
        find: `        "top_heading": "Shop by ring style",
        "col_dk": 5,
        "band": "white"`,
        replace: `        "top_heading": "Shop by ring style",
        "col_dk": 5,
        "band": "teal"`
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
    console.log(`      ${file} NOT written`);
    failed += 1;
    continue;
  }

  await writeFile(file, next, 'utf8');
  changed += 1;
  console.log(`FIXED ${file}`);
}

console.log(`\n${changed} file(s) changed, ${failed} problem(s).`);
