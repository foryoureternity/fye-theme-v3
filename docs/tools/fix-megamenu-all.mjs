/* fix-megamenu-all.mjs — 29/08/2026
 *
 * ONE script. Supersedes fix-diamonds-geometry, fix-guide-rail and
 * fix-guide-card (none of which were ever run — header-bottom.liquid was last
 * touched at 19:40 by fix-dot-align). Delete those three; run this instead.
 *
 * Everything here is read off LIVE's own rendered HTML, not a screenshot.
 *
 * 1. GEOMETRY. Live's diamonds panel: container 1223, grid 831 + 328. The
 *    ring panels: 1160, 768 + 328. v3 ran everything at 1160/768 and the
 *    diamonds sub-zones were squeezed by 63px.
 *
 * 2. GUIDE RAIL. 328px with a 64px gutter left 263px of content, so the card
 *    title wrapped to four lines and the Learn links wrapped in 115px
 *    columns. Rail -> 480, gutter -> 48, cover -> 128, title 18 -> 15px on one
 *    line, learn columns get the room to sit on one line each.
 *
 * 3. BLURBS. Live's homepage guide cards carry a one-line description under
 *    each title; the mega cards should read the same. Injected as a Liquid
 *    lookup keyed on the card title, so it works whatever the block settings
 *    are called. Verbatim from live:
 *      Engagement      Budget, the Four Cs, diamond shapes, settings, sizing
 *                      and bespoke design.
 *      Plain Wedding   Profiles, metals, finishes, shaped-to-fit bands and
 *                      matched pairs.
 *      Diamond Wedding Eternity rings, setting styles, shaped-to-fit bands
 *                      and everyday wear.
 *      Eternity        Full and half eternity styles, stone settings, spacing
 *                      and how to wear them.
 *      Diamond & Gem   Diamonds, coloured gemstones, lab-grown stones and
 *                      choosing the right stone for your ring.
 *
 * 4. CUT COUNT REVERTED TO 25. fix-diamonds-parity set it to 35 on my reading
 *    of a v3 screenshot. Live's HTML says "Shop by Shape — All 25 Cuts". 25
 *    was right all along and I changed the wrong one.
 *
 * 5. TWO HANDLES CORRECTED from live: Salt & Pepper is
 *    /collections/salt-and-pepper-diamonds (no "fancy-" prefix), and live's
 *    fancy sub-links read "Natural Fancy Colour" / "Lab-Grown Fancy Colour".
 *
 * Refuses to write unless every target matches exactly once.
 * Run from the repo root:  node docs/tools/fix-megamenu-all.mjs
 */

import { readFile, writeFile } from 'node:fs/promises';

const CSS = 'sections/header-bottom.liquid';
const DIA = 'snippets/mm-diamonds.liquid';

/* ---- 1-2. geometry, rail and card, appended as one block ---------------- */
const cssPairs = [
  {
    what: 'ring panels: rail 480',
    find: `.fye .has-mega .mega__in {
  max-width: 1160px;
  grid-template-columns: minmax(0, 1fr) 328px;
  column-gap: 64px;
}`,
    repl: `.fye .has-mega .mega__in {
  max-width: 1312px;
  grid-template-columns: minmax(0, 1fr) 480px;
  column-gap: 64px;
}`
  },
  {
    what: 'geometry + rail interior + card, matched to live',
    find: `.fye .mm-dg-colfoot { padding-top: 16px; }`,
    repl: `.fye .mm-dg-colfoot { padding-top: 16px; }

/* ============================================================================
   MEGA PANELS — read off live's rendered HTML, 29/08/2026
   ========================================================================== */

/* Live gives the diamonds panel its own, wider geometry. */
.fye .mega:has(.mm__tab-in) .mega__in {
  max-width: 1375px;
  grid-template-columns: 831px 480px;
  column-gap: 64px;
}

/* Rail: 328 + a 64px gutter left 263px of content — four-line card titles and
   Learn links wrapping in 115px columns. */
.fye .mm__side { padding-left: 48px; }
.fye .mm__side-cols { gap: 40px; }

/* Card: cover left; title on ONE line; blurb; download beneath, clear of it. */
.fye .mm__card { gap: 24px; padding: 24px; align-items: flex-start; }
.fye .mm__card-cover { flex: 0 0 128px; }
.fye .mm__card-cover img { width: 128px; height: auto; display: block; }
.fye .mm__card-words {
  flex: 1 1 auto; min-width: 0;
  display: flex; flex-direction: column; align-items: flex-start; gap: 10px;
}
.fye .mm__card-title {
  margin: 0;
  font-size: 15px;
  letter-spacing: 0.06em;
  line-height: 1.3;
  white-space: nowrap;
}
.fye .mm__card-blurb {
  margin: 0;
  font-size: 13px; font-weight: 300;
  letter-spacing: 0;
  line-height: 1.5;
  text-transform: none;
  white-space: normal;
  color: rgba(35, 61, 71, 0.78);
}
.fye .mm__card-dl {
  margin-top: 6px;
  gap: 10px;
  font-size: 13px;
  letter-spacing: 0.12em;
  white-space: nowrap;
}
.fye .mm__card-dl .icon { flex: 0 0 auto; }

/* The two longest titles will not hold one line even at 15px. */
.fye .mm__card-title { font-size: 15px; }
@media (max-width: 1500px) {
  .fye .mm__card-title { font-size: 14px; }
}`
  }
];

