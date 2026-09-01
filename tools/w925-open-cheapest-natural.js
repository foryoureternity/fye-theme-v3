#!/usr/bin/env node
/* ============================================================================
   w925-open-cheapest-natural.js — patch for sections/main-product.liquid
   ----------------------------------------------------------------------------
   Run once, from the repo root:

       node tools/w925-open-cheapest-natural.js

   WHAT — live's W831, ported 01/09/2026

   A ring page opens on its CHEAPEST NATURAL grade rather than on Shopify's
   first variant.

   WHY IT MATTERS. Option value 1 is "D/E VVS", the dearest grade, so every
   ring currently headlines at its highest price. On live, before this fix, the
   complete trilogies read as a ~27% overnight increase — the ring had not
   changed, only which variant the page opened on.

   NATURAL ONLY. Opening on a lab-grown price would be cheaper still and would
   misrepresent rings sold mainly as natural.

   ONLY WHEN THE SHOPPER HAS NOT CHOSEN. `product.selected_variant` is nil
   unless ?variant= is in the URL, so a deep link, a shared link and the
   back-from-cart journey all keep the variant they asked for. Overriding those
   is the way this change breaks things.

   NOT ON PLAIN WEDDING RINGS. Their variants are RING SIZES, not grades, so
   "cheapest" would mean size A and every plain ring would open on the smallest
   finger size. The guard is `is_plain`, which main-product computes just above
   the line being patched.

   The companion change is in fye-buybox-eternity.liquid, which now reads its
   selected state from `current` rather than from Shopify's option defaults —
   without it the highlighted tile and the displayed price would describe
   different rings.

   IDEMPOTENT: running it twice is safe.
   ========================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');

const FILE = path.join(process.cwd(), 'sections', 'main-product.liquid');
const MARKER = 'cheapest_natural';

function die(msg) {
  console.error('REFUSED: ' + msg);
  console.error('main-product.liquid has NOT been modified.');
  process.exit(1);
}

if (!fs.existsSync(FILE)) die('sections/main-product.liquid not found — run from the repo root.');

let src = fs.readFileSync(FILE, 'utf8');
const before = Buffer.byteLength(src, 'utf8');

if (src.indexOf(MARKER) !== -1) {
  console.log('Already applied. Nothing written.');
  process.exit(0);
}

const FIND = '  assign current = p.selected_or_first_available_variant';

const REPLACE = `  comment
    ── W831: open on the cheapest NATURAL grade ──
    Shopify's first variant is "D/E VVS", the dearest, so leading with it
    headlines every ring at its highest price — on live that read as a ~27%
    overnight rise on the complete trilogies.

    Natural only: a lab-grown opening price would misrepresent rings sold
    mainly as natural.

    ONLY when the shopper has not chosen for themselves. selected_variant is
    nil unless ?variant= is in the URL, so deep links, shared links and the
    back-from-cart journey keep the variant they asked for.

    NOT on plain wedding rings: their variants are ring SIZES, so "cheapest"
    would open every one of them on size A.

    fye-buybox-eternity reads its selected state from this same variant, so
    the highlighted tile and the price always describe the same ring.
  endcomment
  assign current = p.selected_or_first_available_variant

  unless is_plain or p.selected_variant
    assign cheapest_natural = nil

    for var in p.variants
      if var.available
        assign grade = var.title | split: ' / ' | last | downcase

        unless grade contains 'lab'
          comment
            Nested rather than \`a == nil or b < a.price\`: Liquid evaluates
            \`or\` RIGHT TO LEFT, so the comparison against a nil variant would
            run first. This is the same trap documented in the chooser gates.
          endcomment
          if cheapest_natural == nil
            assign cheapest_natural = var
          elsif var.price < cheapest_natural.price
            assign cheapest_natural = var
          endif
        endunless
      endif
    endfor

    if cheapest_natural != nil
      assign current = cheapest_natural
    endif
  endunless`;

const n = src.split(FIND).length - 1;
if (n !== 1) die('expected 1 occurrence of the `current` assignment, found ' + n);

/* is_plain must already exist above the patch point, or the guard is a no-op
   and every plain ring opens on size A. */
const iPlain = src.indexOf('assign is_plain = false');
const iCurrent = src.indexOf(FIND);
if (iPlain === -1 || iPlain > iCurrent) {
  die('is_plain is not computed before `current` — the plain-ring guard would not work.');
}

src = src.replace(FIND, REPLACE);

const after = Buffer.byteLength(src, 'utf8');
if (after <= before) die('patched file is not larger (' + before + ' -> ' + after + ')');

fs.writeFileSync(FILE, src, 'utf8');

console.log('Patched sections/main-product.liquid');
console.log('  ' + before + ' -> ' + after + ' bytes (+' + (after - before) + ')');
console.log('  ring pages now open on the cheapest natural grade.');
