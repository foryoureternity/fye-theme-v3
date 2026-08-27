/* ============================================================================
   schema-dump.mjs — the contract for a batch of old-theme sections
   ----------------------------------------------------------------------------
     cd ~/Dropbox/GIT-repositaries/fye-theme-v3
     node docs/tools/schema-dump.mjs --guides        # the guide library
     node docs/tools/schema-dump.mjs --fye           # every fye-* section
     node docs/tools/schema-dump.mjs accordion about-columns-four
     node docs/tools/schema-dump.mjs --guides --verbose   # include labels/options

   Writes docs/schema-dumps.md.

   WHY
   Rebuilding a section faithfully needs three things: its setting IDs, its
   block type names, and its block setting IDs. Those are frozen — 134 JSON
   templates reference them — and everything else in an old section file is
   T4S markup we are deleting anyway. A 20KB section file yields about fifteen
   lines of contract.

   So this pulls ONLY the {% schema %} block out of each section and prints it
   flat: id, type, and default where there is one. Labels, `info` strings and
   select options are dropped unless --verbose, because v3 rewrites the labels
   (sentence case, UK English) and usually cuts the options down.

   Settings v3 never carries are omitted entirely — the per-block typography,
   spacing and effect controls listed in NOISE below. If a section's dump looks
   suspiciously short, that is the point: the old theme exposed forty controls
   where six were needed.

   Read the dump alongside `section-usage.md` (how many templates use it, and
   whether they are live) and the relevant `template-plans/*.full.md` (what the
   settings are actually SET to). Between the three, a section can be rebuilt
   without opening the old file at all.
   ========================================================================== */

import { readFile, readdir, writeFile, stat } from 'node:fs/promises';
import { join, basename, extname, resolve } from 'node:path';

const GUIDES = [
  'fye-terms', 'fye-chapter-nav', 'fye-rich-text', 'fye-callout',
  'fye-guide-download', 'fye-related', 'fye-table', 'fye-faq',
  'fye-checklist', 'fye-xref', 'fye-cards', 'fye-chips', 'fye-steps'
];

const args = process.argv.slice(2);
const oldArg = args.find((a) => a.startsWith('--old='));
const OLD = resolve(oldArg ? oldArg.slice(6) : '../fye-shopify-theme');
const OUT = resolve('docs/schema-dumps.md');
const verbose = args.includes('--verbose');
const names = args.filter((a) => !a.startsWith('--'));

/* Controls v3 takes from the design system, never from the customiser. */
const NOISE = new Set([
  'fontf', 'text_cl', 'text_fs', 'text_lh', 'text_fw', 'text_ls', 'font_italic',
  'font_uppercase', 'text_shadow', 'text_mgb', 'hidden_mobile', 'text_fs_mb',
  'text_lh_mb', 'text_ls_mb', 'text_mgb_mobile', 'mg', 'pd', 'mg_tb', 'pd_tb',
  'mg_mb', 'pd_mb', 'mg_b', 'mg_bmb', 'padding', 'paddingmb', 'cl_bg',
  'cl_bg_gradient', 'ani_delay', 'use_cus_css', 'code_cus_css', 'mgb', 'mgb_mb',
  'design_heading', 'heading_align', 'icon_heading', 'tophead_mb', 'layout',
  'image_ratio', 'image_size', 'image_position', 'img_effect', 'b_effect',
  'space_h_item', 'space_v_item', 'space_h_item_mb', 'space_v_item_mb',
  'btn_size', 'btn_cl', 'button_effect', 'button_style', 'btns_size', 'btns_cl',
  'head_btn_style', 'head_btn_size', 'head_btn_cl', 'head_btn_effect',
  'btn_owl', 'btn_shape', 'btn_vi', 'btns_pos', 'dot_owl', 'dots_cl',
  'dots_round', 'dots_space', 'au_hover', 'loop', 'col_tb'
]);

async function listSections() {
  const dir = join(OLD, 'sections');
  const out = [];
  for (const name of await readdir(dir)) {
    if (name.startsWith('.') || extname(name) !== '.liquid') continue;
    const path = join(dir, name);
    if ((await stat(path)).isFile()) out.push(path);
  }
  return out;
}

const all = await listSections();

