// w935-wishlist-buttons.mjs — label the buy-box heart, and report the gallery.
//
//   1. snippets/fye-wishlist-button.liquid — when a label is given, the button
//      becomes a proper labelled control: heart + text, uppercase per the
//      design system's button casing.
//   2. sections/main-product.liquid — the heart under Add to bag gets
//      "Add to wishlist" beside it.
//   3. assets/fye-core.css — styles for the labelled and the large overlay
//      variants.
//   4. Prints the PDP gallery markup so the large overlay heart can be
//      anchored exactly, rather than guessed at.
//
// Idempotent; refuses unless each anchor matches exactly once.
//     node tools/w935-wishlist-buttons.mjs
// Delete once run and pushed.

import { readFileSync, writeFileSync } from 'node:fs';

function edit(file, find, replace, skipIf) {
  const src = readFileSync(file, 'utf8');
  if (skipIf && src.includes(skipIf)) {
    console.log(`  ${file}: already applied, skipping`);
    return;
  }
  const hits = src.split(find).length - 1;
  if (hits !== 1) {
    console.error(`REFUSED: anchor matched ${hits} times in ${file}, expected 1.`);
    console.error('  ' + find.slice(0, 100));
    process.exit(1);
  }
  const next = src.replace(find, replace);
  writeFileSync(file, next);
  console.log(`  ${file}: ${src.length} -> ${next.length} bytes`);
}

// ---- the buy-box heart gets its words -------------------------------------

edit(
  'sections/main-product.liquid',
  `            {%- render 'fye-wishlist-button', product: p, context: 'form' -%}`,
  `            {%- render 'fye-wishlist-button', product: p, context: 'form', label: 'Add to wishlist' -%}`,
  `label: 'Add to wishlist'`
);

// ---- a labelled heart is a different shape to an icon-only one ------------

edit(
  'snippets/fye-wishlist-button.liquid',
  `        class="wish{% if label == blank %} wish--icon{% endif %}"`,
  `        class="wish{% if label == blank %} wish--icon{% else %} wish--labelled{% endif %}{% if size == 'lg' %} wish--lg{% endif %}"`,
  `wish--labelled`
);

// ---- css -------------------------------------------------------------------

const CSS = 'assets/fye-core.css';
const css = readFileSync(CSS, 'utf8');

if (css.includes('.wish--labelled')) {
  console.log(`  ${CSS}: already applied, skipping`);
} else {
  const block = `

/* ---- wishlist button variants — 01/09/2026 ----------------------------- */

/* Labelled: heart plus words, under Add to bag. Uppercase with the button
   tracking, because the design system reserves that casing for buttons and
   this is one. Not a filled button — it must not compete with Add to bag. */
.fye .wish--labelled {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--s2);
  width: 100%;
  min-height: 44px;
  padding: var(--s3) var(--s4);
  background: none;
  border: var(--hairline);
  color: var(--ink);
  font: inherit;
  font-size: var(--fs-fine);
  font-weight: var(--fw-medium);
  letter-spacing: var(--tr-button, 0.2em);
  text-transform: uppercase;
  cursor: pointer;
  transition: color var(--dur, 220ms) ease, border-color var(--dur, 220ms) ease;
}
.fye .wish--labelled:hover { color: var(--sage); border-color: var(--sage); }
.fye .wish--labelled.is-on { color: var(--ink); border-color: var(--ink); }

/* The large overlay heart on the gallery. Ivory ground so it holds up over a
   pale ring shot; squared, like everything else in this system. */
.fye .wish--lg {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  background: var(--ivory);
  border: 0;
  color: var(--ink);
  cursor: pointer;
  transition: color var(--dur, 220ms) ease;
}
.fye .wish--lg:hover { color: var(--sage); }
.fye .wish--lg svg { width: 24px; height: 24px; }

.fye .pdp__wish-over {
  position: absolute;
  top: var(--s4);
  right: var(--s4);
  z-index: 2;
}
`;
  writeFileSync(CSS, css + block);
  console.log(`  ${CSS}: ${css.length} -> ${(css + block).length} bytes`);
}

// ---- report ----------------------------------------------------------------

console.log('\n=== main-product.liquid: gallery region ===\n');
const mp = readFileSync('sections/main-product.liquid', 'utf8').split('\n');
const marks = [];
mp.forEach((l, i) => {
  if (/pdp__media|pdp__stage|pdp__gallery|data-fye-stage|pdp__thumbs|class="pdp__left/.test(l)) marks.push(i);
});
if (!marks.length) {
  console.log('  nothing matched — paste me lines 230-380 instead');
} else {
  const from = Math.max(0, marks[0] - 12);
  const to = Math.min(mp.length, marks[0] + 55);
  console.log(`  lines ${from + 1}-${to} of ${mp.length}\n`);
  for (let i = from; i < to; i++) console.log(String(i + 1).padStart(5) + ' | ' + mp[i]);
}
console.log('\n--- end ---\n');
