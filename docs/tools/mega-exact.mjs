/* ============================================================================
   mega-exact.mjs — mega panels matched to live, 28/08/2026
   ----------------------------------------------------------------------------
     cd ~/Dropbox/GIT-repositaries/fye-theme-v3
     node docs/tools/mega-exact.mjs

   Delete once run and synced.

   Built from live's own rendered markup rather than from screenshots, so the
   columns, headings, ordering and every link are lifted verbatim.

   THE ASSUMPTION THAT WAS WRONG
   I had one collection-handle suffix per panel: <stem>-<suffix>. True for
   engagement (round-brilliant-engagement-rings) and false everywhere else —
   live uses wedding-round and eternity-round, a PREFIX plus a short name. Same
   for stones: engagement has ruby-engagement-rings, wedding sends all
   seventeen to coloured-stone-rings, and eternity is a mixture
   (eternity-ruby, pink-sapphire-eternity-rings, black-diamond-eternity-rings,
   everything else to coloured-stone-rings).

   No pattern expresses that, so the snippets now take a `set` name and hold
   the real handles per set. Verbose, but it is one-off data and it is right;
   a clever pattern would have been wrong in three places.

   ORDERING ALSO VARIES, hence `shapes_first`:
     engagement  Shop by Type   then Shop by Shape
     wedding     Shape          then Plain by Profile, Plain by Metal
     eternity    Shop by Coverage then Shop by Shape

   THE 25 CUTS ARE REAL AFTER ALL
   I said they were inline SVG needing extraction. They are not — they are
   ordinary Files SVGs (ROUND-5UMFM7E6.svg and so on), so mm-cuts references
   them directly and the diamonds tab is complete.
   ========================================================================== */

import { readFile, writeFile } from 'node:fs/promises';

const F = 'https://foryoureternity.com/cdn/shop/files/';

/* ==========================================================================
   1. mm-shapes — handles per set, live's order
   ========================================================================== */

const shapes = `{%- comment -%}
  mm-shapes — the diamond-shape grid in a mega panel.

  Params:
    set    'engagement' | 'wedding' | 'eternity'. Blank renders nothing.
    label  column heading.

  Handles are held per set because live has no single rule: engagement is
  <stem>-engagement-rings, wedding is wedding-<short>, eternity is
  eternity-<short>. Order is live's, which reads correctly down a two-column
  grid: Round/Pear, Princess/Emerald, Oval/Asscher.
{%- endcomment -%}
{%- liquid
  assign set = set | strip
  if set == blank
    break
  endif

  if set == 'engagement'
    assign names = 'Round,Pear,Princess,Emerald,Oval,Asscher,Cushion,Marquise,Radiant,Heart' | split: ','
    assign icons = 'icon101,icon104,icon107,icon105,icon102,icon109,icon103,icon108,icon106,icon110' | split: ','
    assign urls = 'round-brilliant-engagement-rings,pear-cut-engagement-rings,princess-cut-engagement-rings,emerald-cut-engagement-rings,oval-cut-engagement-rings,asscher-cut-engagement-rings,cushion-cut-engagement-rings,marquise-cut-engagement-rings,radiant-cut-engagement-rings,heart-cut-engagement-rings' | split: ','
  elsif set == 'wedding'
    assign names = 'Round,Pear,Princess,Emerald,Oval,Asscher,Marquise,Heart' | split: ','
    assign icons = 'icon101,icon104,icon107,icon105,icon102,icon109,icon108,icon110' | split: ','
    assign urls = 'wedding-round,wedding-pear,wedding-princess,wedding-emerald-cut,wedding-oval,wedding-asscher,wedding-marquise,wedding-heart' | split: ','
  elsif set == 'eternity'
    assign names = 'Round,Pear,Princess,Emerald,Oval,Asscher,Marquise,Heart' | split: ','
    assign icons = 'icon101,icon104,icon107,icon105,icon102,icon109,icon108,icon110' | split: ','
    assign urls = 'eternity-round,eternity-pear,eternity-princess,eternity-emerald-cut,eternity-oval,eternity-asscher,eternity-marquise,eternity-heart' | split: ','
  else
    break
  endif
-%}

<div class="mm__col mm__col--shapes">
  <h3 class="mm__label">{{ label | default: 'Shop by Shape' }}</h3>
  <ul class="mm__shapes">
    {%- for name in names -%}
      <li>
        <a href="/collections/{{ urls[forloop.index0] }}">
          <img src="${F}{{ icons[forloop.index0] }}.svg" alt="" width="44" height="44" loading="lazy">
          <span>{{ name }}</span>
        </a>
      </li>
    {%- endfor -%}
  </ul>
</div>
`;

