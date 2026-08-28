/* ============================================================================
   rebuild-mega-live.mjs — 28/08/2026
   ----------------------------------------------------------------------------
     cd ~/Dropbox/GIT-repositaries/fye-theme-v3
     node docs/tools/rebuild-mega-live.mjs

   Delete once run and synced.

   Rebuilds the mega panel to the live designs: TWO ZONES separated by a
   vertical hairline.

   LEFT (fluid)
     zone title + view-all, hairline under
     columns: shape grid | menu columns (one per top-level menu item)
     hairline, then the coloured-stone grid with its own view-all, 5 across

   RIGHT (380px, border-left)
     zone title, hairline
     one or two white guide cards: cover, title, blurb, DOWNLOAD PDF
     hairline, then two link-list columns (Diamond education / Jewellery guide)

   THREE THINGS THE DESIGNS FORCED A CHANGE ON

   1. Shape order is COLUMN-MAJOR. Live reads Round/Pear, Princess/Emerald,
      Oval/Asscher — i.e. the list split into two halves side by side, not
      wrapped row by row. `grid-auto-flow: column` with an explicit row count
      does that natively; wrapping row-wise would give Round/Princess and the
      whole grid would read wrongly.

   2. Shape sets differ per panel. Engagement has ten, wedding and eternity
      eight (no cushion, no radiant). Hence `shape_only` — a comma list of
      stems, empty meaning all ten.

   3. Metal links are DOTS, not plain text. The wedding panel's "Plain · by
      metal" column shows a gold/white-gold/rose/platinum swatch per link. So a
      menu column can be flagged to render dots, with the four metal colours
      mapped in the snippet. Any column whose title contains "metal" gets them.

   DEFERRED, DELIBERATELY: the Diamonds & Gemstones panel in the screenshots is
   a different component — DIAMONDS/GEMSTONES tabs, natural/lab-grown sub-tabs
   inside each, and a 35-cut shape grid. That needs 35 icons I do not have and
   a tab behaviour nothing else on the site uses. This build gives that panel
   the same two-zone treatment as the others; the tabbed version is its own job.
   ========================================================================== */

import { readFile, writeFile } from 'node:fs/promises';

/* ==========================================================================
   1. mm-shapes: column-major, per-panel subset
   ========================================================================== */

const shapes = `{%- comment -%}
  mm-shapes — the diamond-shape grid inside a mega panel.

  Params:
    suffix  collection-handle suffix, e.g. 'engagement-rings'. Blank = no grid.
    label   column heading. Default 'Shop by Shape'.
    only    optional comma list of stems to include, in order. Blank = all ten.

  Order is COLUMN-MAJOR, as live: Round/Pear, Princess/Emerald, Oval/Asscher.
  The CSS does that with grid-auto-flow: column and an explicit row count —
  wrapping row-wise would pair Round with Princess and read wrongly.
{%- endcomment -%}
{%- liquid
  assign sfx = suffix | strip
  if sfx == blank
    break
  endif
  assign heading = label | default: 'Shop by Shape'
  assign all_stems = 'round-brilliant,princess-cut,oval-cut,cushion-cut,radiant-cut,pear-cut,emerald-cut,asscher-cut,marquise-cut,heart-cut' | split: ','
  assign all_names = 'Round,Princess,Oval,Cushion,Radiant,Pear,Emerald,Asscher,Marquise,Heart' | split: ','
  assign all_icons = 'icon101,icon107,icon102,icon103,icon106,icon104,icon105,icon109,icon108,icon110' | split: ','
  assign cdn = 'https://foryoureternity.com/cdn/shop/files/'

  assign stems = all_stems
  if only != blank
    assign stems = only | strip | split: ','
  endif
  assign rows = stems.size | plus: 1 | divided_by: 2
-%}

<div class="mm__col mm__col--shapes">
  <h3 class="mm__label">{{ heading }}</h3>
  <ul class="mm__shapes" style="grid-template-rows: repeat({{ rows }}, auto)">
    {%- for stem in stems -%}
      {%- liquid
        assign s = stem | strip
        assign idx = -1
        for a in all_stems
          if a == s
            assign idx = forloop.index0
            break
          endif
        endfor
      -%}
      {%- if idx >= 0 -%}
        <li>
          <a href="/collections/{{ s }}-{{ sfx }}">
            <img src="{{ cdn }}{{ all_icons[idx] }}.svg" alt="" width="44" height="44" loading="lazy">
            <span>{{ all_names[idx] }}</span>
          </a>
        </li>
      {%- endif -%}
    {%- endfor -%}
  </ul>
</div>
`;

