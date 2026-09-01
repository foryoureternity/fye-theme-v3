// w937-wishlist-fixes.mjs — the big heart's look, and the empty page bug.
//
// THE BUG. The header count rises but the page shows nothing, which tells us
// the store is fine and the PAGE is the problem. fye-wishlist.js read
// window.FYE.wishlist at parse time and returned silently if it was not there
// yet — so whenever the page's own script ran before fye-ui.js had defined the
// store, the grid simply never rendered. Nothing in the console, nothing on
// the page. It now waits for the store instead of giving up on it, and says so
// if it never arrives rather than showing a blank.
//
// Also: transparent ground on the gallery heart, half again as large (Ed).
//
// Idempotent; refuses unless each anchor matches exactly once.
//     node tools/w937-wishlist-fixes.mjs
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
    console.error('  ' + find.slice(0, 100));
    process.exit(1);
  }
  writeFileSync(file, src.replace(find, replace));
  console.log(`  ${file}: ${src.length} -> ${readFileSync(file, 'utf8').length} bytes`);
}

const JS = 'assets/fye-wishlist.js';

// ---- 1. do not read the store at parse time -------------------------------

edit(
  JS,
  `  var store = (window.FYE && window.FYE.wishlist) || null;
  if (!store) return;`,
  `  /* Resolved in boot(), not here. fye-ui.js defines the store, and nothing
     guarantees it has run by the time this file is parsed — reading it now and
     bailing is what left this page blank while the header count rose. */
  var store = null;`,
  'Resolved in boot(), not here'
);

// ---- 2. wait for it, and say so if it never comes -------------------------

edit(
  JS,
  `  var param = new URLSearchParams(window.location.search).get('w');
  if (param) shared = decode(param);

  render();
  if (!shared) paintShare();
  document.addEventListener('fye:wishlist', function () {
    if (!shared) paintShare();
  });
})();`,
  `  var tries = 0;

  function boot() {
    store = (window.FYE && window.FYE.wishlist) || null;

    if (!store) {
      /* About five seconds, then stop. A slow connection is worth waiting for;
         a missing fye-ui.js is not, and an honest message beats a page that
         sits empty forever pretending the shopper saved nothing. */
      if (tries++ < 100) { window.setTimeout(boot, 50); return; }
      show(grid, false);
      show(summary, true);
      if (summary) {
        summary.textContent = 'Your saved rings could not be loaded. Please refresh the page.';
      }
      return;
    }

    var param = new URLSearchParams(window.location.search).get('w');
    if (param) shared = decode(param);

    render();
    if (!shared) paintShare();
    document.addEventListener('fye:wishlist', function () {
      if (!shared) paintShare();
      render();
    });
  }

  boot();
})();`,
  'function boot() {'
);

// ---- 3. the big heart ------------------------------------------------------

edit(
  'assets/fye-core.css',
  `.fye .wish--lg {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  background: var(--ivory);
  border: 0;
  color: var(--ink);
  cursor: pointer;
  transition: color var(--dur, 220ms) ease;
}
.fye .wish--lg:hover { color: var(--sage); }
.fye .wish--lg svg { width: 24px; height: 24px; }`,
  `/* Transparent ground, half again as large — Ed, 01/09/2026. Nothing behind
   it now, so the stroke carries the whole control; a drop shadow would be the
   obvious way to keep it legible on a pale ring shot, and the wrong one here
   (this system has no glows and almost no elevation). */
.fye .wish--lg {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 78px;
  height: 78px;
  background: none;
  border: 0;
  color: var(--ink);
  cursor: pointer;
  transition: color var(--dur, 220ms) ease;
}
.fye .wish--lg:hover { color: var(--sage); }
.fye .wish--lg svg { width: 36px; height: 36px; }`,
  'Transparent ground, half again as large'
);

console.log('\nDone.\n');
