/* ============================================================================
   build-mega.mjs — mega menus, 28/08/2026
   ----------------------------------------------------------------------------
     cd ~/Dropbox/GIT-repositaries/fye-theme-v3
     node docs/tools/build-mega.mjs

   Delete once run and synced.

   Four panels: engagement, wedding, eternity, diamonds & gemstones.
   Link columns come from Shopify MENUS; the shape and stone grids are fixed in
   code, per panel, with colour dots; every relevant guide appears in the panel;
   the mobile drawer becomes an accordion per item.

   WHY THE GRIDS ARE CODE AND THE COLUMNS ARE MENUS
   The shape and stone grids are not really navigation — they are a fixed
   taxonomy with artwork and hex values attached. Ten shapes with an icon each,
   seventeen stones with a colour each. Put those in a Shopify menu and you get
   the titles but lose the icon and the dot, and someone reordering the menu
   silently breaks the visual grid. Whereas "Shop by Type" genuinely changes —
   collections come and go — so that is a menu.

   HANDLES ARE DERIVED, NOT LISTED TWICE
   Each shape carries a slug stem (round-brilliant, princess-cut, …) and the
   block supplies a suffix (-engagement-rings, -eternity-rings). So one grid
   definition serves every panel, and a panel that has no per-shape collections
   simply leaves the suffix empty and hides the grid. Verified against live:
   round-brilliant + -engagement-rings = round-brilliant-engagement-rings, and
   princess-cut + the same = princess-cut-engagement-rings. Both real.

   The shape icons are live's own files (icon101–110.svg on the shop CDN), so
   the artwork matches without copying anything into the theme.
   ========================================================================== */

import { readFile, writeFile } from 'node:fs/promises';

/* ==========================================================================
   1. snippets/mm-shapes.liquid
   ========================================================================== */

const shapes = `{%- comment -%}
  mm-shapes — the diamond-shape grid inside a mega panel.

  Params:
    suffix  collection-handle suffix, e.g. 'engagement-rings'. Each link is
            <stem>-<suffix>. Renders nothing when blank.
    label   column heading. Default 'Shop by Shape'.

  The stems and icons are live's. Icons are live's own CDN files rather than
  theme assets, so the artwork matches with nothing copied in.

  This is a fixed taxonomy, not navigation — see build-mega.mjs on why it is
  code and the type column is a menu.
{%- endcomment -%}
{%- liquid
  assign sfx = suffix | strip
  if sfx == blank
    break
  endif
  assign heading = label | default: 'Shop by Shape'
  assign stems = 'round-brilliant,princess-cut,oval-cut,cushion-cut,radiant-cut,pear-cut,emerald-cut,asscher-cut,marquise-cut,heart-cut' | split: ','
  assign names = 'Round,Princess,Oval,Cushion,Radiant,Pear,Emerald,Asscher,Marquise,Heart' | split: ','
  assign icons = 'icon101,icon107,icon102,icon103,icon106,icon104,icon105,icon109,icon108,icon110' | split: ','
  assign cdn = 'https://foryoureternity.com/cdn/shop/files/'
-%}

<div class="mm__col mm__col--shapes">
  <h3 class="mm__label">{{ heading }}</h3>
  <ul class="mm__shapes">
    {%- for stem in stems -%}
      <li>
        <a href="/collections/{{ stem }}-{{ sfx }}">
          <img src="{{ cdn }}{{ icons[forloop.index0] }}.svg" alt="" width="24" height="24" loading="lazy">
          <span>{{ names[forloop.index0] }}</span>
        </a>
      </li>
    {%- endfor -%}
  </ul>
</div>
`;

/* ==========================================================================
   2. snippets/mm-stones.liquid
   ========================================================================== */

