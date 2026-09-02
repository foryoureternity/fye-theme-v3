// w952-docs-smoke-round2.mjs — single-use patch. Run once, then delete it.
//
//   node tools/w952-docs-smoke-round2.mjs
//
// Appends the second round of smoke findings to docs/build-state.md — the
// gallery, blog, article and popup runs, the gate move, and the two lessons
// worth keeping. Idempotent: guarded on the heading it adds.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DOC = resolve(root, 'docs/build-state.md');
const GUARD = '# Session — 02/09/2026: smoke test, round two';

const BLOCK = `

---

${GUARD}

Everything built in the last two sessions is now measured at 559 and 1440:
gallery, blog listing, article, contact page, and — for the first time — a
popup with its dialog open.

## Fixed

| Where | Was | Now |
|---|---|---|
| \`.btn\` in \`guide-download-block\` (6 × "View guide") | 40px | 44px, scoped to \`.guides\` |
| \`.hdr__contact-link\` (phone / Email / Book appointment) | 18px | 44px under \`@media (pointer: coarse)\` |
| \`.pop__consent\` | label under 44px | 44px minimum |
| \`.pop__opt\` "(optional)" | 11px sentence case | 12px |

Two were scoped deliberately rather than fixed globally:

- **The guide buttons** are fixed inside \`.guides\`, not by raising \`.btn--sm\`
  in \`fye-core.css\`. That modifier is used in places this run has not
  measured, and raising every small button in the theme off one finding is a
  bigger change than the finding justifies. If \`.btn--sm\` turns out to be
  under 44px everywhere it appears, fix it in core THEN and delete the local
  rule.
- **The utility-bar links** are fixed only under \`pointer: coarse\`. Under a
  mouse 18px is right for a utility bar, and padding them out unconditionally
  would change the bar's height on every desktop — a height sampled from the
  live site.

## The lesson that will repeat: the popup and the contact page do not share CSS

The popup dialog produced exactly two faults — the consent row and
"(optional)" — and **both were the same two fixed on the contact page hours
earlier**. \`fye-contact\` was built FROM the popup, so they share their form
markup by descent, but each carries its own \`{% stylesheet %}\`. A fix to one
never reaches the other.

**Anything found in one of those two forms must be checked in the other in the
same pass.** If a third form appears, that is the moment to move the shared
rules into core.

## The gate moved into the layout — do not move it back

\`fyeSmoke\` was loaded by a block inside \`fye-ui.js\` that derived the debug
URL by string-replacing the filename in its own \`<script src>\`. That inherits
\`fye-ui.js\`'s \`?v=\` hash, so editing \`fye-debug.js\` alone left the URL
unchanged and the browser served a cached copy.

Adding a cache-buster inside \`fye-ui.js\` did not fix it, **because the stale
file can be \`fye-ui.js\` itself** — an old \`fye-ui.js\` carries the old loader.
Self-referential, and it cost four rounds: two where sharpened checks appeared
to do nothing, then one confirming
\`fyeSmoke.checks.targets.toString().includes('pointerEvents') === false\`.

The gate is now an INLINE script in \`layout/theme.liquid\`: inline cannot be
stale, and \`{{ 'fye-debug.js' | asset_url }}\` stamps the file's own version
hash. \`fye-ui.js\`'s block remains but stands down on \`window.__fyeDebugGate\`.

**Rule: never derive one asset's URL from another asset's versioned URL.**

Also worth keeping: \`console.groupCollapsed\` hides the detail lines when
output is copied out of the console. For a flat list —
\`console.table(fyeSmoke.checks.targets())\`.

## Where the pages stand

All of these are 8 of 9 groups clean at 559 and 1440, the ninth being the app
images below:

- \`/pages/jewellery-gallery\` — including the card carousels
- \`/blogs/news\`
- an article (\`should-you-buy-an-engagement-ring-online\`)
- \`/pages/contact-us\`
- a guide popup with the dialog open

\`overflow\`, \`forms\`, \`palette\`, \`structure\` and \`liquid\` pass everywhere —
so no sideways scroll, no unlabelled control, no browser-blue link, no
duplicate id, and no Liquid printed raw on any of them.

## Still not ours, still there

\`img.ymq-option-crop-image\` and \`img.ymq-option-crop-preview-image\` are broken
on **every page tested** — the YMQ Product Options app injecting empty
\`<img>\` tags site-wide, including on pages with no products. Nothing in the
theme references them. An app setting or a support ticket.

## Outstanding

1. **Product pages, collection pages and the cart have never been smoke
   tested** — only the pages built in these two sessions have. The buybox
   snippets in particular are full of small controls.
2. Ed's calls, still open: the two test gallery pieces, the photo-less
   \`platinum-sea-turtle-pendant\`, whether \`blog.portfolio.json\` /
   \`article.portfolio.json\` can be dropped, and whether "Start a bespoke
   enquiry" and the FAQ's "Enquire now" should open the enquiry popup or keep
   pointing at the contact page. No code either way.
3. Per-popup photography — seven of nine still share \`Ring_211_5.png\`.
`;

if (!existsSync(DOC)) { console.error('MISSING: ' + DOC); process.exit(1); }

const before = readFileSync(DOC, 'utf8');

if (before.includes(GUARD)) {
  console.log('skip  docs/build-state.md — already present');
  process.exit(0);
}

const after = before + BLOCK;
if (after.length <= before.length) {
  console.error('REFUSING: the file would not grow');
  process.exit(1);
}

writeFileSync(DOC, after, 'utf8');

const check = readFileSync(DOC, 'utf8');
if (!check.includes(GUARD)) { console.error('FAILED to verify write'); process.exit(1); }

console.log('ok    docs/build-state.md  ' + before.length + ' -> ' + check.length + ' chars');
