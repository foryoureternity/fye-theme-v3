/* mega-css-consolidate.mjs — 31/08/2026
 *
 * Replaces THREE generations of mega-menu CSS with one authoritative block,
 * and pulls the two inline <style> blocks back out of the snippets.
 *
 * WHY A SCRIPT, when the rule is now "write whole files directly":
 * header-bottom.liquid is 58KB and its tail holds the {% schema %}. Neither
 * reader returns the whole file, so a whole-file write would risk losing the
 * schema. A script edits the span in place without needing to hold the rest.
 * This is the exception the process doc allows, not a return to patch scripts.
 *
 * WHAT IS WRONG TODAY
 * -------------------
 * The stylesheet block accumulated in layers, each appended rather than
 * merged, each overriding the last:
 *
 *   1. "MEGA PANELS — rebuilt 28/08"     ~130 lines
 *   2. "MEGA PANELS v2 — 28/08"          ~130 lines, a near-verbatim COPY of 1
 *   3. "polish" + "shape grid" + tabs     ~90 lines of corrections to 1 and 2
 *   4. "MEASURED SCALE 29/08"             ~80 lines re-stating sizes measured
 *                                          off live
 *   5. "diamonds sub-zones"               ~70 lines
 *   plus mm-guide-card.liquid and mm-diamonds.liquid each shipping a <style>
 *   block inline — mm-guide-card renders up to 5x per page, so that CSS goes
 *   over the wire five times.
 *
 * Roughly 25 selectors are declared two or three times. .mm__zone-title is
 * declared 4x, .mm__shapes 4x, .mm__label 3x. Reading it tells you nothing
 * about what actually applies; you have to run the cascade in your head. That
 * is what made every fix last week slow.
 *
 * WHAT THIS WRITES INSTEAD
 * ------------------------
 * One block, each selector declared ONCE, carrying the value that currently
 * wins. Nothing here is a new design decision — every number is the one live
 * measured at, or the one the last override set. Verified by reading the
 * cascade top to bottom before writing.
 *
 * Two deliberate changes beyond deduplication:
 *   - the guide-card and diamonds rules move from the snippets into here, so
 *     the CSS is cached with the section instead of re-sent per render;
 *   - the defensive chains those inline blocks needed to out-specify the
 *     section (.fye .mm__card .mm__card-title) drop back to single-class
 *     selectors, since they are no longer fighting anything.
 *
 * The drawer-accordion rules sit inside the replaced span and are carried
 * through unchanged — check they survive.
 *
 * SAFETY: refuses unless it finds the start marker and the stylesheet close,
 * and unless the tail after the close still contains {% schema %}.
 *
 * Run from the repo root:  node docs/tools/mega-css-consolidate.mjs
 * Then: git add -A && git commit && git pull --rebase && git push
 * Delete this file once it has run.
 */

import { readFile, writeFile } from 'node:fs/promises';

const SECTION = 'sections/header-bottom.liquid';
const CARD    = 'snippets/mm-guide-card.liquid';
const DIA     = 'snippets/mm-diamonds.liquid';

const START = `/* ============================================================================
   MEGA PANELS — rebuilt 28/08/2026 to the live designs`;
const CLOSE = '{% endstylesheet %}';

