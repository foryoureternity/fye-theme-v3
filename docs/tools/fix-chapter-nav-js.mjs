/* ============================================================================
   fix-chapter-nav-js.mjs — move the chapter-nav behaviours into fye-ui.js
   ----------------------------------------------------------------------------
     cd ~/Dropbox/GIT-repositaries/fye-theme-v3
     node docs/tools/fix-chapter-nav-js.mjs

   Delete once run and synced.

   The old fye-chapter-nav.liquid carried two inline <script> blocks. Sections
   do not carry scripts in v3 (conventions §6), so both become named functions
   in assets/fye-ui.js. This inserts them rather than rewriting the file.
   ========================================================================== */

import { readFile, writeFile } from 'node:fs/promises';

const FILE = 'assets/fye-ui.js';

const FIND = '  /* ---- Init ------------------------------------------------------------- */';

const ADD = `  /* ---- Chapter navigation ----------------------------------------------
     A guide chapter can belong to several guides at once. The section renders
     ONE trail into the HTML and lists the others as JSON; an incoming link
     carrying ?guide=<key> swaps the trail to the guide the reader arrived
     through. Without the parameter nothing runs and the default trail stands,
     which is also what a crawler sees.

     There are normally two of these per page — breadcrumb at the top,
     prev/next at the foot — and each is rewritten from its own JSON island.
     -------------------------------------------------------------------- */

  function chapterNav() {
    var want;
    try {
      want = new URLSearchParams(window.location.search).get('guide');
    } catch (e) {
      return;
    }
    if (!want) return;

    var roots = document.querySelectorAll('[data-fye-chapter-nav]');
    Array.prototype.forEach.call(roots, function (root) {
      if (root.getAttribute('data-default-guide') === want) return;

      var tag = root.querySelector('[data-fye-chapter-data]');
      if (!tag) return;

      var data;
      try {
        data = JSON.parse(tag.textContent);
      } catch (e) {
        return;
      }

      var match = null;
      data.forEach(function (d) { if (d.g === want) match = d; });
      if (!match) return;

      var guide = root.querySelector('.chnav__guide');
      if (guide) {
        guide.setAttribute('href', match.url);
        guide.textContent = match.name;
      }

      var here = root.querySelector('.chnav__here');
      if (here) here.textContent = match.here;

      var count = root.querySelector('.chnav__count');
      if (count) count.textContent = 'Chapter ' + match.n + ' of ' + match.t;

      [['prev', match.prev], ['next', match.next]].forEach(function (pair) {
        var a = root.querySelector('.chnav__link--' + pair[0]);
        if (!a) return;
        a.setAttribute('href', pair[1].h);
        var lbl = a.querySelector('.chnav__lbl');
        var ttl = a.querySelector('.chnav__ttl');
        if (lbl) lbl.textContent = pair[1].l;
        if (ttl) ttl.textContent = pair[1].t;
      });
    });

    document.documentElement.setAttribute('data-fye-guide', want);
  }

  /* ---- On this page -----------------------------------------------------
     Builds the contents list from the page's own h2s, so it cannot drift from
     the content the way a hand-maintained list does. Stays hidden unless there
     are more than three headings — below that the list is longer than the
     thing it indexes — and stays hidden entirely if this never runs.

     Headings without an id get one derived from their text, so the links have
     something to point at.
     -------------------------------------------------------------------- */

  function pageContents() {
    var toc = document.querySelector('[data-fye-toc]');
    if (!toc) return;

    var list = toc.querySelector('.chnav__toclist');
    if (!list) return;

    var heads = document.querySelectorAll('main h2, .shopify-section h2');
    var n = 0;

    Array.prototype.forEach.call(heads, function (h) {
      var txt = (h.textContent || '').trim();
      if (!txt) return;
      /* Never index the nav's own markup, or the footer's. */
      if (h.closest('[data-fye-chapter-nav]')) return;
      if (h.closest('footer')) return;

      if (!h.id) {
        h.id = 'sec-' + txt
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 40);
      }

      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = txt;
      li.appendChild(a);
      list.appendChild(li);
      n += 1;
    });

    if (n > 3) toc.hidden = false;
  }

  /* ---- Init ------------------------------------------------------------- */`;

const CALL_FIND = '  function init(scope) { initRotators(scope); }';
const CALL_REPLACE = `  function init(scope) {
    initRotators(scope);
    chapterNav();
    pageContents();
  }`;

let text = await readFile(FILE, 'utf8');
let ok = true;

for (const [find, replace] of [[FIND, ADD], [CALL_FIND, CALL_REPLACE]]) {
  const hits = text.split(find).length - 1;
  if (hits !== 1) {
    console.log(`FAIL — expected 1 match, found ${hits}: ${JSON.stringify(find.slice(0, 70))}`);
    ok = false;
    continue;
  }
  text = text.replace(find, replace);
}

if (!ok) {
  console.log(`\n${FILE} NOT written.`);
} else {
  await writeFile(FILE, text, 'utf8');
  console.log(`FIXED ${FILE} — chapterNav() and pageContents() added, wired into init()`);
}
