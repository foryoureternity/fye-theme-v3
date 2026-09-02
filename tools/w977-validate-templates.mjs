// w977-validate-templates.mjs — read-only. Reports; changes nothing.
//
//   node tools/w977-validate-templates.mjs                    all templates
//   node tools/w977-validate-templates.mjs page.sapphire-guide  just one
//
// WHY: the seven gemstone templates were pushed, and Shopify did not take
// them — page.sapphire-guide.json is absent from the theme while
// page.ring-settings.json (same batch, same porter) is present at 16KB. A
// rejected template is SILENT: the page falls back to the default page
// template, which is why the sapphire page shows a title banner and the page
// body and nothing else.
//
// Shopify rejects a whole template when it references something a section's
// schema does not declare. This checks each template against the real
// {% schema %} of each v3 section:
//
//   1. section type exists in sections/
//   2. every BLOCK TYPE used is declared by that section
//   3. every setting whose schema type is `range` is within min/max AND on the
//      step grid — an off-step value silently kills the template (learned
//      01/09/2026 with overlay: 45 on a step-2 range)
//   4. every setting whose schema type is `select` uses one of its options
//
// Unknown SETTING KEYS are reported as notes, not faults: Shopify ignores
// settings a schema no longer declares, which is how the T4S leftovers in the
// ported templates are harmless.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const T = resolve(root, 'templates');
const S = resolve(root, 'sections');

const only = process.argv[2] || null;

const schemaCache = new Map();

function schemaFor(type) {
  if (schemaCache.has(type)) return schemaCache.get(type);
  const f = resolve(S, type + '.liquid');
  let out = null;
  if (existsSync(f)) {
    const src = readFileSync(f, 'utf8');
    const open = src.indexOf('{% schema %}');
    const close = src.indexOf('{% endschema %}');
    if (open !== -1 && close > open) {
      try {
        out = JSON.parse(src.slice(open + 12, close));
      } catch (err) {
        out = { __broken: err.message };
      }
    }
  }
  schemaCache.set(type, out);
  return out;
}

function settingMap(list) {
  const m = new Map();
  for (const s of list || []) {
    if (s && s.id) m.set(s.id, s);
  }
  return m;
}

function checkSettings(map, values, where, faults, notes) {
  for (const [key, val] of Object.entries(values || {})) {
    const def = map.get(key);
    if (!def) {
      notes.push(where + ': setting "' + key + '" not in schema (ignored by Shopify)');
      continue;
    }
    if (def.type === 'range' && typeof val === 'number') {
      const min = Number(def.min), max = Number(def.max), step = Number(def.step || 1);
      if (val < min || val > max) {
        faults.push(where + ': range "' + key + '" = ' + val + ' outside ' + min + '-' + max);
      } else {
        const offset = (val - min) / step;
        if (Math.abs(offset - Math.round(offset)) > 1e-9) {
          faults.push(where + ': range "' + key + '" = ' + val +
                      ' is off the step grid (min ' + min + ', step ' + step + ')');
        }
      }
    }
    if (def.type === 'select' && Array.isArray(def.options)) {
      const ok = def.options.some((o) => String(o.value) === String(val));
      if (!ok && val !== '' && val !== null) {
        faults.push(where + ': select "' + key + '" = "' + val + '" is not one of its options');
      }
    }
  }
}

function validate(file) {
  const faults = [];
  const notes = [];
  let doc;
  try {
    const text = readFileSync(resolve(T, file), 'utf8');
    doc = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1));
  } catch (err) {
    return { faults: ['template does not parse: ' + err.message], notes };
  }

  for (const [id, sec] of Object.entries(doc.sections || {})) {
    if (!sec || !sec.type) continue;
    const where = id + ' (' + sec.type + ')';
    const schema = schemaFor(sec.type);

    if (!schema) {
      faults.push(where + ': NO SUCH SECTION in sections/');
      continue;
    }
    if (schema.__broken) {
      faults.push(where + ': the section schema does not parse — ' + schema.__broken);
      continue;
    }

    checkSettings(settingMap(schema.settings), sec.settings, where, faults, notes);

    const declared = new Set((schema.blocks || []).map((b) => b.type));
    const blockDefs = new Map((schema.blocks || []).map((b) => [b.type, settingMap(b.settings)]));

    for (const [bid, blk] of Object.entries(sec.blocks || {})) {
      if (!blk || !blk.type) continue;
      if (!declared.has(blk.type)) {
        faults.push(where + ': block "' + bid + '" has type "' + blk.type +
                    '" which the section does not declare  [declared: ' +
                    ([...declared].join(', ') || 'none') + ']');
        continue;
      }
      checkSettings(blockDefs.get(blk.type), blk.settings, where + ' block ' + bid, faults, notes);
    }
  }

  return { faults, notes };
}

const files = readdirSync(T)
  .filter((f) => f.endsWith('.json'))
  .filter((f) => (only ? basename(f, '.json') === only || f === only : true))
  .sort();

if (!files.length) {
  console.error('No templates matched.');
  process.exit(1);
}

let bad = 0;
for (const f of files) {
  const { faults, notes } = validate(f);
  if (!faults.length) continue;
  bad++;
  console.log('');
  console.log('=== ' + f + ' ===');
  for (const x of faults) console.log('  FAULT  ' + x);
  if (only) for (const n of notes) console.log('  note   ' + n);
}

console.log('');
console.log('checked ' + files.length + ' template(s); ' + bad + ' with faults');
if (!bad) console.log('Nothing that would make Shopify reject a template.');
