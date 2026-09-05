#!/usr/bin/env node
//
// w317-w319 — three changes Ed asked for on 05/09/2026.
//
//   W317  filter rail density      sections/main-collection.liquid
//   W318  Ring Matchmaker entry    sections/header-group.json, templates/index.json,
//                                  templates/page.{engagement,wedding,eternity}-rings.json
//   W319  calmer article headings  sections/main-article.liquid
//
// Written as a patch script rather than as whole-file writes because another
// session had templates/index.json open the same evening (Dropbox stamp
// 05/09/2026 20:03). A literal find-and-replace applied to whatever is on disk
// at run time cannot clobber someone else's paragraph; a full rewrite can.
//
// Every step asserts its anchor matches EXACTLY ONCE and refuses otherwise,
// checks the file grew, and is idempotent: run it twice and the second run
// reports "already applied" for every step and writes nothing. Guards name the
// CHANGE being introduced, never a selector that already exists, per
// conventions.md section 5.
//
// Usage:  cd ~/Dropbox/GIT-repositaries/fye-theme-v3 && node tools/w317-w319-rail-matchmaker-headings.mjs
// Then:   ./tools/fye ship "W317-W319: rail density, Ring Matchmaker, article headings"

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
let changed = 0, skipped = 0, failed = 0;
const log = [];

function read(rel) {
  const p = resolve(root, rel);
  if (!existsSync(p)) throw new Error(`missing: ${rel}`);
  return { p, text: readFileSync(p, 'utf8') };
}

function step(name, fn) {
  try {
    const r = fn();
    if (r === 'skip') { skipped++; log.push(`  = ${name} — already applied`); }
    else { changed++; log.push(`  + ${name} — ${r}`); }
  } catch (e) {
    failed++;
    log.push(`  ! ${name} — REFUSED: ${e.message}`);
  }
}

// Insert `block` immediately before the LAST occurrence of `anchor`, asserting
// the anchor appears exactly `expect` times.
function insertBefore(rel, anchor, block, guard, expect = 1) {
  const { p, text } = read(rel);
  if (text.includes(guard)) return 'skip';
  const count = text.split(anchor).length - 1;
  if (count !== expect) throw new Error(`anchor ${JSON.stringify(anchor)} matched ${count} times, expected ${expect}`);
  const at = text.lastIndexOf(anchor);
  const out = text.slice(0, at) + block + text.slice(at);
  if (out.length <= text.length) throw new Error('file did not grow');
  writeFileSync(p, out, 'utf8');
  return `${out.length - text.length} bytes added`;
}

function editJson(rel, mutate) {
  const { p, text } = read(rel);
  const data = JSON.parse(text);
  const res = mutate(data);
  if (res === 'skip') return 'skip';
  writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf8');
  return res;
}

// ---------------------------------------------------------------------------
// W317 — the filter rail is longer than the products it filters
// ---------------------------------------------------------------------------

const RAIL_CSS = `
/* ============================================================================
   RAIL DENSITY — 05/09/2026. Ed: the filter spacing is too great.

   MEASURED on the live rail at 1440 before this rule: the rail stood 3,019px
   against a 2,833px product grid, so the filters were taller than the products
   they filter. Where it went: 39 option rows at a 55px pitch (a 44px row plus
   xCloud's own 8px bottom margin and an 11px margin-top on every row after the
   first) = 2,145px; seven groups 32px apart; seven 23px group titles each with
   16px of clearance.

   MEASURED after, same page, same width: 2,132px. 887px shorter, 29%, and the
   rail is now shorter than the grid. Nothing is hidden and nothing scrolls
   internally — xCloud's own max-height stays off, because a scrollbar through
   the middle of the swatches is worse than a long rail.

   GATED ON A FINE POINTER ON PURPOSE. Coarse pointers keep the 44px rows added
   on 02/09/2026 after fyeSmoke measured 19 of them at 16x16. 34px still clears
   WCAG 2.5.8 (24px minimum for a pointer) and still clears the tallest thing in
   a row, the 27px profile drawing — verified, zero rows clip their icon.
   If a later smoke run flags these as small targets, this rule is why: check
   the pointer type before "fixing" it back.

   The sibling selector is deliberate. xCloud sets the row's top margin with its
   own \`.cloud-search-filter-value + .cloud-search-filter-value\`, which carries
   the same specificity as a two-class rule, so a plain \`.fye .row\` override
   ties and loses on source order. Matching their shape and adding .fye wins it
   outright, and still needs no !important.
   ========================================================================== */

@media (min-width: 901px) and (pointer: fine) {
  .fye .cloud-search-filter-value {
    min-height: 34px;
    padding-block: 2px;
    margin-bottom: 0;
  }

  .fye .cloud-search-filter-value + .cloud-search-filter-value {
    margin-top: 0;
  }

  .fye .cloud-search-filter {
    margin-bottom: var(--s5);
  }

  .fye .cloud-search-filter__name {
    margin-bottom: var(--s3);
  }
}
`;

