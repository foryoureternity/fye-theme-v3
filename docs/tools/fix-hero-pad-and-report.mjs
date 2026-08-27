/* ============================================================================
   fix-hero-pad-and-report.mjs — 27/08/2026
   ----------------------------------------------------------------------------
     cd ~/Dropbox/GIT-repositaries/fye-theme-v3
     node docs/tools/fix-hero-pad-and-report.mjs

   Delete once run.

   Does one thing and reports on two.

   FIXES — hero left padding, doubled.
   Live's hero container is 1368 wide with a 24px gutter. Ed wants twice that
   optical indent on the left-aligned hero, so the copy sits clear of the
   viewport edge rather than tight against the container. Applied only to
   `hero--left` (the centred hero has no left edge to speak of) and dropped
   back to the normal gutter under 560px, where 48px of a 375px screen is a
   seventh of the width.

   REPORTS — the flanked heading rules and the header nav type rules.
   I am not patching either blind. The flanking lines are a fixed width
   somewhere, and the nav's size/tracking is set somewhere, and guessing at
   selector names in a 22KB stylesheet is how you end up with a dead rule that
   looks like a fix. This prints every candidate with its file and line number.
   ========================================================================== */

import { readFile, writeFile, readdir } from 'node:fs/promises';

/* ---- 1. the fix --------------------------------------------------------- */

const HERO = 'sections/fye-hero.liquid';
const find = `.fye .hero--left .hero__in {
  align-items: flex-start;
  text-align: left;
  max-width: var(--maxw-wide);
}`;
const replace = `.fye .hero--left .hero__in {
  align-items: flex-start;
  text-align: left;
  max-width: var(--maxw-wide);
  /* Twice live's 24px gutter. The left-aligned hero is the only place the
     copy has a real left edge against a full-bleed photograph, and at one
     gutter it sat too close to it. */
  padding-inline-start: 48px;
}
@media (max-width: 560px) {
  /* 48px of a 375px screen is a seventh of the width. Back to the gutter. */
  .fye .hero--left .hero__in { padding-inline-start: var(--gutter, 16px); }
}`;

const heroSrc = await readFile(HERO, 'utf8');
const hits = heroSrc.split(find).length - 1;
if (hits === 1) {
  await writeFile(HERO, heroSrc.replace(find, replace), 'utf8');
  console.log(`FIXED ${HERO} — hero--left left padding doubled to 48px`);
} else {
  console.log(`SKIP  ${HERO} — found ${hits} matches, expected 1`);
}

/* ---- 2. the report ------------------------------------------------------ */

const dirs = ['assets', 'snippets', 'sections'];
const files = [];
for (const d of dirs) {
  for (const name of await readdir(d)) {
    if (/\.(css|liquid)$/.test(name)) files.push(`${d}/${name}`);
  }
}

/* Flanking lines: a rule with a fixed width on a pseudo-element beside a
   heading. Cast wide — flank, rule, line, hr, divider, ::before/::after. */
const FLANK = /flank|sect-head|sec-head|head__line|__rule|divider|hairline-line/i;
/* Header nav type: font-size / letter-spacing / weight on a nav link. */
const NAV = /nav__link|nav__item|menu__link|header__nav|\.nav\b/i;

const report = { flank: [], nav: [] };

for (const path of files) {
  const src = await readFile(path, 'utf8');
  src.split('\n').forEach((line, i) => {
    const n = i + 1;
    const t = line.trim();
    if (!t || t.startsWith('*') || t.startsWith('//')) return;
    if (FLANK.test(t)) report.flank.push(`${path}:${n}  ${t}`);
    if (NAV.test(t) && /font|letter-spacing|text-transform|size|weight/i.test(t))
      report.nav.push(`${path}:${n}  ${t}`);
  });
}

const show = (title, rows) => {
  console.log(`\n---- ${title} (${rows.length}) ----`);
  rows.slice(0, 60).forEach((r) => console.log(r));
  if (rows.length > 60) console.log(`  ... ${rows.length - 60} more`);
};

show('flanked heading candidates', report.flank);
show('header nav type candidates', report.nav);
