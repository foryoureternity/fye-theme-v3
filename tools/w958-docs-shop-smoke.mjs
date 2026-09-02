// w958-docs-shop-smoke.mjs — single-use patch. Run once, then delete it.
//
//   node tools/w958-docs-shop-smoke.mjs
//
// Appends the shop smoke-test findings to docs/build-state.md.
// Idempotent: guarded on the heading it adds.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DOC = resolve(root, 'docs/build-state.md');
const GUARD = '# Session — 02/09/2026: the shop, smoke tested';

const BLOCK = `

---

${GUARD}

Product, collection and cart were the last untested surfaces. Products came
out clean; the collection page did not, and one of the faults was mine in a
way worth recording.

## Products: clean, all three buybox paths

| Page | 1440 | 559 |
|---|---|---|
| \`14ct-yellow-gold-concave-wedding-ring-2mm-heavy\` (sides buybox) | pass | pass |
| \`eng59825-smt\` (solitaire, centre-stone buybox) | pass | pass |
| \`trl45890-bsad\` (trilogy, three centre stones) | pass | pass |

Every group passed on all three except the YMQ app images. The buyboxes are
the densest UI in the theme — swatch grids, size selectors, stone pickers —
so this is the result that mattered most.

## Collection page

Two faults of this section's own, both fixed:

| Where | Was | Now |
|---|---|---|
| \`.coll__clear\` "Clear all" | 48×21 | 44px |
| \`.coll__promolink\` "Ask an expert" | 129×24 | 44px |

Then the filter panel, which is the **cloud-search app's markup**, not ours.
Confirmed structure — the whole row is a label:

    <label class="cloud-search-filter-value" data-filter-value="Solitaire">
      <span class="cloud-search-filter-value__checkbox"><input type="checkbox"></span>
      <span class="cloud-search-filter-value__name">Solitaire</span>&nbsp;
      <span class="cloud-search-filter-value__count">(575)</span>
    </label>

So \`min-height: 44px\` on the label makes the whole row the target and leaves
the 16px checkbox alone. **19 rows fixed.**

## MY MISTAKE, worth reading before touching this file again

I appended a new \`.fye .cloud-search-filter-value\` rule to the end of
\`main-collection.liquid\` **without reading it first.** That file already
carried a full themed filter panel — the row, hover, checked state, the
diamond-shape swatches, the gemstone swatches, a fix for the app's internal
scrolling — roughly lines 287 to 568. So there were two rules for one
selector, 600 lines apart.

Folded into the original and the duplicate deleted. The patch that did it
refuses to write unless exactly one rule for that selector remains.

**\`grep -n "<the-thing>" <the-file>\` costs one line and would have prevented
it.** Dropbox does not index .liquid content, so a session cannot search the
theme itself — which makes asking for a grep the cheap move, not a last
resort.

## A misread probe, also mine

\`getComputedStyle(field).minHeight\` returned \`0px\`, which I took as evidence
the app declares \`min-height: 0 !important\`, and reached for \`!important\` and
a specificity bump. **\`0px\` is simply the CSS default.** Nothing of mine was
targeting those inputs at all, because that patch had silently failed to
match its anchor.

And \`!important\` was never needed regardless: used height is
\`max(min-height, height)\`, so \`min-height\` beats a fixed \`height\` on its own.

## Left as-is, deliberately

The app's four **min/max price inputs** are still 32px. Three attempts, and
the last plain rule still reads \`min-height: 0px\` in the browser — most
likely the compiled stylesheet lagging (that page also logged a \`styles.css\`
preload warning). The rule is committed, so it may come good by itself; if
not, it is an app-settings job.

Judged not worth a fourth round: two number fields you type into, against 19
rows you tap while browsing, which are fixed.

## Outstanding

1. **The cart has still never been smoke tested.** Every product checked has
   zero inventory (made to order), so nothing could be added to the bag to
   reach it. Worth confirming that is intended rather than a buybox fault.
2. **The YMQ app breaks two images on every page tested** — product,
   collection, blog, article, contact, gallery. It injects empty \`<img>\` tags
   site-wide, including on pages with no products. App ticket.
3. Ed's open calls, unchanged: the two test gallery pieces, the photo-less
   \`platinum-sea-turtle-pendant\`, whether the two \`portfolio\` templates can be
   dropped, and whether "Start a bespoke enquiry" and the FAQ's "Enquire now"
   should open the enquiry popup or keep pointing at the contact page.
4. Per-popup photography — seven of nine still share \`Ring_211_5.png\`.
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
