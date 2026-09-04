// w989-rename-matchmaker.mjs — single use. Run once from the repo root, then delete.
//
//   node tools/w989-rename-matchmaker.mjs
//
// Ed, 04/09/2026: rename the page. Ring Matchmaker, /pages/ring-matchmaker.
//
// THE SHOPIFY SIDE IS ALREADY DONE: the page is titled "Ring Matchmaker", its
// handle is ring-matchmaker, and /pages/find-your-ring redirects to it. Its
// template suffix is still `find-your-ring`, so the page keeps working on the
// old template file until this patch is shipped — then the suffix is switched
// to `ring-matchmaker` and the old file can go.
//
// This patch:
//   1. templates/page.ring-matchmaker.json   copy of the current template
//   2. sections/fye-finder-entry.liquid      default page URL
//   3. layout/theme.liquid                   noindex both handles for now
//   4. docs/build-state.md                   the record
//
// The old template is deliberately NOT deleted here — deleting it while the
// page still points at it would drop the page onto the default template. It
// goes in the tidy-up after the suffix is switched.

import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const P = (p) => resolve(root, p);
const edits = [];

function once(hay, needle, where) {
  const n = hay.split(needle).length - 1;
  if (n !== 1) throw new Error(where + ': expected 1 match for ' + JSON.stringify(needle.slice(0, 70)) + ', found ' + n);
}

/* 1 ---- the template, under its new name --------------------------------- */
{
  const from = P('templates/page.find-your-ring.json');
  const to = P('templates/page.ring-matchmaker.json');
  if (existsSync(to)) { console.log('1. template: page.ring-matchmaker.json already exists, skipping'); }
  else if (!existsSync(from)) { throw new Error('1. template: page.find-your-ring.json is missing'); }
  else {
    JSON.parse(readFileSync(from, 'utf8'));           // must be valid before copying
    copyFileSync(from, to);
    const n = JSON.parse(readFileSync(to, 'utf8'));
    if (!n.sections || !n.sections.finder) throw new Error('1. template: copy has no finder section');
    console.log('wrote templates/page.ring-matchmaker.json  (copy of page.find-your-ring.json)');
  }
}

/* 2 ---- the entry section points at the new URL --------------------------- */
{
  const f = P('sections/fye-finder-entry.liquid');
  const src = readFileSync(f, 'utf8');
  if (src.includes('/pages/ring-matchmaker')) { console.log('2. entry section: already current, skipping'); }
  else {
    let out = src;
    const A = "assign base = s.page_url | default: '/pages/find-your-ring'";
    once(out, A, '2a. entry section liquid');
    out = out.replace(A, "assign base = s.page_url | default: '/pages/ring-matchmaker'");

    const B = '{ "type": "url", "id": "page_url", "label": "Matchmaker page", "info": "Defaults to /pages/find-your-ring." },';
    once(out, B, '2b. entry section schema');
    out = out.replace(B, '{ "type": "url", "id": "page_url", "label": "Matchmaker page", "info": "Defaults to /pages/ring-matchmaker." },');

    const C = '  /pages/find-your-ring?j=eng';
    if (out.includes(C)) out = out.split('/pages/find-your-ring').join('/pages/ring-matchmaker');

    edits.push({ f, out, check: '/pages/ring-matchmaker' });
  }
}

