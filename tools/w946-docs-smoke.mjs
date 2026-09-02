// w946-docs-smoke.mjs — single-use patch. Run once, then delete it.
//
//   node tools/w946-docs-smoke.mjs
//
// Appends the smoke-test findings to docs/build-state.md: what fyeSmoke found
// on its first real run, what was fixed, and the two process lessons.
// Idempotent: guarded on the heading it adds.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DOC = resolve(root, 'docs/build-state.md');
const GUARD = '# Session — 02/09/2026: the first smoke test';

const BLOCK = `

---

${GUARD}

\`fyeSmoke()\` built (see the correction block above — it had never existed) and
run on the contact page at 559 / 748 / 899 / 1440. **It found four genuine
touch-target faults that had been live since 27/08/2026 and that nobody had
spotted by eye.**

## Fixed — real faults

| Where | Was | Now |
|---|---|---|
| \`.ftr__social a\` (footer Instagram / WhatsApp) | 20×20 | 44×44 hit area, icon still 20px |
| \`.ftr__phone\` | 29px tall | 44px |
| \`.ftr__cta\` BOOK CONSULTATION | 41px | 44px |
| \`.fcon__social-links a\` | 25px | 44px |
| \`.fcon__consent\` | label 25px on one line | 44px minimum |
| \`.fcon__opt\` "(optional)" | 11px sentence case | 12px |
| \`{% form 'contact' %}\` × 10 | all \`id="contact_form"\` | unique ids |

Two of those deserve calling out:

**The consent row passed at 599px and failed everywhere else.** The 18px
checkbox is correct — the LABEL is the tap target — but that label was only
25px on a single line. At 599px the text happened to wrap to two lines and
cleared 44px, so a single-width test would have called it clean. **Test every
breakpoint, not the narrowest one.**

**Ten duplicate \`contact_form\` ids.** Shopify's \`{% form 'contact' %}\` writes
\`id="contact_form"\` every time, and the contact page carries nine popup forms
plus its own. Invalid HTML, and it breaks \`getElementById\` and \`label[for]\`
resolution, which land on whichever form is first in the document. \`{% form %}\`
takes an \`id\` parameter — always pass one where a page can hold more than one
form. The popups derive theirs from the block key.

## Fixed — the check was wrong, not the page

Five of the nine groups needed the CHECK corrected. Worth recording, because a
noisy check gets ignored and then it may as well not exist:

- **11px is the design system's eyebrow size.** A flat 12px floor flagged every
  eyebrow, field label and trust-strip caption on the page — the design system
  reported as a defect. Micro-labels (uppercase, or tracked ≥0.5px, or a
  \`<label>\`) are now judged at 10px.
- **44px is a TOUCH rule.** It was firing on an 18px utility-bar link at
  1470px under a mouse. Now scoped to coarse pointers or ≤900px, and says so
  rather than silently passing.
- **Inert by design is not a target.** The footer column headings are
  \`<summary>\` elements with \`pointer-events: none\` above 769px — headings
  there, tappable rows only below 768px. Now skipped.
- **A checkbox is exempt if its label is big enough** — measure the label, not
  the 18px box.
- **Nine "popup has no trigger on this page" lines every run.** They live in
  \`footer-group.json\` so one copy serves every page; that is the design, not a
  fault. Behind \`fyeSmoke('popups', true)\` now. The half that matters — a
  trigger whose key opens nothing — still always fires.
- **A numeric badge is a glyph, not reading text.** The header cart count is an
  11px numeral. First attempt tested \`textContent\` and missed, because a count
  badge carries a visually-hidden word beside the numeral ("3 items"); it tests
  the first text node now.

## THE CACHE TRAP — this cost two runs

Sharpened checks appeared to have **no effect at all**: two consecutive runs
produced byte-identical output.

The loader derived the debug URL by string-replacing \`fye-ui.js\` →
\`fye-debug.js\` in the script tag's \`src\`, **which inherits fye-ui.js's \`?v=\`
cache version.** Editing \`fye-debug.js\` alone left the URL identical, so the
browser served its cached copy indefinitely. The tell was that
\`structure\` had started passing — proof the theme HAD synced.

Fixed by stripping the inherited query and appending \`?fyedebug=<Date.now()>\`.
The asset is only ever fetched on request, so never caching it is correct.

**General rule: never derive one asset's URL from another asset's versioned
URL.** The version hash belongs to the file it was minted for.

## Not ours

\`img.ymq-option-crop-image\` and \`img.ymq-option-crop-preview-image\` are BROKEN
on the contact page — the YMQ Product Options app injecting empty \`<img>\` tags
into a page it has no business being on. Nothing in the theme references them.
An app setting or a support ticket, not a code fix.

## Outstanding

1. **Only the contact page has been smoke-tested.** The gallery, blog listing
   and article page have not, and **no popup has been tested with the dialog
   open** — a \`<dialog>\` is the one thing on the site whose targets and text
   have never been measured.
2. Ed's remaining calls, carried forward: the two test gallery pieces, the
   photo-less \`platinum-sea-turtle-pendant\`, whether
   \`blog.portfolio.json\` / \`article.portfolio.json\` can be dropped, and
   whether "Start a bespoke enquiry" and the FAQ's "Enquire now" should open
   the enquiry popup or keep pointing at the contact page (which now has a
   form). No code either way.
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
