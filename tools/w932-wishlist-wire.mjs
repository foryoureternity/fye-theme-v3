// w932-wishlist-wire.mjs — join the wishlist up.
//
//   1. sections/header-bottom.liquid — the wishlist icon points at
//      "/a/wishlist", the T4S app proxy, which does not exist in v3. Point it
//      at the real page and give it a count badge. Reuses .hdr__count, the
//      class the basket badge already uses, so the two cannot drift apart.
//   2. sections/main-wishlist.liquid — load assets/fye-wishlist.js, and drop
//      an icon render I cannot verify exists in snippets/icon.liquid.
//   3. assets/fye-core.css — the small button used on a saved card.
//
// Idempotent; refuses unless each anchor matches exactly once.
//     node tools/w932-wishlist-wire.mjs
// Delete once run and pushed.

import { readFileSync, writeFileSync } from 'node:fs';

const HEADER = 'sections/header-bottom.liquid';
const PAGE = 'sections/main-wishlist.liquid';
const CSS = 'assets/fye-core.css';

function edit(file, find, replace, skipIf) {
  const src = readFileSync(file, 'utf8');
  if (skipIf && src.includes(skipIf)) {
    console.log(`  ${file}: already applied, skipping`);
    return;
  }
  const hits = src.split(find).length - 1;
  if (hits !== 1) {
    console.error(`REFUSED: anchor matched ${hits} times in ${file}, expected 1.`);
    console.error(find.slice(0, 90));
    process.exit(1);
  }
  const next = src.replace(find, replace);
  writeFileSync(file, next);
  console.log(`  ${file}: ${src.length} -> ${next.length} bytes`);
}

// ----------------------------------------------------------------- header --

edit(
  HEADER,
  `          <a class="hdr__icon" href="/a/wishlist" aria-label="{{ 'general.wishlist' | t }}">{% render 'icon', name: 'heart' %}</a>`,
  `          {%- comment -%}
            Was "/a/wishlist" — the T4S app proxy, which does not exist in v3.
            The count is written by fye-ui.js from localStorage, so it cannot
            be rendered here: Liquid has no idea what this shopper saved. It
            starts hidden and stays hidden at zero.
          {%- endcomment -%}
          <a class="hdr__icon" href="/pages/wishlist" aria-label="{{ 'general.wishlist' | t }}">
            {% render 'icon', name: 'heart' %}
            <span class="hdr__count" data-fye-wish-count hidden></span>
          </a>`,
  'data-fye-wish-count'
);

// ------------------------------------------------------------------- page --

edit(
  PAGE,
  `        <button type="button" class="btn btn--outline" data-wish-share="copy">
          {%- render 'icon', name: 'link', class: 'icon--sm' -%}
          <span>Copy link</span>
        </button>`,
  `        <button type="button" class="btn btn--outline" data-wish-share="copy">
          <span>Copy link</span>
        </button>`,
  'data-wish-share="copy">\n          <span>Copy link'
);

edit(
  PAGE,
  `{% stylesheet %}`,
  `{%- comment -%}
  Page-only. The store lives in fye-ui.js because the hearts are everywhere;
  only this page needs the renderer, the share encoding and the price fetches.
{%- endcomment -%}
<script src="{{ 'fye-wishlist.js' | asset_url }}" defer></script>

{% stylesheet %}`,
  'fye-wishlist.js'
);

// -------------------------------------------------------------------- css --

const css = readFileSync(CSS, 'utf8');
if (css.includes('.btn--sm')) {
  console.log(`  ${CSS}: .btn--sm already present, skipping`);
} else {
  const block = `

/* ---- small button, for a saved card — 01/09/2026 ----------------------- */
.fye .btn--sm {
  padding: var(--s2) var(--s4);
  font-size: var(--fs-fine);
  min-height: 40px;
}
`;
  writeFileSync(CSS, css + block);
  console.log(`  ${CSS}: ${css.length} -> ${(css + block).length} bytes`);
}

console.log('\nDone.\n');
