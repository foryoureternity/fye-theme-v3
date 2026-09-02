// w978-repair-templates.mjs — fixes invalid setting VALUES in ported templates.
//
//   node tools/w978-repair-templates.mjs              dry run, reports only
//   node tools/w978-repair-templates.mjs --write      apply
//   node tools/w978-repair-templates.mjs page.sapphire-guide --write   just one
//
// WHY: the seven gemstone templates were rejected outright by Shopify.
// w977 found the reason — values live's sections accepted that v3's schemas do
// not declare:
//
//   fye-chips     align   "centre"        v3 offers different values
//   fye-table     col1_width 22           v3 range is step 5
//   fye-callout   style   "teal"
//   fye-rich-text variant "divider"
//   fye-guide-download block style "btn--primary"
//
// A rejection is SILENT and total: the page falls back to the default page
// template, which is why sapphire showed a banner and the page body and none
// of its 25 sections.
//
// HOW IT REPAIRS
//   range  → clamp into min/max, then snap to the nearest step
//   select → try the value as-is, then British/American spelling variants,
//            then a case-insensitive match against option values AND labels.
//            If nothing matches, DELETE the key so the section uses its own
//            schema default — which is always valid, and visible, rather than
//            guessing at intent.
//
// Deleting rather than guessing matters: "teal" on a callout might mean the
// teal band or teal type, and picking wrong ships a design decision nobody
// made. A default is honest and easy to change in the theme editor.

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const T = resolve(root, 'templates');
const S = resolve(root, 'sections');

const args = process.argv.slice(2);
const WRITE = args.includes('--write');

// Selects are NOT repaired by default. Shopify tolerates an invalid select —
// the section falls back at render time — so "repairing" them only throws away
// intent. An off-step RANGE is what actually rejects a template. See the
// header of w979 for the evidence.
const DO_SELECTS = args.includes('--selects');
const only = args.find((a) => !a.startsWith('--')) || null;

const schemaCache = new Map();
function schemaFor(type) {
  if (schemaCache.has(type)) return schemaCache.get(type);
  const f = resolve(S, type + '.liquid');
  let out = null;
  if (existsSync(f)) {
    const src = readFileSync(f, 'utf8');
    const a = src.indexOf('{% schema %}');
    const b = src.indexOf('{% endschema %}');
    if (a !== -1 && b > a) {
      try { out = JSON.parse(src.slice(a + 12, b)); } catch (err) { out = null; }
    }
  }
  schemaCache.set(type, out);
  return out;
}

function settingMap(list) {
  const m = new Map();
  for (const s of list || []) if (s && s.id) m.set(s.id, s);
  return m;
}

// British/American and common near-miss spellings, both directions.
function variants(v) {
  const s = String(v);
  const out = new Set([s, s.toLowerCase()]);
  const swaps = [
    ['centre', 'center'], ['center', 'centre'],
    ['colour', 'color'], ['color', 'colour'],
    ['grey', 'gray'], ['gray', 'grey']
  ];
  for (const [from, to] of swaps) {
    if (s.toLowerCase().includes(from)) out.add(s.toLowerCase().split(from).join(to));
  }
  return [...out];
}

function repairSettings(map, values, where, log) {
  if (!values) return;
  for (const [key, val] of Object.entries(values)) {
    const def = map.get(key);
    if (!def) continue;

    if (def.type === 'range' && typeof val === 'number') {
      const min = Number(def.min), max = Number(def.max), step = Number(def.step || 1);
      let fixed = Math.min(max, Math.max(min, val));
      fixed = min + Math.round((fixed - min) / step) * step;
      fixed = Math.round(fixed * 1e6) / 1e6;
      if (fixed !== val) {
        values[key] = fixed;
        log.push(where + ': range ' + key + '  ' + val + ' -> ' + fixed);
      }
      continue;
    }

    if (def.type === 'select' && Array.isArray(def.options)) {
      if (!DO_SELECTS) continue;
      const opts = def.options;
      if (opts.some((o) => String(o.value) === String(val))) continue;

      let hit = null;
      for (const cand of variants(val)) {
        hit = opts.find((o) => String(o.value).toLowerCase() === cand);
        if (hit) break;
      }
      if (!hit) {
        for (const cand of variants(val)) {
          hit = opts.find((o) => String(o.label || '').toLowerCase() === cand);
          if (hit) break;
        }
      }

      if (hit) {
        values[key] = hit.value;
        log.push(where + ': select ' + key + '  "' + val + '" -> "' + hit.value + '"');
      } else {
        delete values[key];
        const d = opts[0] ? opts[0].value : '(schema default)';
        log.push(where + ': select ' + key + '  "' + val + '" REMOVED, section will use its default (' + d + ')');
      }
    }
  }
}

function repair(file) {
  const path = resolve(T, file);
  const text = readFileSync(path, 'utf8');
  let doc;
  try {
    doc = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1));
  } catch (err) {
    return { log: ['does not parse: ' + err.message], json: null };
  }

  const log = [];
  for (const [id, sec] of Object.entries(doc.sections || {})) {
    if (!sec || !sec.type) continue;
    const schema = schemaFor(sec.type);
    if (!schema) continue;
    const where = id + ' (' + sec.type + ')';

    repairSettings(settingMap(schema.settings), sec.settings, where, log);

    const blockDefs = new Map((schema.blocks || []).map((b) => [b.type, settingMap(b.settings)]));
    for (const [bid, blk] of Object.entries(sec.blocks || {})) {
      if (!blk || !blk.type || !blockDefs.has(blk.type)) continue;
      repairSettings(blockDefs.get(blk.type), blk.settings, where + ' block ' + bid, log);
    }
  }

  if (!log.length) return { log, json: null };
  return { log, json: JSON.stringify(doc, null, 2) + String.fromCharCode(10) };
}

const files = readdirSync(T)
  .filter((f) => f.endsWith('.json'))
  .filter((f) => (only ? basename(f, '.json') === only || f === only : true))
  .sort();

let touched = 0, changes = 0;
for (const f of files) {
  const { log, json } = repair(f);
  if (!log.length) continue;
  touched++;
  changes += log.length;
  console.log('');
  console.log('=== ' + f + ' ===');
  for (const line of log) console.log('  ' + line);
  if (WRITE && json) writeFileSync(resolve(T, f), json, 'utf8');
}

console.log('');
console.log(files.length + ' template(s) checked, ' + touched + ' need changes, ' + changes + ' value(s)');
console.log(DO_SELECTS
  ? 'MODE: ranges AND selects (selects can lose intent — check each line)'
  : 'MODE: ranges only. Selects left alone: Shopify tolerates them. Add --selects to include them.');
if (!WRITE) {
  console.log('Dry run — nothing written. Re-run with --write to apply.');
} else {
  console.log('Written. Now: node tools/w977-validate-templates.mjs');
}
