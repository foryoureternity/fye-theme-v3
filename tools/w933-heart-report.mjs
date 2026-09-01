// w933-heart-report.mjs — READ ONLY. Where is the heart already rendered?
//
// main-product.liquid is 58KB, past what a session can read whole. Ed asked
// for hearts on the product page, grid cards, related rows, search results and
// the cart. Grid cards are done via product-card.liquid; this reports on the
// rest so the remaining wiring is anchored on what is really there.
//
//     node tools/w933-heart-report.mjs
// Delete once its answer is recorded.

import { readFileSync, readdirSync } from 'node:fs';

const dirs = ['sections', 'snippets', 'templates'];
const needles = ['fye-wishlist-button', 'data-fye-wish', 'wishlist', 'wish'];

console.log('\n=== where the heart is rendered ===\n');

for (const dir of dirs) {
  for (const name of readdirSync(dir)) {
    const path = dir + '/' + name;
    let src;
    try { src = readFileSync(path, 'utf8'); } catch (e) { continue; }
    const lines = src.split('\n');
    lines.forEach((l, i) => {
      if (needles.some((n) => l.includes(n))) {
        console.log(String(i + 1).padStart(5) + ' | ' + path);
        console.log('      | ' + l.trim().slice(0, 150));
      }
    });
  }
}

// The product form's own hooks, so a form-context heart can be placed exactly.
console.log('\n=== main-product.liquid: buy-box form and title hooks ===\n');
const mp = readFileSync('sections/main-product.liquid', 'utf8').split('\n');
mp.forEach((l, i) => {
  if (/data-fye-atc|data-fye-variants|<h1|product-form|data-fye-product/.test(l)) {
    console.log(String(i + 1).padStart(5) + ' | ' + l.trim().slice(0, 150));
  }
});

console.log('\n--- end ---\n');
