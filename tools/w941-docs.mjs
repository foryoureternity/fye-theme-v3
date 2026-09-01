// w941-docs.mjs — write the cart and wishlist work into docs/build-state.md.
//
// Appends a session block and refreshes the "Last updated" line. Appends
// rather than rewrites: the file is ~49KB, past what a session can read whole,
// and nothing above the insertion point should be touched.
//
//     node tools/w941-docs.mjs
// Delete once run and pushed.

import { readFileSync, writeFileSync } from 'node:fs';

const DOC = 'docs/build-state.md';
const MARKER = '## 01/09/2026 — cart and wishlist';

let doc = readFileSync(DOC, 'utf8');

if (doc.includes(MARKER)) {
  console.log('Already recorded. Nothing to do.');
  process.exit(0);
}

const before = doc.length;

doc += `

${MARKER}

Both built this session, both new files rather than ports — v3 had neither.

### Cart

\`templates/cart.json\` and \`sections/main-cart.liquid\` did not exist, so every
/cart URL 404'd. Same pre-flight failure as the collection page: live's
cart.json named a section v3 had never had. **Check both template AND section
exist before starting any page.**

Live's 49.9KB T4S section exposed six settings, one of which was on. Dropped:
shipping calculator, order notes, live rates, gift wrap, default-country
picker. Block types kept live's names (price / btn / tax / agree / btnck) so
the template stays portable; \`guarantee\` is new.

**Grouped ring sets.** A configured ring is up to five cart lines. They group
under one header with a combined total. The link is \`Ring SKU\`, a property
\`addOnLines()\` in fye-ui.js already wrote on every companion line:

    var tag = { 'For ring': ring.title, 'Ring SKU': ring.sku || '' };

So grouping needed no JS change at all. \`Ring SKU\` and \`For ring\` are hidden
inside a group (machine data, and a repeat of the header). A second identical
setting does NOT steal the first's stones — each SKU is claimed once. Live has
that bug.

**Removing part of a set removes all of it**, after a confirm naming the count.
A setting reaching checkout with no stone is unfulfillable.

**Centre-fee reconciler.** Fee variant \`58461224927616\` (live's, still
unverified on this store). Corrects quietly and in place via the Section
Rendering API — no reload, Ed 01/09. One fee line PER RING rather than live's
single counted line, so it sits inside the right group. Re-adds a fee whose
ring is still present: live never did, so deleting the fee line bought free
setting.

### Wishlist

Live had no real wishlist: \`templates/search.wishlist.liquid\` ran a SEARCH for
product ids T4S kept in \`t4s_wis_cp\`. Nothing was ever stored against a
customer. No migration — Ed chose to start clean.

Ed's calls, 01/09: saves the WHOLE CONFIGURATION; device only, no account;
sharing by link; hearts everywhere; page carries grid, share bar, move to
basket, enquiry, notes.

- Store: \`window.FYE.wishlist\` in fye-ui.js, key \`fye_wishlist_v1\`.
- Identity is handle + hash of variant, properties and companion lines — so the
  same setting with two different centre stones saves as two entries.
- The product-page heart calls \`window.FYE.buyBox(form)\`, which wraps
  \`chosenVariant\` / \`ringProps\` / \`addOnLines\`. Never re-read the buy box:
  two things computing a configuration will disagree.
- Prices are NEVER saved. Fetched per handle when the page renders.
- Page: \`sections/main-wishlist.liquid\` + \`templates/page.wishlist.json\` +
  \`assets/fye-wishlist.js\`. The Shopify page was created by API (handle
  \`wishlist\`, suffix \`wishlist\`) because the template dropdown only lists the
  PUBLISHED theme's templates and v3 is unpublished.
- Sharing: whole list base64url-encoded into \`?w=\`. Opening a shared link shows
  it read-only and MERGES on save — a recipient's own list is never replaced.
- Header icon was pointing at \`/a/wishlist\`, the dead T4S app proxy.

### Open

- **No configured total on a wishlist card.** Companions are saved as variant
  ids, and Shopify cannot price a variant id without its product handle. Card
  shows the setting's live price and lists the configuration. Fix is to save
  each companion's handle in \`addOnLines()\`.
- Cart page has no "save for later" yet.
- Centre-fee variant id still unverified on this store.

### Three mistakes worth not repeating

1. **A guard that matched prose.** A patch skipped itself because the file's own
   comment mentioned \`fye-wishlist.js\`; the \`<script>\` tag was never inserted
   and the page silently never ran. Guard on the THING, not on words about it.
2. **\`hidden\` loses to \`display\`.** Panels toggled with the \`hidden\` attribute
   but styled \`display: flex\` are never hidden. Needed
   \`.fye .fye-wish [hidden] { display: none !important; }\`.
3. **A control outside its form.** The gallery heart sits outside the buy-box
   form, so \`closest('form')\` found nothing and the button looked perfect and
   did nothing. It resolves the page's one buy box instead.
`;

doc = doc.replace(/^Last updated: .*$/m, 'Last updated: 01/09/2026');

writeFileSync(DOC, doc);
console.log(`  ${DOC}: ${before} -> ${doc.length} bytes\n`);
