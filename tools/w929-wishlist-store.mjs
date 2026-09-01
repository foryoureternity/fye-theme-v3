// w929-wishlist-store.mjs — the wishlist store and the hearts.
//
//   1. INSERT a bridge inside fye-ui.js's productPage IIFE, after addOnLines().
//      The heart on a product page saves what the shopper actually chose, and
//      that only exists in that DOM at that moment. This file's own header
//      warns that the moment two things compute a configuration they disagree,
//      so the wishlist calls the SAME functions add-to-cart uses.
//   2. APPEND the store, the heart, the header count.
//
// Append rather than rewrite: fye-ui.js is past what a session can read whole,
// so nothing above the insertion point is touched.
//
// Idempotent; refuses unless the anchor matches exactly once.
//     node tools/w929-wishlist-store.mjs
// Delete once run and pushed.

import { readFileSync, writeFileSync } from 'node:fs';

const UI = 'assets/fye-ui.js';
const MARKER = 'WISHLIST — 01/09/2026';
const ANCHOR = `    return lines.filter(function (l) { return l.id; });
  }`;

let ui = readFileSync(UI, 'utf8');

if (ui.includes(MARKER)) {
  console.log('Already applied. Nothing to do.');
  process.exit(0);
}

const hits = ui.split(ANCHOR).length - 1;
if (hits !== 1) {
  console.error(`REFUSED: anchor matched ${hits} times, expected 1.`);
  process.exit(1);
}

const before = ui.length;

ui = ui.replace(ANCHOR, ANCHOR + `

  /* ---- read the buy box, for the wishlist ------------------------------
     The heart saves what the shopper has chosen, which only exists in this
     DOM at this moment. Rather than a second reading of the buy box (header:
     the moment two things compute a configuration, they disagree), the
     wishlist block at the end of this file calls the same three functions
     add-to-cart already uses. */
  window.FYE = window.FYE || {};
  window.FYE.buyBox = function (form) {
    var v = chosenVariant(form);
    if (!v) return null;
    return { variant: v, props: ringProps(form), lines: addOnLines(form, v) };
  };`);