const stones = `{%- comment -%}
  mm-stones — the coloured-stone grid inside a mega panel.

  Params:
    suffix    collection-handle suffix, e.g. 'engagement-rings'. Renders
              nothing when blank.
    label     column heading. Default 'Shop by Coloured Stone'.
    all_url   optional "view all" link.
    all_label optional "view all" label.

  Seventeen stones, each with the hex live uses for its dot. The dot is a
  <span>, not an image: it is a colour sample, and seventeen tiny images would
  be seventeen requests for something CSS can state exactly.

  Opal gets a border because #EAE6D9 on an ivory panel would otherwise have no
  edge at all — live does the same.
{%- endcomment -%}
{%- liquid
  assign sfx = suffix | strip
  if sfx == blank
    break
  endif
  assign heading = label | default: 'Shop by Coloured Stone'
  assign stems = 'ruby,sapphire,pink-sapphire,yellow-sapphire,emerald,tanzanite,aquamarine,morganite,peridot,amethyst,garnet,citrine,blue-topaz,opal,fire-opal,pink-tourmaline' | split: ','
  assign names = 'Ruby,Sapphire,Pink Sapphire,Yellow Sapphire,Emerald,Tanzanite,Aquamarine,Morganite,Peridot,Amethyst,Garnet,Citrine,Blue Topaz,Opal,Fire Opal,Pink Tourmaline' | split: ','
  assign hexes = '#9E2B2B,#2F5C8A,#D46A8B,#E3C14E,#2E7D54,#5B5AA0,#8FBFCB,#E3ADA6,#94A83E,#7E5AA2,#8B2E2E,#E0A33E,#4E93C4,#EAE6D9,#E0713E,#CE6B92' | split: ','
-%}

<div class="mm__stones-wrap">
  <div class="mm__stones-head">
    <h3 class="mm__label">{{ heading }}</h3>
    {%- if all_url != blank -%}
      <a class="mm__viewall" href="{{ all_url }}">
        {{ all_label | default: 'View all' }}
        {% render 'icon', name: 'arrow-right', size: 14 %}
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
        <span class="mm__dot" style="background:#1C1C1C"></span>
        <span>Black Diamond</span>
      </a>
    </li>
  </ul>
</div>
`;

await writeFile('snippets/mm-shapes.liquid', shapes, 'utf8');
await writeFile('snippets/mm-stones.liquid', stones, 'utf8');
console.log('FIXED snippets/mm-shapes.liquid');
console.log('FIXED snippets/mm-stones.liquid');

/* ==========================================================================
   3. header-bottom: the panel, the schema, the drawer accordion
   ========================================================================== */

const HDR = 'sections/header-bottom.liquid';
let hdr = await readFile(HDR, 'utf8');