/* ==========================================================================
   2. mm-stones — the seventeen, handles per set
   ========================================================================== */

const stones = `{%- comment -%}
  mm-stones — the coloured-stone grid. Seventeen stones, live's order.

  Params: set ('engagement' | 'wedding' | 'eternity'), label, all_url, all_label.

  Handles per set, because live's differ: engagement has a collection per
  stone; wedding points every one at coloured-stone-rings; eternity has five of
  its own and sends the rest to coloured-stone-rings.

  The dot is a span with a background — a colour sample, not artwork.
  Seventeen images would be seventeen requests for a hex value. Opal and the
  metals get a hairline or they vanish against ivory, as live does.
{%- endcomment -%}
{%- liquid
  assign set = set | strip
  if set == blank
    break
  endif

  assign names = 'Ruby,Sapphire,Pink Sapphire,Yellow Sapphire,Emerald,Tanzanite,Aquamarine,Morganite,Peridot,Amethyst,Garnet,Citrine,Blue Topaz,Opal,Fire Opal,Pink Tourmaline,Black Diamond' | split: ','
  assign hexes = '#9E2B2B,#1F4E79,#D46A8B,#E3C14E,#1E7A4C,#5B5AA0,#8FC7D8,#E3ADA6,#94A83E,#7E5AA2,#8B2E2E,#E0A33E,#4E93C4,#EAE6D9,#E0713E,#DE7BA0,#141414' | split: ','
  assign csr = 'coloured-stone-rings'

  if set == 'engagement'
    assign urls = 'ruby-engagement-rings,sapphire-engagement-rings,pink-sapphire-engagement-rings,yellow-sapphire-engagement-rings,emerald-engagement-rings,tanzanite-engagement-rings,aquamarine-engagement-rings,morganite-engagement-rings,peridot-engagement-rings,amethyst-engagement-rings,garnet-engagement-rings,citrine-engagement-rings,blue-topaz-engagement-rings,opal-engagement-rings,fire-opal-engagement-rings,pink-tourmaline-engagement-rings,coloured-stone-rings' | split: ','
  elsif set == 'eternity'
    assign urls = 'eternity-ruby,eternity-sapphire,pink-sapphire-eternity-rings,coloured-stone-rings,eternity-emerald,coloured-stone-rings,coloured-stone-rings,coloured-stone-rings,coloured-stone-rings,coloured-stone-rings,coloured-stone-rings,coloured-stone-rings,coloured-stone-rings,coloured-stone-rings,coloured-stone-rings,coloured-stone-rings,black-diamond-eternity-rings' | split: ','
  else
    assign urls = 'a,a,a,a,a,a,a,a,a,a,a,a,a,a,a,a,a' | split: ','
  endif
-%}

<div class="mm__stones-wrap">
  <div class="mm__row-head">
    <h3 class="mm__label">{{ label | default: 'Shop by Coloured Stone' }}</h3>
    {%- if all_url != blank -%}
      <a class="mm__viewall" href="{{ all_url }}">
        {{ all_label | default: 'View All Coloured Stone Rings' }}
        {% render 'icon', name: 'arrow-right', size: 16 %}
      </a>
    {%- endif -%}
  </div>
  <ul class="mm__stones">
    {%- for name in names -%}
      {%- liquid
        assign u = urls[forloop.index0]
        if set == 'wedding'
          assign u = csr
        endif
        assign hex = hexes[forloop.index0]
      -%}
      <li>
        <a href="/collections/{{ u }}">
          <span class="mm__dot{% if name == 'Opal' %} mm__dot--pale{% endif %}" style="background:{{ hex }}"></span>
          <span>{{ name }}</span>
        </a>
      </li>
    {%- endfor -%}
  </ul>
</div>
`;

