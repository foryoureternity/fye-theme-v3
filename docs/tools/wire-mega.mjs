/* ============================================================================
   wire-mega.mjs — 28/08/2026
   ----------------------------------------------------------------------------
     cd ~/Dropbox/GIT-repositaries/fye-theme-v3
     node docs/tools/wire-mega.mjs

   Delete once run and synced.

   WHY NOTHING DROPPED DOWN
   The five mega blocks in header-group.json had no `menu` setting at all —
   they only ever carried `title` and `url`. So every panel rendered as an
   empty div: present in the DOM, zero height, invisible. Not a hover bug, not
   a CSS bug. There was nothing in them.

   Four menus have now been created in the store (mega-engagement,
   mega-wedding, mega-eternity, mega-diamonds), each with column headings as
   top-level items and links beneath. This wires them in, along with the shape
   and stone suffixes and a guides menu per panel.

   ONE HONEST LIMIT, WORTH KNOWING
   Only ENGAGEMENT gets the shape and stone grids. The per-shape and per-stone
   collections only exist with an -engagement-rings suffix: live's own wedding
   panel points every coloured-stone link at /collections/coloured-stone-rings
   with a comment saying no per-stone wedding collections exist yet. Rather
   than generate seventeen links to collections that would 404, the wedding,
   eternity and diamond panels leave both suffixes empty and the grids simply
   do not render. Fill the suffix in the editor the day those collections exist
   and the grid appears with no code change.

   Also switching JEWELLERY GUIDES from mega to a plain link: with no menu of
   its own it was rendering a chevron and an empty panel, which is worse than
   a link that works. Give it a menu later and flip it back.
   ========================================================================== */

import { readFile, writeFile } from 'node:fs/promises';

const FILE = 'sections/header-group.json';
const doc = JSON.parse(await readFile(FILE, 'utf8'));
const hdr = doc.sections.header;
const b = hdr.blocks;

/* Logos, so the header is configured in the file rather than the editor. */
hdr.settings.logo_url = 'https://cdn.shopify.com/s/files/1/0972/5391/7056/files/TER_Logo_Teal_f8aa5b79-0138-4319-8fba-25f42c08e217.svg?v=1774511367';
hdr.settings.logo_mb_url = 'https://cdn.shopify.com/s/files/1/0972/5391/7056/files/fye-brand-mark.webp?v=1785320235';

const panels = {
  nav_engagement: {
    menu: 'mega-engagement',
    zone1_title: 'Pre-Designed Rings',
    zone1_all_url: '/collections/engagement-rings',
    zone1_all_label: 'View all engagement rings',
    /* The only panel with per-shape and per-stone collections. */
    shape_suffix: 'engagement-rings',
    shape_label: 'Shop by Shape',
    stone_suffix: 'engagement-rings',
    stone_label: 'Shop by Coloured Stone',
    stone_all_url: '/collections/coloured-engagement-ring',
    stone_all_label: 'View all coloured stone rings',
    guides_menu: 'footer-guides',
    guides_title: 'Guides & Advice'
  },
  nav_wedding: {
    menu: 'mega-wedding',
    zone1_title: 'Pre-Designed Rings',
    zone1_all_url: '/collections/wedding-rings',
    zone1_all_label: 'View all wedding rings',
    shape_suffix: '',
    stone_suffix: '',
    guides_menu: 'footer-guides',
    guides_title: 'Guides & Advice'
  },
  nav_eternity: {
    menu: 'mega-eternity',
    zone1_title: 'Pre-Designed Rings',
    zone1_all_url: '/collections/eternity-rings',
    zone1_all_label: 'View all eternity rings',
    shape_suffix: '',
    stone_suffix: '',
    guides_menu: 'footer-guides',
    guides_title: 'Guides & Advice'
  },
  nav_diamonds: {
    menu: 'mega-diamonds',
    zone1_title: 'Diamonds & Gemstones',
    zone1_all_url: '/collections/loose-diamonds',
    zone1_all_label: 'View all loose stones',
    shape_suffix: '',
    stone_suffix: '',
    guides_menu: 'footer-diamonds',
    guides_title: 'Learn About Stones'
  }
};

for (const [id, settings] of Object.entries(panels)) {
  if (!b[id]) {
    console.log(`SKIP  ${id} not in header-group.json`);
    continue;
  }
  b[id].settings = { ...b[id].settings, ...settings };
  console.log(`  ok  ${id} -> ${settings.menu}`);
}

/* An empty panel with a chevron is worse than a link that works. */
if (b.nav_guides && b.nav_guides.type === 'mega') {
  b.nav_guides.type = 'base';
  delete b.nav_guides.settings.menu;
  console.log('  ok  nav_guides: mega -> base (no menu of its own yet)');
}

await writeFile(FILE, JSON.stringify(doc, null, 2) + '\n', 'utf8');
console.log(`FIXED ${FILE}`);
