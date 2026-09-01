// w938-load-wishlist-js.mjs — actually load fye-wishlist.js.
//
// WHAT WENT WRONG. w932 guarded its insert with "does the file already mention
// fye-wishlist.js?" — and main-wishlist.liquid's own header comment says
// "assets/fye-wishlist.js fills the grid on load". So the guard matched prose,
// reported "already applied, skipping", and the <script> tag was never added.
// The page has never loaded its script; every symptom followed from that.
//
// The lesson for later guards: check for the THING, not for words about it.
// This one looks for the script tag itself.
//
//     node tools/w938-load-wishlist-js.mjs
// Delete once run and pushed.

import { readFileSync, writeFileSync } from 'node:fs';

const PAGE = 'sections/main-wishlist.liquid';
const src = readFileSync(PAGE, 'utf8');

if (src.includes("<script src=\"{{ 'fye-wishlist.js' | asset_url }}\"")) {
  console.log('  script tag already present. Nothing to do.');
  process.exit(0);
}

const find = '{% stylesheet %}';
const hits = src.split(find).length - 1;
if (hits !== 1) {
  console.error(`REFUSED: anchor matched ${hits} times, expected 1.`);
  process.exit(1);
}

const replace = `{%- comment -%}
  Page-only. The store lives in fye-ui.js because the hearts are on every page;
  only this page needs the renderer, the share encoding and the price fetches.
  No defer: the script waits for the store itself, so load order cannot leave
  the grid blank again.
{%- endcomment -%}
<script src="{{ 'fye-wishlist.js' | asset_url }}"></script>

{% stylesheet %}`;

writeFileSync(PAGE, src.replace(find, replace));
console.log(`  ${PAGE}: ${src.length} -> ${readFileSync(PAGE, 'utf8').length} bytes`);
console.log('\nDone.\n');
