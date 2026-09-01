// w926-gallery-blog.mjs — single-use patch. Run once, then delete it.
//
//   node tools/w926-gallery-blog.mjs
//
// APPENDS two blocks:
//   assets/fye-ui.js     Past Pieces gallery behaviour — masonry, per-card
//                        media carousels, category filters, load more.
//   assets/fye-core.css  the shared article-card vocabulary (.acard, .agrid),
//                        rendered by sections/main-blog AND sections/main-article
//                        via snippets/article-card.liquid. Two consumers, so it
//                        earns its place in core.
//
// Both target files are past the size a session can read back whole, so they
// are APPENDED to and never rewritten — rewriting from memory is how
// hand-applied fixes get reverted.
//
// Idempotent. Each block is guarded on the THING it introduces (a data
// attribute in the JS, a selector in the CSS), never on a comment that
// mentions it: a guard that greps for words about the change trips over the
// file's own prose and skips a patch that never actually ran.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const JS_PATH = resolve(root, 'assets/fye-ui.js');
const CSS_PATH = resolve(root, 'assets/fye-core.css');

// The guards: markup hooks and a selector that exist ONLY in the new blocks.
const JS_GUARD = 'data-fye-gallery-grid';
const CSS_GUARD = '.fye .acard {';

const JS_BLOCK = `

/* ============================================================================
   PAST PIECES GALLERY — appended 01/09/2026
   sections/past-pieces-gallery.liquid

   Four jobs: masonry layout, one media carousel per card, category filters
   with live counts, and load more.

   MASONRY. The grid's CSS default is an even three-column grid, which is what
   a visitor without JavaScript sees and is perfectly readable. This adds
   .is-masonry, which switches the rows to 1px tracks, and then gives each
   card a grid-row span matching its measured height. Cards keep their natural
   heights and stagger, and — unlike CSS columns, which balance by height —
   they still fill left to right in DOM order, which is what "newest first"
   requires.

   Everything is delegated from document, so a section re-render in the theme
   editor needs no re-binding.
   ========================================================================== */
(function () {
  function grids(scope) {
    return Array.prototype.slice.call(
      (scope || document).querySelectorAll('[data-fye-gallery-grid]')
    );
  }

  function gutter(grid) {
    var g = parseFloat(getComputedStyle(grid).columnGap);
    return isNaN(g) ? 32 : g;
  }

  function layout(grid) {
    if (!grid.classList.contains('is-masonry')) return;
    var g = gutter(grid);
    grid.querySelectorAll('.ppg__card').forEach(function (card) {
      card.style.gridRowEnd = '';
      if (card.classList.contains('is-capped') || card.style.display === 'none') return;
      var h = card.getBoundingClientRect().height;
      if (h > 0) card.style.gridRowEnd = 'span ' + Math.ceil(h + g);
    });
  }

  function relayoutAll() {
    grids().forEach(layout);
  }

  // Counts are filled in from the DOM rather than Liquid, so they cannot
  // disagree with what is actually on the page.
  function tally(root) {
    var grid = root.querySelector('[data-fye-gallery-grid]');
    if (!grid) return;
    var total = grid.querySelectorAll('[data-cat]').length;
    root.querySelectorAll('[data-fye-gallery-filter]').forEach(function (btn) {
      var f = btn.getAttribute('data-fye-gallery-filter');
      var n = f === 'all'
        ? total
        : grid.querySelectorAll('[data-cat="' + f + '"]').length;
      var slot = btn.querySelector('[data-fye-gallery-tally]');
      if (slot) slot.textContent = n;
    });
  }

  function uncap(root) {
    root.querySelectorAll('.ppg__card.is-capped').forEach(function (card) {
      card.classList.remove('is-capped');
    });
    var wrap = root.querySelector('[data-fye-gallery-more-wrap]');
    if (wrap) wrap.style.display = 'none';
  }

  function filter(root, value) {
    var grid = root.querySelector('[data-fye-gallery-grid]');
    if (!grid) return;
    // Reveal the capped cards first, or a filtered count would be a promise
    // the grid does not keep.
    uncap(root);
    root.querySelectorAll('[data-fye-gallery-filter]').forEach(function (btn) {
      btn.classList.toggle('is-on', btn.getAttribute('data-fye-gallery-filter') === value);
    });
    grid.querySelectorAll('[data-cat]').forEach(function (card) {
      var show = value === 'all' || card.getAttribute('data-cat') === value;
      card.style.display = show ? '' : 'none';
    });
    layout(grid);
  }

  function step(car, dir) {
    var track = car.querySelector('[data-fye-car-track]');
    if (!track) return;
    var n = track.children.length;
    if (n < 2) return;
    var i = (parseInt(car.getAttribute('data-fye-car-i') || '0', 10) + dir + n) % n;
    car.setAttribute('data-fye-car-i', i);
    track.style.transform = 'translateX(' + (-100 * i) + '%)';
    var count = car.querySelector('[data-fye-car-count]');
    if (count) count.textContent = (i + 1) + ' / ' + n;
    var card = car.parentElement;
    if (card) {
      card.querySelectorAll('.ppg__dash').forEach(function (dash, j) {
        dash.classList.toggle('is-on', j === i);
      });
    }
    // A video on a slide that has scrolled away keeps playing otherwise.
    track.querySelectorAll('video').forEach(function (v) { v.pause(); });
  }

  document.addEventListener('click', function (e) {
    if (!e.target || !e.target.closest) return;

    var prev = e.target.closest('[data-fye-car-prev]');
    if (prev) {
      step(prev.closest('[data-fye-car]'), -1);
      return;
    }
    var next = e.target.closest('[data-fye-car-next]');
    if (next) {
      step(next.closest('[data-fye-car]'), 1);
      return;
    }
    var btn = e.target.closest('[data-fye-gallery-filter]');
    if (btn) {
      filter(btn.closest('[data-fye-gallery]'), btn.getAttribute('data-fye-gallery-filter'));
      return;
    }
    var more = e.target.closest('[data-fye-gallery-more]');
    if (more) {
      var root = more.closest('[data-fye-gallery]');
      uncap(root);
      layout(root.querySelector('[data-fye-gallery-grid]'));
    }
  });

  /* Touch swipe. Horizontal drags only, so vertical page scrolling is
     untouched, and never when the drag starts on a video — those controls need
     the gesture. Passive listeners: preventDefault is never called. */
  var sx = 0, sy = 0, swiping = null;
  document.addEventListener('touchstart', function (e) {
    swiping = null;
    if (e.touches.length !== 1 || !e.target || !e.target.closest) return;
    if (e.target.closest('video')) return;
    var car = e.target.closest('[data-fye-car]');
    if (!car) return;
    sx = e.touches[0].clientX;
    sy = e.touches[0].clientY;
    swiping = car;
  }, { passive: true });

  document.addEventListener('touchend', function (e) {
    if (!swiping) return;
    var car = swiping;
    swiping = null;
    var dx = e.changedTouches[0].clientX - sx;
    var dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) < 40 || Math.abs(dx) <= Math.abs(dy)) return; // a scroll
    step(car, dx < 0 ? 1 : -1);
  }, { passive: true });

  function init(scope) {
    grids(scope).forEach(function (grid) {
      if (grid.getAttribute('data-fye-ready')) return;
      grid.setAttribute('data-fye-ready', '1');
      grid.classList.add('is-masonry');

      var root = grid.closest('[data-fye-gallery]');
      if (root) tally(root);
      layout(grid);

      // Images and videos arrive after first paint and change card heights.
      grid.querySelectorAll('img').forEach(function (im) {
        if (!im.complete) {
          im.addEventListener('load', function () { layout(grid); }, { once: true });
        }
      });
      if (window.ResizeObserver) {
        var ro = new ResizeObserver(function () {
          window.requestAnimationFrame(function () { layout(grid); });
        });
        grid.querySelectorAll('.ppg__card').forEach(function (c) { ro.observe(c); });
      }
    });
  }

  var t;
  window.addEventListener('resize', function () {
    clearTimeout(t);
    t = setTimeout(relayoutAll, 120);
  });

  init();
  document.addEventListener('shopify:section:load', function (e) { init(e.target); });
})();
`;