const CONSOLIDATED = `/* ============================================================================
   MEGA PANELS
   ----------------------------------------------------------------------------
   Consolidated 31/08/2026 from five overlapping generations. Every selector is
   declared ONCE here. Sizes are the values live measured at (1470px viewport,
   panel open, read from computed styles) — not estimates, and not tokens.
   Chrome is pixel work; do not "tidy" these into --s* without re-measuring.

   Layout summary:
     ring panels      1312px container, main + 480px guide rail
     diamonds panel   1375px container, 831px main + 480px rail (live is wider)
     the rail         48px gutter, hairline on its left edge
     cut grid         6 x 80px tracks standalone, 6 x 96px inside a sub-zone

   BEFORE ADDING A RULE: find the existing declaration and change it. Appending
   an override is what turned this file into 400 lines of cascade archaeology.
   ========================================================================== */

/* Panel shell. position: static on the item so the panel can span the full
   header width; the nav band is the positioned ancestor. */
.fye .hdr__nav-item.has-mega { position: static; }

.fye .has-mega .mega {
  position: absolute;
  left: 0; right: 0; top: 100%;
  transform: none;
  min-width: 0;
  max-height: calc(100vh - 190px);
  overflow-y: auto;
  background: var(--ivory);
  border: 0;
  border-top: 1px solid rgba(35, 61, 71, 0.35);
  padding: 24px 32px 48px;
}

/* Content is 1160px on live's ring panels, but the guide rail needs 480px to
   hold a title on one line, so the container widens to suit. */
.fye .has-mega .mega__in {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 480px;
  column-gap: 64px;
  max-width: 1312px;
  margin-inline: auto;
  align-items: start;
}
/* Live gives the diamonds panel its own, wider geometry. */
.fye .mega:has(.mm__tab-in) .mega__in {
  grid-template-columns: 831px 480px;
  max-width: 1375px;
}
.fye .has-mega .mega__in--wide { grid-template-columns: minmax(0, 1fr); }

/* min-width: 0 is load-bearing. A grid item defaults to min-width: auto — "at
   least as wide as my content" — and the 25-cut grid's natural width is
   enormous, so the track grew and pushed the rail off-screen. grid-column is
   pinned so placement cannot depend on source order. */
.fye .mm__main { min-width: 0; grid-column: 1; }
.fye .mm__side {
  min-width: 0;
  grid-column: 2;
  padding-left: 48px;
  border-left: 1px solid rgba(35, 61, 71, 0.18);
}
.fye .mega__in--wide .mm__side { grid-column: 1; border-left: 0; padding-left: 0; }

/* ---- heads and labels --------------------------------------------------- */

.fye .mm__row-head {
  display: flex; align-items: baseline; justify-content: space-between;
  gap: var(--s6);
  margin-bottom: var(--s5);
}
.fye .mm__row-head--major {
  padding-bottom: var(--s4);
  border-bottom: 1px solid rgba(35, 61, 71, 0.18);
  margin-bottom: var(--s7);
}
/* The tab bar sits inside the zone head, so it must not repeat the head's
   own bottom rule. */
.fye .mm__row-head--major .mm__tab-bar { border: 0; margin: 0; gap: var(--s7); }

.fye .mm__zone-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 19px;
  font-weight: 400;
  letter-spacing: 0.08em;
  line-height: 1.2;
  text-transform: uppercase;
}
/* nowrap belongs to the LEFT zone only — the rail's headings are longer and
   two non-wrapping labels in one narrow track overlapped outright. */
.fye .mm__main .mm__zone-title { white-space: nowrap; }
.fye .mm__side .mm__zone-title { white-space: normal; }
/* Live's diamonds rail has no zone title; it starts at the card. Ours printed
   the guide name twice and pushed the Learn lists down. */
.fye .mega:has(.mm__tab-in) .mm__side .mm__row-head--major { display: none; }

.fye .mm__viewall {
  display: inline-flex; align-items: center; gap: var(--s3);
  font-size: 12px; font-weight: 500;
  letter-spacing: 0.08em; text-transform: uppercase;
  white-space: nowrap;
}

/* Category label, not a link — softer than body ink. 500 rather than 400
   because at 11px the lighter weight cannot hold its colour. */
.fye .mm__label {
  display: block;
  margin: 0 0 16px;
  font-size: 11px; font-weight: 500;
  letter-spacing: 0.18em; text-transform: uppercase;
  color: rgba(35, 61, 71, 0.62);
  white-space: nowrap;
}
.fye .mm__side-cols .mm__label { white-space: normal; line-height: 1.35; }

/* ---- left zone: columns and lists --------------------------------------- */

.fye .mm__cols { display: flex; gap: var(--s11); align-items: flex-start; }
/* A row carrying the cut grid is tighter: the grid is 491px of fixed content,
   so an 80px gap overflowed the track and crushed the second column. */
.fye .mm__cols:has(.mm__cuts-wrap) { gap: 48px; }
.fye .mm__col { min-width: 0; }

.fye .mm__list { margin: 0; padding: 0; list-style: none; }
.fye .mm__list li { margin: 0 0 var(--s4); }
.fye .mm__list a,
.fye .mm__list--caps a {
  display: inline-flex; align-items: center; gap: var(--s3);
  font-size: 12px; font-weight: 500;
  letter-spacing: 0.06em; text-transform: uppercase;
  line-height: 1.3;
}
.fye .mm__list--dots a { gap: var(--s4); }
.fye .mm__side-cols .mm__list a { white-space: normal; }

/* A list of 11+ flows into two columns. Below that live keeps one column
   (wedding's nine profiles), so the threshold is deliberate. */
.fye .mm__list:has(li:nth-child(11)) { column-count: 2; column-gap: 48px; }
.fye .mm__list:has(li:nth-child(11)) li { break-inside: avoid; }

/* Sub-zone divider: the column holding the cut grid is the left zone, the one
   after it carries the rule — mirroring the main divider on .mm__side. */
.fye .mm__col:has(.mm__cuts-wrap) { flex: 0 0 auto; }
.fye .mm__col:has(.mm__cuts-wrap) + .mm__col {
  padding-left: 48px;
  border-left: 1px solid rgba(35, 61, 71, 0.18);
  align-self: stretch;
}
.fye .mm__col .mm__cuts-wrap { margin-top: 32px; padding-top: 0; border-top: 0; }

/* ---- shape grid ---------------------------------------------------------
   Two explicit columns, normal row flow. grid-auto-flow: column with no row
   count put all ten shapes in ONE row: the grid overflowed the sheet, clipped
   Asscher mid-word, and on the wedding panel printed OVAL on top of
   TRADITIONAL COURT. mm-shapes authors its arrays in reading PAIRS
   (Round/Pear, Princess/Emerald), which is row-major — do not restore
   column flow without also reordering the snippet. */
.fye .mm__shapes {
  display: grid;
  grid-auto-flow: row;
  grid-template-columns: repeat(2, max-content);
  gap: var(--s3) var(--s8);
  margin: 0; padding: 0; list-style: none;
}
.fye .mm__shapes li { margin: 0; }
.fye .mm__shapes a {
  display: inline-flex; align-items: center; gap: var(--s4);
  font-size: 12px; font-weight: 500;
  letter-spacing: 0.06em; text-transform: uppercase;
  white-space: nowrap;
}
.fye .mm__shapes img { width: 38px; height: 38px; flex: none; }

/* ---- cuts grid ----------------------------------------------------------
   A different object from the shape grid: six fixed tracks, a 26px icon
   stacked ABOVE a centred 9.5px caption, 2px gap. Live gives it 80px tracks —
   6x80 + 5x2 = 491px, which is what live measured. */
.fye .mm__cuts-wrap {
  margin-top: var(--s8);
  padding-top: var(--s6);
  border-top: 1px solid rgba(35, 61, 71, 0.18);
}
.fye .mm__cuts {
  display: grid;
  grid-template-columns: repeat(6, 80px);
  gap: 2px;
  justify-content: start;
  margin: 0; padding: 0; list-style: none;
}
.fye .mm__cuts li { margin: 0; }
.fye .mm__cuts a {
  display: flex; flex-direction: column; align-items: center;
  gap: 6px;
  padding: 8px 2px;
  font-size: 9.5px; font-weight: 500;
  letter-spacing: 0.08em; text-transform: uppercase;
  line-height: 1.2;
  text-align: center;
}
.fye .mm__cuts img { width: 26px; height: 26px; }

/* ---- stones and swatches ------------------------------------------------ */

.fye .mm__stones-wrap {
  margin-top: var(--s9);
  padding-top: var(--s6);
  border-top: 1px solid rgba(35, 61, 71, 0.18);
}
.fye .mm__stones {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: var(--s4) var(--s6);
  margin: 0; padding: 0; list-style: none;
}
/* Live runs the gemstone grid at 4 columns. At 5 the labels wrapped. */
.fye .mm__main:has(.mm__tab-in) .mm__stones {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}
.fye .mm__stones li { margin: 0; }
.fye .mm__stones a {
  display: inline-flex; align-items: flex-start; gap: var(--s4);
  font-size: 12px; font-weight: 500;
  letter-spacing: 0.06em; text-transform: uppercase;
  line-height: 1.25;
}

/* Dots align to the label's FIRST line: centring against a two-line label
   ("Salt & Pepper", "Yellow Sapphire") drops the dot below its single-line
   neighbours and the row stops reading as a row. The nudge is half the
   difference between the line box and the dot, in em so it survives a
   type-size change. */
.fye .mm__dot {
  width: 22px; height: 22px; flex: 0 0 auto;
  border-radius: 50%;
  border: 1px solid transparent;
  margin-top: calc((1.25em - 22px) / 2);
}
/* Pale stones and the metal swatches need an edge or they vanish on ivory. */
.fye .mm__dot--pale { border-color: rgba(35, 61, 71, 0.28); }

/* ---- panel tabs ---------------------------------------------------------
   CSS-only: the radios are visually hidden but focusable, so the tabs are
   keyboard operable with no JavaScript. The radios must be direct children of
   .mm__main ahead of the bodies — every rule below is a sibling selector and
   cannot climb out of .mm__tab-bar. */
.fye .mm__tab-in {
  position: absolute;
  width: 1px; height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}
.fye .mm__tab-bar {
  display: flex;
  gap: var(--s8);
  margin-bottom: var(--s7);
  border-bottom: 1px solid rgba(35, 61, 71, 0.18);
}
.fye .mm__tab {
  padding: 0 0 var(--s3);
  margin-bottom: -1px;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-family: var(--font-display);
  font-size: 24px;
  letter-spacing: var(--tr-h2);
  line-height: 1.2;
  text-transform: uppercase;
  color: rgba(35, 61, 71, 0.45);
  transition: color var(--dur) var(--ease), border-color var(--dur) var(--ease);
}
.fye .mm__tab:hover { color: var(--sage); }

/* Scoped with :has() deliberately. An unscoped hide also caught the panels
   with no tabs, which have no radio to reveal their single body — so those
   panels rendered a heading and nothing else. */
.fye .mm__main:has(.mm__tab-in) .mm__tab-body { display: none; }
.fye .mm__tab-in:nth-of-type(1):checked ~ .mm__tab-body--1,
.fye .mm__tab-in:nth-of-type(2):checked ~ .mm__tab-body--2 { display: block; }
.fye .mm__tab-in:nth-of-type(1):checked ~ .mm__row-head .mm__tab:nth-of-type(1),
.fye .mm__tab-in:nth-of-type(2):checked ~ .mm__row-head .mm__tab:nth-of-type(2) {
  color: var(--ink);
  border-bottom-color: var(--ink);
}
/* Focus must show on the LABEL, since the input itself is hidden. */
.fye .mm__tab-in:focus-visible ~ .mm__row-head .mm__tab {
  outline: 2px solid var(--teal);
  outline-offset: 3px;
}

/* ---- diamonds panel sub-zones ------------------------------------------
   Moved out of mm-diamonds.liquid 31/08. Live's tab 1 is two sub-zones side
   by side, divided by a hairline — not a column loop with a grid beneath. */

.fye .mm-dg-cols { display: flex; gap: 28px; align-items: flex-start; }
.fye .mm-dg-col { min-width: 0; flex: 0 0 auto; }
.fye .mm-dg-col--aside {
  flex: 1 1 auto;
  padding-left: 32px;
  border-left: 1px solid rgba(35, 61, 71, 0.18);
  align-self: stretch;
}

/* min-height + flex-end keeps the two sub-zone titles level: White Diamonds
   carries a View All (a 24px icon row) and Fancy Coloured does not, so its
   title floated 24px higher. */
.fye .mm-dg-colhead {
  display: flex; align-items: flex-end; justify-content: space-between;
  gap: 20px;
  min-height: 24px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(35, 61, 71, 0.18);
}
.fye .mm-dg-coltitle {
  margin: 0;
  font-family: var(--font-display);
  font-size: 13px; font-weight: 400;
  letter-spacing: 0.14em; text-transform: uppercase;
  white-space: nowrap;
}
.fye .mm-viewall-link {
  display: inline-flex; align-items: center; gap: 9px;
  font-size: 11.5px; font-weight: 500;
  letter-spacing: 0.18em; text-transform: uppercase;
  white-space: nowrap;
}

/* Live sits the shape label almost on top of this row — 6px, not 16px. */
.fye .mm-dg-sublinks {
  display: flex; flex-wrap: nowrap; gap: 22px;
  margin: 12px 0 6px;
}
.fye .mm-dg-sublinks a {
  font-size: 12.5px; font-weight: 500;
  letter-spacing: 0.08em; text-transform: uppercase;
  white-space: nowrap;
}

.fye .mm-col-label {
  display: block;
  margin: 0 0 12px;
  font-size: 11px; font-weight: 500;
  letter-spacing: 0.18em; text-transform: uppercase;
  color: rgba(35, 61, 71, 0.62);
}
.fye .mm-gem .mm-col-label { margin-top: 14px; }

/* Inside a sub-zone the cut grid is not a band: no rule, no band margin, and
   96px tracks rather than the 80px it uses standing alone. */
.fye .mm-dg-col .mm__cuts-wrap { margin: 0; padding: 0; border: 0; }
.fye .mm-dg-col .mm__cuts { grid-template-columns: repeat(6, 96px); }

/* Row-major: the snippets interleave their arrays (Yellow, Pink, Blue…) so
   markup order IS reading order. Do not add grid-auto-flow: column. */
.fye .mm-dg-swatches { display: grid; margin: 0; padding: 0; list-style: none; }
.fye .mm-dg-swatches--2col { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px 20px; }
.fye .mm-dg-swatches--4col { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 4px 20px; }
.fye .mm-dg-swatches li { margin: 0; }
.fye .mm-dg-swatches a {
  display: inline-flex; align-items: flex-start; gap: 10px;
  padding: 4px 0;
  font-size: 12px; font-weight: 500;
  letter-spacing: 0.06em; text-transform: uppercase;
  line-height: 1.25;
}
.fye .mm-dg-swatches .mm__dot {
  width: 18px; height: 18px; flex: 0 0 18px;
  margin-top: calc((1.25em - 18px) / 2);
}
.fye .mm-dg-colfoot { padding-top: 16px; }

/* ---- right zone: guide card and learn lists -----------------------------
   Moved out of mm-guide-card.liquid 31/08, where it shipped once per card —
   up to five times a page. The rail is 480px so the title holds one or two
   lines and the download never collides with it. */

.fye .mm__card {
  display: flex; align-items: flex-start;
  gap: 24px;
  padding: 24px;
  background: var(--white);
  margin-bottom: var(--s6);
}
.fye .mm__card-cover { flex: 0 0 128px; }
.fye .mm__card-cover img { display: block; width: 128px; height: auto; }
.fye .mm__card-words {
  flex: 1 1 auto; min-width: 0;
  display: flex; flex-direction: column; align-items: flex-start; gap: 10px;
}
.fye .mm__card-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 15px;
  letter-spacing: 0.06em;
  line-height: 1.3;
  text-transform: uppercase;
  overflow-wrap: break-word;
  text-wrap: pretty;
}
/* "The Diamond & Gemset Wedding Ring Guide" is the longest by some way. */
.fye .mm__card-title--long { font-size: 13px; letter-spacing: 0.04em; }
.fye .mm__card-blurb {
  margin: 0;
  font-size: 13px; font-weight: 300;
  letter-spacing: 0;
  line-height: 1.5;
  text-transform: none;
  color: rgba(35, 61, 71, 0.78);
}
.fye .mm__card-dl {
  display: inline-flex; align-items: center; gap: 10px;
  margin-top: 6px;
  font-size: 13px; font-weight: 500;
  letter-spacing: 0.12em; text-transform: uppercase;
  white-space: nowrap;
}
.fye .mm__card-dl .icon { flex: 0 0 auto; }

.fye .mm__side-cols {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 40px;
  margin-top: var(--s8);
  padding-top: var(--s7);
  border-top: 1px solid rgba(35, 61, 71, 0.18);
}

.fye .mm__note {
  margin: var(--s6) 0 0;
  font-size: 15px; font-weight: var(--fw-light);
  line-height: 1.5;
  color: var(--ink-soft);
}

/* ---- drawer accordion --------------------------------------------------- */

.fye .drawer__acc > summary {
  display: flex; align-items: center; justify-content: space-between;
  gap: var(--s4);
  min-height: 48px;
  cursor: pointer;
  list-style: none;
  font-size: 15px; font-weight: var(--fw-semi);
  letter-spacing: 0.09em; text-transform: uppercase;
}
.fye .drawer__acc > summary::-webkit-details-marker { display: none; }
.fye .drawer__acc > summary .icon { transition: transform var(--dur) var(--ease); flex: none; }
.fye .drawer__acc[open] > summary .icon { transform: rotate(180deg); }
.fye .drawer__sub { margin: 0 0 var(--s4); padding: 0 0 0 var(--s4); list-style: none; }
.fye .drawer__sub li { border: 0; padding: var(--s2) 0; margin: 0; }
.fye .drawer__sub a { font-size: 15px; font-weight: var(--fw-light); letter-spacing: 0; text-transform: none; }
.fye .drawer__sub-deep { padding-left: var(--s4); }
.fye .drawer__sub-deep a { font-size: 14px; color: var(--ink-soft); }

/* ---- mega panel breakpoints — last in the chain, as they must be -------- */

@media (max-width: 1400px) {
  /* Below the diamonds panel's own width the fixed 831px track cannot hold;
     let it flex rather than overflow the sheet. */
  .fye .mega:has(.mm__tab-in) .mega__in { grid-template-columns: minmax(0, 1fr) 420px; }
  .fye .mm__card-title { font-size: 14px; }
}
@media (max-width: 1280px) {
  .fye .has-mega .mega__in { grid-template-columns: minmax(0, 1fr) 380px; column-gap: var(--s8); }
  .fye .mm__side { padding-left: var(--s8); }
  .fye .mm__cols { gap: var(--s9); }
}
@media (max-width: 1100px) {
  .fye .mm__cols { flex-wrap: wrap; gap: var(--s8); }
  .fye .mm__stones { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .fye .mm-dg-cols { flex-wrap: wrap; }
  .fye .mm-dg-col--aside { padding-left: 0; border-left: 0; }
}
`;

