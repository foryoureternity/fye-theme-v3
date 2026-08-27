/* ============================================================================
   fix-hero-padding.mjs — 27/08/2026
   ----------------------------------------------------------------------------
     cd ~/Dropbox/GIT-repositaries/fye-theme-v3
     node docs/tools/fix-hero-padding.mjs

   Delete once run and synced.

   THE BUG
   `.hero--media` is `display: flex` so short copy can sit vertically centred
   on a tall photograph. That turned `.hero__in` — which is a `.wrap` — into a
   flex item. Flex items shrink-to-fit instead of filling the line, so the wrap
   collapsed to the width of its own text, and `.wrap`'s `margin-inline: auto`
   then centred that narrow box. Result: on a 1277px viewport the copy started
   ~305px in, with no padding value anywhere saying so.

   `width: 100%` restores block behaviour, so the wrap fills the band, its
   max-width and auto margins centre it properly, and the copy starts at the
   gutter — matching live, whose hero is a 1368px container with a 24px gutter.

   THE RULE THIS BELONGS TO
   Same failure as the `.shopify-section` one already in conventions: a flex or
   grid parent silently changes how its children size themselves. Any `.wrap`
   inside a flex container needs `width: 100%`, or it stops being a container.
   Added to conventions as the ninth non-negotiable.
   ========================================================================== */

import { readFile, writeFile } from 'node:fs/promises';

const edits = [
  {
    file: 'sections/fye-hero.liquid',
    find: `.fye .hero--media .hero__in { position: relative; z-index: 1; }`,
    replace: `/* width: 100% is load-bearing. .hero--media is display:flex, which makes this
   wrap a flex item — without an explicit width it shrink-to-fits its own text
   and .wrap's auto margins then centre that narrow box, indenting the copy by
   a few hundred px. See the ninth non-negotiable in conventions.md. */
.fye .hero--media .hero__in { position: relative; z-index: 1; width: 100%; }`
  },
  {
    file: 'docs/conventions.md',
    find: `## 10. Before you build a section at all`,
    replace: `### 9. A \`.wrap\` inside a flex or grid parent needs \`width: 100%\`

A flex item shrink-to-fits. Put a \`.wrap\` inside \`display: flex\` and it stops
being a full-width container: it collapses to its content, and its own
\`margin-inline: auto\` centres that collapsed box. The symptom is content
mysteriously indented by a few hundred pixels with no padding rule responsible
— which is how the homepage hero shipped with its copy a third of the way
across the screen.

Same family as the \`.shopify-section\` rule above: **a parent's display type
changes how its children size themselves.** When a section wraps its inner
container in flex or grid for vertical centring, the inner container needs
\`width: 100%\` stated explicitly.

## 10. Before you build a section at all`
  }
];

for (const { file, find, replace } of edits) {
  const src = await readFile(file, 'utf8');
  const n = src.split(find).length - 1;
  if (n !== 1) {
    console.log(`SKIP  ${file} — found ${n} matches, expected 1`);
    continue;
  }
  await writeFile(file, src.replace(find, replace), 'utf8');
  console.log(`FIXED ${file}`);
}