/* ==========================================================================
   2. mm-stones: 5 across, as live
   ========================================================================== */

const stones = `{%- comment -%}
  mm-stones — the coloured-stone grid. Five across, as live.

  Params: suffix, label, all_url, all_label.

  The dot is a <span> with a background: it is a colour sample, and seventeen
  tiny images would be seventeen requests for a hex value. Opal gets a border
  or it would have no edge on the ivory panel — live does the same.
{%- endcomment -%}
{%- liquid
  assign sfx = suffix | strip
  if sfx == blank
    break
  endif
  assign heading = label | default: 'Shop by Coloured Stone'
  assign stems = 'ruby,sapphire,pink-sapphire,yellow-sapphire,emerald,tanzanite,aquamarine,morganite,peridot,amethyst,garnet,citrine,blue-topaz,opal,fire-opal,pink-tourmaline' | split: ','
  assign names = 'Ruby,Sapphire,Pink Sapphire,Yellow Sapphire,Emerald,Tanzanite,Aquamarine,Morganite,Peridot,Amethyst,Garnet,Citrine,Blue Topaz,Opal,Fire Opal,Pink Tourmaline' | split: ','
  assign hexes = '#9E2B2B,#1F4E79,#D46A8B,#E3C14E,#1E7A4C,#5B5AA0,#8FC7D8,#E3ADA6,#94A83E,#7E5AA2,#8B2E2E,#E0A33E,#4E93C4,#EAE6D9,#E0713E,#DE7BA0' | split: ','
-%}

<div class="mm__stones-wrap">
  <div class="mm__row-head">
    <h3 class="mm__label">{{ heading }}</h3>
    {%- if all_url != blank -%}
      <a class="mm__viewall" href="{{ all_url }}">
        {{ all_label | default: 'View all coloured stone rings' }}
        {% render 'icon', name: 'arrow-right', size: 16 %}
      </a>
    {%- endif -%}
  </div>
  <ul class="mm__stones">
    {%- for stem in stems -%}
      {%- assign hex = hexes[forloop.index0] -%}
      <li>
        <a href="/collections/{{ stem }}-{{ sfx }}">
          <span class="mm__dot{% if stem == 'opal' %} mm__dot--pale{% endif %}" style="background:{{ hex }}"></span>
          <span>{{ names[forloop.index0] }}</span>
        </a>
      </li>
    {%- endfor -%}
    <li>
      <a href="/collections/coloured-stone-rings">
        <span class="mm__dot" style="background:#141414"></span>
        <span>Black Diamond</span>
      </a>
    </li>
  </ul>
</div>
`;

/* ==========================================================================
   3. mm-guide-card: the white card in the right zone
   ========================================================================== */

const card = `{%- comment -%}
  mm-guide-card — one guide offer in a mega panel's right zone.
  Params: cover, title, blurb, link, pdf_label.

  Renders nothing without a title, so an unused second card costs no markup.
{%- endcomment -%}
{%- if title != blank -%}
  <div class="mm__card">
    {%- if cover != blank -%}
      <a class="mm__card-cover" href="{{ link | default: '#' }}" tabindex="-1" aria-hidden="true">
        <img src="{{ cover }}" alt="" width="180" height="255" loading="lazy">
      </a>
    {%- endif -%}
    <div class="mm__card-words">
      <p class="mm__card-title">{{ title }}</p>
      {%- if blurb != blank -%}
        <p class="mm__card-blurb">{{ blurb }}</p>
      {%- endif -%}
      {%- if link != blank -%}
        <a class="mm__card-dl" href="{{ link }}">
          {% render 'icon', name: 'download', size: 16 %}
          <span>{{ pdf_label | default: 'Download PDF' }}</span>
        </a>
      {%- endif -%}
    </div>
  </div>
{%- endif -%}
`;

await writeFile('snippets/mm-shapes.liquid', shapes, 'utf8');
await writeFile('snippets/mm-stones.liquid', stones, 'utf8');
await writeFile('snippets/mm-guide-card.liquid', card, 'utf8');
console.log('FIXED snippets/mm-shapes.liquid, mm-stones.liquid, mm-guide-card.liquid');

/* ==========================================================================
   4. header-bottom: panel markup, CSS, schema
   ========================================================================== */

const HDR = 'sections/header-bottom.liquid';
let hdr = await readFile(HDR, 'utf8');