/* ==========================================================================
   3. mm-cuts — the 25 loose-diamond cuts
   ========================================================================== */

const cutNames = ['Round','Princess','Oval','Cushion','Emerald','Radiant','Asscher','Pear','Marquise','Heart','Square Radiant','Old Miner','European Cut','Half Moon','Trapezoid','Briolette','Hexagonal','Octagonal','Pentagonal','Triangular','Shield','Lozenge','Kite','Baguette','Tapered Baguette'];
const cutFiles = ['ROUND-5UMFM7E6','PRINCESS-GYL3K7OB','OVAL-FJP3WUW2','CUSHION-VQ6KC3AI','EMERALD-WDWYFLXN','RADIANT-LBLWCVJT','ASSCHER-U7PARIXY','PEAR-ZABBQM76','MARQUISE-LMQ3JHFO','HEART-VGGURWHG','SQUARE_RADIANT-JMBQZIIZ','OLD_MINER-XTTUAEMP','EUROPEAN_CUT-RDS7J474','HALF_MOON-SAGXPLKL','TRAPEZOID-AIQQ6UTE','BRIOLETTE-NU2UCFJF','HEXAGONAL-O4A64ZEM','OCTAGONAL-5U36MRSK','PENTAGONAL-33JOXHWI','TRIANGULAR-RCP37CKB','SHIELD-TYUMPNLP','LOZENGE-OZKBZU7J','KITE-ABA5RJGY','BAGUETTE-5APAWROW','TAPERED_BAGUETTE-RR6FHT2K'];
const cutUrls = ['round-cut-diamond','princess-cut-diamond','oval-cut-diamond','cushion-cut-diamond','emerald-cut-diamond','radiant-cut-diamond','asscher-cut-diamond','pear-cut-diamond','marquise-cut-diamond','heart-cut-diamond','square-radiant-cut-diamond','old-miner-cut-diamond','european-cut-diamond','half-moon-cut-diamond','trapezoid-cut-diamond','hexagonal-cut-diamond','pentagonal-cut-diamond','octagonal-cut-diamond','triangular-cut-diamond','shield-cut-diamond','lozenge-cut-diamond','kite-cut-diamond','baguette-cut-diamond','tapered-baguette-cut-diamond'];

/* Order-safe: build rows from live's own sequence rather than three arrays
   that could drift out of step. */
const cuts = [
  ['Round','ROUND-5UMFM7E6','round-cut-diamond'],
  ['Princess','PRINCESS-GYL3K7OB','princess-cut-diamond'],
  ['Oval','OVAL-FJP3WUW2','oval-cut-diamond'],
  ['Cushion','CUSHION-VQ6KC3AI','cushion-cut-diamond'],
  ['Emerald','EMERALD-WDWYFLXN','emerald-cut-diamond'],
  ['Radiant','RADIANT-LBLWCVJT','radiant-cut-diamond'],
  ['Asscher','ASSCHER-U7PARIXY','asscher-cut-diamond'],
  ['Pear','PEAR-ZABBQM76','pear-cut-diamond'],
  ['Marquise','MARQUISE-LMQ3JHFO','marquise-cut-diamond'],
  ['Heart','HEART-VGGURWHG','heart-cut-diamond'],
  ['Square Radiant','SQUARE_RADIANT-JMBQZIIZ','square-radiant-cut-diamond'],
  ['Old Miner','OLD_MINER-XTTUAEMP','old-miner-cut-diamond'],
  ['European Cut','EUROPEAN_CUT-RDS7J474','european-cut-diamond'],
  ['Half Moon','HALF_MOON-SAGXPLKL','half-moon-cut-diamond'],
  ['Trapezoid','TRAPEZOID-AIQQ6UTE','trapezoid-cut-diamond'],
  ['Briolette','BRIOLETTE-NU2UCFJF','briolette-cut-diamond'],
  ['Hexagonal','HEXAGONAL-O4A64ZEM','hexagonal-cut-diamond'],
  ['Octagonal','OCTAGONAL-5U36MRSK','octagonal-cut-diamond'],
  ['Pentagonal','PENTAGONAL-33JOXHWI','pentagonal-cut-diamond'],
  ['Triangular','TRIANGULAR-RCP37CKB','triangular-cut-diamond'],
  ['Shield','SHIELD-TYUMPNLP','shield-cut-diamond'],
  ['Lozenge','LOZENGE-OZKBZU7J','lozenge-cut-diamond'],
  ['Kite','KITE-ABA5RJGY','kite-cut-diamond'],
  ['Baguette','BAGUETTE-5APAWROW','baguette-cut-diamond'],
  ['Tapered Baguette','TAPERED_BAGUETTE-RR6FHT2K','tapered-baguette-cut-diamond']
];

