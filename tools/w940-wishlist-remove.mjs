// w940-wishlist-remove.mjs — a real Remove control on each saved item.
//
// There was one: a small × floated over the corner of the image. Ed did not
// find it, which is the only test that matters. It becomes a labelled Remove
// beside Add to basket — same affordance and same wording as the cart, so the
// two pages behave alike.
//
//     node tools/w940-wishlist-remove.mjs
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
    console.error('  ' + find.slice(0, 90));
    process.exit(1);
  }
  writeFileSync(file, src.replace(find, replace));
  console.log(`  ${file}: ${src.length} -> ${readFileSync(file, 'utf8').length} bytes`);
}

const JS = 'assets/fye-wishlist.js';

// ---- drop the corner cross -------------------------------------------------

edit(
  JS,
  `        (readOnly ? '' :
          '<button type="button" class="wcard__drop" data-wish-remove aria-label="Remove ' +
          esc(title) + '">&times;</button>') +`,
  `        /* The remove control used to be a small cross over the corner of the
           image. It was there and nobody found it, so it is a labelled button
           in the row below now — the same word the cart uses. */`,
  `used to be a small cross`
);

// ---- a labelled one in the actions row -------------------------------------

edit(
  JS,
  `        '<div class="wcard__actions">' +
          (variant && variant.available && !readOnly
            ? '<button type="button" class="btn btn--sm" data-wish-add>Add to basket</button>'
            : '') +
        '</div>' +`,
  `        '<div class="wcard__actions">' +
          (variant && variant.available && !readOnly
            ? '<button type="button" class="btn btn--sm" data-wish-add>Add to basket</button>'
            : '') +
          (readOnly ? '' :
            '<button type="button" class="wcard__remove" data-wish-remove>Remove' +
            '<span class="visually-hidden"> ' + esc(title) + '</span></button>') +
        '</div>' +`,
  `wcard__remove`
);

// ---- styles ----------------------------------------------------------------

edit(
  'sections/main-wishlist.liquid',
  `.fye .wcard__actions { display: flex; flex-wrap: wrap; gap: var(--s2); margin-top: var(--s1); }`,
  `.fye .wcard__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s4);
  margin-top: var(--s1);
}

/* Underlined text, not a second button: removing is destructive and should
   not compete with Add to basket for the eye. Matches the cart's Remove. */
.fye .wcard__remove {
  background: none;
  border: 0;
  padding: 0;
  font: inherit;
  font-size: var(--fs-fine);
  color: var(--ink-soft);
  border-bottom: 1px solid currentColor;
  line-height: 1.2;
  cursor: pointer;
}
.fye .wcard__remove:hover { color: var(--sage); }`,
  `.fye .wcard__remove {`
);

console.log('\nDone.\n');
