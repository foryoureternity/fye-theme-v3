/* ============================================================================
   build-diamond-tabs.mjs — 28/08/2026
   ----------------------------------------------------------------------------
     cd ~/Dropbox/GIT-repositaries/fye-theme-v3
     node docs/tools/build-diamond-tabs.mjs

   Delete once run and synced.

   Adds the DIAMONDS / GEMSTONES tab pair to a mega panel. CSS-only: hidden
   radio inputs plus :checked sibling selectors, so it works with no
   JavaScript, is keyboard operable, and cannot break if a script fails.

   Radios rather than <details>: tabs are mutually exclusive by nature, which
   is exactly what a radio group is, and it gives arrow-key navigation free.
   Each panel needs unique input names, hence the block id in the name.

   WHAT IS AND IS NOT HERE
   Each tab renders menu columns and, optionally, a coloured-stone grid — the
   same parts the other panels use. What is NOT here is live's 35-cut shape
   grid: only ten shape icons exist in the store (icon101-110, already in use),
   so the other 25 cuts live as inline SVG inside live's hand-written mega HTML
   block. Extracting those is its own job; this build gives the diamonds tab
   its links and leaves the 35-cut artwork for that pass.
   ========================================================================== */

import { readFile, writeFile } from 'node:fs/promises';

const FILE = 'sections/header-bottom.liquid';
let src = await readFile(FILE, 'utf8');

/* ---- 1. markup: wrap the left zone's body in tabs when tab2 is set ------- */

const findMain = `                    <div class="mm__cols">
                      {%- render 'mm-shapes', suffix: b.shape_suffix, label: b.shape_label, only: b.shape_only -%}`;

const replaceMain = `                    {%- if b.tab2_label != blank -%}
                      {%- comment -%}
                        CSS-only tabs: hidden radios + :checked siblings. Names
                        carry the block id so two panels on one page cannot
                        share a radio group.
                      {%- endcomment -%}
                      <div class="mm__tabs">
                        <input class="mm__tab-in" type="radio" name="mmtab-{{ block.id }}" id="mmtab-{{ block.id }}-1" checked>
                        <input class="mm__tab-in" type="radio" name="mmtab-{{ block.id }}" id="mmtab-{{ block.id }}-2">
                        <div class="mm__tab-bar">
                          <label class="mm__tab" for="mmtab-{{ block.id }}-1">{{ b.tab1_label | default: 'Diamonds' }}</label>
                          <label class="mm__tab" for="mmtab-{{ block.id }}-2">{{ b.tab2_label }}</label>
                        </div>

                        <div class="mm__tab-body mm__tab-body--1">
                          <div class="mm__cols">
                            {%- assign t1 = linklists[b.tab1_menu] -%}
                            {%- for child in t1.links -%}
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
                        </div>

                        <div class="mm__tab-body mm__tab-body--2">
                          <div class="mm__cols">
                            {%- assign t2 = linklists[b.tab2_menu] -%}
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
                              suffix: b.tab2_stone_suffix,
                              label: b.tab2_stone_label,
                              all_url: b.tab2_stone_all_url,
                              all_label: b.tab2_stone_all_label -%}
                        </div>
                      </div>
                    {%- endif -%}

                    <div class="mm__cols">
                      {%- render 'mm-shapes', suffix: b.shape_suffix, label: b.shape_label, only: b.shape_only -%}`;

if (src.includes('mm__tab-bar')) {
  console.log('SKIP  tabs already present');
} else if (!src.includes(findMain)) {
  console.log('SKIP  could not find the left-zone columns');
} else {
  src = src.replace(findMain, replaceMain);
  console.log('  ok  tab markup added');
}

/* ---- 2. CSS ------------------------------------------------------------- */