const cutItems = cuts.map(([n, f, u]) =>
  `    <li><a href="/collections/${u}"><img src="${F}${f}.svg?v=1778235944" alt="" width="40" height="40" loading="lazy"><span>${n}</span></a></li>`
).join('\n');

const cutsSnippet = `{%- comment -%}
  mm-cuts — the 25 loose-diamond cuts in the Diamonds tab.

  Static: this is a fixed taxonomy with one Files SVG and one collection each,
  so it is written out rather than driven by a menu — a menu would carry the
  titles and lose the artwork, and a reorder would silently break the grid.

  Params: label.
{%- endcomment -%}
<div class="mm__cuts-wrap">
  <h3 class="mm__label">{{ label | default: 'Shop by Shape — All 25 Cuts' }}</h3>
  <ul class="mm__cuts">
${cutItems}
  </ul>
</div>
`;

await writeFile('snippets/mm-shapes.liquid', shapes, 'utf8');
await writeFile('snippets/mm-stones.liquid', stones, 'utf8');
await writeFile('snippets/mm-cuts.liquid', cutsSnippet, 'utf8');
console.log(`FIXED snippets/mm-shapes.liquid, mm-stones.liquid, mm-cuts.liquid (${cuts.length} cuts)`);

/* ==========================================================================
   4. header-bottom — panel markup replaced wholesale
   ========================================================================== */

const HDR = 'sections/header-bottom.liquid';
let hdr = await readFile(HDR, 'utf8');

const pStart = hdr.indexOf(`{%- if block.type == 'mega' -%}`);
const pEnd = hdr.indexOf(`{%- endif -%}\n          </li>`, pStart);

