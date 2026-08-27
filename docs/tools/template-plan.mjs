/* ============================================================================
   template-plan.mjs — reduce a fat JSON template to a readable build plan
   ----------------------------------------------------------------------------
     cd ~/Dropbox/GIT-repositaries/fye-theme-v3
     node docs/tools/template-plan.mjs                  # the four queue templates
     node docs/tools/template-plan.mjs index --full     # nothing truncated
     node docs/tools/template-plan.mjs page.about-us page.contact
     node docs/tools/template-plan.mjs --all-pages

   Writes one file per template into docs/template-plans/ and prints a summary.

   WHY THIS EXISTS
   index.json is 38KB, page.engagement-rings.json 60KB, page.eternity-rings
   40KB, page.wedding-rings 42KB. Claude cannot read 180KB of JSON in a session
   and still have room to write sections. Almost all of that weight is settings
   sitting at their defaults, empty strings, and the old theme's per-block
   typography controls — none of which survive into v3 anyway.

   So this keeps only what a rebuild actually needs:
     - section order, and whether each one is disabled
     - block types and how many of each
     - settings that carry a real value (empty strings, nulls, zeros and false
       are dropped — they tell us nothing)
     - custom_css, flagged loudly: it is per-template CSS that v3 has nowhere
       to put, so every instance is a decision
     - whether v3 already has a section file for that type

   --full
   Values are truncated to 90 characters by default, which is right for
   planning and wrong for PORTING: the real body copy gets cut off, and copy
   must never be reconstructed from a truncated string — it either comes across
   exactly or it is not carried over. Pass --full when the plan is about to be
   turned into a v3 template, and nothing is shortened.
   ========================================================================== */

import { readFile, readdir, writeFile, mkdir, stat } from 'node:fs/promises';
import { join, basename, extname, resolve } from 'node:path';

const DEFAULTS = ['index', 'page.engagement-rings', 'page.wedding-rings', 'page.eternity-rings'];

const args = process.argv.slice(2);
const oldArg = args.find((a) => a.startsWith('--old='));
const OLD = resolve(oldArg ? oldArg.slice(6) : '../fye-shopify-theme');
const OUTDIR = resolve('docs/template-plans');
const wantAllPages = args.includes('--all-pages');
const full = args.includes('--full');
const MAXLEN = full ? Infinity : 90;
const names = args.filter((a) => !a.startsWith('--'));

function stripJsonComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter((line) => !/^\s*\/\//.test(line))
    .join('\n');
}

async function listFiles(dir) {
  try {
    const out = [];
    for (const name of await readdir(dir)) {
      if (name.startsWith('.')) continue;
      const path = join(dir, name);
      if ((await stat(path)).isFile()) out.push(path);
    }
    return out;
  } catch {
    return [];
  }
}

/* Which section types v3 already has, so the plan says what is left to build. */
const v3Sections = new Set(
  (await listFiles(resolve('sections')))
    .filter((p) => extname(p) === '.liquid')
    .map((p) => basename(p, '.liquid'))
);

const templateDir = join(OLD, 'templates');
const templateFiles = await listFiles(templateDir);

let targets;
if (wantAllPages) {
  targets = templateFiles.filter((p) => basename(p).startsWith('page.') && extname(p) === '.json');
} else if (names.length) {
  targets = names.map((n) => join(templateDir, n.endsWith('.json') ? n : `${n}.json`));
} else {
  targets = DEFAULTS.map((n) => join(templateDir, `${n}.json`));
}

/* A setting is worth printing if it carries a decision. */
function meaningful(value) {
  if (value === null || value === undefined) return false;
  if (value === '' || value === false || value === 0) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
}

function short(value) {
  let s = typeof value === 'string' ? value : JSON.stringify(value);
  /* In --full mode keep the string byte-for-byte: newlines and all. Collapsing
     whitespace would quietly change the copy being ported. */
  if (full) return s;
  s = s.replace(/\s+/g, ' ').trim();
  return s.length > MAXLEN ? `${s.slice(0, MAXLEN)}…` : s;
}

/* The old theme's per-block typography and spacing controls. v3 takes these
   from the design system, so listing them per block is pure noise. */
const NOISE = new Set([
  'fontf', 'text_cl', 'text_fs', 'text_lh', 'text_fw', 'text_ls', 'font_italic',
  'font_uppercase', 'text_shadow', 'text_mgb', 'hidden_mobile', 'text_fs_mb',
  'text_lh_mb', 'text_ls_mb', 'text_mgb_mobile', 'mg', 'pd', 'mg_tb', 'pd_tb',
  'mg_mb', 'pd_mb', 'mg_b', 'mg_bmb', 'padding', 'paddingmb', 'cl_bg',
  'cl_bg_gradient', 'ani_delay', 'use_cus_css', 'code_cus_css'
]);

const summary = [];
await mkdir(OUTDIR, { recursive: true });

