// w939-wishlist-polish.mjs
//
//   1. THE EMPTY STATE THAT WOULD NOT HIDE. Every panel on the page is toggled
//      with the `hidden` attribute, but .wish-page__empty and friends declare
//      display:flex/grid — and a class rule with a display beats the browser's
//      own [hidden] { display: none }. So nothing was ever actually hidden.
//      One scoped rule fixes the lot.
//   2. WORDING. The page is not only rings — loose diamonds today, other
//      jewellery soon (Ed). Every "ring" on this page becomes "item".
//   3. The gallery heart's ground, again, at higher specificity: a section's
//      {% stylesheet %} can load after fye-core.css, which would explain a
//      transparent background that is not transparent.
//   4. Reports every .wish background rule in the theme, so if it is STILL
//      wrong I fix the real one rather than guessing a third time.
//
//     node tools/w939-wishlist-polish.mjs
// Delete once run and pushed.

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

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

const CSS = 'assets/fye-core.css';
const css = readFileSync(CSS, 'utf8');

if (css.includes('.fye .fye-wish [hidden]')) {
  console.log(`  ${CSS}: already applied, skipping`);
} else {
  writeFileSync(CSS, css + `

/* ---- wishlist page: make [hidden] mean hidden — 01/09/2026 -------------
   The panels declare display:flex and display:grid, and a class rule with a
   display beats the browser's own [hidden] { display: none }. Without this the
   empty state sits under a full grid of saved items, which is exactly what it
   did. !important because the point is to out-rank the layout rules above. */
.fye .fye-wish [hidden] { display: none !important; }

/* The gallery heart's ground, at a specificity that survives a section
   stylesheet loading after this file. */
.fye .pdp__wish-over .wish--lg,
.fye .pdp__stage .wish--lg {
  background: transparent;
  border: 0;
  box-shadow: none;
}
`);
  console.log(`  ${CSS}: ${css.length} -> ${readFileSync(CSS, 'utf8').length} bytes`);
}

edit(
  'sections/main-wishlist.liquid',
  `        <h1 class="wish-page__title">{{ s.heading | default: 'Your saved rings' }}</h1>`,
  `        <h1 class="wish-page__title">{{ s.heading | default: 'Your wishlist' }}</h1>`,
  `default: 'Your wishlist'`
);

edit(
  'sections/main-wishlist.liquid',
  `    { "type": "text", "id": "heading", "label": "Heading", "default": "Your saved rings" },`,
  `    { "type": "text", "id": "heading", "label": "Heading", "default": "Your wishlist" },`,
  `"default": "Your wishlist"`
);

edit(
  'sections/main-wishlist.liquid',
  `      "default": "Tap the heart on any ring and it will appear here, exactly as you configured it."`,
  `      "default": "Tap the heart on anything you love and it will appear here, exactly as you set it up."`,
  `anything you love`
);

edit(
  'templates/page.wishlist.json',
  `        "heading": "Your saved rings",`,
  `        "heading": "Your wishlist",`,
  `"heading": "Your wishlist"`
);

edit(
  'templates/page.wishlist.json',
  `        "empty_copy": "Tap the heart on any ring and it will appear here, exactly as you configured it.",`,
  `        "empty_copy": "Tap the heart on anything you love and it will appear here, exactly as you set it up.",`,
  `anything you love`
);

edit(
  'assets/fye-wishlist.js',
  `    summary.textContent = readOnly
      ? 'A list someone shared with you — ' + list.length +
        (list.length === 1 ? ' ring.' : ' rings.')
      : list.length + (list.length === 1 ? ' ring saved.' : ' rings saved.');`,
  `    /* "item", not "ring" — the site sells loose diamonds today and will sell
       other jewellery soon. Ed, 01/09/2026. */
    var noun = list.length === 1 ? ' item' : ' items';
    summary.textContent = readOnly
      ? 'A list someone shared with you — ' + list.length + noun + '.'
      : list.length + noun + ' saved.';`,
  `"item", not "ring"`
);

edit(
  'assets/fye-wishlist.js',
  `      if (window.confirm('Remove every saved ring from this device?')) {`,
  `      if (window.confirm('Remove everything saved on this device?')) {`,
  `Remove everything saved`
);

edit(
  'assets/fye-wishlist.js',
  `    var text = 'Rings I have saved at For Your Eternity';`,
  `    var text = 'What I have saved at For Your Eternity';`,
  `What I have saved`
);

console.log('\n=== every .wish background rule in the theme ===\n');
for (const dir of ['assets', 'sections', 'snippets']) {
  for (const name of readdirSync(dir)) {
    if (!/\.(css|liquid)$/.test(name)) continue;
    const path = dir + '/' + name;
    readFileSync(path, 'utf8').split('\n').forEach((l, i) => {
      if (/\.wish|\.pdp__wish/.test(l) && /background|\{/.test(l)) {
        console.log(String(i + 1).padStart(5) + ' | ' + path + '  ' + l.trim().slice(0, 110));
      }
    });
  }
}
console.log('\n--- end ---\n');