if (pStart === -1 || pEnd === -1) {
  console.log('SKIP  panel block not located');
} else {
  const panel = `{%- if block.type == 'mega' -%}
              {%- liquid
                assign b = block.settings
                assign edu = linklists[b.edu_menu]
                assign jew = linklists[b.jewel_menu]
                assign tabbed = false
                if b.tab2_label != blank
                  assign tabbed = true
                endif
              -%}
              <div class="mega">
                <div class="mega__in">

                  <div class="mm__main">
                    <div class="mm__row-head mm__row-head--major">
                      {%- if tabbed -%}
                        <div class="mm__tab-bar">
                          <input class="mm__tab-in" type="radio" name="mmtab-{{ block.id }}" id="mmtab-{{ block.id }}-1" checked>
                          <input class="mm__tab-in" type="radio" name="mmtab-{{ block.id }}" id="mmtab-{{ block.id }}-2">
                          <label class="mm__tab" for="mmtab-{{ block.id }}-1">{{ b.tab1_label | default: 'Diamonds' }}</label>
                          <label class="mm__tab" for="mmtab-{{ block.id }}-2">{{ b.tab2_label }}</label>
                        </div>
                      {%- else -%}
                        <h2 class="mm__zone-title">{{ b.zone1_title | default: 'Pre-Designed Rings' }}</h2>
                      {%- endif -%}
                      {%- if b.zone1_all_url != blank -%}
                        <a class="mm__viewall" href="{{ b.zone1_all_url }}">
                          {{ b.zone1_all_label | default: 'View all' }}
                          {% render 'icon', name: 'arrow-right', size: 16 %}
                        </a>
                      {%- endif -%}
                    </div>

                    {%- comment -%}
                      Tab 1 / the untabbed panel. Column order differs per
                      panel — wedding leads with shapes, the others lead with
                      their menu columns — hence shapes_first.
                    {%- endcomment -%}
                    <div class="mm__tab-body mm__tab-body--1">
                      <div class="mm__cols">
                        {%- if b.shapes_first -%}
                          {%- render 'mm-shapes', set: b.shape_set, label: b.shape_label -%}
                        {%- endif -%}

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
                          </div>
                        {%- endfor -%}

                        {%- unless b.shapes_first -%}
                          {%- render 'mm-shapes', set: b.shape_set, label: b.shape_label -%}
                        {%- endunless -%}
                      </div>

                      {%- if b.show_cuts -%}
                        {%- render 'mm-cuts', label: b.cuts_label -%}
                      {%- endif -%}

                      {%- render 'mm-stones',
                          set: b.stone_set,
                          label: b.stone_label,
                          all_url: b.stone_all_url,
                          all_label: b.stone_all_label -%}
                    </div>

                    {%- if tabbed -%}
                      <div class="mm__tab-body mm__tab-body--2">
                        {%- assign t2 = linklists[b.tab2_menu] -%}
                        <div class="mm__cols">
                          {%- for child in t2.links -%}
                            <div class="mm__col">
                              <h3 class="mm__label">{{ child.title }}</h3>
                              <ul class="mm__list">
                                {%- for gc in child.links -%}
                                  <li><a href="{{ gc.url }}">{{ gc.title }}</a></li>
                                {%- endfor -%}
                              </ul>
                            </div>
                          {%- endfor -%}
                        </div>
                        {%- render 'mm-stones',
                            set: b.tab2_stone_set,
                            label: b.tab2_stone_label,
                            all_url: b.tab2_stone_all_url,
                            all_label: b.tab2_stone_all_label -%}
                      </div>
                    {%- endif -%}
                  </div>

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
                            <h3 class="mm__label">{{ b.edu_label | default: 'Diamond Education' }}</h3>
                            <ul class="mm__list mm__list--caps">
                              {%- for link in edu.links -%}
                                <li><a href="{{ link.url }}">{{ link.title }}</a></li>
                              {%- endfor -%}
                            </ul>
                          </div>
                        {%- endif -%}
                        {%- if jew.links.size > 0 -%}
                          <div class="mm__col">
                            <h3 class="mm__label">{{ b.jewel_label | default: 'Jewellery Guide' }}</h3>
                            <ul class="mm__list mm__list--caps">
                              {%- for link in jew.links -%}
                                <li><a href="{{ link.url }}">{{ link.title }}</a></li>
                              {%- endfor -%}
                            </ul>
                          </div>
                        {%- endif -%}
                      </div>
                    {%- endif -%}

                    {%- if b.side_note != blank -%}
                      <p class="mm__note">{{ b.side_note }}</p>
                    {%- endif -%}
                  </div>

                </div>
              </div>
            `;
  hdr = hdr.slice(0, pStart) + panel + hdr.slice(pEnd);
  console.log('  ok  panel markup replaced');
}

/* CSS additions: cuts grid + note. Appended, per the ordering rule. */
if (!hdr.includes('.fye .mm__cuts')) {
  const css = `
/* Cuts grid — 25 items, so it wants more columns and a smaller icon than the
   ten-shape grid. */
.fye .mm__cuts-wrap { margin-top: var(--s8); padding-top: var(--s6); border-top: 1px solid rgba(35, 61, 71, 0.18); }
.fye .mm__cuts {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: var(--s4) var(--s6);
  margin: 0; padding: 0; list-style: none;
}
.fye .mm__cuts li { margin: 0; }
.fye .mm__cuts a {
  display: inline-flex; align-items: center; gap: var(--s3);
  font-size: 14px; font-weight: var(--fw-medium);
  letter-spacing: 0.06em; text-transform: uppercase;
  line-height: 1.25;
}
.fye .mm__cuts img { width: 40px; height: 40px; flex: none; }

.fye .mm__note {
  margin: var(--s6) 0 0;
  font-size: 15px; font-weight: var(--fw-light);
  line-height: 1.5;
  color: var(--ink-soft);
}

/* The tab bar sits in the zone head, so it must not carry the head's own
   bottom rule twice. */
.fye .mm__row-head--major .mm__tab-bar { border: 0; margin: 0; gap: var(--s7); }

@media (max-width: 1280px) {
  .fye .mm__cuts { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
`;
  const at = hdr.lastIndexOf('{% endstylesheet %}');
  hdr = hdr.slice(0, at) + css + hdr.slice(at);
  console.log('  ok  cuts CSS appended');
}

