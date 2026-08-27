/* ============================================================================
   usage-map.mjs — which sections are actually referenced, and which are live
   ----------------------------------------------------------------------------
   Run it, commit the output, and Claude can read the result instead of fetching
   140 templates one at a time.

     cd ~/Dropbox/GIT-repositaries/fye-theme-v3
     node docs/tools/usage-map.mjs

   Writes docs/section-usage.md and prints a summary. Reads the OLD theme at
   ../fye-shopify-theme (override with --old=/some/path).

   WHY THIS EXISTS
   The previous map was built from 70 of ~140 templates and found 89 live
   sections and 94 referenced by nothing. Both numbers are suspect: the missing
   templates are exactly the guide library (ring-care-*, the gemstone guides),
   and `sections/*.json` section groups were not walked at all.

   WHAT IT COUNTS, AND WHY THE DISTINCTION MATTERS
   A section reference in a JSON template is not the same as a section that
   renders. Every sidebar reference sampled by hand on 27/08/2026 carried
   "disabled": true. So each reference is counted as one of:

     enabled   — the section renders on that template
     disabled  — referenced, but "disabled": true. Dormant, not live.

   A section whose every reference is disabled is NOT live, and is not safe to
   delete either: re-enabling it in the theme editor is one click, and the
   content is still sitting in the template.

   TRAPS THIS HANDLES
   - Shopify writes C-style banner comments into auto-generated JSON templates.
     JSON.parse chokes on them; strip before parsing or every parse fails and
     the map comes out empty.
   - Templates can be .liquid instead of .json (search.wishlist.liquid,
     gift_card.liquid, password.liquid). Those are scanned as text for
     section tags.
   - Section GROUPS (sections/header-group.json, footer-group.json) reference
     sections too, and are themselves referenced from the layout.
   - Sections referenced only from the layout or from another file's render tag
     are live even though no template names them.
   - Dotfile backups (.index.json.bak) are skipped — they are not the theme.
   ========================================================================== */

import { readFile, readdir, writeFile, stat } from 'node:fs/promises';
import { join, basename, extname, resolve } from 'node:path';

const args = process.argv.slice(2);
const oldArg = args.find((a) => a.startsWith('--old='));
const OLD = resolve(oldArg ? oldArg.slice(6) : '../fye-shopify-theme');
const OUT = resolve('docs/section-usage.md');

/* Shopify's banner comments, and nothing else. Line comments are only stripped
   at the start of a line, so that "https://..." inside a string survives. */
function stripJsonComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter((line) => !/^\s*\/\//.test(line))
    .join('\n');
}

async function listFiles(dir) {
  try {
    const names = await readdir(dir);
    const out = [];
    for (const name of names) {
      if (name.startsWith('.')) continue;              /* backup files etc */
      const path = join(dir, name);
      const s = await stat(path);
      if (s.isFile()) out.push(path);
    }
    return out;
  } catch {
    return [];
  }
}

/* ---- Collect ------------------------------------------------------------ */

const refs = new Map();        /* section type -> [{ from, state }]          */
const parseFailures = [];

function note(type, from, state) {
  if (!type) return;
  if (!refs.has(type)) refs.set(type, []);
  refs.get(type).push({ from, state });
}

/* App blocks and app sections are not theme files; keep them out of the map. */
const isAppSection = (type) => type === 'apps' || type.startsWith('shopify://');

function walkSectionsObject(json, from) {
  const sections = json?.sections;
  if (!sections || typeof sections !== 'object') return;
  for (const key of Object.keys(sections)) {
    const entry = sections[key];
    const type = entry?.type;
    if (!type || isAppSection(type)) continue;
    note(type, from, entry.disabled === true ? 'disabled' : 'enabled');
  }
}

/* Liquid templates and layouts: the section and sections tags. */
function walkLiquidText(text, from) {
  const re = /\{%-?\s*sections?\s+'([^']+)'/g;
  let m;
  while ((m = re.exec(text)) !== null) note(m[1], from, 'enabled');
}

/* Files that render other files — a section reached only this way is live. */
function walkRenders(text, sink) {
  const re = /\{%-?\s*render\s+'([^']+)'/g;
  let m;
  while ((m = re.exec(text)) !== null) sink.add(m[1]);
}

const templateFiles = await listFiles(join(OLD, 'templates'));
const customerTemplates = await listFiles(join(OLD, 'templates', 'customers'));
const sectionFiles = await listFiles(join(OLD, 'sections'));
const snippetFiles = await listFiles(join(OLD, 'snippets'));
const layoutFiles = await listFiles(join(OLD, 'layout'));

const allTemplates = [...templateFiles, ...customerTemplates];

for (const path of allTemplates) {
  const from = basename(path);
  const text = await readFile(path, 'utf8');
  if (extname(path) === '.json') {
    try {
      walkSectionsObject(JSON.parse(stripJsonComments(text)), from);
    } catch (err) {
      parseFailures.push(`${from}: ${err.message}`);
    }
  } else {
    walkLiquidText(text, from);
  }
}

/* Section groups: sections/*.json. Referenced from the layout, and they
   reference sections themselves. */
