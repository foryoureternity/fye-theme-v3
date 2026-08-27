/* ============================================================================
   fix-home-03.mjs — the nine gallery photographs, 27/08/2026
   ----------------------------------------------------------------------------
     cd ~/Dropbox/GIT-repositaries/fye-theme-v3
     node docs/tools/fix-home-03.mjs

   Delete once run and synced.

   Item 10. The SECTION was already right — three rotating sets of three, all
   nine images selectable in the editor, one image_picker each. What was wrong
   was the CONTENT: my references came from an older version of the template
   and pointed at different files than live renders. These nine are read
   straight off the live theme, so the section now shows the pieces Ed means.

   Parsed and re-serialised as JSON rather than string-replaced: the values are
   nested three deep and a literal match on a settings blob is exactly the kind
   of edit that silently hits the wrong block.

   Also corrected while here, both read off live:
   - the gallery links point at the jewellery gallery page, not "#"
   - "10% discount on your wedding ring" in the homepage guarantee. Mine said
     20%, which is the ETERNITY page's offer — a real content error, not a
     layout one, and the sort of thing that turns into a customer argument.
   ========================================================================== */

import { readFile, writeFile } from 'node:fs/promises';

const FILE = 'templates/index.json';

/* Read off the live theme, in live's block order. */
const SETS = [
  {
    image_lead: 'shopify://shop_images/teal-sapphire-engagement-ring-platinum-marquise-diamonds.jpg',
    image_top: 'shopify://shop_images/curved-wedding-ring-pair-18ct-yellow-gold-matt-finish.jpg',
    image_bottom: 'shopify://shop_images/emerald-cut-diamond-and-marquise-emerald-pendant-platinum.jpg'
  },
  {
    image_lead: 'shopify://shop_images/oval-diamond-solitaire-18ct-yellow-gold-diamond-set-shoulders.jpg',
    image_top: 'shopify://shop_images/platinum-grain-set-and-white-gold-court-wedding-ring-pair.jpg',
    image_bottom: 'shopify://shop_images/emerald-and-tanzanite-wedding-rings-18ct-yellow-and-white-gold.jpg'
  },
  {
    image_lead: 'shopify://shop_images/001-oval-solitaire-yellow-gold-2-17ct-photo-2-three-quarter.jpg',
    image_top: 'shopify://shop_images/curved-diamond-set-platinum-wedding-ring.jpg',
    image_bottom: 'shopify://shop_images/platinum-diamond-and-emerald-pendant-on-chain.jpg'
  }
];

const GALLERY_LINK = 'shopify://pages/jewellery-gallery';

const raw = await readFile(FILE, 'utf8');
const doc = JSON.parse(raw);

let notes = [];

/* ---- the gallery -------------------------------------------------------- */

const galleryKey = Object.keys(doc.sections).find(
  (k) => doc.sections[k].type === 'fye-gallery-promo'
);

if (!galleryKey) {
  console.log('FAIL  no fye-gallery-promo section in index.json');
  process.exit(1);
}

const gallery = doc.sections[galleryKey];
const order = gallery.block_order || Object.keys(gallery.blocks || {});

if (order.length !== 3) {
  console.log(`FAIL  expected 3 sets, found ${order.length}`);
  process.exit(1);
}

order.forEach((blockId, i) => {
  const block = gallery.blocks[blockId];
  block.settings = { ...block.settings, ...SETS[i], link: GALLERY_LINK };
  notes.push(`      set ${i + 1} (${blockId}) — 3 images + link`);
});

/* ---- the guarantee percentage ------------------------------------------- */

const guaranteeKey = Object.keys(doc.sections).find(
  (k) =>
    doc.sections[k].type === 'fye-media-text' &&
    (doc.sections[k].settings?.heading || '').toLowerCase().includes('guarantee')
);

if (guaranteeKey) {
  const g = doc.sections[guaranteeKey].settings;
  if (g.body && g.body.includes('20% discount on your wedding ring')) {
    g.body = g.body.replace(
      '20% discount on your wedding ring',
      '10% discount on your wedding ring'
    );
    notes.push('      guarantee — 20% corrected to 10% (live value)');
  } else if (g.body && g.body.includes('10% discount on your wedding ring')) {
    notes.push('      guarantee — already 10%, left alone');
  } else {
    notes.push('      guarantee — discount line not found, left alone');
  }
}

await writeFile(FILE, JSON.stringify(doc, null, 2) + '\n', 'utf8');

console.log(`FIXED ${FILE}`);
notes.forEach((n) => console.log(n));
