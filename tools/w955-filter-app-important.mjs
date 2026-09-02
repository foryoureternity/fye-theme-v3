// w955-filter-app-important.mjs — single-use patch. Run once, then delete it.
//
//   node tools/w955-filter-app-important.mjs
//
// w954's rule for the cloud-search filter rows had no effect: the rows still
// measure 16×16 after a reload. The theme's compiled stylesheet loads BEFORE
// the app's, so the app's own rules win on source order and the label never
// took the 44px height.
//
// This is the case !important is actually for — overriding a third party you
// do not control and cannot reorder. Both properties need it: without the
// display change, min-height on an inline <label> does nothing.
//
// Also raises the app's min/max price fields, which measured 32px tall.
//
// Replaces w954's rule in place rather than adding a second one.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const F = resolve(root, 'sections/main-collection.liquid');

const FIND = `.fye .cloud-search-filter-value {
  display: flex;
  align-items: center;
  min-height: 44px;
}`;

const REPLACE = `.fye .cloud-search-filter-value {
  /* !important because the app's stylesheet loads AFTER the theme's compiled
     one, so it wins on source order — the first attempt at this rule had no
     effect at all. Both properties need it: min-height on an inline <label>
     does nothing without the display change. */
  display: flex !important;
  align-items: center !important;
  min-height: 44px !important;
}

/* The min/max price inputs, same panel, measured 32px tall. */
.fye .cloud-search-num-field__input,
.fye .cloud-search-text-field__input {
  min-height: 44px !important;
}`;

const GUARD = 'min-height: 44px !important;';

function count(h, n) {
  let c = 0, i = h.indexOf(n);
  while (i !== -1) { c++; i = h.indexOf(n, i + n.length); }
  return c;
}

if (!existsSync(F)) { console.error('MISSING: ' + F); process.exit(1); }

const before = readFileSync(F, 'utf8');

if (before.includes(GUARD)) {
  console.log('skip  sections/main-collection.liquid — already applied');
  process.exit(0);
}

const hits = count(before, FIND);
if (hits !== 1) {
  console.error('REFUSING: anchor matched ' + hits + ', expected 1 — was w954 run? Nothing written.');
  process.exit(1);
}

const after = before.replace(FIND, REPLACE);
writeFileSync(F, after, 'utf8');

const check = readFileSync(F, 'utf8');
if (!check.includes(GUARD)) { console.error('FAILED to verify write'); process.exit(1); }

console.log('ok    sections/main-collection.liquid  ' + before.length + ' -> ' + check.length + ' chars');
console.log('\nIf the rows STILL measure 16px after this, the app renders them in a');
console.log('shadow root and theme CSS cannot reach them at all — that would be an');
console.log('app-settings job, and worth knowing rather than patching further.');