const CSS_BLOCK = `

/* ============================================================================
   ARTICLE CARD — appended 01/09/2026
   snippets/article-card.liquid

   In core because TWO sections render the snippet: main-blog's listing grid
   and main-article's closing "latest news" row. latest-news-EM does NOT use
   it — that band's lead-plus-three geometry was measured against live and
   shares nothing with this beyond the idea of an article.

   The card is the product card's sibling: squared 4:3 photograph, a small
   uppercase date, an Outfit title, an excerpt. No border and no shadow — the
   image edge and the grid gap do the separating, exactly as .pcard does.
   ========================================================================== */

.fye .acard { display: flex; flex-direction: column; gap: var(--s4); }

.fye .acard__media {
  display: block;
  overflow: hidden;
  background: var(--ivory);      /* shows through transparent ring PNGs */
}
.fye .acard__media :where(img) {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  transition: transform var(--dur) var(--ease);
}
.fye .acard:hover .acard__media :where(img) { transform: scale(1.03); }
.fye .acard__ph {
  display: block;
  aspect-ratio: 4 / 3;
  background: var(--ivory);
  border: var(--hairline);
}

.fye .acard__words {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--s2);
}
.fye .acard__date {
  margin: 0;
  font-size: var(--fs-eyebrow);
  font-weight: var(--fw-medium);
  letter-spacing: var(--tr-eyebrow);
  text-transform: uppercase;
  color: var(--ink-soft);
}
/* Outfit, sentence case, 15px: a card title is a label on a tile, not a
   heading in the page's voice. The element is still an h2/h3 — the outline is
   correct, only the treatment is quiet. */
.fye .acard__title {
  margin: 0;
  font-family: var(--font-body);
  font-size: var(--fs-small);
  font-weight: var(--fw-regular);
  line-height: 1.4;
  letter-spacing: 0.01em;
  text-transform: none;
}
.fye .acard__title a { color: var(--ink); }
.fye .acard__title a:hover { color: var(--sage); }
.fye .acard__excerpt {
  margin: 0;
  font-size: var(--fs-small);
  line-height: 1.55;
  color: var(--ink-soft);
}
.fye .acard__more { margin-top: var(--s1); }

/* The grid article cards sit in. Sections set --cols / --cols-mb inline,
   because the column count is a Liquid-computed value CSS cannot know. */
.fye .agrid {
  display: grid;
  grid-template-columns: repeat(var(--cols, 4), minmax(0, 1fr));
  gap: var(--s9) var(--grid-gap);
  list-style: none;
  margin: 0;
  padding: 0;
}
.fye .agrid > li { margin: 0; }

@media (max-width: 900px) {
  .fye .agrid { grid-template-columns: repeat(var(--cols-mb, 2), minmax(0, 1fr)); }
}
@media (max-width: 560px) {
  .fye .agrid { grid-template-columns: 1fr; gap: var(--s8); }
}
@media (prefers-reduced-motion: reduce) {
  .fye .acard:hover .acard__media :where(img) { transform: none; }
}
`;

