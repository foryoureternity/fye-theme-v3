// w934-heart-fixes.mjs — three things the w933 report found.
//
//   1. sections/main-product.liquid renders the heart with no context, so it
//      defaults to 'card' — the product page would save the ring UNCONFIGURED,
//      which is the exact failure the whole build exists to avoid.
//   2. snippets/fye-page-type.liquid still maps '/a/wishlist', the dead T4S
//      proxy. The page is /pages/wishlist now.
//   3. fye-ui.js's form-context reader falls back to `document` for the title
//      and image, so on a page with no [data-fye-product] wrapper it could
//      save the header logo as the ring's picture. Scope both to the PDP.
//
// fye-stone-product.liquid is left alone deliberately: a loose stone has no
// configuration, so 'card' is the right context there.
//
// Idempotent; refuses unless each anchor matches exactly once.
//     node tools/w934-heart-fixes.mjs
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

edit(
  'sections/main-product.liquid',
  `{%- render 'fye-wishlist-button', product: p -%}`,
  `{%- comment -%}
              context: 'form' — on a product page the heart saves what the
              shopper has actually chosen (metal, quality, centre stone, side
              pair, engraving), read from the buy box at the moment of the
              click. Without it the snippet defaults to 'card' and saves the
              bare product, which is what live did and the reason a shopper
              could lose ten minutes of configuring.
            {%- endcomment -%}
            {%- render 'fye-wishlist-button', product: p, context: 'form' -%}`,
  `context: 'form'`
);

edit(
  'snippets/fye-page-type.liquid',
  `elsif path contains '/a/wishlist'`,
  `elsif path contains '/pages/wishlist'`,
  `/pages/wishlist`
);

edit(
  'assets/fye-ui.js',
  `    var scope = form.closest('[data-fye-product]') || document;
    var titleEl = scope.querySelector('[data-fye-product-title]') || document.querySelector('h1');
    var imgEl = scope.querySelector('[data-fye-stage] img') || scope.querySelector('img');`,
  `    /* Scoped deliberately. A bare scope.querySelector('img') on a page with
       no product wrapper walks the whole document and finds the header logo,
       which would then be saved as the ring's picture. Better no image than
       the wrong one — the wishlist page fetches the real one anyway, and only
       falls back to this for a product that has since been unpublished. */
    var scope = form.closest('[data-fye-product]') || document;
    var titleEl = scope.querySelector('[data-fye-product-title]') ||
                  document.querySelector('.pdp__title') ||
                  document.querySelector('h1');
    var imgEl = scope.querySelector('[data-fye-stage] img') ||
                document.querySelector('.pdp__media img, .pdp__stage img, .pdp__gallery img');`,
  `Better no image than`
);

console.log('\nDone.\n');
