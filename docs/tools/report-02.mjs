/* ============================================================================
   report-02.mjs — 27/08/2026. Read-only, changes nothing.
   ----------------------------------------------------------------------------
     cd ~/Dropbox/GIT-repositaries/fye-theme-v3
     node docs/tools/report-02.mjs

   Three questions the last report left open.

   1. The hero rule did not match, so it has been reformatted since I wrote it.
      Print it as it actually is.
   2. The flank device is fye-core.css:326 and there is a `flex-basis: 24px`
      at 683 — print both blocks so I can see what sets the line length.
   3. The nav search found nothing, so the header does not use any of the
      class names I guessed. Print every type declaration in the header.
   ========================================================================== */

import { readFile, readdir } from 'node:fs/promises';

const slice = async (path, from, to, label) => {
  try {
    const lines = (await readFile(path, 'utf8')).split('\n');
    console.log(`\n---- ${label} — ${path}:${from}-${to} ----`);
    lines.slice(from - 1, to).forEach((l, i) => console.log(`${from + i}  ${l}`));
  } catch (e) {
    console.log(`\n---- ${label} — ${path} MISSING ----`);
  }
};

/* 1. the hero's left-aligned rule, however it now reads */
const hero = await readFile('sections/fye-hero.liquid', 'utf8');
const heroLines = hero.split('\n');
const heroAt = heroLines.findIndex((l) => l.includes('hero--left .hero__in'));
console.log('---- hero left rule ----');
if (heroAt === -1) {
  console.log('  no .hero--left .hero__in rule found at all');
} else {
  heroLines.slice(Math.max(0, heroAt - 4), heroAt + 12)
    .forEach((l, i) => console.log(`${Math.max(1, heroAt - 3) + i}  ${l}`));
}

/* 2. the flank device and its breakpoint override */
await slice('assets/fye-core.css', 320, 360, 'flank + sect-head');
await slice('assets/fye-core.css', 655, 695, 'flank breakpoint override');

/* 3. every type declaration in whatever the header section is called */
const names = await readdir('sections');
const headers = names.filter((n) => /header|nav|menu/i.test(n));
console.log(`\n---- header-ish section files ----\n  ${headers.join('\n  ') || '(none)'}`);

for (const name of headers) {
  const src = await readFile(`sections/${name}`, 'utf8');
  const rows = [];
  src.split('\n').forEach((line, i) => {
    const t = line.trim();
    if (!t) return;
    if (/font-size|font-family|letter-spacing|text-transform|font-weight|line-height|--fs-|gap:/i.test(t))
      rows.push(`${i + 1}  ${t}`);
  });
  console.log(`\n---- type declarations — sections/${name} (${rows.length}) ----`);
  rows.slice(0, 45).forEach((r) => console.log(r));
  if (rows.length > 45) console.log(`  ... ${rows.length - 45} more`);

  /* and the markup class names on the nav, so I patch a live selector */
  const cls = new Set();
  for (const m of src.matchAll(/class="([^"{]*)"/g)) {
    m[1].split(/\s+/).forEach((c) => { if (/nav|menu|link|item|hdr|header/i.test(c)) cls.add(c); });
  }
  console.log(`  nav-ish classes: ${[...cls].join(', ') || '(none)'}`);
}
