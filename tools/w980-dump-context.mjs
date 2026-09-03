// w980-dump-context.mjs — read-only. Prints; writes nothing. Delete after use.
//
//   node tools/w980-dump-context.mjs
//
// Two things a session needs before composing new chapter templates, and both
// are expensive to read in full:
//
//   1. the tail of docs/build-state.md (the current session block)
//   2. the SELECT OPTIONS, RANGE GRIDS and BLOCK TYPES of every section the
//      new templates will compose from
//
// (2) is the one that matters. A select value outside its options or a range
// value off its step grid makes Shopify reject the whole template silently, so
// composing from memory is how a template gets refused. This prints the legal
// vocabulary compactly instead of 18 whole section files.
//
// Also prints fye-chapter-nav's seq_ arrays, which decide what previous/next
// on every guide chapter points at.

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const S = resolve(root, 'sections');

const WANT = [
  'heading-template',
  'fye-chapter-nav',
  'fye-rich-text',
  'fye-terms',
  'fye-facts',
  'fye-table',
  'fye-chips',
  'fye-checklist',
  'fye-callout',
  'fye-steps',
  'fye-cards',
  'fye-two-ways',
  'fye-media-text',
  'fye-xref',
  'fye-faq',
  'fye-guide-download',
  'fye-related',
  'fye-consultation'
];

// ---- 1. the build-state tail ---------------------------------------------

const DOC = resolve(root, 'docs/build-state.md');
if (existsSync(DOC)) {
  const lines = readFileSync(DOC, 'utf8').split(String.fromCharCode(10));
  // Find the last top-level session heading and print from there.
  let start = -1;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (/^#\s+Session/.test(lines[i])) { start = i; break; }
  }
  if (start === -1) start = Math.max(0, lines.length - 120);
  console.log('===== docs/build-state.md, from the last session heading =====');
  console.log(lines.slice(start).join(String.fromCharCode(10)).trim());
  console.log('');
} else {
  console.log('(docs/build-state.md not found)');
}

// ---- 2. the legal vocabulary ---------------------------------------------

function schemaOf(type) {
  const f = resolve(S, type + '.liquid');
  if (!existsSync(f)) return { missing: true };
  const src = readFileSync(f, 'utf8');
  const a = src.indexOf('{% schema %}');
  const b = src.indexOf('{% endschema %}');
  if (a === -1 || b <= a) return { noSchema: true };
  try {
    return { schema: JSON.parse(src.slice(a + 12, b)), src };
  } catch (err) {
    return { broken: err.message };
  }
}

function describe(list, indent) {
  const out = [];
  for (const s of list || []) {
    if (!s || !s.id) continue;
    if (s.type === 'select') {
      out.push(indent + s.id + '  select: ' + (s.options || []).map((o) => o.value).join(' | ') +
               (s.default !== undefined ? '   (default ' + s.default + ')' : ''));
    } else if (s.type === 'range') {
      out.push(indent + s.id + '  range: ' + s.min + '-' + s.max + ' step ' + (s.step || 1) +
               (s.default !== undefined ? '   (default ' + s.default + ')' : ''));
    } else if (s.type === 'checkbox') {
      out.push(indent + s.id + '  checkbox' + (s.default !== undefined ? '   (default ' + s.default + ')' : ''));
    } else {
      out.push(indent + s.id + '  ' + s.type);
    }
  }
  return out;
}

console.log('===== SECTION VOCABULARY =====');
for (const type of WANT) {
  const r = schemaOf(type);
  console.log('');
  if (r.missing) { console.log('## ' + type + '   *** NO SUCH SECTION ***'); continue; }
  if (r.noSchema) { console.log('## ' + type + '   (no schema block)'); continue; }
  if (r.broken) { console.log('## ' + type + '   SCHEMA DOES NOT PARSE: ' + r.broken); continue; }

  const sc = r.schema;
  console.log('## ' + type + '   "' + (sc.name || '') + '"');
  const settings = describe(sc.settings, '     ');
  if (settings.length) console.log(settings.join(String.fromCharCode(10)));

  for (const b of sc.blocks || []) {
    console.log('     block "' + b.type + '"' + (b.limit ? ' limit ' + b.limit : ''));
    const bs = describe(b.settings, '        ');
    if (bs.length) console.log(bs.join(String.fromCharCode(10)));
  }
  if (sc.max_blocks) console.log('     max_blocks: ' + sc.max_blocks);
}

// ---- 3. chapter-nav sequences --------------------------------------------

console.log('');
console.log('===== fye-chapter-nav seq_ ARRAYS =====');
const navFile = resolve(S, 'fye-chapter-nav.liquid');
if (existsSync(navFile)) {
  const src = readFileSync(navFile, 'utf8');
  const re = /assign\s+(seq_\w+)\s*=\s*'([^']*)'/g;
  let m, found = 0;
  while ((m = re.exec(src)) !== null) {
    found++;
    console.log('');
    console.log(m[1] + ':');
    m[2].split(',').forEach((h, i) => console.log('   ' + (i + 1) + '. ' + h.trim()));
  }
  if (!found) console.log('(no seq_ assigns matched — check the file by hand)');
} else {
  console.log('(fye-chapter-nav.liquid not found)');
}

// ---- 4. what sections exist at all ---------------------------------------

console.log('');
console.log('===== ALL fye-* SECTIONS PRESENT =====');
console.log(readdirSync(S)
  .filter((f) => f.endsWith('.liquid'))
  .map((f) => f.replace('.liquid', ''))
  .filter((n) => n.startsWith('fye-'))
  .join('  '));
