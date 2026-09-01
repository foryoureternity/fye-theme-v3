// w931-card-heart.mjs — the heart on a product tile, and a header report.
//
//   1. snippets/product-card.liquid — add the heart. It sits OUTSIDE
//      .pcard__link, absolutely positioned over the image: a <button> inside
//      an <a> is invalid HTML and browsers recover from it unpredictably.
//   2. assets/fye-core.css — position the card and the heart.
//   3. Prints the utility-bar region of sections/header-bottom.liquid, which
//      is 52KB and past what a session can read whole. Paste that back and the
//      header count goes in next.
//
// Idempotent; refuses unless each anchor matches exactly once.
//     node tools/w931-card-heart.mjs
// Delete once run and pushed.

import { readFileSync, writeFileSync } from 'node:fs';

const CARD = 'snippets/product-card.liquid';
const CSS = 'assets/fye-core.css';
const HEADER = 'sections/header-bottom.liquid';
const MARKER = 'fye-wishlist-button';

// ------------------------------------------------------------------- card --

let card = readFileSync(CARD, 'utf8');

if (card.includes(MARKER)) {
  console.log(`  ${CARD}: heart already present, skipping`);
} else {
  const anchor = `  </a>
</div>`;
  const hits = card.split(anchor).length - 1;
  if (hits !== 1) {
    console.error(`REFUSED: card anchor matched ${hits} times, expected 1.`);
    process.exit(1);
  }

  const before = card.length;
  card = card.replace(anchor, `  </a>

  {%- comment -%}
    The heart is a sibling of the link, not a child of it: a <button> inside an
    <a> is invalid HTML and browsers recover from it in their own ways. It is
    positioned over the image instead, so it reads as part of the tile while
    staying a separate control for both the mouse and the keyboard.

    A card heart saves the product at its default variant — nothing is
    configured here. The product page's heart saves the configuration.
  {%- endcomment -%}
  <span class="pcard__wish">
    {%- render 'fye-wishlist-button', product: product, context: 'card' -%}
  </span>
</div>`);

  writeFileSync(CARD, card);
  console.log(`  ${CARD}: ${before} -> ${card.length} bytes`);
}

// -------------------------------------------------------------------- css --

const css = readFileSync(CSS, 'utf8');

if (css.includes('.pcard__wish')) {
  console.log(`  ${CSS}: card-heart styles already present, skipping`);
} else {
  const block = `

/* ---- wishlist heart on a product tile — 01/09/2026 --------------------- */
.fye .pcard { position: relative; }
.fye .pcard__wish {
  position: absolute;
  top: var(--s3);
  right: var(--s3);
  z-index: 1;
}
/* Squared, per the design system — the only curves in this theme are the logo
   and the monogram. Ivory rather than white so it reads on a pale ring shot. */
.fye .pcard__wish .wish {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: var(--ivory);
  color: var(--ink);
  border: 0;
  cursor: pointer;
}
.fye .pcard__wish .wish:hover { color: var(--sage); }
`;
  writeFileSync(CSS, css + block);
  console.log(`  ${CSS}: ${css.length} -> ${(css + block).length} bytes`);
}

// ----------------------------------------------------------------- report --

console.log(`\n--- ${HEADER}: utility bar ---\n`);
const lines = readFileSync(HEADER, 'utf8').split('\n');
const marks = [];
lines.forEach((l, i) => {
  if (/cart_url|routes\.cart|icon['"]?,\s*name:\s*['"](bag|cart|search|account|user|heart)/.test(l)) {
    marks.push(i);
  }
});

if (!marks.length) {
  console.log('  no utility icons found — paste me the top 120 lines instead');
} else {
  const from = Math.max(0, marks[0] - 25);
  const to = Math.min(lines.length, marks[marks.length - 1] + 20);
  console.log(`  lines ${from + 1}-${to} of ${lines.length}\n`);
  for (let i = from; i < to; i++) console.log(String(i + 1).padStart(5) + ' | ' + lines[i]);
}
console.log('\n--- end ---\n');