const css = `
/* ---- panel tabs, 28/08/2026 --------------------------------------------
   CSS-only: the radios are visually hidden but focusable, so the tabs are
   keyboard operable and work with no JavaScript. */
.fye .mm__tab-in {
  position: absolute;
  width: 1px; height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}
.fye .mm__tab-bar {
  display: flex;
  gap: var(--s8);
  margin-bottom: var(--s7);
  border-bottom: 1px solid rgba(35, 61, 71, 0.18);
}
.fye .mm__tab {
  padding: 0 0 var(--s3);
  margin-bottom: -1px;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-family: var(--font-display);
  font-size: 24px;
  letter-spacing: var(--tr-h2);
  line-height: 1.2;
  text-transform: uppercase;
  color: rgba(35, 61, 71, 0.45);
  transition: color var(--dur) var(--ease), border-color var(--dur) var(--ease);
}
.fye .mm__tab:hover { color: var(--sage); }

.fye .mm__tab-body { display: none; }
.fye .mm__tab-in:nth-of-type(1):checked ~ .mm__tab-body--1,
.fye .mm__tab-in:nth-of-type(2):checked ~ .mm__tab-body--2 { display: block; }
.fye .mm__tab-in:nth-of-type(1):checked ~ .mm__tab-bar .mm__tab:nth-of-type(1),
.fye .mm__tab-in:nth-of-type(2):checked ~ .mm__tab-bar .mm__tab:nth-of-type(2) {
  color: var(--ink);
  border-bottom-color: var(--ink);
}
/* Focus must be visible on the LABEL, since the input itself is hidden. */
.fye .mm__tab-in:focus-visible ~ .mm__tab-bar .mm__tab {
  outline: 2px solid var(--teal);
  outline-offset: 3px;
}
`;

if (!src.includes('panel tabs, 28/08/2026')) {
  const at = src.lastIndexOf('{% endstylesheet %}');
  src = src.slice(0, at) + css + src.slice(at);
  console.log('  ok  tab CSS appended');
}

/* ---- 3. schema, mutated as JSON ----------------------------------------- */

const sOpen = src.indexOf('{% schema %}');
const sClose = src.indexOf('{% endschema %}');
const schema = JSON.parse(src.slice(sOpen + 12, sClose));
const mega = schema.blocks.find((b) => b.type === 'mega');

if (mega && !mega.settings.some((s) => s.id === 'tab2_label')) {
  mega.settings.push(
    { type: 'header', content: 'Tabs (optional)' },
    { type: 'paragraph', content: 'Leave the second tab label empty for a panel with no tabs.' },
    { type: 'text', id: 'tab1_label', label: 'Tab 1 label', default: 'Diamonds' },
    { type: 'link_list', id: 'tab1_menu', label: 'Tab 1 menu' },
    { type: 'text', id: 'tab2_label', label: 'Tab 2 label' },
    { type: 'link_list', id: 'tab2_menu', label: 'Tab 2 menu' },
    { type: 'text', id: 'tab2_stone_suffix', label: 'Tab 2 stone suffix', info: 'Empty hides the stone grid.' },
    { type: 'text', id: 'tab2_stone_label', label: 'Tab 2 stone heading', default: 'Shop by Stone' },
    { type: 'url', id: 'tab2_stone_all_url', label: 'Tab 2 stone view-all link' },
    { type: 'text', id: 'tab2_stone_all_label', label: 'Tab 2 stone view-all label', default: 'View all loose gemstones' }
  );
  src = src.slice(0, sOpen) + '{% schema %}\n' + JSON.stringify(schema, null, 2) + '\n' + src.slice(sClose);
  console.log(`  ok  schema: ${mega.settings.length} settings`);
}

await writeFile(FILE, src, 'utf8');
console.log(`FIXED ${FILE}`);

/* ---- 4. wire the diamonds panel ---------------------------------------- */

const TPL = 'sections/header-group.json';
const doc = JSON.parse(await readFile(TPL, 'utf8'));
const dia = doc.sections.header.blocks.nav_diamonds;

if (dia) {
  dia.settings = {
    ...dia.settings,
    menu: '',
    tab1_label: 'Diamonds',
    tab1_menu: 'mega-diamonds',
    tab2_label: 'Gemstones',
    tab2_menu: 'mega-gemstones',
    tab2_stone_suffix: '',
    shape_suffix: '',
    stone_suffix: ''
  };
  await writeFile(TPL, JSON.stringify(doc, null, 2) + '\n', 'utf8');
  console.log(`FIXED ${TPL} — diamonds panel tabbed`);
}
