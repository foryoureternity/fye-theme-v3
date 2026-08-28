/* ============================================================================
   fix-mega-css-schema.mjs — 28/08/2026
   ----------------------------------------------------------------------------
     cd ~/Dropbox/GIT-repositaries/fye-theme-v3
     node docs/tools/fix-mega-css-schema.mjs

   Delete once run and synced.

   rebuild-mega-live.mjs landed the new two-zone MARKUP but reported:
     SKIP  could not locate the mega CSS block
     SKIP  schema block not found

   So the page had new markup styled by the old single-zone rules — which is
   exactly the mess in the screenshot: a 380px right column with nothing
   telling the left column to be a grid, columns overlapping, and no styling at
   all for the cards and side lists.

   Both failures were mine for anchoring on long verbatim strings. This script
   uses anchors that cannot miss:

   1. CSS is APPENDED at the end of the stylesheet. Same-specificity selectors
      later in a sheet win, so the new rules override the old block without
      needing to find it. Leftover orphan rules (mm__divider, mm__guides) style
      nothing that exists now and are harmless.

   2. The SCHEMA is parsed as JSON, mutated, and written back — no string
      matching at all. The settings array is rebuilt for the mega block, so
      running this twice is safe.
   ========================================================================== */

import { readFile, writeFile } from 'node:fs/promises';

const FILE = 'sections/header-bottom.liquid';
let src = await readFile(FILE, 'utf8');

/* ==========================================================================
   1. CSS, appended
   ========================================================================== */

const css = `
/* ============================================================================
   MEGA PANELS v2 — 28/08/2026, the live two-zone design.
   APPENDED at the end deliberately: these override the earlier single-zone
   rules above without depending on finding them. Later wins at equal
   specificity.
   ========================================================================== */

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
  align-items: start;
}
.fye .has-mega .mega__in--wide { grid-template-columns: minmax(0, 1fr); }

.fye .mm__main { min-width: 0; }
.fye .mm__side {
  min-width: 0;
  padding-left: var(--s10);
  border-left: 1px solid rgba(35, 61, 71, 0.18);
}

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
  white-space: nowrap;
}
.fye .mm__viewall {
  display: inline-flex; align-items: center; gap: var(--s3);
  font-size: 15px; font-weight: var(--fw-medium);
  letter-spacing: 0.08em; text-transform: uppercase;
  white-space: nowrap;
}
.fye .mm__label {
  display: block;
  margin: 0 0 var(--s5);
  font-size: 13px; font-weight: var(--fw-regular);
  letter-spacing: 0.16em; text-transform: uppercase;
  color: rgba(35, 61, 71, 0.55);
  white-space: nowrap;
}

.fye .mm__cols { display: flex; gap: var(--s11); align-items: flex-start; }
.fye .mm__col { min-width: 0; }
.fye .mm__list { margin: 0; padding: 0; list-style: none; }
.fye .mm__list li { margin: 0 0 var(--s4); }
.fye .mm__list a {
  display: inline-flex; align-items: center; gap: var(--s3);
  font-size: 16px; font-weight: var(--fw-medium);
  letter-spacing: 0.06em; text-transform: uppercase;
  line-height: 1.3;
}
.fye .mm__list--caps a { font-size: 15px; letter-spacing: 0.05em; }

/* Column-major: live reads Round/Pear, Princess/Emerald. Row count comes from
   the snippet as an inline style, since panels carry different shape counts. */
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
  white-space: nowrap;
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
.fye .mm__dot--pale { border-color: rgba(35, 61, 71, 0.28); }

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
.fye .mm__side-cols .mm__list a { white-space: normal; }

@media (max-width: 1280px) {
  .fye .has-mega .mega__in { grid-template-columns: minmax(0, 1fr) 320px; gap: 0 var(--s8); }
  .fye .mm__side { padding-left: var(--s8); }
  .fye .mm__cols { gap: var(--s9); }
  .fye .mm__stones { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
@media (max-width: 1100px) {
  .fye .mm__cols { flex-wrap: wrap; gap: var(--s8); }
  .fye .mm__stones { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
`;