function append(path, guard, block, label) {
  if (!existsSync(path)) {
    console.error('MISSING: ' + path);
    process.exit(1);
  }
  const before = readFileSync(path, 'utf8');

  if (before.includes(guard)) {
    console.log('skip  ' + label + ' — already present (found guard: ' + guard + ')');
    return 0;
  }

  const after = before + block;
  if (after.length <= before.length) {
    console.error('REFUSING: ' + label + ' would not grow the file');
    process.exit(1);
  }

  writeFileSync(path, after, 'utf8');

  const check = readFileSync(path, 'utf8');
  if (!check.includes(guard) || check.length !== after.length) {
    console.error('FAILED to verify write: ' + label);
    process.exit(1);
  }
  console.log(
    'ok    ' + label + '  ' + before.length + ' -> ' + check.length +
    ' bytes (+' + (check.length - before.length) + ')'
  );
  return 1;
}

let changed = 0;
changed += append(JS_PATH, JS_GUARD, JS_BLOCK, 'assets/fye-ui.js (gallery behaviour)');
changed += append(CSS_PATH, CSS_GUARD, CSS_BLOCK, 'assets/fye-core.css (article card)');

console.log(changed === 0 ? '\nNothing to do — both blocks were already in place.' : '\nDone. ' + changed + ' file(s) changed.');