for (const path of targets) {
  const name = basename(path, '.json');
  let json;
  try {
    json = JSON.parse(stripJsonComments(await readFile(path, 'utf8')));
  } catch (err) {
    summary.push(`${name}: FAILED — ${err.message}`);
    continue;
  }

  const sections = json.sections || {};
  const order = json.order || Object.keys(sections);
  const lines = [];
  let live = 0;
  let cssBlocks = 0;
  const missing = new Set();

  lines.push(`# ${name} — build plan${full ? ' (full values)' : ''}`);
  lines.push('');
  lines.push(`Reduced from \`${basename(path)}\` by \`docs/tools/template-plan.mjs\`.`);
  lines.push('Settings left at defaults, blanks and per-block typography controls are');
  lines.push(`dropped. Values are ${full ? 'complete — safe to port from.' : 'truncated at 90 characters — re-run with --full before porting copy.'}`);
  lines.push('Do not hand-edit; re-run instead.');
  lines.push('');

  const rows = [];
  for (const key of order) {
    const entry = sections[key];
    if (!entry) continue;
    const type = entry.type || '(none)';
    const off = entry.disabled === true;
    if (!off) live += 1;
    const isApp = type === 'apps' || type.startsWith('shopify://');
    if (!off && !isApp && !v3Sections.has(type)) missing.add(type);
    const blocks = entry.blocks ? Object.values(entry.blocks) : [];
    const tally = {};
    for (const b of blocks) {
      const t = b?.type || '?';
      const label = b?.disabled === true ? `${t} (off)` : t;
      tally[label] = (tally[label] || 0) + 1;
    }
    rows.push({ key, type, off, isApp, tally, entry });
  }

  lines.push('## Section order');
  lines.push('');
  lines.push('| # | id | type | state | blocks | in v3 |');
  lines.push('|---|---|---|---|---|---|');
  rows.forEach((r, i) => {
    const blocks = Object.entries(r.tally).map(([t, n]) => (n > 1 ? `${t} ×${n}` : t)).join(', ') || '—';
    const inV3 = r.isApp ? 'app' : v3Sections.has(r.type) ? 'yes' : 'NO';
    lines.push(`| ${i + 1} | \`${r.key}\` | \`${r.type}\` | ${r.off ? 'disabled' : 'live'} | ${blocks} | ${inV3} |`);
  });
  lines.push('');
  lines.push(`${rows.length} sections, ${live} live, ${rows.length - live} disabled.`);
  lines.push('');

  if (missing.size) {
    lines.push('## Live section types not yet in v3');
    lines.push('');
    for (const t of [...missing].sort()) lines.push(`- \`${t}\``);
    lines.push('');
  }

  lines.push('## Settings that carry a decision');
  lines.push('');

  for (const r of rows) {
    if (r.isApp) continue;
    const s = r.entry.settings || {};
    const keep = Object.entries(s).filter(([k, v]) => meaningful(v) && !NOISE.has(k));
    const css = r.entry.custom_css;
    const blocks = r.entry.blocks ? Object.entries(r.entry.blocks) : [];

    const blockLines = [];
    for (const [bid, b] of blocks) {
      const bs = b?.settings || {};
      const bkeep = Object.entries(bs).filter(([k, v]) => meaningful(v) && !NOISE.has(k));
      if (!bkeep.length) continue;
      if (full) {
        /* One setting per line in full mode — a single long line of
           middot-separated richtext is unreadable and easy to mis-copy. */
        blockLines.push(`  - **${b?.type || '?'}** \`${bid}\`${b?.disabled ? ' *(off)*' : ''}`);
        for (const [k, v] of bkeep) blockLines.push(`    - \`${k}\`: ${short(v)}`);
      } else {
        blockLines.push(`  - **${b?.type || '?'}**${b?.disabled ? ' *(off)*' : ''} — ` +
          bkeep.map(([k, v]) => `\`${k}\`: ${short(v)}`).join(' · '));
      }
    }

    if (!keep.length && !blockLines.length && !css) continue;

    lines.push(`### \`${r.type}\` — id \`${r.key}\`${r.off ? ' *(disabled)*' : ''}`);
    lines.push('');
    if (keep.length) {
      for (const [k, v] of keep) lines.push(`- \`${k}\`: ${short(v)}`);
    }
    if (css) {
      cssBlocks += 1;
      const rules = Array.isArray(css) ? css : [css];
      lines.push(`- **custom_css — ${rules.length} rule(s), needs a home in v3:**`);
      for (const rule of rules) lines.push(`  - \`${short(rule)}\``);
    }
    if (blockLines.length) {
      lines.push('- blocks:');
      lines.push(...blockLines);
    }
    lines.push('');
  }

  const out = join(OUTDIR, full ? `${name}.full.md` : `${name}.md`);
  await writeFile(out, lines.join('\n'), 'utf8');
  summary.push(`${name}: ${rows.length} sections (${live} live), ${missing.size} types missing from v3, ${cssBlocks} custom_css`);
}

console.log(`Old theme: ${OLD}${full ? '   (full values)' : ''}`);
console.log('');
for (const line of summary) console.log(line);
console.log(`\nWrote ${targets.length} plan(s) to ${OUTDIR}`);