if (src.includes('MEGA PANELS v2')) {
  console.log('SKIP  v2 CSS already appended');
} else {
  const closer = '{% endstylesheet %}';
  const at = src.lastIndexOf(closer);
  if (at === -1) {
    console.log('SKIP  no {% endstylesheet %} found');
  } else {
    src = src.slice(0, at) + css + src.slice(at);
    console.log('  ok  v2 CSS appended at the end of the stylesheet');
  }
}

/* ==========================================================================
   2. schema, mutated as JSON
   ========================================================================== */

const sOpen = src.indexOf('{% schema %}');
const sClose = src.indexOf('{% endschema %}');

if (sOpen === -1 || sClose === -1) {
  console.log('SKIP  no schema tags');
} else {
  const raw = src.slice(sOpen + 12, sClose);
  const schema = JSON.parse(raw);
  const mega = (schema.blocks || []).find((b) => b.type === 'mega');

  if (!mega) {
    console.log('SKIP  no mega block in the schema');
  } else {
    mega.name = 'Link with mega panel';
    mega.settings = [
      { type: 'text', id: 'title', label: 'Title' },
      { type: 'url', id: 'url', label: 'Link' },
      { type: 'link_list', id: 'menu', label: 'Columns menu', info: 'Each top-level item becomes a column; its children are the links in it. A column whose title mentions metal renders colour swatches.' },

      { type: 'header', content: 'Left zone' },
      { type: 'text', id: 'zone1_title', label: 'Zone heading', default: 'Pre-Designed Rings' },
      { type: 'url', id: 'zone1_all_url', label: 'View-all link' },
      { type: 'text', id: 'zone1_all_label', label: 'View-all label', default: 'View all' },

      { type: 'header', content: 'Shape grid' },
      { type: 'text', id: 'shape_suffix', label: 'Collection suffix', info: 'e.g. engagement-rings. Empty hides the grid.' },
      { type: 'text', id: 'shape_label', label: 'Heading', default: 'Shop by Shape' },
      { type: 'text', id: 'shape_only', label: 'Shapes to show', info: 'Comma list of stems in order, e.g. round-brilliant,princess-cut. Empty shows all ten.' },

      { type: 'header', content: 'Coloured stone grid' },
      { type: 'text', id: 'stone_suffix', label: 'Collection suffix', info: 'e.g. engagement-rings. Empty hides the grid.' },
      { type: 'text', id: 'stone_label', label: 'Heading', default: 'Shop by Coloured Stone' },
      { type: 'url', id: 'stone_all_url', label: 'View-all link' },
      { type: 'text', id: 'stone_all_label', label: 'View-all label', default: 'View all coloured stone rings' },

      { type: 'header', content: 'Right zone' },
      { type: 'text', id: 'side_title', label: 'Zone heading', default: 'The Guide' },
      { type: 'text', id: 'guide1_cover', label: 'Guide 1 cover URL' },
      { type: 'text', id: 'guide1_title', label: 'Guide 1 title' },
      { type: 'textarea', id: 'guide1_blurb', label: 'Guide 1 blurb' },
      { type: 'url', id: 'guide1_link', label: 'Guide 1 link' },
      { type: 'text', id: 'guide2_cover', label: 'Guide 2 cover URL' },
      { type: 'text', id: 'guide2_title', label: 'Guide 2 title' },
      { type: 'textarea', id: 'guide2_blurb', label: 'Guide 2 blurb' },
      { type: 'url', id: 'guide2_link', label: 'Guide 2 link' },
      { type: 'link_list', id: 'edu_menu', label: 'Education menu' },
      { type: 'text', id: 'edu_label', label: 'Education heading', default: 'Diamond education' },
      { type: 'link_list', id: 'jewel_menu', label: 'Jewellery guide menu' },
      { type: 'text', id: 'jewel_label', label: 'Jewellery heading', default: 'Jewellery guide' }
    ];

    const out = '{% schema %}\n' + JSON.stringify(schema, null, 2) + '\n';
    src = src.slice(0, sOpen) + out + src.slice(sClose);
    console.log(`  ok  schema rebuilt: mega block now has ${mega.settings.length} settings`);
  }
}

await writeFile(FILE, src, 'utf8');
console.log(`FIXED ${FILE}`);
