// w928-cart.mjs — two changes, both asserted before anything is written.
//
//   1. sections/main-cart.liquid — separate top-level basket items with gap
//      rather than a margin. The margin on .cart__group lost the cascade to
//      `.fye .cart__list > li { margin: 0 }`, which carries one more element
//      of specificity, so two ring sets rendered flush against each other.
//
//   2. assets/fye-ui.js — APPEND the cart behaviours. Append-only: the file is
//      ~67KB and past what a session can read whole, so nothing above the
//      insertion point is touched or re-authored.
//
// Idempotent. Refuses unless every anchor matches exactly once, and refuses to
// append twice. Run from the repo root:
//
//     node tools/w928-cart.mjs
//
// Delete this file once it has run and the change is pushed.

import { readFileSync, writeFileSync } from 'node:fs';

const SECTION = 'sections/main-cart.liquid';
const UI = 'assets/fye-ui.js';
const MARKER = 'CART — 01/09/2026';

let wrote = 0;

// ---------------------------------------------------------------- section --

const cssEdits = [
  [
    `.fye .cart__list { list-style: none; margin: 0; padding: 0; }
.fye .cart__list > li { margin: 0; }
.fye .cart__row { border-bottom: var(--hairline); }
.fye .cart__row:first-child { border-top: var(--hairline); }`,
    `/* Every top-level item is a peer — a grouped ring set, or a single line —
   so they are separated by GAP, not margins. A margin-bottom on .cart__group
   lost to \`.fye .cart__list > li { margin: 0 }\`, which carries one more
   element of specificity, and two ring sets rendered flush together. */
.fye .cart__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--s6);
}
.fye .cart__list > li { margin: 0; }
.fye .cart__row { border: var(--hairline); background: var(--white); }`
  ],
  [
    `.fye .cart__group {
  border: var(--hairline);
  margin-bottom: var(--s6);
  background: var(--white);
}`,
    `.fye .cart__group {
  border: var(--hairline);
  background: var(--white);
}`
  ]
];

let section = readFileSync(SECTION, 'utf8');
const sectionBefore = section.length;
let sectionDone = 0;

for (const [find, replace] of cssEdits) {
  const hits = section.split(find).length - 1;
  if (hits === 0 && section.includes(replace)) {
    console.log('  already applied, skipping one CSS edit');
    sectionDone++;
    continue;
  }
  if (hits !== 1) {
    console.error(`REFUSED: anchor matched ${hits} times in ${SECTION}:\n${find.slice(0, 70)}…`);
    process.exit(1);
  }
  section = section.replace(find, replace);
  sectionDone++;
}

if (sectionDone !== cssEdits.length) {
  console.error('REFUSED: not every CSS edit resolved.');
  process.exit(1);
}

if (section !== readFileSync(SECTION, 'utf8')) {
  writeFileSync(SECTION, section);
  console.log(`  ${SECTION}: ${sectionBefore} -> ${section.length} bytes`);
  wrote++;
} else {
  console.log(`  ${SECTION}: already current`);
}

// --------------------------------------------------------------------- ui --

const ui = readFileSync(UI, 'utf8');

