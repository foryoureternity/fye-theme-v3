/* ============================================================================
   audit-mega-css.mjs — read-only. 28/08/2026
   ----------------------------------------------------------------------------
     cd ~/Dropbox/GIT-repositaries/fye-theme-v3
     node docs/tools/audit-mega-css.mjs

   The theme has the new markup and snippets, so the layout is still wrong for
   one of two reasons: a duplicate rule from the v1 block winning, or the
   .mega__in grid getting an unexpected third child.

   Prints every declaration of the selectors that decide the layout, in file
   order, plus the grid children the markup actually emits. Changes nothing.
   ========================================================================== */

import { readFile } from 'node:fs/promises';

const src = await readFile('sections/header-bottom.liquid', 'utf8');
const lines = src.split('\n');

const watch = [
  'mega__in',
  'mm__cols',
  'mm__main',
  'mm__side',
  'has-mega .mega',
  'mm__zone'
];

console.log('---- layout selectors, in file order ----');
lines.forEach((l, i) => {
  const t = l.trim();
  if (!t.startsWith('.fye') && !t.startsWith('.mm') && !t.startsWith('.mega')) return;
  if (watch.some((w) => t.includes(w))) console.log(`${String(i + 1).padStart(5)}  ${t.slice(0, 110)}`);
});

console.log('\n---- v2 block present? ----');
console.log(src.includes('MEGA PANELS v2') ? '  yes' : '  NO — the append did not happen');
console.log('  v1 banner present:', src.includes('MEGA PANELS — 28/08/2026') ? 'yes (duplicate rules)' : 'no');

console.log('\n---- direct children the panel emits ----');
const start = src.indexOf('<div class="mega__in');
const end = src.indexOf('</div>\n              </div>', start);
if (start === -1) {
  console.log('  could not find the panel markup');
} else {
  const region = src.slice(start, end === -1 ? start + 4000 : end);
  region.split('\n').forEach((l) => {
    const t = l.trim();
    if (/^<div class="mm__(main|side)|^\{%- if has_side|^<section class="mm__zone/.test(t))
      console.log(`  ${t.slice(0, 80)}`);
  });
}

console.log('\n---- schema setting count ----');
const so = src.indexOf('{% schema %}');
const sc = src.indexOf('{% endschema %}');
if (so > -1 && sc > -1) {
  try {
    const schema = JSON.parse(src.slice(so + 12, sc));
    const mega = (schema.blocks || []).find((b) => b.type === 'mega');
    console.log(`  mega block settings: ${mega ? mega.settings.length : 'block missing'}`);
    if (mega) console.log(`  has side_title: ${mega.settings.some((s) => s.id === 'side_title')}`);
  } catch (e) {
    console.log(`  SCHEMA IS NOT VALID JSON: ${e.message}`);
  }
}