/* ---- strip the inline <style> blocks from the two snippets -------------- */
const stripStyle = (src) => src.replace(/[ \t]*<style>[\s\S]*?<\/style>\n?/g, '');

const section = await readFile(SECTION, 'utf8');
const card    = await readFile(CARD, 'utf8');
const dia     = await readFile(DIA, 'utf8');

const startAt = section.indexOf(START);
const closeAt = section.indexOf(CLOSE);
const problems = [];

if (startAt === -1) problems.push('start marker "MEGA PANELS — rebuilt 28/08/2026" not found');
if (closeAt === -1) problems.push('{% endstylesheet %} not found');
if (startAt !== -1 && closeAt !== -1 && closeAt < startAt) problems.push('markers out of order');
if (closeAt !== -1 && !section.slice(closeAt).includes('{% schema %}')) {
  problems.push('no {% schema %} after the stylesheet close — refusing, the tail may be truncated');
}
if (!/<style>/.test(card)) problems.push(`${CARD}: no inline <style> to remove (already done?)`);
if (!/<style>/.test(dia))  problems.push(`${DIA}: no inline <style> to remove (already done?)`);

if (problems.length) {
  console.error('REFUSED, nothing written:');
  problems.forEach(m => console.error('  ' + m));
  process.exit(1);
}

const before = section.slice(0, startAt);
const after  = section.slice(closeAt);
const out    = before + CONSOLIDATED + '\n' + after;

const cardOut = stripStyle(card);
const diaOut  = stripStyle(dia);

await writeFile(SECTION, out, 'utf8');
await writeFile(CARD, cardOut, 'utf8');
await writeFile(DIA, diaOut, 'utf8');

const kb = n => (n / 1024).toFixed(1) + 'KB';
console.log(`${SECTION}  ${kb(section.length)} -> ${kb(out.length)}`);
console.log(`${CARD}     ${kb(card.length)} -> ${kb(cardOut.length)}`);
console.log(`${DIA}      ${kb(dia.length)} -> ${kb(diaOut.length)}`);
console.log(`\ntotal saved: ${kb((section.length + card.length + dia.length) - (out.length + cardOut.length + diaOut.length))}`);
console.log('\nCheck after reload: all five panels open, tabs switch, cut grid at');
console.log('6 columns, guide cards show blurbs, drawer accordions still work.');