if (ui.includes(MARKER)) {
  console.log(`  ${UI}: cart block already present, not appending`);
} else {
  const block = [
    '',
    '',
    '/* ============================================================================',
    '   CART — 01/09/2026',
    '   ----------------------------------------------------------------------------',
    '   Two behaviours, both cart-page only, both no-ops everywhere else.',
    '',
    '   1. REMOVING PART OF A RING REMOVES THE SET. A configured ring is up to five',
    '      cart lines and they are only a ring together: a setting that reaches',
    '      checkout with no centre stone is an order we cannot fulfil, and a stone',
    '      with no setting is worse. main-cart puts every line key of the set on',
    '      each of its Remove links; this asks once, then takes them all.',
    '',
    '   2. THE CENTRE-FEE RECONCILER. When a customer supplies their own centre',
    '      diamond we sell no stone, we charge to set one, and Shopify cannot',
    '      attach a fee to an existing line — so the fee is its own line and the',
    '      two can drift apart in a basket left overnight.',
    '',
    '      Ed, 01/09/2026: correct it QUIETLY and IN PLACE, and ADD THE FEE BACK if',
    '      it was deleted while the ring stayed. Live only ever corrected a fee',
    '      line that was still there, so deleting it bought free setting.',
    '',
    '   ── ONE FEE LINE PER RING, NOT ONE LINE WITH A QUANTITY ───────────────────',
    '',
    '   Live keeps a single fee line and counts it up. v3 tags every companion with',
    '   its ring\'s SKU (addOnLines above), so a fee line belongs to a ring the same',
    '   way a stone does — which is what lets main-cart show it inside the right',
    '   group. Same variant, different "Ring SKU", so Shopify keeps them separate.',
    '',
    '   ── NO RELOAD ─────────────────────────────────────────────────────────────',
    '',
    '   Both paths re-render through Shopify\'s Section Rendering API and swap the',
    '   section in place. A location.reload() (live\'s approach) throws away scroll',
    '   position and flashes the whole page to correct one line.',
    '   ========================================================================== */',
    '(function cartPage() {',
    '  if (window.location.pathname.indexOf(\'/cart\') !== 0) return;',
    '',
    '  var SUPPLIED = [',
    '    "Customer\'s own diamond",',
    '    \'Supplied by you (setting fee applies)\'',
    '  ];',
    '',
    '  function root() { return document.querySelector(\'[data-fye-cart]\'); }',
    '',
    '  /* The section id Shopify knows this by, read off its own wrapper rather',
    '     than hardcoded — the key in templates/cart.json is free to change. */',
    '  function sectionId() {',
    '    var el = root();',
    '    var wrap = el && el.closest(\'.shopify-section\');',
    '    return wrap && wrap.id ? wrap.id.replace(/^shopify-section-/, \'\') : null;',
    '  }',
    '',
    '  function swap(data) {',
    '    var id = sectionId();',
    '    var html = data && data.sections && id ? data.sections[id] : null;',
    '    var wrap = root() && root().closest(\'.shopify-section\');',
    '    if (!html || !wrap) { window.location.reload(); return; }',
    '    var doc = new DOMParser().parseFromString(html, \'text/html\');',
    '    var fresh = doc.getElementById(wrap.id) || doc.querySelector(\'.shopify-section\');',
    '    if (!fresh) { window.location.reload(); return; }',
    '    wrap.innerHTML = fresh.innerHTML;',
    '  }',
    '',
    '  function post(url, body) {',
    '    var id = sectionId();',
    '    if (id) body.sections = id;',
    '    return fetch(url, {',
    '      method: \'POST\',',
    '      headers: { \'Content-Type\': \'application/json\', Accept: \'application/json\' },',
    '      body: JSON.stringify(body)',
    '    }).then(function (r) { return r.ok ? r.json() : Promise.reject(r); });',
    '  }',
    '',
    '  /* ---- 1. remove the whole set -------------------------------------- */',
    '',
    '  document.addEventListener(\'click\', function (e) {',
    '    var link = e.target.closest && e.target.closest(\'[data-fye-cart-remove-set]\');',
    '    if (!link) return;',
    '',
    '    var keys = (link.getAttribute(\'data-fye-cart-remove-set\') || \'\')',
    '      .split(\',\')',
    '      .filter(Boolean);',
    '',
    '    /* A set of one is just a line. Let the plain href do its job. */',
    '    if (keys.length < 2) return;',
    '',
    '    e.preventDefault();',
    '',
    '    var ok = window.confirm(',
    '      \'This ring is made up of \' + keys.length + \' items — the setting and the \' +',
    '      \'stones chosen with it. Removing one removes them all, so your order \' +',
    '      \'cannot end up with a setting and no stones. Remove them?\'',
    '    );',
    '    if (!ok) return;',
    '',
    '    var updates = {};',
    '    keys.forEach(function (k) { updates[k] = 0; });',
    '',
    '    post(\'/cart/update.js\', { updates: updates })',
    '      .then(swap)',
    '      .catch(function () { window.location.href = link.getAttribute(\'href\'); });',
    '  });',
    '',
    '  /* ---- 2. the centre-fee reconciler ---------------------------------- */',
    '',
    '  function suppliesOwnStone(item) {',
    '    var v = (item.properties || {})[\'Centre Diamond\'];',
    '    return !!v && SUPPLIED.indexOf(v) >= 0;',
    '  }',
    '',
    '  function reconcile() {',
    '    var el = root();',
    '    if (!el) return;',
    '',
    '    var fee = (el.getAttribute(\'data-fee-variant\') || \'\').trim();',
    '    if (!fee) return; /* switched off in the theme editor */',
    '',
    '    var linkKey = el.getAttribute(\'data-link-key\') || \'Ring SKU\';',
    '',
    '    fetch(\'/cart.js\', { headers: { Accept: \'application/json\' } })',
    '      .then(function (r) { return r.json(); })',
    '      .then(function (cart) {',
    '        var items = cart.items || [];',
    '',
    '        /* Rings that need a fee, by SKU. */',
    '        var need = {};',
    '        items.forEach(function (it) {',
    '          if (suppliesOwnStone(it) && it.sku) need[it.sku] = it.product_title;',
    '        });',
    '',
    '        /* Fee lines we already hold, by the ring they name. */',
    '        var held = {};',
    '        var strays = [];',
    '        items.forEach(function (it) {',
    '          if (String(it.variant_id) !== String(fee)) return;',
    '          var owner = (it.properties || {})[linkKey];',
    '          if (owner && need[owner]) held[owner] = it;',
    '          else strays.push(it);',
    '        });',
    '',
    '        /* A fee line naming no ring, or a ring that has gone. Both are the',
    '           customer paying to set a stone nobody is setting. */',
    '        var updates = {};',
    '        strays.forEach(function (it) { updates[it.key] = 0; });',
    '        Object.keys(held).forEach(function (sku) {',
    '          if (held[sku].quantity !== 1) updates[held[sku].key] = 1;',
    '        });',
    '',
    '        /* A ring whose fee line was deleted. Live left these alone, which',
    '           meant free setting. */',
    '        var adds = [];',
    '        Object.keys(need).forEach(function (sku) {',
    '          if (held[sku]) return;',
    '          var props = { \'For ring\': need[sku] };',
    '          props[linkKey] = sku;',
    '          adds.push({ id: parseInt(fee, 10), quantity: 1, properties: props });',
    '        });',
    '',
    '        if (!Object.keys(updates).length && !adds.length) return;',
    '',
    '        var step = Object.keys(updates).length',
    '          ? post(\'/cart/update.js\', { updates: updates })',
    '          : Promise.resolve(null);',
    '',
    '        step',
    '          .then(function (res) {',
    '            return adds.length ? post(\'/cart/add.js\', { items: adds }) : res;',
    '          })',
    '          .then(swap)',
    '          .catch(function () { /* leave the basket as the shopper left it */ });',
    '      })',
    '      .catch(function () {});',
    '  }',
    '',
    '  if (document.readyState === \'loading\') {',
    '    document.addEventListener(\'DOMContentLoaded\', reconcile);',
    '  } else {',
    '    reconcile();',
    '  }',
    '})();',
    ''
  ].join('\n');

  const next = ui + block;
  if (next.length <= ui.length) {
    console.error('REFUSED: append did not grow the file.');
    process.exit(1);
  }
  writeFileSync(UI, next);
  console.log(`  ${UI}: ${ui.length} -> ${next.length} bytes (appended)`);
  wrote++;
}

console.log(wrote ? `\nDone. ${wrote} file(s) changed.\n` : '\nNothing to do — already applied.\n');