step('W317 rail density → sections/main-collection.liquid', () =>
  insertBefore(
    'sections/main-collection.liquid',
    '{% endstylesheet %}',
    RAIL_CSS,
    'min-height: 34px'
  )
);

// ---------------------------------------------------------------------------
// W319 — article headings one step down
// ---------------------------------------------------------------------------

const ARTICLE_CSS = `
/* Article headings one step down — 05/09/2026. Ed: the blog headings are too
   big. article.content arrives as bare h2/h3 and picked up the page scale, so
   an in-article h2 rendered at up to 38px uppercase: the size the PAGE title
   is set in, inside the body copy. Each level now borrows the scale of the one
   below (h2 -> --fs-h3, h3 -> --fs-h4).

   Sizes only. The elements, the outline and the Tenor Sans uppercase treatment
   are untouched, so the document structure and the brand voice are unchanged
   and this cannot affect the guide templates, which set their headings through
   their own sections rather than through .prose.

   These beat .prose in core because a section's {% stylesheet %} is served
   after fye-core.css — same reason core cannot override a section (build-state,
   R4). Equal specificity, later wins. */
.fye .art__body :where(h2) { font-size: var(--fs-h3); }
.fye .art__body :where(h3) { font-size: var(--fs-h4); }
`;

step('W319 article headings → sections/main-article.liquid', () =>
  insertBefore(
    'sections/main-article.liquid',
    '{% endstylesheet %}',
    ARTICLE_CSS,
    '.fye .art__body :where(h2) { font-size: var(--fs-h3); }'
  )
);

// ---------------------------------------------------------------------------
// W318 — Ring Matchmaker: the nav item
// ---------------------------------------------------------------------------

step('W318 nav item → sections/header-group.json', () =>
  editJson('sections/header-group.json', (d) => {
    const header = d.sections && d.sections.header;
    if (!header) throw new Error('no "header" section in the group');
    if (header.blocks.nav_matchmaker) return 'skip';

    header.blocks.nav_matchmaker = {
      type: 'base',
      settings: {
        title: 'Ring Matchmaker',
        url: '/pages/ring-matchmaker'
      }
    };

    // After Diamonds & gemstones, before the guides: it is a way of shopping,
    // not a thing to read. Falls back to the end rather than guessing.
    const order = header.block_order;
    const at = order.indexOf('nav_diamonds');
    if (at === -1) order.push('nav_matchmaker');
    else order.splice(at + 1, 0, 'nav_matchmaker');
    return `inserted at position ${order.indexOf('nav_matchmaker') + 1} of ${order.length}`;
  })
);

// ---------------------------------------------------------------------------
// W318 — Ring Matchmaker: the entry sections
// ---------------------------------------------------------------------------