/* Schema: swap the suffix settings for set settings. */
const sOpen = hdr.indexOf('{% schema %}');
const sClose = hdr.indexOf('{% endschema %}');
const schema = JSON.parse(hdr.slice(sOpen + 12, sClose));
const mega = schema.blocks.find((x) => x.type === 'mega');

if (mega) {
  const drop = new Set(['shape_suffix', 'stone_suffix', 'shape_only', 'tab2_stone_suffix']);
  mega.settings = mega.settings.filter((s) => !drop.has(s.id));
  const add = [
    { type: 'select', id: 'shape_set', label: 'Shape grid', options: [
      { value: '', label: 'None' },
      { value: 'engagement', label: 'Engagement (10)' },
      { value: 'wedding', label: 'Wedding (8)' },
      { value: 'eternity', label: 'Eternity (8)' }
    ], default: '' },
    { type: 'checkbox', id: 'shapes_first', label: 'Shapes before the menu columns', default: false },
    { type: 'select', id: 'stone_set', label: 'Coloured stone grid', options: [
      { value: '', label: 'None' },
      { value: 'engagement', label: 'Engagement' },
      { value: 'wedding', label: 'Wedding' },
      { value: 'eternity', label: 'Eternity' }
    ], default: '' },
    { type: 'checkbox', id: 'show_cuts', label: 'Show the 25-cut grid', default: false },
    { type: 'text', id: 'cuts_label', label: 'Cuts heading', default: 'Shop by Shape — All 25 Cuts' },
    { type: 'select', id: 'tab2_stone_set', label: 'Tab 2 stone grid', options: [
      { value: '', label: 'None' },
      { value: 'engagement', label: 'Engagement' },
      { value: 'wedding', label: 'Wedding' },
      { value: 'eternity', label: 'Eternity' }
    ], default: '' },
    { type: 'textarea', id: 'side_note', label: 'Right-zone note' }
  ];
  for (const s of add) {
    if (!mega.settings.some((x) => x.id === s.id)) mega.settings.push(s);
  }
  hdr = hdr.slice(0, sOpen) + '{% schema %}\n' + JSON.stringify(schema, null, 2) + '\n' + hdr.slice(sClose);
  console.log(`  ok  schema: ${mega.settings.length} settings`);
}

await writeFile(HDR, hdr, 'utf8');
console.log(`FIXED ${HDR}`);

/* ==========================================================================
   5. header-group.json — live's content per panel
   ========================================================================== */

const TPL = 'sections/header-group.json';
const doc = JSON.parse(await readFile(TPL, 'utf8'));
const bl = doc.sections.header.blocks;