/* --- 4a. markup: replace the whole panel block ---------------------------- */

const startMark = `            {%- if block.type == 'mega' -%}`;
const endMark = `            {%- endif -%}
          </li>`;
const iStart = hdr.indexOf(startMark);
const iEnd = hdr.indexOf(endMark, iStart);

if (iStart === -1 || iEnd === -1) {
  console.log('SKIP  could not locate the panel block');
} else {
  const panel = `            {%- if block.type == 'mega' -%}
              {%- liquid
                assign b = block.settings
                assign edu = linklists[b.edu_menu]
                assign jew = linklists[b.jewel_menu]
                assign has_side = false
                if b.guide1_title != blank or b.guide2_title != blank or edu.links.size > 0 or jew.links.size > 0
                  assign has_side = true
                endif
              -%}
              <div class="mega">
                <div class="mega__in{% unless has_side %} mega__in--wide{% endunless %}">

                  <div class="mm__main">
                    <div class="mm__row-head mm__row-head--major">
                      <h2 class="mm__zone-title">{{ b.zone1_title | default: 'Pre-Designed Rings' }}</h2>
                      {%- if b.zone1_all_url != blank -%}
                        <a class="mm__viewall" href="{{ b.zone1_all_url }}">
                          {{ b.zone1_all_label | default: 'View all' }}
                          {% render 'icon', name: 'arrow-right', size: 16 %}
                        </a>
                      {%- endif -%}
                    </div>

                    <div class="mm__cols">
                      {%- render 'mm-shapes', suffix: b.shape_suffix, label: b.shape_label, only: b.shape_only -%}

                      {%- comment -%}
                        Each top-level menu item becomes a column; its children
                        are the links. A column whose title mentions metal gets
                        colour swatches instead of plain links — live's
                        "Plain · by metal" column.
                      {%- endcomment -%}
                      {%- for child in sub.links -%}
                        {%- liquid
                          assign lower = child.title | downcase
                          assign as_dots = false
                          if lower contains 'metal'
                            assign as_dots = true
                          endif
                        -%}
                        <div class="mm__col">
                          <h3 class="mm__label">{{ child.title }}</h3>
                          {%- if child.links.size > 0 -%}
                            <ul class="mm__list{% if as_dots %} mm__list--dots{% endif %}">
                              {%- for gc in child.links -%}
                                {%- liquid
                                  assign m = gc.title | downcase
                                  assign hex = '#C8CDC7'
                                  if m contains 'yellow'
                                    assign hex = '#E8CE8B'
                                  elsif m contains 'rose'
                                    assign hex = '#DFAE9B'
                                  elsif m contains 'white'
                                    assign hex = '#E4E4E2'
                                  elsif m contains 'platinum'
                                    assign hex = '#C9CBCC'
                                  endif
                                -%}
                                <li>
                                  <a href="{{ gc.url }}">
                                    {%- if as_dots -%}<span class="mm__dot mm__dot--pale" style="background:{{ hex }}"></span>{%- endif -%}
                                    <span>{{ gc.title }}</span>
                                  </a>
                                </li>
                              {%- endfor -%}
                            </ul>
                          {%- endif -%}
                        </div>
                      {%- endfor -%}
                    </div>

                    {%- render 'mm-stones',
                        suffix: b.stone_suffix,
                        label: b.stone_label,
                        all_url: b.stone_all_url,
                        all_label: b.stone_all_label -%}
                  </div>

                  {%- if has_side -%}
                    <div class="mm__side">
                      <div class="mm__row-head mm__row-head--major">
                        <h2 class="mm__zone-title">{{ b.side_title | default: 'The Guide' }}</h2>
                      </div>

                      {%- render 'mm-guide-card',
                          cover: b.guide1_cover, title: b.guide1_title,
                          blurb: b.guide1_blurb, link: b.guide1_link -%}
                      {%- render 'mm-guide-card',
                          cover: b.guide2_cover, title: b.guide2_title,
                          blurb: b.guide2_blurb, link: b.guide2_link -%}

                      {%- if edu.links.size > 0 or jew.links.size > 0 -%}
                        <div class="mm__side-cols">
                          {%- if edu.links.size > 0 -%}
                            <div class="mm__col">
                              <h3 class="mm__label">{{ b.edu_label | default: 'Diamond education' }}</h3>
                              <ul class="mm__list mm__list--caps">
                                {%- for link in edu.links -%}
                                  <li><a href="{{ link.url }}">{{ link.title }}</a></li>
                                {%- endfor -%}
                              </ul>
                            </div>
                          {%- endif -%}
                          {%- if jew.links.size > 0 -%}
                            <div class="mm__col">
                              <h3 class="mm__label">{{ b.jewel_label | default: 'Jewellery guide' }}</h3>
                              <ul class="mm__list mm__list--caps">
                                {%- for link in jew.links -%}
                                  <li><a href="{{ link.url }}">{{ link.title }}</a></li>
                                {%- endfor -%}
                              </ul>
                            </div>
                          {%- endif -%}
                        </div>
                      {%- endif -%}
                    </div>
                  {%- endif -%}

                </div>
              </div>
`;
  hdr = hdr.slice(0, iStart) + panel + hdr.slice(iEnd);
  console.log('  ok  panel markup rebuilt to the two-zone design');
}

