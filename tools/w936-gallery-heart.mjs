// w936-gallery-heart.mjs — the large heart over the gallery.
//
//   1. sections/main-product.liquid — a large heart at the top right of the
//      image stage.
//   2. assets/fye-ui.js — the gallery is OUTSIDE the buy-box form, so
//      btn.closest('form') finds nothing and the click would silently do
//      nothing. A form-context heart now falls back to the page's one buy box.
//      This is why the button is wired here and not just styled.
//   3. assets/fye-core.css — make the stage a positioning context.
//
// Idempotent; refuses unless each anchor matches exactly once.
//     node tools/w936-gallery-heart.mjs
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
  writeFileSync(file, src.replace(find, replace));
  console.log(`  ${file}: ${src.length} -> ${readFileSync(file, 'utf8').length} bytes`);
}

// ---- the overlay ----------------------------------------------------------

edit(
  'sections/main-product.liquid',
  `      <div class="pdp__gallery" data-fye-gallery>
        <div class="pdp__stage">`,
  `      <div class="pdp__gallery" data-fye-gallery>
        <div class="pdp__stage">
          {%- comment -%}
            The large heart, over the top right of the image. Form context: it
            saves the configuration currently in the buy box, exactly as the
            button under Add to bag does — the two are the same control in two
            places, and both light up together.

            It sits OUTSIDE the buy-box form, so fye-ui.js resolves the form by
            looking for the page's one buy box rather than by walking up from
            the button. Without that it would look right and do nothing.
          {%- endcomment -%}
          <div class="pdp__wish-over">
            {%- render 'fye-wishlist-button', product: p, context: 'form', size: 'lg' -%}
          </div>`,
  `pdp__wish-over`
);

// ---- find the form even when the button is outside it ---------------------

edit(
  'assets/fye-ui.js',
  `  function fromForm(btn) {
    var form = btn.closest('form');`,
  `  function fromForm(btn) {
    /* The gallery heart lives outside the buy-box form, so closest() finds
       nothing. A product page has exactly one buy box, so falling back to it
       is unambiguous — and without this the overlay heart would look correct
       and do nothing at all. */
    var form = btn.closest('form');
    if (!form) {
      var island = document.querySelector('form [data-fye-variants]');
      form = island ? island.closest('form') : null;
    }`,
  `The gallery heart lives outside`
);

// ---- css -------------------------------------------------------------------

const CSS = 'assets/fye-core.css';
const css = readFileSync(CSS, 'utf8');

if (css.includes('.pdp__stage { position: relative')) {
  console.log(`  ${CSS}: already applied, skipping`);
} else {
  const block = `

/* The gallery heart is positioned against the stage. Declared here rather
   than assumed — the panels stack, and a missing positioning context would
   send the heart to the top of the page. 01/09/2026. */
.fye .pdp__stage { position: relative; }
`;
  writeFileSync(CSS, css + block);
  console.log(`  ${CSS}: ${css.length} -> ${(css + block).length} bytes`);
}

console.log('\nDone.\n');