for (const path of sectionFiles) {
  if (extname(path) !== '.json') continue;
  const from = basename(path);
  const text = await readFile(path, 'utf8');
  try {
    walkSectionsObject(JSON.parse(stripJsonComments(text)), from);
  } catch (err) {
    parseFailures.push(`${from}: ${err.message}`);
  }
}

for (const path of layoutFiles) {
  walkLiquidText(await readFile(path, 'utf8'), basename(path));
}

/* Render graph, so the "unreferenced" list does not accuse a section that is
   only ever rendered by another file. */
const renderedNames = new Set();
for (const path of [...sectionFiles, ...snippetFiles, ...layoutFiles]) {
  if (extname(path) === '.json') continue;
  walkRenders(await readFile(path, 'utf8'), renderedNames);
}

/* ---- Classify ----------------------------------------------------------- */

const sectionNames = sectionFiles
  .filter((p) => extname(p) === '.liquid')
  .map((p) => basename(p, '.liquid'))
  .sort();

const rows = sectionNames.map((name) => {
  const list = refs.get(name) || [];
  const enabled = list.filter((r) => r.state === 'enabled');
  const disabled = list.filter((r) => r.state === 'disabled');
  let verdict;
  if (enabled.length) verdict = 'live';
  else if (disabled.length) verdict = 'dormant';
  else if (renderedNames.has(name)) verdict = 'rendered by another file';
  else verdict = 'unreferenced';
  return { name, enabled, disabled, verdict };
});

/* Types referenced by a template with no section file behind them — these
   break the theme editor, so name them loudly. */
const missing = [...refs.keys()].filter((t) => !sectionNames.includes(t)).sort();

const count = (v) => rows.filter((r) => r.verdict === v).length;

/* ---- Write -------------------------------------------------------------- */

const stamp = new Date().toISOString().slice(0, 10);
const lines = [];

lines.push('# Section usage map — old theme');
lines.push('');
lines.push(`Generated ${stamp} by \`docs/tools/usage-map.mjs\`. Do not hand-edit.`);
lines.push('');
lines.push(`Scanned ${allTemplates.length} templates, ${sectionFiles.length} section files.`);
lines.push('');
lines.push('**live** = at least one enabled reference · **dormant** = referenced but every');
lines.push('reference is `"disabled": true` · **unreferenced** = nothing points at it.');
lines.push('A dormant section is not live, and not safe to delete either: re-enabling it');
lines.push('is one click in the theme editor and its content is still in the template.');
lines.push('');
lines.push('| | count |');
lines.push('|---|---|');
lines.push(`| live | ${count('live')} |`);
lines.push(`| dormant | ${count('dormant')} |`);
lines.push(`| rendered by another file | ${count('rendered by another file')} |`);
lines.push(`| unreferenced | ${count('unreferenced')} |`);
lines.push('');

if (missing.length) {
  lines.push('## Referenced but MISSING a section file');
  lines.push('');
  lines.push('These break the theme editor on the templates that name them. v3 must');
  lines.push('either provide the type name, or the template must be edited.');
  lines.push('');
  for (const t of missing) {
    const list = refs.get(t);
    const on = list.filter((r) => r.state === 'enabled').length;
    lines.push(`- \`${t}\` — ${list.length} refs, ${on} enabled: ${list.map((r) => r.from).join(', ')}`);
  }
  lines.push('');
}

for (const verdict of ['live', 'dormant', 'rendered by another file', 'unreferenced']) {
  const group = rows.filter((r) => r.verdict === verdict);
  if (!group.length) continue;
  lines.push(`## ${verdict} (${group.length})`);
  lines.push('');
  if (verdict === 'unreferenced' || verdict === 'rendered by another file') {
    for (const r of group) lines.push(`- \`${r.name}\``);
  } else {
    lines.push('| section | enabled | disabled | templates |');
    lines.push('|---|---|---|---|');
    for (const r of group) {
      const where = [...new Set([...r.enabled, ...r.disabled].map((x) => x.from))];
      const shown = where.slice(0, 8).join(', ') + (where.length > 8 ? `, +${where.length - 8} more` : '');
      lines.push(`| \`${r.name}\` | ${r.enabled.length} | ${r.disabled.length} | ${shown} |`);
    }
  }
  lines.push('');
}

if (parseFailures.length) {
  lines.push('## Parse failures');
  lines.push('');
  lines.push('Every one of these is a hole in the map. Fix before trusting the counts.');
  lines.push('');
  for (const f of parseFailures) lines.push(`- ${f}`);
  lines.push('');
}

await writeFile(OUT, lines.join('\n'), 'utf8');

console.log(`Old theme:  ${OLD}`);
console.log(`Templates:  ${allTemplates.length}`);
console.log(`Sections:   ${sectionFiles.length}`);
console.log('');
console.log(`live                      ${count('live')}`);
console.log(`dormant                   ${count('dormant')}`);
console.log(`rendered by another file  ${count('rendered by another file')}`);
console.log(`unreferenced              ${count('unreferenced')}`);
if (missing.length) console.log(`\nreferenced but missing a section file: ${missing.length}`);
if (parseFailures.length) console.log(`\nPARSE FAILURES: ${parseFailures.length} — the map has holes`);
console.log(`\nWrote ${OUT}`);