let targets;
if (args.includes('--fye')) {
  targets = all.filter((p) => basename(p).startsWith('fye-'));
} else if (args.includes('--guides')) {
  targets = all.filter((p) => GUIDES.includes(basename(p, '.liquid')));
} else if (names.length) {
  targets = names.map((n) => join(OLD, 'sections', n.endsWith('.liquid') ? n : `${n}.liquid`));
} else {
  console.log('Nothing to do. Pass section names, or --guides, or --fye.');
  process.exit(0);
}

/* The schema block, whichever tag style the old theme used. */
function extractSchema(text) {
  const m = text.match(/\{%-?\s*schema\s*-?%\}([\s\S]*?)\{%-?\s*endschema\s*-?%\}/);
  return m ? m[1].trim() : null;
}

function describe(setting) {
  const bits = [`\`${setting.id}\``, setting.type];
  if (setting.default !== undefined && setting.default !== '') {
    let d = typeof setting.default === 'string' ? setting.default : JSON.stringify(setting.default);
    if (d.length > 60) d = `${d.slice(0, 60)}…`;
    bits.push(`default: ${d}`);
  }
  if (verbose && setting.label) bits.push(`"${setting.label}"`);
  if (verbose && Array.isArray(setting.options)) {
    bits.push(`options: ${setting.options.map((o) => o.value).join('|')}`);
  }
  return bits.join(' · ');
}

function usefulSettings(list) {
  return (list || []).filter((s) => s.type !== 'header' && s.type !== 'paragraph' && !NOISE.has(s.id));
}

const lines = [];
const stamp = new Date().toISOString().slice(0, 10);
lines.push('# Old-theme section schemas');
lines.push('');
lines.push(`Generated ${stamp} by \`docs/tools/schema-dump.mjs\`. Do not hand-edit.`);
lines.push('');
lines.push('Setting IDs and block type names are **frozen** — templates reference them.');
lines.push('Labels and options are omitted (v3 rewrites those); per-block typography,');
lines.push('spacing, carousel and button-style controls are dropped as noise. Run with');
lines.push('`--verbose` to see labels and select options.');
lines.push('');

const summary = [];

for (const path of targets) {
  const name = basename(path, '.liquid');
  let text;
  try {
    text = await readFile(path, 'utf8');
  } catch {
    lines.push(`## \`${name}\`\n\nNOT FOUND.\n`);
    summary.push(`${name}: not found`);
    continue;
  }

  const raw = extractSchema(text);
  if (!raw) {
    lines.push(`## \`${name}\`\n\nNo schema block.\n`);
    summary.push(`${name}: no schema`);
    continue;
  }

  let schema;
  try {
    schema = JSON.parse(raw);
  } catch (err) {
    lines.push(`## \`${name}\`\n\nSchema did not parse: ${err.message}\n`);
    summary.push(`${name}: schema parse failed`);
    continue;
  }

  const settings = usefulSettings(schema.settings);
  const blocks = schema.blocks || [];
  const dropped = (schema.settings || []).length - settings.length;

  lines.push(`## \`${name}\``);
  lines.push('');
  lines.push(`Section name: "${schema.name || '?'}" · ${(schema.settings || []).length} settings (${dropped} dropped as noise) · ${blocks.length} block type(s) · ${Math.round(text.length / 1024)}KB of old markup`);
  lines.push('');

  if (settings.length) {
    lines.push('**Settings**');
    lines.push('');
    for (const s of settings) lines.push(`- ${describe(s)}`);
    lines.push('');
  }

  for (const b of blocks) {
    const bs = usefulSettings(b.settings);
    lines.push(`**Block \`${b.type}\`**${b.limit ? ` (limit ${b.limit})` : ''} — "${b.name || '?'}"`);
    lines.push('');
    if (bs.length) {
      for (const s of bs) lines.push(`- ${describe(s)}`);
    } else {
      lines.push('- no settings worth carrying');
    }
    lines.push('');
  }

  summary.push(`${name}: ${settings.length} settings, ${blocks.length} blocks`);
}

await writeFile(OUT, lines.join('\n'), 'utf8');

console.log(`Old theme: ${OLD}\n`);
for (const s of summary) console.log(s);
console.log(`\nWrote ${OUT}`);
