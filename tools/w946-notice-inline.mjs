// w946-notice-inline.mjs — the info box becomes a permanent line under the
// share buttons rather than a box that floats in and vanishes.
//
// Ed, 01/09: permanent, on the line below Copy link / WhatsApp / Email. It
// carries the snapshot caveat at all times, and switches to a confirmation
// when the link is copied — the caveat stays either way, because that is the
// part worth reading.
//
//     node tools/w946-notice-inline.mjs
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

const PAGE = 'sections/main-wishlist.liquid';
const JS = 'assets/fye-wishlist.js';

// ---- markup: a real element, always in the flow ---------------------------

edit(
  PAGE,
  `    {%- if s.share_note != blank -%}
      <p class="fine wish-page__note" data-wish-tools hidden>{{ s.share_note }}</p>
    {%- endif -%}`,
  `{%- comment -%}
      Sits directly under the share buttons and stays there. The copy
      confirmation writes into it rather than floating over the page, so the
      caveat about snapshots is on screen when someone is deciding to send the
      link — not for six seconds after they already have.
    {%- endcomment -%}
    <div class="wish-notice" data-wish-tools data-wish-notice hidden>
      <span>{{ s.share_note | default: 'Your list is saved on this device. Share the link to show someone else — it is a snapshot, so send a new one if you change your wishlist.' }}</span>
    </div>`,
  `data-wish-notice`
);

// ---- the writer ------------------------------------------------------------

edit(
  JS,
  `  var toastEl = null;
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
  }`,
  `  function toast(head, body) {
    var el = root.querySelector('[data-wish-notice]');
    if (!el) return;
    /* Permanent, not a flash. The heading changes; the explanation below it
       is the same sentence the shopper was already reading. */
    el.innerHTML = (head ? '<strong>' + esc(head) + '</strong>' : '') +
                   '<span>' + esc(body) + '</span>';
    el.classList.add('is-said');
  }`,
  `Permanent, not a flash`
);

// ---- styles ----------------------------------------------------------------

edit(
  PAGE,
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
.fye .wish-toast span { font-size: var(--fs-fine); line-height: 1.5; }`,
  `/* The sharing notice, under the buttons and always present. Mist blue is
   the design system's information ground; it goes teal once something has
   actually happened, so a confirmation reads as a change without moving. */
.fye .wish-notice {
  display: flex;
  flex-direction: column;
  gap: var(--s2);
  margin-top: var(--s4);
  padding: var(--s4) var(--s5);
  background: var(--mist, #DCEFEF);
  color: var(--ink);
}
.fye .wish-notice.is-said { background: var(--ink); color: var(--ivory); }
.fye .wish-notice strong {
  font-size: var(--fs-eyebrow);
  font-weight: var(--fw-medium);
  letter-spacing: var(--tr-eyebrow);
  text-transform: uppercase;
}
.fye .wish-notice span { font-size: var(--fs-fine); line-height: 1.5; }`,
  `.fye .wish-notice`
);

console.log('\nDone.\n');
