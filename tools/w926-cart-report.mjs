// w926-cart-report.mjs — READ ONLY. Writes nothing, changes nothing.
//
// Why this exists: assets/fye-ui.js is now ~67KB and every file reader
// available to a Claude session truncates around 50KB, so the multi-line
// add-to-cart at the end of the file cannot be read remotely. The cart page
// needs one fact out of it — whether a companion cart line (centre stone,
// side pair, fee, engraving) carries a property linking it back to the ring
// line, and what that property is called.
//
// Run from the repo root:
//     node tools/w926-cart-report.mjs
//
// Then paste the output back into the session. Delete this file once the
// answer is recorded in docs/build-state.md.

import { readFileSync } from 'node:fs';

const FILE = 'assets/fye-ui.js';
const src = readFileSync(FILE, 'utf8');
const lines = src.split('\n');

console.log(`\n${FILE} — ${src.length} bytes, ${lines.length} lines\n`);

// 1. Every candidate link-property name anywhere in the file.
console.log('--- property names mentioned ---');
const props = new Set();
for (const m of src.matchAll(/properties\s*\[\s*['"]([^'"]+)['"]\s*\]/g)) props.add(m[1]);
for (const m of src.matchAll(/['"]properties['"]\s*:\s*\{([^}]*)\}/g)) {
  for (const k of m[1].matchAll(/['"]([^'"]+)['"]\s*:/g)) props.add(k[1]);
}
for (const m of src.matchAll(/properties\s*:\s*\{([^}]*)\}/g)) {
  for (const k of m[1].matchAll(/['"]([^'"]+)['"]\s*:/g)) props.add(k[1]);
}
console.log(props.size ? [...props].map((p) => `  ${p}`).join('\n') : '  (none found)');

// 2. Direct check for the two names the cart page could use.
console.log('\n--- link-property check ---');
for (const name of ['Ring SKU', '_Ring', 'Ring', '_ring', 'ringSku', 'parent']) {
  const n = (src.match(new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  console.log(`  ${JSON.stringify(name).padEnd(12)} ${n} occurrence(s)`);
}

// 3. The add-to-cart region, so the exact shape of each line is visible.
console.log('\n--- /cart/add.js region ---');
const hit = lines.findIndex((l) => l.includes('/cart/add.js'));
if (hit < 0) {
  console.log('  no /cart/add.js found — the form may post normally');
} else {
  const from = Math.max(0, hit - 70);
  const to = Math.min(lines.length, hit + 40);
  console.log(`  lines ${from + 1}-${to} of ${lines.length}\n`);
  for (let i = from; i < to; i++) {
    console.log(String(i + 1).padStart(5) + ' | ' + lines[i]);
  }
}

console.log('\n--- end of report ---\n');
