// w927-docs-gallery-blog.mjs — single-use patch. Run once, then delete it.
//
//   node tools/w927-docs-gallery-blog.mjs
//
// Appends the 01/09/2026 gallery + blog session block to docs/build-state.md.
// That file is 56KB, past what a session can read back whole, so it is
// appended to rather than rewritten.
//
// Idempotent: guarded on the session heading it adds.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DOC = resolve(root, 'docs/build-state.md');
const GUARD = '# Session — 01/09/2026 (evening): the gallery and the blog';

const BLOCK = `

---

${GUARD}

Three templates that did not exist in v3: the Gallery page, the blog listing
and the article page. Every /blogs/news URL 404'd before this, the same
template-missing failure as the collection and cart pages.

## What was built

| File | Notes |
|---|---|
| \`sections/past-pieces-gallery.liquid\` | 18.2KB, from live's 28.8KB. Ported from an FYE-original, not from T4S |
| \`templates/page.past-pieces.json\` | Did not exist. Banner + gallery |
| \`sections/main-blog.liquid\` | 6.8KB, from live's 43.7KB T4S section. Grid + pager |
| \`templates/blog.json\` | Did not exist |
| \`sections/main-article.liquid\` | 7.1KB, from live's 53.3KB. Body + latest-news row |
| \`templates/article.json\` | Did not exist |
| \`snippets/article-card.liquid\` | One article tile, shared by both new sections |
| \`assets/fye-ui.js\` | +1 IIFE: gallery masonry, carousels, filters, load more |
| \`assets/fye-core.css\` | +\`.acard\` / \`.agrid\` — two consumers, so it earns core |

## The gallery is metaobject-driven, and that is the thing to know

One \`past_piece\` METAOBJECT per commission — 11 entries at 01/09/2026, fields
name / category / number / caption / spec / date / media / featured / label.
Nothing about a piece is edited in the theme editor. Categories in use:
Engagement, Wedding, Pendants.

Order is automatic: featured first, then newest by date completed. The sort
key carries the entry's POSITION and the entry is then found by walking the
list again. That is deliberate and must not be "optimised":

- \`.values\` is a collection drop supporting iteration only. \`values[i]\`
  returns nil, which renders a card with every field empty and raises nothing.
- \`metaobjects.TYPE[handle]\` is capped at 20 lookups per page.

**W514 carried forward:** a Liquid loop over \`.values\` reads at most 50
entries. Past 50 the OLDEST pieces vanish silently. Years away at a few
pieces a month, but the fix is a paginate tag, which also moves the filter
counts server-side.

**Kept from live, unchanged:** card anatomy (monogram, name, category, square
media carousel, caption, spec), the masonry mechanic, and the two suppressions
Ed asked for on 25/08 — the piece NUMBER and the DATE are not rendered, and
both fields must stay because the date orders the grid.

**Dropped:** \`load_fonts\` (theme.liquid loads both faces), \`padding_top\` and
\`padding_top_mobile\` (rhythm is --sect-y), \`enquire_label\` and
\`default_enquire_url\` (the footer that used them went on 25/08). Gained
\`bg_color\`, a palette choice, replacing a hard-coded ivory ground.

## Decisions taken

- **Masonry is progressive enhancement now.** The CSS default is an even
  three-column grid; \`fye-ui.js\` adds \`.is-masonry\`, which switches to 1px row
  tracks and spans each card by its measured height. Live tested for the
  fallback by reading \`getComputedStyle(grid).gridAutoRows\`; adding a class is
  the same result without the read, and no-JS gets a clean grid rather than a
  broken one.
- **Filter bar is buttons, not \`<a href="#">\`.** They do not navigate. Also
  44px tall, which live's 12px text links were not.
- **Dates are ON in the blog listing**, against live, which set \`show_dt\`
  false. A news item with no date reads as undated rather than timeless. It is
  still a checkbox.
- **The article page uses \`heading-template\`**, where live disables
  \`heading-article\` and prints the title inside \`main-article\`. The shared
  banner already titles an article and already builds the Home > News > title
  breadcrumb, so articles now match every other page and gain crumbs they
  never had.
- **Latest-news row is 4 posts in one row**, not live's 8 over two. Setting
  kept (\`limit_related\`), so it is a number change.
- **Only live's two ENABLED article block types exist**: \`image\` and
  \`related\`. Content, tags, socials, navigation and comments were disabled on
  every article, so they were not built. Re-adding one is a design decision,
  not markup.
- **\`main-page\` left off the Gallery template.** The page's body is empty on
  the store, and \`main-page\` renders its band regardless — that is 160px of
  nothing. Live includes it, with custom_css targeting content that is not
  there.

## Gotchas earned

**A custom property cannot cap itself.** \`--cols: min(var(--cols), 4)\` in a
rule on the same element whose inline style sets \`--cols\` is a self-reference:
the property goes guaranteed-invalid and the grid silently collapses to one
column. The cap is done in Liquid instead. Caught before it shipped.

**\`part.title == paginate.current_page\` is always false.** part.title is a
String and current_page an Integer, and \`==\` across types in Liquid is false
rather than an error — so no page would ever be marked current, silently.
Coerce with \`| append: ''\` first. (This is the same family as the
\`comparison of Integer with String failed\` trap from the collection page, but
quieter: \`<\` and \`>\` raise, \`==\` just lies.)

**\`0 == blank\` is false but \`nil == blank\` is true**, again: \`media.size |
default: 0\` matters because a nil size fails BOTH the \`> 1\` and the \`== 0\`
test, and the card then renders with no carousel and no placeholder.

## Outstanding

1. **Not yet previewed.** Written and pushed; no page has been looked at, and
   \`fyeSmoke()\` has not been run at 1440 / 899 / 748 / 559.
2. **Two test pieces are live in the gallery data** — \`zz-test-entry-delete-me\`
   and \`test-piece\`. They will render on the page. Store data, Ed's call.
3. **\`platinum-sea-turtle-pendant\` has no media**, so it renders the "no
   photographs yet" placeholder card.
4. **\`blog.portfolio.json\` / \`article.portfolio.json\`** are T4S demo
   templates on live and were not ported. Confirm they can be dropped.
5. **Pagination markup now exists twice** — \`main-collection\` has its own
   pager, \`main-blog\` has \`.mblog__pager\`. If a third listing appears, they
   should merge into fye-core.css rather than a third copy appearing.
6. **The blog tail is long**: guides, guarantee, trust strip under every
   article, which is live's structure. Worth a look on a short post.
`;

if (!existsSync(DOC)) {
  console.error('MISSING: ' + DOC);
  process.exit(1);
}

const before = readFileSync(DOC, 'utf8');

if (before.includes(GUARD)) {
  console.log('skip  docs/build-state.md — session block already present');
  process.exit(0);
}

const after = before + BLOCK;
if (after.length <= before.length) {
  console.error('REFUSING: the file would not grow');
  process.exit(1);
}

writeFileSync(DOC, after, 'utf8');

const check = readFileSync(DOC, 'utf8');
if (!check.includes(GUARD)) {
  console.error('FAILED to verify write');
  process.exit(1);
}

console.log('ok    docs/build-state.md  ' + before.length + ' -> ' + check.length + ' bytes (+' + (check.length - before.length) + ')');
