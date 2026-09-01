// w944-config-restore.mjs — a shared ring opens configured.
//
//   1. fye-ui.js — the heart now also saves cfg (window.FYE.readConfig).
//   2. fye-ui.js — a new block: on a product page, if the URL carries ?fyec=,
//      rebuild the buy box from it. Nothing read the URL before, not even
//      ?variant=, so a shared ring opened blank however it was configured.
//   3. fye-wishlist.js — carry cfg through the share link and hang it on each
//      card's product URL.
//
// The payload is the same base64url shape the share link already uses, so
// there is one encoder to reason about.
//
//     node tools/w944-config-restore.mjs
// Delete once run and pushed.

import { readFileSync, writeFileSync } from 'node:fs';

function edit(file, find, replace, skipIf) {
  const src = readFileSync(file, 'utf8');
  if (skipIf && src.includes(skipIf)) {
    console.log(`  ${file}: already applied, skipping`);
    return;
  }
  const hits = src.split(find).length - 1;
  if (hits !== 1) {
    console.error(`REFUSED: anchor matched ${hits} times in ${file}, expected 1.`);
    console.error('  ' + find.slice(0, 90));
    process.exit(1);
  }
  writeFileSync(file, src.replace(find, replace));
  console.log(`  ${file}: ${src.length} -> ${readFileSync(file, 'utf8').length} bytes`);
}

const UI = 'assets/fye-ui.js';

// ---- 1. save the configuration too ----------------------------------------

edit(
  UI,
  `      props: box.props || {},
      lines: box.lines || [],
      note: '', added: Date.now()
    };
  }`,
  `      props: box.props || {},
      lines: box.lines || [],
      /* The choosers in full, including the stone's own JSON. props and lines
         are enough to BUY the ring again; only this is enough to SHOW it
         configured on the product page. */
      cfg: window.FYE.readConfig ? window.FYE.readConfig(form) : null,
      note: '', added: Date.now()
    };
  }`,
  `only this is enough to SHOW it`
);

// ---- 2. rebuild from the URL ----------------------------------------------

const ui = readFileSync(UI, 'utf8');
if (ui.includes('CONFIGURED LINKS')) {
  console.log(`  ${UI}: restore block already present, skipping`);
} else {
  writeFileSync(UI, ui + `


/* ============================================================================
   CONFIGURED LINKS — 01/09/2026
   ----------------------------------------------------------------------------
   ?fyec= carries a whole buy box: metal, quality, centre stone, side pair,
   engraving, waivers. Written by the wishlist when it links to a product, so a
   ring shared with a partner opens as the sender left it rather than as a bare
   product page.

   Before this, NOTHING on a product page read the URL — not even ?variant= —
   so every shared configuration was lost on arrival.

   The payload is trusted only as far as it goes: applyConfig sets controls
   that exist and ignores anything else, prices are recomputed by render(), and
   the add-to-cart requirement check still runs. A tampered link cannot produce
   a cheap ring, only a confused-looking one.
   ========================================================================== */
(function configuredLink() {
  var param;
  try {
    param = new URLSearchParams(window.location.search).get('fyec');
  } catch (e) {
    return;
  }
  if (!param) return;

  var cfg;
  try {
    var b64 = param.replace(/-/g, '+').replace(/_/g, '/');
    cfg = JSON.parse(decodeURIComponent(escape(window.atob(b64))));
  } catch (e) {
    return; /* a mangled link is just a normal product page */
  }

  function apply() {
    var island = document.querySelector('form [data-fye-variants]');
    var form = island ? island.closest('form') : null;
    if (!form || !window.FYE || !window.FYE.applyConfig) return;
    window.FYE.applyConfig(form, cfg);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }
})();
`);
  console.log(`  ${UI}: restore block appended`);
}

// ---- 3. the wishlist writes those links ------------------------------------

const JS = 'assets/fye-wishlist.js';

edit(
  JS,
  `      return { h: it.handle, v: it.variant, p: it.props, l: it.lines, n: it.note || '' };`,
  `      return { h: it.handle, v: it.variant, p: it.props, l: it.lines, n: it.note || '', c: it.cfg || null };`,
  `c: it.cfg || null`
);

edit(
  JS,
  `          handle: o.h, variant: String(o.v), props: o.p || {}, lines: o.l || [],
          note: o.n || '', title: '', image: '', added: Date.now()`,
  `          handle: o.h, variant: String(o.v), props: o.p || {}, lines: o.l || [],
          cfg: o.c || null, note: o.n || '', title: '', image: '', added: Date.now()`,
  `cfg: o.c || null`
);

edit(
  JS,
  `    var url = product ? '/products/' + product.handle + '?variant=' + item.variant : null;`,
  `    /* ?fyec= rebuilds the whole buy box on arrival — see CONFIGURED LINKS in
       fye-ui.js. ?variant= alone restores nothing: the product page does not
       read it. */
    var url = null;
    if (product) {
      url = '/products/' + product.handle + '?variant=' + item.variant;
      if (item.cfg) {
        try {
          var raw = window.btoa(unescape(encodeURIComponent(JSON.stringify(item.cfg))));
          url += '&fyec=' + raw.replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=+$/, '');
        } catch (e) {}
      }
    }`,
  `?fyec= rebuilds the whole buy box`
);

console.log('\nDone.\n');