/* --- 4b. CSS: replace the mega block wholesale ---------------------------- */

const cssStart = hdr.indexOf(`/* ============================================================================
   MEGA PANELS — 28/08/2026`);
const cssEnd = hdr.indexOf(`/* ---- drawer accordion`, cssStart);

const css = `/* ============================================================================
   MEGA PANELS — rebuilt 28/08/2026 to the live designs
   Two zones on an ivory sheet: shop-by grids left, guide + education right,
   divided by a vertical hairline.
   ========================================================================== */

.fye .hdr__nav-item.has-mega { position: static; }
.fye .has-mega .mega {
  position: absolute;
  left: 0; right: 0; top: 100%;
  transform: none;
  min-width: 0;
  max-height: calc(100vh - 190px);
  overflow-y: auto;
  background: var(--ivory);
  border: 0;
  border-top: 1px solid rgba(35, 61, 71, 0.35);
  padding: var(--s8) var(--s7) var(--s10);
}
.fye .has-mega .mega__in {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 380px;
  gap: 0 var(--s10);
  max-width: 1500px;
  margin-inline: auto;
}
.fye .has-mega .mega__in--wide { grid-template-columns: minmax(0, 1fr); }

/* The vertical rule between zones. */
.fye .mm__side {
  padding-left: var(--s10);
  border-left: 1px solid rgba(35, 61, 71, 0.18);
}

/* ---- shared heads ------------------------------------------------------- */

.fye .mm__row-head {
  display: flex; align-items: baseline; justify-content: space-between;
  gap: var(--s6);
  margin-bottom: var(--s5);
}
.fye .mm__row-head--major {
  padding-bottom: var(--s4);
  border-bottom: 1px solid rgba(35, 61, 71, 0.18);
  margin-bottom: var(--s7);
}
.fye .mm__zone-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: var(--fw-regular);
  letter-spacing: var(--tr-h2);
  line-height: 1.2;
  text-transform: uppercase;
}
.fye .mm__viewall {
  display: inline-flex; align-items: center; gap: var(--s3);
  font-size: 15px; font-weight: var(--fw-medium);
  letter-spacing: 0.08em; text-transform: uppercase;
  white-space: nowrap;
}
/* Small caps label. Softer than body ink — it is a category, not a link. */
.fye .mm__label {
  display: block;
  margin: 0 0 var(--s5);
  font-size: 13px; font-weight: var(--fw-regular);
  letter-spacing: 0.16em; text-transform: uppercase;
  color: rgba(35, 61, 71, 0.55);
}

/* ---- left zone ---------------------------------------------------------- */

.fye .mm__cols { display: flex; gap: var(--s11); align-items: flex-start; }
.fye .mm__col { min-width: 0; }
.fye .mm__list { margin: 0; padding: 0; list-style: none; }
.fye .mm__list li { margin-bottom: var(--s4); }
.fye .mm__list a {
  display: inline-flex; align-items: center; gap: var(--s3);
  font-size: 16px; font-weight: var(--fw-medium);
  letter-spacing: 0.06em; text-transform: uppercase;
}
.fye .mm__list--caps a { font-size: 15px; letter-spacing: 0.05em; }

/* Two columns, filled COLUMN-MAJOR: live reads Round/Pear, Princess/Emerald.
   Row-wise wrapping would pair Round with Princess. The row count comes from
   the snippet, since panels carry different numbers of shapes. */
.fye .mm__shapes {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  gap: var(--s4) var(--s9);
  margin: 0; padding: 0; list-style: none;
}
.fye .mm__shapes li { margin: 0; }
.fye .mm__shapes a {
  display: inline-flex; align-items: center; gap: var(--s5);
  font-size: 15px; font-weight: var(--fw-medium);
  letter-spacing: 0.08em; text-transform: uppercase;
}
.fye .mm__shapes img { width: 44px; height: 44px; flex: none; }

.fye .mm__stones-wrap {
  margin-top: var(--s9);
  padding-top: var(--s6);
  border-top: 1px solid rgba(35, 61, 71, 0.18);
}
.fye .mm__stones {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: var(--s4) var(--s6);
  margin: 0; padding: 0; list-style: none;
}
.fye .mm__stones li { margin: 0; }
.fye .mm__stones a {
  display: inline-flex; align-items: center; gap: var(--s4);
  font-size: 15px; font-weight: var(--fw-medium);
  letter-spacing: 0.06em; text-transform: uppercase;
  line-height: 1.25;
}
.fye .mm__dot {
  width: 22px; height: 22px; flex: none;
  border-radius: 50%;
  border: 1px solid transparent;
}
/* Pale stones and the metal swatches need an edge or they vanish on ivory. */
.fye .mm__dot--pale { border-color: rgba(35, 61, 71, 0.28); }
.fye .mm__list--dots a { gap: var(--s4); }

/* ---- right zone --------------------------------------------------------- */

.fye .mm__card {
  display: flex;
  gap: var(--s5);
  padding: var(--s5);
  background: var(--white);
  margin-bottom: var(--s6);
}
.fye .mm__card-cover { flex: none; width: 84px; }
.fye .mm__card-cover img { display: block; width: 100%; height: auto; }
.fye .mm__card-words { display: flex; flex-direction: column; gap: var(--s3); min-width: 0; }
.fye .mm__card-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 18px;
  letter-spacing: var(--tr-h2);
  line-height: 1.25;
  text-transform: uppercase;
}
.fye .mm__card-blurb {
  margin: 0;
  font-size: 15px; font-weight: var(--fw-light);
  line-height: 1.5;
  color: var(--ink-soft);
}
.fye .mm__card-dl {
  display: inline-flex; align-items: center; gap: var(--s3);
  margin-top: var(--s2);
  font-size: 14px; font-weight: var(--fw-medium);
  letter-spacing: 0.1em; text-transform: uppercase;
}

.fye .mm__side-cols {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--s7);
  margin-top: var(--s8);
  padding-top: var(--s7);
  border-top: 1px solid rgba(35, 61, 71, 0.18);
}

@media (max-width: 1280px) {
  .fye .has-mega .mega__in { grid-template-columns: minmax(0, 1fr) 320px; gap: 0 var(--s8); }
  .fye .mm__side { padding-left: var(--s8); }
  .fye .mm__cols { gap: var(--s9); }
  .fye .mm__stones { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
@media (max-width: 1100px) {
  .fye .mm__cols { flex-wrap: wrap; gap: var(--s8); }
}

`;