const content = {
  nav_engagement: {
    url: '/pages/engagement-rings',
    menu: 'mega-engagement',
    zone1_title: 'Engagement Rings',
    zone1_all_url: '/collections/engagement-rings',
    zone1_all_label: 'View All Engagement Rings',
    shape_set: 'engagement', shape_label: 'Shop by Shape', shapes_first: false,
    stone_set: 'engagement', stone_label: 'Shop by Coloured Stone',
    stone_all_url: '/collections/coloured-engagement-ring',
    stone_all_label: 'View All Coloured Stone Rings',
    show_cuts: false,
    side_title: 'The Engagement Ring Guide',
    guide1_cover: `${F}Engagement_Ring_Cover.png?v=1783603372&width=300`,
    guide1_title: 'The Engagement Ring Guide',
    guide1_blurb: '',
    guide1_link: '/pages/engagement-ring-guide',
    guide2_title: '', guide2_cover: '', guide2_blurb: '', guide2_link: '',
    edu_menu: 'mega-edu', edu_label: 'Diamond Education',
    jewel_menu: 'mega-jewellery', jewel_label: 'Jewellery Guide',
    tab2_label: '', side_note: ''
  },
  nav_wedding: {
    url: '/pages/wedding-rings',
    menu: 'mega-wedding',
    zone1_title: 'Wedding Rings',
    zone1_all_url: '/collections/wedding-rings',
    zone1_all_label: 'View All Wedding Rings',
    shape_set: 'wedding', shape_label: 'Diamond & Gemstone Set', shapes_first: true,
    stone_set: 'wedding', stone_label: 'Shop by Coloured Stone',
    stone_all_url: '/collections/coloured-stone-rings',
    stone_all_label: 'View All Coloured Stone Rings',
    show_cuts: false,
    side_title: 'Wedding Ring Guides',
    guide1_cover: `${F}Plain_Wedding_Cover.png?v=1783603372&width=300`,
    guide1_title: 'The Plain Wedding Ring Guide',
    guide1_blurb: '',
    guide1_link: '/pages/plain-wedding-ring-guide',
    guide2_cover: `${F}Diamond_Ring_Guide.png?v=1783603372&width=300`,
    guide2_title: 'The Diamond & Gemset Wedding Ring Guide',
    guide2_blurb: '',
    guide2_link: '/pages/diamond-gemstone-wedding-ring-guide',
    edu_menu: 'mega-edu', edu_label: 'Diamond Education',
    jewel_menu: 'mega-jewellery', jewel_label: 'Jewellery Guide',
    tab2_label: '', side_note: ''
  },
  nav_eternity: {
    url: '/pages/eternity-rings',
    menu: 'mega-eternity',
    zone1_title: 'Eternity Rings',
    zone1_all_url: '/collections/eternity-rings',
    zone1_all_label: 'View All Eternity Rings',
    shape_set: 'eternity', shape_label: 'Shop by Shape', shapes_first: false,
    stone_set: 'eternity', stone_label: 'Shop by Coloured Stone',
    stone_all_url: '/collections/coloured-stone-rings',
    stone_all_label: 'View All Coloured Stone Rings',
    show_cuts: false,
    side_title: 'The Eternity Ring Guide',
    guide1_cover: `${F}Eternity_Ring_Guide_Cover_v3.png?v=1786444086&width=300`,
    guide1_title: 'The Eternity Ring Guide',
    guide1_blurb: '',
    guide1_link: '/pages/eternity-ring-guide',
    guide2_title: '', guide2_cover: '', guide2_blurb: '', guide2_link: '',
    edu_menu: 'mega-edu', edu_label: 'Diamond Education',
    jewel_menu: 'mega-jewellery', jewel_label: 'Jewellery Guide',
    tab2_label: '', side_note: ''
  },
  nav_diamonds: {
    url: '/pages/loose-diamonds-gems',
    menu: 'mega-diamonds',
    zone1_all_url: '/collections/loose-diamonds',
    zone1_all_label: 'View All Loose Diamonds',
    shape_set: '', shapes_first: false,
    stone_set: '',
    show_cuts: true,
    cuts_label: 'Shop by Shape — All 25 Cuts',
    tab1_label: 'Diamonds', tab1_menu: 'mega-diamonds',
    tab2_label: 'Gemstones', tab2_menu: 'mega-gemstones',
    tab2_stone_set: 'engagement',
    tab2_stone_label: 'Shop by Stone',
    tab2_stone_all_url: '/collections/gemstones',
    tab2_stone_all_label: 'View All Loose Gemstones',
    side_title: 'The Diamond & Gemstone Guide',
    guide1_cover: `${F}diamond-and-gemstone-guide-cover.png?v=1786408513&width=300`,
    guide1_title: 'The Diamond & Gemstone Guide',
    guide1_blurb: '',
    guide1_link: '/pages/downloadable-guides',
    guide2_title: '', guide2_cover: '', guide2_blurb: '', guide2_link: '',
    edu_menu: 'mega-learn', edu_label: 'Learn',
    jewel_menu: '', jewel_label: '',
    side_note: 'Not sure where to start? Book a consultation and we’ll source the stone with you.'
  }
};

for (const [id, s] of Object.entries(content)) {
  if (!bl[id]) { console.log(`SKIP  ${id}`); continue; }
  bl[id].settings = { ...bl[id].settings, ...s };
  console.log(`  ok  ${id}`);
}

/* Live's own nav URLs. */
if (bl.nav_contact) bl.nav_contact.settings.url = '/pages/contact-us';
if (bl.nav_guides) bl.nav_guides.settings.url = '/pages/jewellery-guides';

await writeFile(TPL, JSON.stringify(doc, null, 2) + '\n', 'utf8');
console.log(`FIXED ${TPL}`);
