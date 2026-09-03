// w971-port-education-pages.mjs — the education library porter.
//
//   node tools/w971-port-education-pages.mjs           dry run, reports only
//   node tools/w971-port-education-pages.mjs --write   writes the supportable ones
//
// Generalises what w967 did for the six guide reading pages, to every page
// template live has and v3 does not.
//
// WHAT IT DOES PER PAGE
//   · reads live/templates/page.<suffix>.json
//   · works out every section TYPE the page uses
//   · checks each type exists in v3/sections (or is a known Shopify default)
//   · converts the hero: v3's fye-hero is a DIFFERENT section under the same
//     name — live's takes heading/subtext/button blocks with per-block
//     typography, v3's takes flat settings — so a copied hero would render
//     EMPTY. It becomes a heading-template banner carrying the h1, the
//     subtext, the image and the overlay.
//   · drops any standalone fye-breadcrumb: heading-template has a crumb block
//   · rounds the overlay to an even number, because that range has step 2 and
//     an odd value makes Shopify reject the WHOLE template silently
//   · passes everything else through untouched
//
// A page needing a section v3 does not have is SKIPPED and listed, with the
// missing types named. Nothing is half-written.
//
// It never overwrites a template that already exists in v3 — those were built
// deliberately and may have diverged.

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const LIVE = resolve(root, '..', 'fye-shopify-theme', 'templates');
const V3_TEMPLATES = resolve(root, 'templates');
const V3_SECTIONS = resolve(root, 'sections');

const WRITE = process.argv.includes('--write');

// Section types Shopify provides or that are theme-level rather than files.
const BUILTIN = new Set(['apps', 'custom-liquid']);

// Section types this porter REMOVES rather than requires.
//   fye-breadcrumb — heading-template carries a crumb block
//   sidebar-page   — v3 has no sidebars anywhere (Ed, 02/09/2026). Blog and
//                    collection both had one on live; neither does now, so the
//                    education pages are single-column to match.
const DROP_TYPES = new Set(['fye-breadcrumb', 'sidebar-page']);

// Never port these, whatever they contain.
const EXCLUDE = new Set([
  'page.zz-form-testing.json',        // internal, marked do-not-link
  'page.about-us-v2.json',            // duplicate of the About page already built
  'page.edu-test-page.json',          // internal test page

  // No page with these handles exists in the store — orphan templates on live.
  'page.faqs.json',
  'page.faq-2.json',
  'page.gemstones.json',

  // Pages exist but their bodies are empty and nothing links to them: no menu
  // item, no reference in either repo. The nav uses the COLLECTIONS of the
  // same name (/collections/natural-diamonds, /collections/lab-diamonds).
  'page.diamonds.json',
  'page.lab-diamonds.json',

  // No page with these handles exists either, confirmed 03/09/2026. Their
  // blocked sections (main-pagebrands, contact-form, main-store-locator,
  // timeline) are therefore not needed by anything.
  'page.create.json',
  'page.brands.json',
  'page.store-locator.json',
  'page.timeline.json'
]);

if (!existsSync(LIVE)) {
  console.error('MISSING: ' + LIVE);
  console.error('Expects the live repo beside this one: ../fye-shopify-theme');
  process.exit(1);
}

const v3Sections = new Set(
  readdirSync(V3_SECTIONS)
    .filter((f) => f.endsWith('.liquid'))
    .map((f) => basename(f, '.liquid'))
);

const existing = new Set(readdirSync(V3_TEMPLATES));

function parseTemplate(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end <= start) throw new Error('no JSON object found');
  return JSON.parse(text.slice(start, end + 1));
}

