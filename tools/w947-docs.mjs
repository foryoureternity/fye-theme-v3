// w947-docs.mjs — record the configured-link and sharing work.
//
//     node tools/w947-docs.mjs
// Delete once run and pushed.

import { readFileSync, writeFileSync } from 'node:fs';

const DOC = 'docs/build-state.md';
const MARKER = '### Configured links and sharing';

let doc = readFileSync(DOC, 'utf8');
if (doc.includes(MARKER)) {
  console.log('Already recorded. Nothing to do.');
  process.exit(0);
}

const before = doc.length;

doc += `

${MARKER}

Added after the first wishlist pass, same day.

**Nothing on a product page read the URL — not even \`?variant=\`.** Worth
knowing before assuming any link restores anything. A shared ring opened as a
bare product page however it had been configured.

**\`?fyec=\`** now carries a whole buy box: options, centre mode + the stone's
own JSON, sides mode + chip, engraving on/off + its fields, waivers. Written by
the wishlist onto every product link, read by the CONFIGURED LINKS block at the
end of fye-ui.js.

The reading and re-applying live INSIDE the productPage IIFE as
\`window.FYE.readConfig\` / \`window.FYE.applyConfig\`, next to \`buyBox\`, because
that is where \`setMode\` and \`paintStone\` are. applyConfig dispatches real
CLICKS for the engraving segment and the side chips rather than reproducing
their side effects — reproducing them is how two code paths drift apart.

Note the thing that made this necessary: the chosen diamond is a JSON blob on
\`[data-fye-centre]\`'s \`data-stone\`. Saving variant ids alone was never going to
be enough to SHOW a configured ring, only to buy one.

**Add to basket from a wishlist card** posts the saved companion lines
directly, so it reproduces the exact cart without visiting the product page.
Available on shared lists too — a recipient buying their partner's choice is
the point of sharing.

### Sharing is a snapshot, and says so

A share link encodes the list, so it cannot update when the sender's wishlist
changes. Ed, 01/09: accept that and be honest about it rather than build
server-side storage.

- A permanent mist-blue notice sits under the share buttons carrying the
  caveat; it goes teal with a LINK COPIED heading once copied. Not a toast —
  the caveat matters most BEFORE the link is sent.
- \`&d=\` carries the day the link was made; a shared view says "shared on 1
  September … it is a snapshot". Separate parameter, so older links still open.
- Clipboard fallback added: \`navigator.clipboard\` does not exist outside a
  secure context and was failing silently.

**If couples turn out to go back and forth over days**, that is the evidence
for real sync — which needs somewhere server-side to store lists (a small
hosted endpoint, or customer accounts). Both were considered and deferred;
neither is possible from the storefront alone, because Shopify lets no
shopper's browser write to metaobjects or customer metafields.
`;

writeFileSync(DOC, doc);
console.log(`  ${DOC}: ${before} -> ${doc.length} bytes\n`);
