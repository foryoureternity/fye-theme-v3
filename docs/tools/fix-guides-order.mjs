/* ============================================================================
   fix-guides-order.mjs — 27/08/2026
   ----------------------------------------------------------------------------
     cd ~/Dropbox/GIT-repositaries/fye-theme-v3
     node docs/tools/fix-guides-order.mjs

   Delete once run and synced.

   THE DIAGNOSIS, from one console line:
     {vw: 399, dir: 'column', minH: '68px', border: '1px', coverW: '351px'}

   min-height and border-bottom applied. flex-direction and cover width did
   not. Same rule, same media query — so it was never a media query problem.

   I inserted the mobile block where the OLD breakpoint blocks were, which is
   near the top of the stylesheet, ABOVE the base `.guides__item` and
   `.guides__cover` rules. Equal specificity, so the base rules — being later —
   won for every property they declare. min-height and border-bottom survived
   only because the base rules never mention them. A perfect partial apply,
   which is exactly what the console showed.

   THE FIX
   The mobile block moves to the end of the stylesheet, where a mobile override
   belongs. Done by brace-matching the block and re-inserting it before
   {% endstylesheet %} rather than by string surgery on its contents, so
   nothing inside it changes.

   THE RULE
   Media-query overrides go LAST in a stylesheet. A media query does not raise
   specificity — it only adds a condition — so a mobile block sitting above the
   rules it means to override does nothing for any property those rules set.
   This is the same class of error as the core-versus-section one an hour ago:
   both are cascade order, not selectors.
   ========================================================================== */

import { readFile, writeFile } from 'node:fs/promises';

const FILE = 'sections/guide-download-block.liquid';
let src = await readFile(FILE, 'utf8');

const MARK = '/* ============================================================================\n   MOBILE (<=768px)';

const markIdx = src.indexOf(MARK);
if (markIdx === -1) {
  console.log('SKIP  mobile block comment not found');
  process.exit(0);
}

/* The @media that follows the comment. */
const openIdx = src.indexOf('@media (max-width: 768px) {', markIdx);
if (openIdx === -1) {
  console.log('SKIP  @media (max-width: 768px) not found after the comment');
  process.exit(0);
}

/* Brace-match to the block's real end — it contains nested rules and data URIs
   with braces in them is not a thing, but nested rules certainly are. */
let depth = 0;
let endIdx = -1;
for (let i = src.indexOf('{', openIdx); i < src.length; i++) {
  if (src[i] === '{') depth++;
  else if (src[i] === '}') {
    depth--;
    if (depth === 0) { endIdx = i + 1; break; }
  }
}

if (endIdx === -1) {
  console.log('SKIP  could not brace-match the mobile block');
  process.exit(0);
}

const block = src.slice(markIdx, endIdx);
const before = src.slice(0, markIdx);
const after = src.slice(endIdx);

/* Remove it from where it is, then place it immediately before the stylesheet
   closes. */
let rest = (before + after).replace(/\n{3,}/g, '\n\n');

const closer = '{% endstylesheet %}';
if (!rest.includes(closer)) {
  console.log('SKIP  {% endstylesheet %} not found');
  process.exit(0);
}

rest = rest.replace(
  closer,
  `${block}\n${closer}`
);

await writeFile(FILE, rest, 'utf8');
console.log(`FIXED ${FILE} — mobile block moved to the end of the stylesheet`);
console.log('  it was above the base .guides__item / .guides__cover rules, so');
console.log('  flex-direction and width were being overridden by them');
