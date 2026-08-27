/* ============================================================================
   fix-liquid-syntax.mjs — one-off repair, 27/08/2026
   ----------------------------------------------------------------------------
     cd ~/Dropbox/GIT-repositaries/fye-theme-v3
     node docs/tools/fix-liquid-syntax.mjs

   Prints every change and refuses to write a file if a target string is not
   found exactly once, so a partial match can never silently half-fix a file.
   Delete this script once it has run and the theme has synced.

   WHY
   Seven files were being REJECTED by Shopify's GitHub sync — silently, with no
   error anywhere in git. `themeFilesUpsert` was what finally surfaced the
   reason. Two bugs, both mine:

   1. A FILTER INSIDE AN image_tag ARGUMENT.
        {{ img | image_url: width: 900 | image_tag:
           alt: product.title | escape,
           class: 'x' }}
      `| escape` ends the argument list, so the comma after it is a syntax
      error and Shopify refuses the file:
        "Liquid syntax error: Expected end_of_string but found comma"
      Arguments to image_tag take a variable or a literal. Nothing else. Where
      a fallback or a filter is wanted, compute it with `assign` first.

      Worth knowing: image_tag ALREADY escapes its attribute values, so
      `| escape` was never needed there.

   2. A `unit` LONGER THAN THREE CHARACTERS in a range setting. Shopify caps
      `unit` at 3 characters; "prod" and "star" both fail schema validation and
      the file is refused.

   The same filter-in-argument mistake also appears with `| escape` as the LAST
   argument, where it parses — and then escapes the entire <img> tag, so the
   markup renders as visible text on the page. Fixed here too.
   ========================================================================== */

import { readFile, writeFile } from 'node:fs/promises';

/* Each edit is a literal, not a regex: exact text in, exact text out. */
const EDITS = [
  {
    file: 'sections/fye-hero.liquid',
    changes: [
      {
        find: "  assign hstyle = s.heading_style | default: 'display'\n",
        replace: "  assign hstyle = s.heading_style | default: 'display'\n  assign hero_alt = s.heading | default: shop.name | strip_html\n"
      },
      { find: "         alt: s.heading | escape,\n", replace: "         alt: hero_alt,\n" }
    ]
  },
  {
    file: 'snippets/product-card.liquid',
    changes: [
      {
        find: '  assign second = product.images[1]\n',
        replace: '  assign second = product.images[1]\n  assign card_alt = product.featured_image.alt | default: product.title\n'
      },
      {
        find: '           alt: product.featured_image.alt | default: product.title | escape,\n',
        replace: '           alt: card_alt,\n'
      }
    ]
  },
  {
    file: 'sections/fye-media-text.liquid',
    changes: [
      {
        find: '  assign img = s.image\n',
        replace: '  assign img = s.image\n  assign media_alt = s.image_alt | default: img.alt | default: s.heading\n'
      },
      {
        find: '             alt: s.image_alt | default: img.alt | escape,\n',
        replace: '             alt: media_alt,\n'
      }
    ]
  },
  {
    file: 'sections/custom-collections.liquid',
    changes: [
      { find: "alt: s.left_image.alt | escape, class: 'ccols__img' }}", replace: "alt: s.left_heading, class: 'ccols__img' }}" },
      { find: "alt: s.top_image.alt | escape, class: 'ccols__img' }}", replace: "alt: s.top_heading, class: 'ccols__img' }}" },
      { find: "alt: s.bottom_image.alt | escape, class: 'ccols__img' }}", replace: "alt: s.bottom_heading, class: 'ccols__img' }}" }
    ]
  },
  {
    file: 'sections/fye-gallery-promo.liquid',
    changes: [
      { find: 'alt: b.image_lead.alt | escape }}', replace: 'alt: b.image_lead.alt }}' },
      { find: 'alt: b.image_top.alt | escape }}', replace: 'alt: b.image_top.alt }}' },
      { find: 'alt: b.image_bottom.alt | escape }}', replace: 'alt: b.image_bottom.alt }}' }
    ]
  },
  {
    file: 'sections/guide-download-block.liquid',
    changes: [
      { find: 'alt: b.title | default: b.cover.alt | escape }}', replace: 'alt: b.title }}' }
    ]
  },
  {
    file: 'sections/latest-news-EM.liquid',
    changes: [
      /* article.image.alt is nearly always empty; the headline is the better
         alt for a thumbnail anyway, and it needs no assign. */
      { find: 'alt: article.image.alt | default: article.title | escape }}', replace: 'alt: article.title }}' }
    ]
  },
  {
    file: 'sections/feature_columns2.liquid',
    changes: [
      { find: 'alt: b.image.alt | escape }}', replace: 'alt: b.image.alt }}' }
    ]
  },
  {
    file: 'sections/about_us.liquid',
    changes: [
      { find: 'alt: b.image.alt | escape }}', replace: 'alt: b.image.alt }}' },
      { find: "alt: b.image_sig.alt | default: 'Signature' | escape }}", replace: 'alt: b.image_sig.alt }}' }
    ]
  },
  {
    file: 'sections/featured-collection.liquid',
    changes: [
      /* Shopify caps `unit` at 3 characters. "prod" fails validation. */
      { find: '"unit": "prod"', replace: '"unit": "pcs"' }
    ]
  },
  {
    file: 'sections/fye-testimonials.liquid',
    changes: [
      { find: '"unit": "star"', replace: '"unit": "/5"' }
    ]
  }
];

let failed = 0;
let changed = 0;

for (const { file, changes } of EDITS) {
  let text;
  try {
    text = await readFile(file, 'utf8');
  } catch {
    console.log(`SKIP  ${file} — not found`);
    failed += 1;
    continue;
  }

  const applied = [];
  let next = text;
  let ok = true;

  for (const { find, replace } of changes) {
    const hits = next.split(find).length - 1;
    if (hits !== 1) {
      console.log(`FAIL  ${file} — expected 1 match, found ${hits}: ${JSON.stringify(find.slice(0, 60))}`);
      ok = false;
      continue;
    }
    next = next.replace(find, replace);
    applied.push(find.trim().slice(0, 70));
  }

  if (!ok) {
    console.log(`      ${file} NOT written — fix the mismatch above first`);
    failed += 1;
    continue;
  }

  if (next === text) {
    console.log(`OK    ${file} — already correct`);
    continue;
  }

  await writeFile(file, next, 'utf8');
  changed += 1;
  console.log(`FIXED ${file}`);
  for (const a of applied) console.log(`        ${a}`);
}

console.log(`\n${changed} file(s) changed, ${failed} problem(s).`);
if (failed) console.log('Do not push until the problems above are resolved.');
