// w942-wishlist-atc.mjs — Add to basket on shared items, plus a report.
//
// PATCH. A shared list rendered read-only, which sensibly stopped a recipient
// editing the sender's notes — but it also hid Add to basket, and a recipient
// buying the ring their partner picked is the whole point of sharing. The
// saved companion lines travel in the share link, so adding from a shared item
// puts the exact configuration in the basket without visiting the product page
// at all.
//
// REPORT. Clicking a shared item opens /products/<handle>?variant=<id>, which
// restores metal and quality and NOTHING else — no centre stone, no side pair,
// no engraving. Rebuilding the buy box from the URL needs the chooser
// internals, and fye-ui.js is past what a session can read whole. This prints
// exactly the functions involved.
//
//     node tools/w942-wishlist-atc.mjs
// Delete once its answer is recorded.

import { readFileSync, writeFileSync } from 'node:fs';

const JS = 'assets/fye-wishlist.js';
const src = readFileSync(JS, 'utf8');

const find = `          (variant && variant.available && !readOnly
            ? '<button type="button" class="btn btn--sm" data-wish-add>Add to basket</button>'
            : '') +`;

if (src.includes('shared item can be bought')) {
  console.log(`  ${JS}: already applied, skipping`);
} else {
  const hits = src.split(find).length - 1;
  if (hits !== 1) {
    console.error(`REFUSED: anchor matched ${hits} times, expected 1.`);
    process.exit(1);
  }
  /* A shared item can be bought. The lines came with the link, so this adds
     the sender's exact configuration without a trip to the product page. */
  writeFileSync(JS, src.replace(find, `          (variant && variant.available
            ? '<button type="button" class="btn btn--sm" data-wish-add>Add to basket</button>'
            : '') +`));
  console.log(`  ${JS}: ${src.length} -> ${readFileSync(JS, 'utf8').length} bytes`);
}

// ---- report ----------------------------------------------------------------

const ui = readFileSync('assets/fye-ui.js', 'utf8');
const lines = ui.split('\n');

function dump(label, re, span) {
  console.log(`\n=== ${label} ===\n`);
  let found = 0;
  lines.forEach((l, i) => {
    if (found >= 3) return;
    if (!re.test(l)) return;
    found++;
    const from = Math.max(0, i - 2);
    const to = Math.min(lines.length, i + span);
    for (let j = from; j < to; j++) console.log(String(j + 1).padStart(5) + ' | ' + lines[j]);
    console.log('   ...');
  });
  if (!found) console.log('  not found');
}

dump('setMode', /function setMode\s*\(/, 40);
dump('stoneOf / paintStone', /function (stoneOf|paintStone)\s*\(/, 30);
dump('modeOf / feeVariant / chosenChip', /function (modeOf|feeVariant|chosenChip)\s*\(/, 14);
dump('chosenVariant', /function chosenVariant\s*\(/, 30);
dump('engraving block', /data-fye-engrave/, 12);
dump('does anything read ?variant= today', /searchParams|location\.search|URLSearchParams/, 8);

console.log('\n--- end ---\n');
