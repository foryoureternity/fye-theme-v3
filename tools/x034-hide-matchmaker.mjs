// x034-hide-matchmaker.mjs — single use, idempotent. Run once, then delete.
//
//   node tools/x034-hide-matchmaker.mjs              # nav only
//   node tools/x034-hide-matchmaker.mjs --homepage   # nav + the homepage entry
//
// Ed, 07/09/2026: remove the Ring Matchmaker from the nav bar — not ready for
// public use yet.
//
// THERE ARE TWO PUBLIC WAYS IN, and the nav is the less prominent of them:
//
//   1. sections/header-group.json — the nav_matchmaker block. This is what Ed
//      asked about, and it goes.
//   2. templates/index.json — a Matchmaker entry section on the HOMEPAGE, with
//      three deep-linked journey tiles. Removing the nav link while leaving
//      this in place would not take it out of public use; it would just move
//      the front door.
//
// The homepage one is left alone unless --homepage is passed, because Ed asked
// about the nav and the two are separate decisions. It is DISABLED rather than
// deleted: `"disabled": true` keeps the section, its settings and its position
// in the template, so putting it back later is one keystroke in the theme
// editor rather than a rebuild.
//
// WHAT IS DELIBERATELY NOT TOUCHED:
//
//   · templates/page.ring-matchmaker.json — the page itself. Unlinking is not
//     unpublishing: /pages/ring-matchmaker stays reachable to anyone with the
//     URL, which is what makes it testable. To make it genuinely private,
//     unpublish the PAGE in Shopify admin (Online Store > Pages) — that is
//     store data, not theme code, and not something a theme script should do
//     behind your back.
//   · layout/theme.liquid line 58 — the handle is in a list that suppresses
//     something (a rail or a wrapper) on this page. Harmless while hidden, and
//     needed again the moment it comes back.
//   · sections/fye-finder-entry.liquid — the section stays available in the
//     theme editor for when it is ready.

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const alsoHomepage = process.argv.includes('--homepage');
const edits = [];

/* 1 ---- the nav item ------------------------------------------------------ */
{
  const f = resolve(root, 'sections/header-group.json');
  const raw = readFileSync(f, 'utf8');
  const cut = raw.indexOf('{');
  const doc = JSON.parse(raw.slice(cut));

  let found = false;
  for (const [sid, sec] of Object.entries(doc.sections || {})) {
    if (!sec.blocks || !sec.blocks.nav_matchmaker) continue;
    const b = sec.blocks.nav_matchmaker;
    console.log('1. found nav item in section "' + sid + '": ' +
      JSON.stringify((b.settings && b.settings.title) || '(no title)') +
      ' -> ' + ((b.settings && b.settings.url) || '(no url)'));
    delete sec.blocks.nav_matchmaker;
    if (Array.isArray(sec.block_order)) {
      const before = sec.block_order.length;
      sec.block_order = sec.block_order.filter((id) => id !== 'nav_matchmaker');
      console.log('   block_order ' + before + ' -> ' + sec.block_order.length +
        ':  ' + sec.block_order.join(', '));
    }
    found = true;
  }

  if (!found) console.log('1. nav item already gone');
  else edits.push({ f, out: raw.slice(0, cut) + JSON.stringify(doc, null, 2) + '\n', gone: 'nav_matchmaker' });
}

/* 2 ---- the homepage entry ----------------------------------------------- */
{
  const f = resolve(root, 'templates/index.json');
  const raw = readFileSync(f, 'utf8');
  const cut = raw.indexOf('{');
  const doc = JSON.parse(raw.slice(cut));

  const hits = Object.entries(doc.sections || {}).filter(([, sec]) =>
    (sec.type || '').includes('fye-finder-entry'));

  if (!hits.length) {
    console.log('2. no Matchmaker entry section on the homepage');
  } else if (!alsoHomepage) {
    console.log('');
    console.log('2. STILL PUBLIC — the homepage carries a Matchmaker entry section:');
    hits.forEach(([sid, sec]) => {
      const n = (sec.block_order || []).length;
      console.log('     "' + sid + '"  ' + sec.type +
        (sec.disabled ? '  (already disabled)' : '') +
        (n ? '  ' + n + ' journey tile(s)' : ''));
    });
    console.log('   Removing the nav link but leaving this in place does not take the');
    console.log('   matchmaker out of public use — it moves the front door to the homepage,');
    console.log('   where it is MORE prominent than the nav.');
    console.log('');
    console.log('   To disable it too:  node tools/x034-hide-matchmaker.mjs --homepage');
    console.log('   (disabled, not deleted — settings and position are kept.)');
  } else {
    let changed = 0;
    hits.forEach(([sid, sec]) => {
      if (sec.disabled) { console.log('2. "' + sid + '" already disabled'); return; }
      sec.disabled = true;
      changed++;
      console.log('2. disabled homepage section "' + sid + '" (' + sec.type + ')');
    });
    if (changed) edits.push({ f, out: raw.slice(0, cut) + JSON.stringify(doc, null, 2) + '\n', gone: null });
  }
}

/* ---- write --------------------------------------------------------------- */
if (!edits.length) { console.log('\nnothing to change'); process.exit(0); }
for (const e of edits) {
  const before = readFileSync(e.f, 'utf8').length;
  writeFileSync(e.f, e.out, 'utf8');
  const after = readFileSync(e.f, 'utf8');
  if (e.gone && after.includes(e.gone)) throw new Error(e.f + ' still contains ' + e.gone);
  console.log('wrote ' + e.f.replace(root + '/', '') + '  ' + before + ' -> ' + after.length);
}
console.log('');
console.log('TEST: the nav bar has no Ring Matchmaker item, on desktop and mobile.');
console.log('      /pages/ring-matchmaker still LOADS — unlinking is not unpublishing.');
console.log('      To make it genuinely private, unpublish the page in Shopify admin.');
console.log('');
console.log('then: rm tools/x034-hide-matchmaker.mjs tools/w317-w319-rail-matchmaker-headings.mjs');
console.log('      && ./tools/fye ship "nav: hide the matchmaker"');