function stripTags(html) {
  return String(html || '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function transform(doc) {
  const sections = doc.sections || {};
  const order = Array.isArray(doc.order) ? doc.order.slice() : Object.keys(sections);

  let heroId = null;
  const dropIds = new Set();
  const droppedTypes = new Set();
  const types = new Set();

  for (const [id, sec] of Object.entries(sections)) {
    if (!sec || !sec.type) continue;
    types.add(sec.type);
    if (sec.type === 'fye-hero' && !heroId) heroId = id;
    if (DROP_TYPES.has(sec.type)) {
      dropIds.add(id);
      droppedTypes.add(sec.type);
    }
  }

  // Types this porter handles itself rather than requiring in v3.
  const needed = [...types].filter((t) => t !== 'fye-hero' && !DROP_TYPES.has(t));
  const missing = needed.filter((t) => !v3Sections.has(t) && !BUILTIN.has(t));
  if (missing.length) return { missing };

  let banner = null;
  if (heroId) {
    const hero = sections[heroId];
    const hs = hero.settings || {};
    let headingHtml = '';
    let subText = '';
    for (const b of Object.values(hero.blocks || {})) {
      if (!b || !b.settings) continue;
      if (b.type === 'heading' && !headingHtml) headingHtml = b.settings.html || '';
      if (b.type === 'subtext' && !subText) subText = b.settings.text || '';
    }
    const heading = stripTags(headingHtml);
    if (!heading) return { missing: [], error: 'hero had no heading text' };

    let overlay = parseInt(hs.overlay_opacity, 10);
    if (isNaN(overlay)) overlay = 46;
    overlay = Math.max(0, Math.min(100, Math.round(overlay / 2) * 2));

    banner = {
      type: 'heading-template',
      blocks: {
        crumbs: { type: '3', settings: {} },
        title: { type: '1', settings: { heading } }
      },
      block_order: ['crumbs', 'title'],
      settings: { content_align: 't4s-text-center', heading_fullwidth: false, overlay }
    };
    if (subText) {
      banner.blocks.sub = { type: '2', settings: { content: '<p>' + subText + '</p>' } };
      banner.block_order.push('sub');
    }
    if (hs.image) {
      banner.settings.image = hs.image;
      banner.settings.use_specify_image = true;
    } else {
      banner.settings.use_specify_image = false;
      banner.settings.ground = 'teal';
    }
    banner.__heading = heading;
  }

  const outSections = {};
  const outOrder = [];
  for (const id of order) {
    if (!sections[id]) continue;
    if (dropIds.has(id)) continue;
    if (id === heroId) {
      const b = { ...banner };
      delete b.__heading;
      outSections.heading = b;
      outOrder.push('heading');
      continue;
    }
    outSections[id] = sections[id];
    outOrder.push(id);
  }
  if (banner && !outOrder.includes('heading')) {
    const b = { ...banner };
    delete b.__heading;
    outSections.heading = b;
    outOrder.unshift('heading');
  }

  const json = JSON.stringify({ sections: outSections, order: outOrder }, null, 2);
  JSON.parse(json);

  return {
    missing: [],
    json: json + String.fromCharCode(10),
    heading: banner ? banner.__heading : '(no hero)',
    kept: outOrder.length,
    dropped: droppedTypes.size ? [...droppedTypes].join(', ') : 'none'
  };
}

const candidates = readdirSync(LIVE)
  .filter((f) => f.startsWith('page.') && f.endsWith('.json'))
  .filter((f) => !existing.has(f))
  .filter((f) => !EXCLUDE.has(f))
  .sort();

const ready = [];
const skipped = [];
const failed = [];

for (const name of candidates) {
  let out;
  try {
    out = transform(parseTemplate(readFileSync(resolve(LIVE, name), 'utf8')));
  } catch (err) {
    failed.push({ name, why: err.message });
    continue;
  }
  if (out.missing && out.missing.length) {
    skipped.push({ name, missing: out.missing });
  } else if (out.error) {
    failed.push({ name, why: out.error });
  } else {
    ready.push({ name, ...out });
  }
}

console.log('LIVE page templates not in v3 : ' + candidates.length);
console.log('portable now                  : ' + ready.length);
console.log('blocked by missing sections    : ' + skipped.length);
console.log('errored                        : ' + failed.length);
console.log('');

if (skipped.length) {
  console.log('=== BLOCKED — v3 has no such section ===');
  const tally = {};
  for (const s of skipped) {
    console.log('  ' + s.name + '  needs: ' + s.missing.join(', '));
    for (const m of s.missing) tally[m] = (tally[m] || 0) + 1;
  }
  console.log('');
  console.log('  sections to build, most-used first:');
  Object.entries(tally)
    .sort((a, b) => b[1] - a[1])
    .forEach(([t, n]) => console.log('    ' + t + '  — unblocks ' + n + ' page(s)'));
  console.log('');
}

if (failed.length) {
  console.log('=== ERRORED — look at these by hand ===');
  for (const f of failed) console.log('  ' + f.name + '  ' + f.why);
  console.log('');
}

if (!WRITE) {
  console.log('=== PORTABLE NOW (dry run, nothing written) ===');
  for (const r of ready) console.log('  ' + r.name + '  — ' + r.heading.slice(0, 60));
  console.log('');
  console.log('Re-run with --write to create these ' + ready.length + ' template(s).');
  process.exit(0);
}

for (const r of ready) {
  writeFileSync(resolve(V3_TEMPLATES, r.name), r.json, 'utf8');
  console.log('new   ' + r.name + '  — ' + r.heading.slice(0, 60) +
              (r.dropped && r.dropped !== 'none' ? '   [dropped: ' + r.dropped + ']' : ''));
}
console.log('');
console.log('Done. ' + ready.length + ' template(s) written.');
