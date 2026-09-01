// w949-docs-close.mjs — close the session in build-state.md and point at the
// handover brief.
//
//     node tools/w949-docs-close.mjs
// Delete once run and pushed.

import { readFileSync, writeFileSync } from 'node:fs';

const DOC = 'docs/build-state.md';
const MARKER = '## Session close — 01/09/2026';

let doc = readFileSync(DOC, 'utf8');
if (doc.includes(MARKER)) {
  console.log('Already recorded. Nothing to do.');
  process.exit(0);
}

const before = doc.length;

doc += `

${MARKER}

Cart and wishlist both complete and pushed. **Next job: the gallery section and
the blog.**

\`docs/handover-brief.md\` is the starting point for the next session — it holds
the three working channels (Dropbox + terminal for theme code, patch scripts
for anything over ~50KB, the Shopify MCP for store data), the theme ids, the
pre-flight that has now caught two pages, and the open items.

### Late fix

The header wishlist badge drew a filled square at zero: \`.hdr__count\` sets a
display, which out-ranks the browser's \`[hidden]\`. Second time that trap has
bitten in one day — the first was the wishlist empty state. Both are listed in
the handover brief.

The basket badge never showed it because Liquid omits the element entirely at
zero. The wishlist count cannot: the server has no idea what is on the device,
so the element must exist and be hidden.
`;

writeFileSync(DOC, doc);
console.log(`  ${DOC}: ${before} -> ${doc.length} bytes\n`);