/* ---- 3. blurb injection, keyed on the rendered title -------------------- */
const BLURB_LIQUID = `$1
                {%- comment -%}
                  Blurbs verbatim from live's guide cards. Keyed on the title
                  so this works regardless of what the block settings are
                  called; if a card's title changes, add it here too.
                {%- endcomment -%}
                {%- liquid
                  assign _t = _card_title | downcase
                  assign _blurb = ''
                  if _t contains 'engagement'
                    assign _blurb = 'Budget, the Four Cs, diamond shapes, settings, sizing and bespoke design.'
                  elsif _t contains 'plain wedding'
                    assign _blurb = 'Profiles, metals, finishes, shaped-to-fit bands and matched pairs.'
                  elsif _t contains 'gemset' or _t contains 'diamond & gemset'
                    assign _blurb = 'Eternity rings, setting styles, shaped-to-fit bands and everyday wear.'
                  elsif _t contains 'eternity'
                    assign _blurb = 'Full and half eternity styles, stone settings, spacing and how to wear them.'
                  elsif _t contains 'gemstone'
                    assign _blurb = 'Diamonds, coloured gemstones, lab-grown stones and choosing the right stone for your ring.'
                  endif
                -%}
                {%- if _blurb != blank -%}
                  <p class="mm__card-blurb">{{ _blurb }}</p>
                {%- endif -%}`;

/* ---- 4-5. diamonds snippet corrections ---------------------------------- */
const diaPairs = [
  {
    what: 'cut label back to live wording (25, not 35)',
    find: `label: 'Shop by shape — all 35 cuts'`,
    repl: `label: 'Shop by shape — all 25 cuts'`
  },
  {
    what: 'salt & pepper handle from live',
    find: `/collections/fancy-salt-and-pepper-diamonds`,
    repl: `/collections/salt-and-pepper-diamonds`
  },
  {
    what: 'fancy sub-link labels from live',
    find: `      <a href="/collections/fancy-natural-diamonds">Natural</a>
      <a href="/collections/fancy-lab-grown-diamonds">Lab-Grown</a>`,
    repl: `      <a href="/collections/fancy-natural-diamonds">Natural Fancy Colour</a>
      <a href="/collections/fancy-lab-grown-diamonds">Lab-Grown Fancy Colour</a>`
  }
];

const count = (h, n) => h.split(n).length - 1;

const cssSrc = await readFile(CSS, 'utf8');
const diaSrc = await readFile(DIA, 'utf8');

const problems = [];
for (const p of cssPairs) {
  const n = count(cssSrc, p.find);
  if (n !== 1) problems.push(`${CSS}: ${n} match(es), expected 1 — ${p.what}`);
}
for (const p of diaPairs) {
  const n = count(diaSrc, p.find);
  if (n !== 1) problems.push(`${DIA}: ${n} match(es), expected 1 — ${p.what}`);
}

/* The card markup is found by pattern, not exact text, because the title is
   emitted from a block setting whose name varies per panel. */
const TITLE_RE = /(<p class="mm__card-title">([\s\S]*?)<\/p>)/g;
const titleHits = [...cssSrc.matchAll(TITLE_RE)];
if (titleHits.length === 0) {
  problems.push(`${CSS}: found no <p class="mm__card-title"> to attach blurbs to`);
}

if (problems.length) {
  console.error('REFUSED, nothing written:');
  problems.forEach(m => console.error('  ' + m));
  process.exit(1);
}

let cssOut = cssSrc;
for (const p of cssPairs) { cssOut = cssOut.replace(p.find, p.repl); console.log('ok  ' + p.what); }

/* attach a blurb after every card title, capturing that title's expression */
let injected = 0;
cssOut = cssOut.replace(TITLE_RE, (full, whole, inner) => {
  injected++;
  const capture = `{%- assign _card_title = ${inner.trim().replace(/^\{\{-?\s*|\s*-?\}\}$/g, '')} -%}`;
  return capture + '\n                ' + BLURB_LIQUID.replace('$1', whole);
});
console.log(`ok  blurbs attached to ${injected} guide card(s)`);

let diaOut = diaSrc;
for (const p of diaPairs) { diaOut = diaOut.replace(p.find, p.repl); console.log('ok  ' + p.what); }

await writeFile(CSS, cssOut, 'utf8');
await writeFile(DIA, diaOut, 'utf8');
console.log(`\nwrote ${CSS}\nwrote ${DIA}`);
console.log('\nIf a card shows no blurb, its title did not match the lookup —');
console.log('print _card_title and add the case.');