ui += `


/* ============================================================================
   WISHLIST — 01/09/2026
   ----------------------------------------------------------------------------
   Ed, 01/09/2026: the heart saves the WHOLE CONFIGURATION, the list lives on
   the device, and it exists so partners can send each other rings.

   STORED: what identifies the ring — handle, variant id, the line-item
   properties, and the companion lines exactly as add-to-cart would post them.
   That is what makes "move to basket" one call rather than a reconstruction.

   NOT STORED: price and availability, read live when the list renders. A ring
   saved in March and opened in September must not quote March's price; metal
   moves, and a stale figure in a list shared with a partner is a promise we
   did not make. Title and image are kept only as a fallback for a product
   since unpublished — the live read wins whenever it succeeds.

   IDENTITY is handle + a hash of variant, properties and companion lines, not
   the bare product id live uses. The same setting with two different centre
   stones is two different rings and must save as two entries.

   DEVICE ONLY, one localStorage key, no migration from T4S's 't4s_wis_cp' —
   Ed chose to start clean. Sharing is by URL; that half lives in the wishlist
   page's own script.
   ========================================================================== */
(function wishlist() {
  var KEY = 'fye_wishlist_v1';
  var EVENT = 'fye:wishlist';

  window.FYE = window.FYE || {};

  function read() {
    try {
      var raw = window.localStorage.getItem(KEY);
      var list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (e) {
      /* Private mode, a full quota, someone else's malformed value. An
         unusable wishlist must not take the page down with it. */
      return [];
    }
  }

  function write(list) {
    try { window.localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {}
    document.dispatchEvent(new CustomEvent(EVENT, { detail: { count: list.length } }));
  }

  /* Short, stable, order-independent digest. Not security — just enough that
     two different stones cannot collide. */
  function digest(obj) {
    var keys = Object.keys(obj || {}).sort();
    var s = keys.map(function (k) { return k + '=' + obj[k]; }).join('|');
    var h = 5381;
    for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return (h >>> 0).toString(36);
  }

  function identify(item) {
    var parts = { v: item.variant };
    Object.keys(item.props || {}).forEach(function (k) { parts['p:' + k] = item.props[k]; });
    (item.lines || []).forEach(function (l, i) { parts['l:' + i] = l.id + 'x' + l.quantity; });
    return item.handle + ':' + digest(parts);
  }

  var store = {
    all: read,
    count: function () { return read().length; },
    has: function (id) { return read().some(function (it) { return it.id === id; }); },
    add: function (item) {
      var list = read();
      if (list.some(function (it) { return it.id === item.id; })) return list;
      /* Newest first: a wishlist is a shortlist, and the thing just saved is
         the thing being thought about. */
      list.unshift(item);
      write(list);
      return list;
    },
    remove: function (id) {
      var list = read().filter(function (it) { return it.id !== id; });
      write(list);
      return list;
    },
    note: function (id, text) {
      var list = read();
      list.forEach(function (it) { if (it.id === id) it.note = text; });
      write(list);
      return list;
    },
    replace: function (list) { write(Array.isArray(list) ? list : []); return read(); },
    identify: identify
  };

  window.FYE.wishlist = store;

  function fromCard(btn) {
    return {
      handle: btn.getAttribute('data-wish-handle'),
      variant: btn.getAttribute('data-wish-variant'),
      title: btn.getAttribute('data-wish-title') || '',
      image: btn.getAttribute('data-wish-image') || '',
      props: {}, lines: [], note: '', added: Date.now()
    };
  }

  function fromForm(btn) {
    var form = btn.closest('form');
    var box = form && window.FYE.buyBox ? window.FYE.buyBox(form) : null;
    if (!box) return null;

    var scope = form.closest('[data-fye-product]') || document;
    var titleEl = scope.querySelector('[data-fye-product-title]') || document.querySelector('h1');
    var imgEl = scope.querySelector('[data-fye-stage] img') || scope.querySelector('img');

    return {
      handle: (form.getAttribute('data-fye-handle') ||
               window.location.pathname.split('/products/')[1] || '').split('?')[0],
      variant: String(box.variant.id),
      title: titleEl ? titleEl.textContent.trim() : '',
      image: imgEl ? imgEl.getAttribute('src') : '',
      props: box.props || {},
      lines: box.lines || [],
      note: '', added: Date.now()
    };
  }

  function paint(btn, on) {
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.classList.toggle('is-on', !!on);
  }

  function counts(n) {
    document.querySelectorAll('[data-fye-wish-count]').forEach(function (el) {
      el.textContent = n ? String(n) : '';
      el.hidden = !n;
    });
  }

  function paintAll() {
    var list = read();
    var ids = {};
    list.forEach(function (it) { ids[it.id] = true; });

    document.querySelectorAll('[data-fye-wish="card"]').forEach(function (btn) {
      var probe = fromCard(btn);
      probe.id = identify(probe);
      paint(btn, ids[probe.id]);
    });

    /* A form heart cannot be painted from markup — it depends on the current
       configuration — so it is repainted whenever the buy box changes. */
    document.querySelectorAll('[data-fye-wish="form"]').forEach(function (btn) {
      var item = fromForm(btn);
      paint(btn, item && ids[identify(item)]);
    });

    counts(list.length);
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('[data-fye-wish]');
    if (!btn) return;
    e.preventDefault();

    var ctx = btn.getAttribute('data-fye-wish');
    var item = ctx === 'form' ? fromForm(btn) : fromCard(btn);

    /* No variant chosen yet. Nothing to save, and nothing to say — the buy
       box is already telling them what is outstanding. */
    if (!item || !item.handle) return;

    item.id = identify(item);
    if (store.has(item.id)) store.remove(item.id);
    else store.add(item);
    paintAll();
  });

  /* A changed buy box means the form heart now refers to a different ring, so
     its saved state has to be re-read. */
  document.addEventListener('change', function (e) {
    if (e.target.closest && e.target.closest('form [data-fye-variants]')) paintAll();
  });

  document.addEventListener(EVENT, function (e) { counts(e.detail.count); });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', paintAll);
  } else {
    paintAll();
  }
  document.addEventListener('shopify:section:load', paintAll);
})();
`;

writeFileSync(UI, ui);
console.log(`  ${UI}: ${before} -> ${ui.length} bytes\n`);
