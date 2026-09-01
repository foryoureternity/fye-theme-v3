// w927-cart-report.mjs — READ ONLY. Writes nothing, changes nothing.
//
// Replaces w926, which matched the "/cart/add.js" written inside a banner
// COMMENT at line 549 and printed the wrong region. This one ignores comment
// lines when hunting for the real call, and prints the tail regardless.
//
// Run from the repo root:
//     node tools/w927-cart-report.mjs
//
// Delete tools/w926-cart-report.mjs and this file once the answer is in
// docs/build-state.md.

import { readFileSync } from 'node:fs';

const FILE = 'assets/fye-ui.js';
const lines = readFileSync(FILE, 'utf8').split('\n');

const show = (title, from, to) => {
  from = Math.max(0, from);
  to = Math.min(lines.length, to);
  console.log(`\n--- ${title} (lines ${from + 1}-${to}) ---\n`);
  for (let i = from; i < to; i++) console.log(String(i + 1).padStart(5) + ' | ' + lines[i]);
};

// A line that is only a comment tells us nothing about what the code does.
const isComment = (l) => {
  const t = l.trim();
  return t.startsWith('*') || t.startsWith('//') || t.startsWith('/*');
};

console.log(`\n${FILE} — ${lines.length} lines`);

// 1. Every line mentioning the link property, with context.
console.log('\n=== "Ring SKU" in context ===');
const ringHits = [];
lines.forEach((l, i) => { if (l.includes('Ring SKU') || /\bRing\b/.test(l)) ringHits.push(i); });
if (!ringHits.length) console.log('  none');
ringHits.forEach((i) => show(`around line ${i + 1}`, i - 12, i + 13));

// 2. The real add-to-cart call — last non-comment mention.
console.log('\n=== /cart/add.js, code only ===');
const addHits = lines
  .map((l, i) => (l.includes('/cart/add') && !isComment(l) ? i : -1))
  .filter((i) => i >= 0);
if (!addHits.length) {
  console.log('  none outside comments');
} else {
  console.log('  found at lines: ' + addHits.map((i) => i + 1).join(', '));
  const at = addHits[addHits.length - 1];
  show('add-to-cart', at - 80, at + 50);
}

// 3. The tail, which no remote reader can reach.
show('tail of file', lines.length - 90, lines.length);

console.log('\n--- end of report ---\n');