// Settings are only those the schema declares. `page_url` is deliberately
// omitted so the section falls back to /pages/ring-matchmaker in Liquid, and
// `start` is omitted so each journey asks its own fork question.
function entrySection(heading, intro, tiles, band = 'ivory') {
  const blocks = {};
  const block_order = [];
  tiles.forEach((t, i) => {
    const key = `tile_${i + 1}`;
    blocks[key] = { type: 'tile', settings: t };
    block_order.push(key);
  });
  return {
    type: 'fye-finder-entry',
    blocks,
    block_order,
    settings: {
      eyebrow: 'Ring Matchmaker',
      heading,
      intro,
      cta: 'Begin',
      band
    }
  };
}

// Insert `key` into order at `preferred`; if that anchor is absent, put it
// before the first fye-consultation band; if there is none, append.
function placeSection(data, key, section, preferredAfter) {
  data.sections[key] = section;
  const order = data.order;
  let at = -1;
  if (preferredAfter && order.includes(preferredAfter)) {
    at = order.indexOf(preferredAfter) + 1;
  } else {
    const consult = order.findIndex(
      (k) => data.sections[k] && data.sections[k].type === 'fye-consultation'
    );
    at = consult === -1 ? order.length : consult;
  }
  order.splice(at, 0, key);
  const before = order[order.indexOf(key) - 1] || '(first)';
  const after = order[order.indexOf(key) + 1] || '(last)';
  return `placed between ${before} and ${after}`;
}

step('W318 entry band → templates/index.json', () =>
  editJson('templates/index.json', (d) => {
    if (d.sections.fye_finder_entry_home) return 'skip';
    // Straight after the three category panels: a visitor who did not pick one
    // of the three is exactly the visitor this is for.
    return placeSection(
      d,
      'fye_finder_entry_home',
      entrySection(
        'Find or design your perfect ring',
        'Answer a few questions and we will show you the rings that match, or start a design with us instead.',
        [
          { label: 'Engagement rings', description: 'Solitaires, halos, trilogies and coloured stones.', journey: 'eng' },
          { label: 'Plain wedding rings', description: 'Profiles, widths, metals and finishes.', journey: 'plain' },
          { label: 'Diamond and eternity rings', description: 'Set bands, half and full eternity.', journey: 'dia' }
        ]
      ),
      'custom_collections_cq7kaN'
    );
  })
);

const ringPages = [
  ['templates/page.engagement-rings.json', 'fye_finder_entry_eng', 'eng',
    'Find your engagement ring',
    'Over a thousand designs. Answer a few questions and we will narrow them down, or design something new with you.',
    'Start the matchmaker'],
  ['templates/page.wedding-rings.json', 'fye_finder_entry_wedding', 'plain',
    'Find your wedding ring',
    'Profile, width, metal and finish. Answer a few questions and we will show you the bands that match.',
    'Start the matchmaker'],
  ['templates/page.eternity-rings.json', 'fye_finder_entry_eternity', 'dia',
    'Find your eternity ring',
    'Coverage, stone, shape and setting. Answer a few questions and we will show you the rings that match.',
    'Start the matchmaker']
];

for (const [rel, key, journey, heading, intro, label] of ringPages) {
  step(`W318 entry band → ${rel}`, () =>
    editJson(rel, (d) => {
      if (d.sections[key]) return 'skip';
      return placeSection(
        d,
        key,
        entrySection(heading, intro, [{ label, journey }]),
        null
      );
    })
  );
}

// ---------------------------------------------------------------------------

console.log('\nw317-w319 — rail density, Ring Matchmaker, article headings\n');
console.log(log.join('\n'));
console.log(`\n${changed} applied, ${skipped} already present, ${failed} refused.\n`);
if (failed) {
  console.log('A refusal means the file did not look the way this script expected.');
  console.log('Nothing was written for that step. Say so rather than editing by hand.\n');
  process.exit(1);
}
console.log('Next:  ./tools/fye ship "W317-W319: rail density, Ring Matchmaker, article headings"');
console.log('Then in Online Store > Themes > Customise, check the matchmaker band');
console.log('sits where you want it on each page and drag it if not.\n');
