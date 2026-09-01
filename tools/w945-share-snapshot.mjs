// w945-share-snapshot.mjs — say what a shared link actually is.
//
// A share link encodes the list, so it is a photograph taken at the moment it
// was copied: change your wishlist afterwards and the link still shows the old
// one. Nothing can sync it without somewhere server-side to store lists (Ed,
// 01/09 — deferred). So instead of pretending, the page says so.
//
//   1. Copying shows an info box: copied, and a new link is needed if the
//      wishlist changes. Replaces the old label swap, which nobody would read.
//   2. The link carries the date it was made, and a shared view says so —
//      "shared on 1 September" — so a recipient knows how fresh it is.
//   3. A clipboard fallback, because navigator.clipboard is unavailable
//      outside a secure context and silently rejected before.
//
//     node tools/w945-share-snapshot.mjs
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

const JS = 'assets/fye-wishlist.js';

// ---- 1. the link carries its date -----------------------------------------

edit(
  JS,
  `  function shareUrl(list) {
    return window.location.origin + window.location.pathname + '?w=' + encode(list);
  }`,
  `  /* &d= is the day the link was made. A separate parameter rather than part
     of the payload, so links shared before this existed still open. */
  function shareUrl(list) {
    return window.location.origin + window.location.pathname +
           '?w=' + encode(list) + '&d=' + Math.floor(Date.now() / 86400000);
  }

  function sharedOnText(days) {
    if (!days) return '';
    var d = new Date(Number(days) * 86400000);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
  }

  /* ---- the info box ----------------------------------------------------
     A quiet panel at the foot of the screen rather than a browser alert: it
     has two things to say, and the second one matters more than the first. */
  var toastEl = null;
  var toastTimer = null;

  function toast(head, body) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'wish-toast';
      toastEl.setAttribute('role', 'status');
      document.body.appendChild(toastEl);
    }
    toastEl.innerHTML = '<strong>' + esc(head) + '</strong>' +
                        (body ? '<span>' + esc(body) + '</span>' : '');
    toastEl.classList.add('is-on');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove('is-on');
    }, 6000);
  }

  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    /* Older browsers, and any page not served over https. */
    return new Promise(function (resolve, reject) {
      var box = document.createElement('textarea');
      box.value = text;
      box.setAttribute('readonly', '');
      box.style.position = 'fixed';
      box.style.opacity = '0';
      document.body.appendChild(box);
      box.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(box);
      ok ? resolve() : reject();
    });
  }`,
  `&d= is the day the link was made`
);

// ---- 2. the copy button ----------------------------------------------------

edit(
  JS,
  `      var url = shareUrl(store.all());
      var label = share.querySelector('span');
      navigator.clipboard.writeText(url).then(function () {
        if (label) {
          var was = label.textContent;
          label.textContent = 'Link copied';
          setTimeout(function () { label.textContent = was; }, 2000);
        }
      });`,
  `      copy(shareUrl(store.all())).then(function () {
        toast('Link copied',
              'It shows your wishlist as it is right now. If you add or remove ' +
              'anything, send a new link.');
      }).catch(function () {
        toast('Could not copy the link',
              'Your browser blocked it. Copy the address bar instead.');
      });`,
  `send a new link`
);

// ---- 3. a shared view says when -------------------------------------------

edit(
  JS,
  `    var noun = list.length === 1 ? ' item' : ' items';
    summary.textContent = readOnly
      ? 'A list someone shared with you — ' + list.length + noun + '.'
      : list.length + noun + ' saved.';`,
  `    var noun = list.length === 1 ? ' item' : ' items';
    var when = readOnly ? sharedOnText(sharedDay) : '';
    summary.textContent = readOnly
      ? 'A list someone shared with you' + (when ? ' on ' + when : '') +
        ' — ' + list.length + noun + '. It is a snapshot, so it will not change ' +
        'if they update their wishlist.'
      : list.length + noun + ' saved.';`,
  `It is a snapshot`
);

edit(
  JS,
  `  var cache = {};
  var shared = null; /* a list arriving by ?w=, kept apart from the shopper's */`,
  `  var cache = {};
  var shared = null; /* a list arriving by ?w=, kept apart from the shopper's */
  var sharedDay = null;`,
  `var sharedDay = null;`
);

edit(
  JS,
  `    var param = new URLSearchParams(window.location.search).get('w');
    if (param) shared = decode(param);`,
  `    var qs = new URLSearchParams(window.location.search);
    var param = qs.get('w');
    if (param) {
      shared = decode(param);
      sharedDay = qs.get('d');
    }`,
  `sharedDay = qs.get('d')`
);

// ---- 4. styles -------------------------------------------------------------

edit(
  'sections/main-wishlist.liquid',
  `.fye .wish-page__empty {`,
  `/* The copy confirmation. Teal ground, squared, no shadow — it is a panel
   that happens to be fixed, not a floating card. */
.fye .wish-toast {
  position: fixed;
  left: var(--s5);
  bottom: var(--s5);
  z-index: 60;
  max-width: 34ch;
  display: flex;
  flex-direction: column;
  gap: var(--s2);
  padding: var(--s4) var(--s5);
  background: var(--ink);
  color: var(--ivory);
  opacity: 0;
  transform: translateY(6px);
  pointer-events: none;
  transition: opacity var(--dur, 220ms) ease, transform var(--dur, 220ms) ease;
}
.fye .wish-toast.is-on { opacity: 1; transform: none; }
.fye .wish-toast strong {
  font-size: var(--fs-eyebrow);
  font-weight: var(--fw-medium);
  letter-spacing: var(--tr-eyebrow);
  text-transform: uppercase;
}
.fye .wish-toast span { font-size: var(--fs-fine); line-height: 1.5; }

.fye .wish-page__empty {`,
  `.fye .wish-toast`
);

console.log('\nDone.\n');