/* 3 ---- noindex: both handles, while the old one still redirects ---------- */
{
  const f = P('layout/theme.liquid');
  const src = readFileSync(f, 'utf8');
  if (src.includes('ring-matchmaker')) { console.log('3. theme.liquid: already current, skipping'); }
  else if (!src.includes('find-your-ring')) { throw new Error('3. theme.liquid: no find-your-ring entry — was w981 run?'); }
  else {
    const lines = src.split('\n');
    const hits = lines.map((l, i) => (l.includes('find-your-ring') ? i : -1)).filter((i) => i > -1);
    if (hits.length !== 1) throw new Error('3. theme.liquid: expected find-your-ring on 1 line, found ' + hits.length);
    const line = lines[hits[0]];
    let next = null;
    if (/'find-your-ring'\s*,/.test(line) || /,\s*'find-your-ring'/.test(line)) {
      next = line.replace("'find-your-ring'", "'find-your-ring', 'ring-matchmaker'");
    } else if (/\bwhen\s+'find-your-ring'/.test(line)) {
      next = line.replace("when 'find-your-ring'", "when 'find-your-ring', 'ring-matchmaker'");
    } else if (/==\s*'find-your-ring'/.test(line)) {
      next = line.replace(/(\S+)\s*==\s*'find-your-ring'/, "$1 == 'find-your-ring' or $1 == 'ring-matchmaker'");
    } else if (/contains\s+'find-your-ring'/.test(line)) {
      next = line.replace(/(\S+)\s+contains\s+'find-your-ring'/, "$1 contains 'find-your-ring' or $1 contains 'ring-matchmaker'");
    }
    if (!next) throw new Error('3. theme.liquid: unrecognised noindex line, edit by hand:\n   ' + line.trim());
    lines[hits[0]] = next;
    edits.push({ f, out: lines.join('\n'), check: 'ring-matchmaker' });
  }
}

/* 4 ---- the record -------------------------------------------------------- */
{
  const f = P('docs/build-state.md');
  const src = readFileSync(f, 'utf8');
  if (src.includes('Rename — 04/09/2026: Ring Matchmaker')) { console.log('4. build-state.md: already present, skipping'); }
  else {
    const note = `

---

## Rename — 04/09/2026: Ring Matchmaker

The page is **Ring Matchmaker** at **/pages/ring-matchmaker**. Chosen because
one name has to serve the nav and five in-page entry sections: in a menu of
category nouns a helper name differentiates, and on the engagement rings page
"Which Ring?" would ask something the visitor has already answered. Ring
Concierge was ruled out as an existing New York bridal jewellery company.

The heading everywhere is the promise, not the name: **Find or Design Your
Perfect Ring**, which names both columns of the results screen. The name sits
in the eyebrow.

### Done on Shopify (before this patch)

- Page title → Ring Matchmaker, handle → \`ring-matchmaker\`.
- \`/pages/find-your-ring\` → \`/pages/ring-matchmaker\` URL redirect created,
  so anything already linking to the old path still lands.
- Template suffix left as \`find-your-ring\` on purpose, so the live page kept
  working until the new template file shipped.

### Done in the theme (this patch)

- \`templates/page.ring-matchmaker.json\` — copy of the old template.
- \`sections/fye-finder-entry.liquid\` defaults to the new URL.
- Both handles noindexed, since the old one still resolves via the redirect.

### AFTER SHIPPING — two steps, in this order

1. **Switch the page's theme template** to \`ring-matchmaker\` (Online Store ›
   Pages › Ring Matchmaker › Theme template). Until this is done the page
   renders from the OLD template file, so edits to the new one have no effect.
2. **Delete \`templates/page.find-your-ring.json\`** and drop
   \`'find-your-ring'\` from the noindex list in \`layout/theme.liquid\`. Not
   before step 1: deleting it while the page points at it drops the page onto
   the default template.

The two template files are identical the moment this patch runs. If the page
is edited in the theme editor before step 1, the edits land in the OLD file —
so do step 1 first, or those edits are lost when it is deleted.
`;
    edits.push({ f, out: src.replace(/\s*$/, '\n') + note, check: 'Ring Matchmaker' });
  }
}

for (const e of edits) {
  const before = readFileSync(e.f, 'utf8').length;
  writeFileSync(e.f, e.out, 'utf8');
  const after = readFileSync(e.f, 'utf8');
  if (!after.includes(e.check)) throw new Error(e.f + ' missing ' + e.check + ' after write');
  console.log('wrote ' + e.f.replace(root + '/', '') + '  ' + before + ' -> ' + after.length);
}
console.log('done. next: node tools/w977-validate-templates.mjs page.ring-matchmaker');
console.log('then: rm tools/w989-rename-matchmaker.mjs && ./tools/fye ship "rename: ring matchmaker"');
console.log('THEN in Shopify admin: Pages > Ring Matchmaker > Theme template > ring-matchmaker');