if (cssStart === -1 || cssEnd === -1) {
  console.log('SKIP  could not locate the mega CSS block');
} else {
  hdr = hdr.slice(0, cssStart) + css + hdr.slice(cssEnd);
  console.log('  ok  mega CSS rebuilt');
}

/* --- 4c. schema ---------------------------------------------------------- */

const schemaFind = `        { "type": "header", "content": "Guides" },
        { "type": "link_list", "id": "guides_menu", "label": "Guides menu" },
        { "type": "text", "id": "guides_title", "label": "Zone heading", "default": "Guides & Advice" }`;

const schemaReplace = `        { "type": "text", "id": "shape_only", "label": "Shapes to show", "info": "Comma list of stems, in order, e.g. round-brilliant,princess-cut. Empty shows all ten." },
        { "type": "header", "content": "Right zone" },
        { "type": "text", "id": "side_title", "label": "Zone heading", "default": "The Guide" },
        { "type": "text", "id": "guide1_cover", "label": "Guide 1 cover URL" },
        { "type": "text", "id": "guide1_title", "label": "Guide 1 title" },
        { "type": "textarea", "id": "guide1_blurb", "label": "Guide 1 blurb" },
        { "type": "url", "id": "guide1_link", "label": "Guide 1 link" },
        { "type": "text", "id": "guide2_cover", "label": "Guide 2 cover URL" },
        { "type": "text", "id": "guide2_title", "label": "Guide 2 title" },
        { "type": "textarea", "id": "guide2_blurb", "label": "Guide 2 blurb" },
        { "type": "url", "id": "guide2_link", "label": "Guide 2 link" },
        { "type": "link_list", "id": "edu_menu", "label": "Education menu" },
        { "type": "text", "id": "edu_label", "label": "Education heading", "default": "Diamond education" },
        { "type": "link_list", "id": "jewel_menu", "label": "Jewellery guide menu" },
        { "type": "text", "id": "jewel_label", "label": "Jewellery heading", "default": "Jewellery guide" }`;