const edits = [
  {
    label: 'panel markup',
    find: `            {%- if block.type == 'mega' and sub.links.size > 0 -%}
              <div class="mega">
                <div class="mega__in">
                  {%- for child in sub.links -%}
                    <div class="mega__col">
                      <a class="mega__head" href="{{ child.url }}">{{ child.title }}</a>
                      {%- if child.links.size > 0 -%}
                        <ul class="mega__list">
                          {%- for gc in child.links -%}
                            <li><a href="{{ gc.url }}">{{ gc.title }}</a></li>
                          {%- endfor -%}
                        </ul>
                      {%- endif -%}
                    </div>
                  {%- endfor -%}
                </div>
              </div>
            {%- endif -%}`,
    replace: `            {%- if block.type == 'mega' -%}
              {%- liquid
                assign b = block.settings
                assign guides = linklists[b.guides_menu]
                assign has_zone1 = false
                if sub.links.size > 0 or b.shape_suffix != blank or b.stone_suffix != blank
                  assign has_zone1 = true
                endif
              -%}
              <div class="mega">
                <div class="mega__in">

                  {%- if has_zone1 -%}
                    <section class="mm__zone">
                      <div class="mm__zone-head">
                        <h2 class="mm__zone-title">{{ b.zone1_title | default: 'Pre-Designed Rings' }}</h2>
                        {%- if b.zone1_all_url != blank -%}
                          <a class="mm__viewall" href="{{ b.zone1_all_url }}">
                            {{ b.zone1_all_label | default: 'View all' }}
                            {% render 'icon', name: 'arrow-right', size: 14 %}
                          </a>
                        {%- endif -%}
                      </div>

                      <div class="mm__cols">
                        {%- render 'mm-shapes', suffix: b.shape_suffix, label: b.shape_label -%}

                        {%- comment -%}
                          The menu's TOP level becomes one column each, its
                          children the links under it — so "Shop by Type" is a
                          menu item with children, not a hardcoded list.
                        {%- endcomment -%}
                        {%- for child in sub.links -%}
                          <div class="mm__col">
                            <a class="mm__label mm__label--link" href="{{ child.url }}">{{ child.title }}</a>
                            {%- if child.links.size > 0 -%}
                              <ul class="mm__list">
                                {%- for gc in child.links -%}
                                  <li><a href="{{ gc.url }}">{{ gc.title }}</a></li>
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
                    </section>
                  {%- endif -%}

                  {%- if guides.links.size > 0 -%}
                    <div class="mm__divider"></div>
                    <section class="mm__zone">
                      <div class="mm__zone-head">
                        <h2 class="mm__zone-title">{{ b.guides_title | default: 'Guides & Advice' }}</h2>
                      </div>
                      <ul class="mm__guides">
                        {%- for link in guides.links -%}
                          <li><a href="{{ link.url }}">
                            {% render 'icon', name: 'arrow-right', size: 14 %}
                            <span>{{ link.title }}</span>
                          </a></li>
                        {%- endfor -%}
                      </ul>
                    </section>
                  {%- endif -%}

                </div>
              </div>
            {%- endif -%}`
  },
  {
    label: 'drawer becomes an accordion',
    find: `    <ul class="drawer__list">
      {%- for block in section.blocks -%}
        <li><a href="{{ block.settings.url | default: '#' }}">{{ block.settings.title }}</a></li>
      {%- endfor -%}
    </ul>`,
    replace: `    <ul class="drawer__list">
      {%- for block in section.blocks -%}
        {%- assign dsub = linklists[block.settings.menu] -%}
        {%- if block.type == 'mega' and dsub.links.size > 0 -%}
          {%- comment -%}
            Native <details>, same reasoning as the footer: keyboard operable,
            announced properly, and it opens with no JavaScript. Closed by
            default here because the drawer is already a deliberate action —
            unlike the footer, nothing is hidden until the user opens it.
          {%- endcomment -%}
          <li>
            <details class="drawer__acc">
              <summary>
                <span>{{ block.settings.title }}</span>
                {% render 'icon', name: 'chevron-down', size: 16 %}
              </summary>
              <ul class="drawer__sub">
                {%- if block.settings.url != blank -%}
                  <li><a href="{{ block.settings.url }}">All {{ block.settings.title | downcase }}</a></li>
                {%- endif -%}
                {%- for child in dsub.links -%}
                  <li><a href="{{ child.url }}">{{ child.title }}</a></li>
                  {%- for gc in child.links -%}
                    <li class="drawer__sub-deep"><a href="{{ gc.url }}">{{ gc.title }}</a></li>
                  {%- endfor -%}
                {%- endfor -%}
              </ul>
            </details>
          </li>
        {%- else -%}
          <li><a href="{{ block.settings.url | default: '#' }}">{{ block.settings.title }}</a></li>
        {%- endif -%}
      {%- endfor -%}
    </ul>`
  },
  {
    label: 'mega + drawer CSS',
    find: `{% endstylesheet %}`,
    replace: `
/* ============================================================================
   MEGA PANELS — 28/08/2026
   Full-bleed ivory sheet under the nav band. Two zones: pre-designed rings
   (shape grid, menu columns, stone grid) and guides.
   ========================================================================== */

.fye .hdr__nav-item.has-mega { position: static; }
.fye .has-mega .mega {
  position: absolute;
  left: 0; right: 0; top: 100%;
  transform: none;
  min-width: 0;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  background: var(--ivory);
  border: 0;
  border-top: 1px solid var(--sage-grey);
  padding: var(--s9) var(--s7);
}
.fye .has-mega .mega__in {
  display: block;
  max-width: var(--maxw);
  margin-inline: auto;
}

.fye .mm__zone + .mm__zone { margin-top: var(--s8); }
.fye .mm__zone-head {
  display: flex; align-items: baseline; justify-content: space-between;
  gap: var(--s6);
  margin-bottom: var(--s7);
}
.fye .mm__zone-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: var(--fw-regular);
  letter-spacing: var(--tr-h2);
  text-transform: uppercase;
}
.fye .mm__viewall {
  display: inline-flex; align-items: center; gap: var(--s2);
  font-size: 13px; font-weight: var(--fw-medium);
  letter-spacing: var(--tr-eyebrow); text-transform: uppercase;
  white-space: nowrap;
}

.fye .mm__cols { display: flex; gap: var(--s10); align-items: flex-start; }
.fye .mm__col { min-width: 0; }
.fye .mm__label {
  display: block;
  margin: 0 0 var(--s5);
  font-size: 13px; font-weight: var(--fw-medium);
  letter-spacing: var(--tr-eyebrow); text-transform: uppercase;
  color: var(--ink);
}
.fye .mm__list, .fye .mm__shapes, .fye .mm__stones, .fye .mm__guides { margin: 0; padding: 0; list-style: none; }
.fye .mm__list li { margin-bottom: var(--s3); }
.fye .mm__list a { font-size: 16px; font-weight: var(--fw-light); }

/* Shapes: two columns of five, icon then name. */
.fye .mm__shapes {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--s3) var(--s7);
}
.fye .mm__shapes li { margin: 0; }
.fye .mm__shapes a { display: inline-flex; align-items: center; gap: var(--s3); font-size: 15px; font-weight: var(--fw-light); }
.fye .mm__shapes img { width: 24px; height: 24px; flex: none; }

/* Stones: the dot is a colour sample, so CSS states it — seventeen tiny
   images would be seventeen requests for a hex value. */
.fye .mm__stones-wrap { margin-top: var(--s8); padding-top: var(--s7); border-top: var(--hairline); }
.fye .mm__stones-head { display: flex; align-items: baseline; justify-content: space-between; gap: var(--s6); }
.fye .mm__stones {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: var(--s3) var(--s7);
}
.fye .mm__stones li { margin: 0; }
.fye .mm__stones a { display: inline-flex; align-items: center; gap: var(--s3); font-size: 15px; font-weight: var(--fw-light); }
.fye .mm__dot {
  width: 12px; height: 12px; flex: none;
  border: 1px solid transparent;
}
/* Opal would have no edge at all on an ivory panel. Live does the same. */
.fye .mm__dot--pale { border-color: rgba(35, 61, 71, 0.35); }

.fye .mm__divider { height: 1px; background: rgba(35, 61, 71, 0.18); margin-block: var(--s8); }

.fye .mm__guides {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--s3) var(--s7);
}
.fye .mm__guides li { margin: 0; }
.fye .mm__guides a { display: inline-flex; align-items: center; gap: var(--s3); font-size: 16px; font-weight: var(--fw-light); }

/* ---- drawer accordion --------------------------------------------------- */

.fye .drawer__acc > summary {
  display: flex; align-items: center; justify-content: space-between;
  gap: var(--s4);
  min-height: 48px;
  cursor: pointer;
  list-style: none;
  font-size: 15px; font-weight: var(--fw-semi);
  letter-spacing: 0.09em; text-transform: uppercase;
}
.fye .drawer__acc > summary::-webkit-details-marker { display: none; }
.fye .drawer__acc > summary .icon { transition: transform var(--dur) var(--ease); flex: none; }
.fye .drawer__acc[open] > summary .icon { transform: rotate(180deg); }
.fye .drawer__sub { margin: 0 0 var(--s4); padding: 0 0 0 var(--s4); list-style: none; }
.fye .drawer__sub li { border: 0; padding: var(--s2) 0; margin: 0; }
.fye .drawer__sub a { font-size: 15px; font-weight: var(--fw-light); letter-spacing: 0; text-transform: none; }
.fye .drawer__sub-deep { padding-left: var(--s4); }
.fye .drawer__sub-deep a { font-size: 14px; color: var(--ink-soft); }

@media (max-width: 1100px) {
  .fye .mm__cols { flex-wrap: wrap; gap: var(--s8); }
}
{% endstylesheet %}`
  },
  {
    label: 'mega block schema',
    find: `    {
      "type": "mega",
      "name": "Link with dropdown",
      "settings": [
        { "type": "text", "id": "title", "label": "Title" },
        { "type": "url", "id": "url", "label": "Link" },
        { "type": "link_list", "id": "menu", "label": "Dropdown menu" }
      ]
    }`,
    replace: `    {
      "type": "mega",
      "name": "Link with mega panel",
      "settings": [
        { "type": "text", "id": "title", "label": "Title" },
        { "type": "url", "id": "url", "label": "Link" },
        { "type": "link_list", "id": "menu", "label": "Columns menu", "info": "Each top-level item becomes a column; its children become the links in it." },
        { "type": "header", "content": "Zone 1" },
        { "type": "text", "id": "zone1_title", "label": "Zone heading", "default": "Pre-Designed Rings" },
        { "type": "url", "id": "zone1_all_url", "label": "View-all link" },
        { "type": "text", "id": "zone1_all_label", "label": "View-all label", "default": "View all" },
        { "type": "header", "content": "Shape grid" },
        {
          "type": "text", "id": "shape_suffix", "label": "Collection suffix",
          "info": "e.g. engagement-rings \\u2014 links become round-brilliant-engagement-rings and so on. Empty hides the grid."
        },
        { "type": "text", "id": "shape_label", "label": "Heading", "default": "Shop by Shape" },
        { "type": "header", "content": "Coloured stone grid" },
        {
          "type": "text", "id": "stone_suffix", "label": "Collection suffix",
          "info": "e.g. engagement-rings. Empty hides the grid."
        },
        { "type": "text", "id": "stone_label", "label": "Heading", "default": "Shop by Coloured Stone" },
        { "type": "url", "id": "stone_all_url", "label": "View-all link" },
        { "type": "text", "id": "stone_all_label", "label": "View-all label", "default": "View all coloured stone rings" },
        { "type": "header", "content": "Guides" },
        { "type": "link_list", "id": "guides_menu", "label": "Guides menu" },
        { "type": "text", "id": "guides_title", "label": "Zone heading", "default": "Guides & Advice" }
      ]
    }`
  }
];

for (const { label, find, replace } of edits) {
  const n = hdr.split(find).length - 1;
  if (n !== 1) {
    console.log(`SKIP  ${label} — ${n} matches`);
    continue;
  }
  hdr = hdr.replace(find, replace);
  console.log(`  ok  ${label}`);
}

await writeFile(HDR, hdr, 'utf8');
console.log(`FIXED ${HDR}`);
