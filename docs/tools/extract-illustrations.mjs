/* ============================================================================
   extract-illustrations.mjs — lift the FYE line drawings out of template JSON
   ----------------------------------------------------------------------------
     cd ~/Dropbox/GIT-repositaries/fye-theme-v3
     node docs/tools/extract-illustrations.mjs

   Writes snippets/illustration.liquid. Delete this script once it has run.

   WHY
   The `shipping` section ("why choose us") carries eight bespoke FYE line
   drawings as raw inline SVG in its block settings — the faceted diamond, the
   interlocking rings, the shield and tick. Each is 2-4KB of path data, and the
   same eight appear on page.engagement-rings, page.wedding-rings and
   page.eternity-rings. Left in the templates that is ~90KB of duplicated
   artwork, edited in three places, and already inconsistent: the wedding
   page's resize drawing has a corrupted attribute (`stroke-w idth`) that the
   engagement page's does not.

   So they come out of the content and into the theme, keyed by name. A block
   then says `"icon": "diamond"` instead of carrying 3KB of SVG, and the
   drawing is edited once.

   Extracted from page.engagement-rings.json specifically — its copies are the
   clean ones.

   These are ILLUSTRATIONS, not UI icons, which is why they get their own
   snippet rather than joining snippets/icon.liquid: they carry their own
   viewBox and proportions, they are decorative, and icon.liquid's contract
   (24x24, 1.3px stroke, currentColor) does not fit them.
   ========================================================================== */

import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const OLD = resolve('../fye-shopify-theme');
const SRC = resolve(OLD, 'templates/page.engagement-rings.json');
const OUT = resolve('snippets/illustration.liquid');

/* In the order the blocks appear in the section. The text is what the block
   says on the page, and is only used here to check the order has not moved. */
const NAMES = [
  { name: 'diamond',   expect: 'ethically sourced' },
  { name: 'pricing',   expect: 'competitive pricing' },
  { name: 'rings',     expect: 'matching wedding' },
  { name: 'education', expect: 'educational approach' },
  { name: 'custom',    expect: 'customisable' },
  { name: 'shipping',  expect: 'shipping' },
  { name: 'resize',    expect: 'resizing' },
  { name: 'warranty',  expect: 'warranty' }
];

function stripJsonComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter((line) => !/^\s*\/\//.test(line))
    .join('\n');
}

const json = JSON.parse(stripJsonComments(await readFile(SRC, 'utf8')));

const section = Object.values(json.sections).find((s) => s.type === 'shipping');
if (!section) {
  console.log('No `shipping` section in page.engagement-rings.json. Nothing done.');
  process.exit(1);
}

const order = section.block_order || Object.keys(section.blocks);
const blocks = order.map((id) => section.blocks[id]).filter(Boolean);

if (blocks.length !== NAMES.length) {
  console.log(`Expected ${NAMES.length} blocks, found ${blocks.length}. Check NAMES against the template before trusting the output.`);
}

const parts = [];
let ok = true;

blocks.forEach((b, i) => {
  const meta = NAMES[i];
  if (!meta) return;
  const text = (b.settings?.text || '').toLowerCase();
  const svg = (b.settings?.html || '').trim();

  if (!svg.startsWith('<svg')) {
    console.log(`WARN  ${meta.name}: block ${i + 1} has no SVG`);
    ok = false;
    return;
  }
  if (!text.includes(meta.expect)) {
    console.log(`WARN  ${meta.name}: expected text containing "${meta.expect}", got "${text.slice(0, 50)}"`);
    ok = false;
  }

  /* Strip the editor cruft Illustrator leaves behind. The serif namespaces do
     nothing in a browser and the fixed 100% width/height fights the box the
     section puts these in. */
  const cleaned = svg
    .replace(/\s+xmlns:(xlink|serif)="[^"]*"/g, '')
    .replace(/\s+xml:space="preserve"/g, '')
    .replace(/\s+width="100%"/g, '')
    .replace(/\s+height="100%"/g, '')
    .replace(/stroke-w\s+idth/g, 'stroke-width')
    .replace(/\s{2,}/g, ' ')
    .trim();

  parts.push({ name: meta.name, svg: cleaned, label: b.settings?.text || '' });
  console.log(`OK    ${meta.name}  (${Math.round(cleaned.length / 1024 * 10) / 10}KB)`);
});

const lines = [];
lines.push('{%- comment -%}');
lines.push('  illustration — the FYE line drawings.');
lines.push('');
lines.push('  Usage:  {% render \'illustration\', name: \'diamond\' %}');
lines.push('');
lines.push('  Bespoke artwork drawn for the brand: 0.75px stroke, Eternal Teal, each');
lines.push('  with its own viewBox and proportions. Used by the `shipping` section');
lines.push('  ("why choose us") on the ring pages.');
lines.push('');
lines.push('  NOT the same thing as snippets/icon.liquid. Those are UI icons on a fixed');
lines.push('  24x24 grid at 1.3px in currentColor; these are decorative illustrations');
lines.push('  at their own scale. Do not merge the two.');
lines.push('');
lines.push('  Generated by docs/tools/extract-illustrations.mjs from the old theme\'s');
lines.push('  template JSON, where all eight were pasted into block settings and');
lines.push('  duplicated across three pages. Edit them HERE now.');
lines.push('');
lines.push('  Decorative, so the SVG carries aria-hidden from the calling section.');
lines.push('{%- endcomment -%}');
lines.push('{%- case name -%}');
for (const p of parts) {
  lines.push(`  {%- when '${p.name}' -%}`);
  lines.push(`    ${p.svg}`);
}
lines.push('{%- endcase -%}');

await writeFile(OUT, lines.join('\n'), 'utf8');

console.log(`\n${parts.length} illustration(s) written to ${OUT}`);
if (!ok) console.log('Some warnings above — check the names match the drawings before pushing.');