if (hdr.includes(schemaFind)) {
  hdr = hdr.replace(schemaFind, schemaReplace);
  console.log('  ok  schema rebuilt');
} else {
  console.log('SKIP  schema block not found');
}

await writeFile(HDR, hdr, 'utf8');
console.log(`FIXED ${HDR}`);

/* ==========================================================================
   5. header-group.json — content per panel
   ========================================================================== */

const CDN = 'https://foryoureternity.com/cdn/shop/files/';
const TPL = 'sections/header-group.json';
const doc = JSON.parse(await readFile(TPL, 'utf8'));
const blocks = doc.sections.header.blocks;

const eight = 'round-brilliant,princess-cut,oval-cut,pear-cut,emerald-cut,asscher-cut,marquise-cut,heart-cut';

const content = {
  nav_engagement: {
    zone1_all_label: 'View all engagement rings',
    shape_only: '',
    side_title: 'The Engagement Ring Guide',
    guide1_cover: `${CDN}Engagement_Ring_Cover.png`,
    guide1_title: 'The Engagement Ring Guide',
    guide1_blurb: 'Budget, the Four Cs, diamond shapes, settings, sizing and bespoke design.',
    guide1_link: '/pages/engagement-ring-guide',
    edu_menu: 'footer-diamonds',
    edu_label: 'Diamond education',
    jewel_menu: 'footer-guides',
    jewel_label: 'Jewellery guide'
  },
  nav_wedding: {
    zone1_all_label: 'View all wedding rings',
    shape_suffix: 'engagement-rings',
    shape_label: 'Diamond & gemstone set',
    shape_only: eight,
    stone_suffix: 'engagement-rings',
    stone_all_url: '/collections/coloured-stone-rings',
    side_title: 'Wedding Ring Guides',
    guide1_cover: `${CDN}Plain_Wedding_Cover.png`,
    guide1_title: 'The Plain Wedding Ring Guide',
    guide1_blurb: 'Profiles, metals, finishes, shaped-to-fit bands and matched pairs.',
    guide1_link: '/pages/plain-wedding-ring-guide',
    guide2_cover: `${CDN}Diamond_Ring_Guide.png`,
    guide2_title: 'The Diamond & Gemset Wedding Ring Guide',
    guide2_blurb: 'Setting styles, stone choices, shaped bands and everyday wear.',
    guide2_link: '/pages/jewellery-guides',
    edu_menu: 'footer-diamonds',
    jewel_menu: 'footer-guides'
  },
  nav_eternity: {
    zone1_all_label: 'View all eternity rings',
    shape_suffix: 'engagement-rings',
    shape_label: 'Shop by shape',
    shape_only: eight,
    stone_suffix: 'engagement-rings',
    stone_all_url: '/collections/coloured-stone-rings',
    side_title: 'The Eternity Ring Guide',
    guide1_cover: `${CDN}Eternity_Ring_Cover.png`,
    guide1_title: 'The Eternity Ring Guide',
    guide1_blurb: 'Full, half and three-quarter styles, stone settings, spacing and how to wear them.',
    guide1_link: '/pages/eternity-ring-guide',
    edu_menu: 'footer-diamonds',
    jewel_menu: 'footer-guides'
  },
  nav_diamonds: {
    zone1_title: 'Diamonds & Gemstones',
    zone1_all_label: 'View all loose stones',
    side_title: 'Free Buying Guide',
    guide1_cover: `${CDN}Diamond_Ring_Guide.png`,
    guide1_title: 'The Diamond and Gemstone Guide',
    guide1_blurb: 'The 4Cs, lab-grown versus natural, colour and ethical sourcing.',
    guide1_link: '/pages/diamond-and-gemstone-guide',
    edu_menu: 'footer-diamonds',
    edu_label: 'Learn',
    jewel_menu: '',
    jewel_label: ''
  }
};

for (const [id, settings] of Object.entries(content)) {
  if (!blocks[id]) continue;
  blocks[id].settings = { ...blocks[id].settings, ...settings };
  console.log(`  ok  ${id}`);
}

await writeFile(TPL, JSON.stringify(doc, null, 2) + '\n', 'utf8');
console.log(`FIXED ${TPL}`);
