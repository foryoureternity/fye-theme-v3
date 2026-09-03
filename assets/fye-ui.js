/* ============================================================================
   fye-ui.js — FYE v3 interaction layer
   ----------------------------------------------------------------------------
   Vanilla, no dependencies, no jQuery. Replaces the old theme's 535KB T4S core.

   Click and keydown are delegated from document, so markup added later — a
   section re-render in the theme editor, an AJAX load — works without
   re-binding. Anything that needs a TIMER cannot be delegated, so those are
   initialised per section by init() below, which also runs on Shopify's
   section:load / section:unload events.

   Add behaviours as small named functions; keep this file small enough to read.
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---- Drawers ----------------------------------------------------------
     Drawers are NAMED, because there is more than one on a page:

       opener:  <button data-fye-drawer-open="x" aria-controls="x">
       drawer:  <div data-fye-drawer="x">
       closer:  <button data-fye-drawer-close>   (closes the one it sits in)

     The name is matched exactly, so the original valueless pair (both empty)
     still finds each other and the header's mobile nav keeps working.
     -------------------------------------------------------------------- */

  function findByAttr(selector, attr, name) {
    var all = document.querySelectorAll(selector);
    var wanted = name || '';
    for (var i = 0; i < all.length; i++) {
      if ((all[i].getAttribute(attr) || '') === wanted) return all[i];
    }
    return null;
  }

  function findDrawer(name) { return findByAttr('[data-fye-drawer]', 'data-fye-drawer', name); }
  function opener(name) { return findByAttr('[data-fye-drawer-open]', 'data-fye-drawer-open', name); }

  function openDrawer(el) {
    if (!el) return;
    el.classList.add('is-open');
    document.documentElement.style.overflow = 'hidden';
    var btn = opener(el.getAttribute('data-fye-drawer') || '');
    if (btn) btn.setAttribute('aria-expanded', 'true');
    var focusable = el.querySelector('a, button, input, select');
    if (focusable) focusable.focus();
  }

  function closeDrawer(el) {
    if (!el) return;
    el.classList.remove('is-open');
    /* Only release the scroll lock once nothing is left open. */
    if (!document.querySelector('[data-fye-drawer].is-open')) {
      document.documentElement.style.overflow = '';
    }
    var btn = opener(el.getAttribute('data-fye-drawer') || '');
    if (btn) {
      btn.setAttribute('aria-expanded', 'false');
      btn.focus();
    }
  }

  /* ---- Rotators ---------------------------------------------------------
     A horizontally scrolling track that advances a page at a time. Used by
     fye-testimonials; anything else with the same shape can reuse it.

     The track is a real scroll container with scroll-snap, so it works with no
     JS at all (swipe on touch, shift-scroll on desktop) — the JS only adds
     the arrows' behaviour and the timer. Markup contract:

       <div data-fye-rotate            <- interval in seconds, or "" for manual
            data-fye-rotate-track>     <- the scrolling element
         ... items ...
       <button data-fye-rotate-prev>   <- anywhere inside the rotator
       <button data-fye-rotate-next>

     Rules it follows, so it stays a content rotator and not an annoyance:
       - pauses on hover, on keyboard focus inside it, and when the tab is
         hidden (a timer firing in a background tab wastes battery and lands
         the reader somewhere unexpected on return);
       - stops for good once the reader uses an arrow — they have taken over;
       - never autoplays under prefers-reduced-motion, and jumps rather than
         animates when it does move;
       - wraps to the start instead of dead-ending.
     -------------------------------------------------------------------- */

  var rotators = [];

  function pageWidth(track) {
    /* Scroll by a whole visible page, so a 3-up desktop advances by three. */
    return track.clientWidth;
  }

  function atEnd(track) {
    return track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
  }

  function step(track, dir) {
    var behavior = reduceMotion.matches ? 'auto' : 'smooth';
    if (dir > 0 && atEnd(track)) {
      track.scrollTo({ left: 0, behavior: behavior });
      return;
    }
    if (dir < 0 && track.scrollLeft <= 2) {
      track.scrollTo({ left: track.scrollWidth, behavior: behavior });
      return;
    }
    track.scrollBy({ left: dir * pageWidth(track), behavior: behavior });
  }

  function initRotator(root) {
    var track = root.querySelector('[data-fye-rotate-track]');
    if (!track) return;

    var seconds = parseFloat(root.getAttribute('data-fye-rotate'));
    var rot = { root: root, track: track, timer: null, stopped: false };

    rot.tick = function () {
      if (rot.stopped || document.hidden) return;
      step(track, 1);
    };

    rot.start = function () {
      if (rot.stopped || rot.timer || !seconds || reduceMotion.matches) return;
      rot.timer = setInterval(rot.tick, seconds * 1000);
    };

    rot.pause = function () {
      if (!rot.timer) return;
      clearInterval(rot.timer);
      rot.timer = null;
    };

    rot.stop = function () {
      rot.stopped = true;
      rot.pause();
    };

    root.addEventListener('mouseenter', rot.pause);
    root.addEventListener('mouseleave', rot.start);
    root.addEventListener('focusin', rot.pause);
    root.addEventListener('focusout', rot.start);

    rotators.push(rot);
    rot.start();
  }

  function initRotators(scope) {
    var roots = (scope || document).querySelectorAll('[data-fye-rotate]');
    for (var i = 0; i < roots.length; i++) initRotator(roots[i]);
  }

  function teardownRotators(scope) {
    rotators = rotators.filter(function (rot) {
      if (scope && !scope.contains(rot.root)) return true;
      rot.pause();
      return false;
    });
  }

  document.addEventListener('visibilitychange', function () {
    rotators.forEach(function (rot) {
      if (document.hidden) rot.pause();
      else rot.start();
    });
  });

  /* ---- Delegated clicks ------------------------------------------------- */

  document.addEventListener('click', function (e) {
    var hit = e.target.closest('[data-fye-drawer-open]');
    if (hit) {
      e.preventDefault();
      openDrawer(findDrawer(hit.getAttribute('data-fye-drawer-open')));
      return;
    }

    hit = e.target.closest('[data-fye-drawer-close]');
    if (hit) {
      e.preventDefault();
      closeDrawer(hit.closest('[data-fye-drawer]') || findDrawer(''));
      return;
    }

    /* Click the scrim (the drawer element itself, not its panel) to dismiss. */
    if (e.target.matches('[data-fye-drawer]')) {
      closeDrawer(e.target);
      return;
    }

    /* ---- Rotator arrows ------------------------------------------------- */
    hit = e.target.closest('[data-fye-rotate-prev], [data-fye-rotate-next]');
    if (hit) {
      e.preventDefault();
      var root = hit.closest('[data-fye-rotate]');
      if (root) {
        var track = root.querySelector('[data-fye-rotate-track]');
        if (track) step(track, hit.hasAttribute('data-fye-rotate-next') ? 1 : -1);
        /* The reader has taken over; the timer does not fight them. */
        rotators.forEach(function (rot) { if (rot.root === root) rot.stop(); });
      }
      return;
    }

    /* ---- Back to top ---------------------------------------------------- */
    if (e.target.closest('[data-fye-top]')) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      return;
    }

    /* ---- Generic disclosure --------------------------------------------- */
    var toggle = e.target.closest('[data-fye-toggle]');
    if (toggle) {
      e.preventDefault();
      var target = document.getElementById(toggle.getAttribute('data-fye-toggle'));
      if (target) {
        var isOpen = target.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      }
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var open = document.querySelectorAll('[data-fye-drawer].is-open');
    for (var i = 0; i < open.length; i++) closeDrawer(open[i]);
  });

  /* ---- Chapter navigation ----------------------------------------------
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

  /* ---- Init ------------------------------------------------------------- */

  function init(scope) {
    initRotators(scope);
    chapterNav();
    pageContents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { init(); });
  } else {
    init();
  }

  /* Theme editor: a re-rendered section brings new markup and loses its timer. */
  document.addEventListener('shopify:section:load', function (e) {
    teardownRotators(e.target);
    init(e.target);
  });
  document.addEventListener('shopify:section:unload', function (e) {
    teardownRotators(e.target);
  });
})();


/* ============================================================================
   FOOTER ACCORDIONS — 28/08/2026
   The footer's link columns are <details open>, so with no JavaScript every
   section is expanded: the pre-accordion behaviour, and a safe failure. This
   only sets the DEFAULT state for the breakpoint — closed below 769px, open
   above — and it never fights a reader who has opened something: once any
   summary in the footer has been clicked, the automatic sync stops for that
   page view.
   ========================================================================== */
(function footerAccordions() {
  var mq = window.matchMedia('(max-width: 768px)');
  var touched = false;

  function panels() {
    return Array.prototype.slice.call(document.querySelectorAll('.ftr__acc'));
  }

  function sync() {
    if (touched) return;
    var mobile = mq.matches;
    panels().forEach(function (el) {
      if (mobile) el.removeAttribute('open');
      else el.setAttribute('open', '');
    });
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('.ftr__acc > summary')) touched = true;
  });

  if (mq.addEventListener) mq.addEventListener('change', sync);
  else if (mq.addListener) mq.addListener(sync);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', sync);
  } else {
    sync();
  }
})();


/* ============================================================================
   COLLECTION SORT — 31/08/2026
   The sort control on main-collection is a real <select>. It NAVIGATES rather
   than submitting a form, and that is the whole reason this exists:

   the collection page's filters are injected by xCloud, which keeps its active
   filters in the query string. A <form method="get"> serialises only its own
   fields, so submitting one would silently drop every active filter and hand
   the shopper an unfiltered grid. Rewriting the current URL keeps whatever is
   already there — xCloud's parameters, campaign tags, anything — and changes
   one key.

   `page` is dropped deliberately: page 4 of the old sort is not page 4 of the
   new one, and landing on an empty page looks like a broken filter.

   No JS ⇒ the select still renders and still reads as the current sort; it
   just does not act. That is a degraded control, not a broken page. If this
   ever needs to work without JS, the fallback is a submit button beside it,
   not a second copy of the markup.
   ========================================================================== */
(function collectionSort() {
  document.addEventListener('change', function (e) {
    var select = e.target.closest ? e.target.closest('[data-fye-sort]') : null;
    if (!select) return;

    var url;
    try {
      url = new URL(window.location.href);
    } catch (err) {
      return;
    }

    url.searchParams.set('sort_by', select.value);
    url.searchParams.delete('page');
    window.location.assign(url.toString());
  });
})();


/* ============================================================================
   FILTER ICONS — 31/08/2026
   Metal swatches and ring-profile shapes in the xCloud filter rail.

   xCloud renders the rail at runtime and re-renders it on every filter change,
   so the icons cannot be put there from Liquid. snippets/fye-filter-icons
   supplies a <template> of icons keyed by data-fic; this clones from it into
   any filter value whose data-filter-value matches, and keeps doing so as the
   app redraws.

   Ported from live, where it was an inline <script> in a custom-liquid block.
   Two things changed:
     · it clones DOM nodes instead of assigning innerHTML from a JSON-escaped
       SVG string — the escaping in live's version was four backslashes deep
       and one bad edit from silently emitting nothing;
     · it does nothing at all when the template is absent, so it costs a page
       without filters one querySelector.

   The observer is debounced because xCloud rewrites the whole rail on each
   change; without it this runs dozens of times per interaction. 60ms is live's
   figure and it is imperceptible.
   ========================================================================== */
(function filterIcons() {
  var tpl = document.querySelector('[data-fye-filter-icons]');
  if (!tpl) return;

  /* Build the lookup once. Cloning from this map is what keeps the SVG out of
     a string literal. */
  var icons = {};
  Array.prototype.forEach.call(tpl.content.querySelectorAll('[data-fic]'), function (el) {
    icons[el.getAttribute('data-fic')] = el.firstElementChild;
  });

  function inject() {
    var values = document.querySelectorAll('.cloud-search-filter-value[data-filter-value]');
    Array.prototype.forEach.call(values, function (row) {
      if (row.querySelector('.fic')) return;

      var icon = icons[row.getAttribute('data-filter-value')];
      if (!icon) return;

      /* The label is the anchor: the icon goes immediately before it, inside
         the row, so it sits after the checkbox rather than before it. */
      var name = row.querySelector('.cloud-search-filter-value__name');
      if (!name) return;

      var wrap = document.createElement('span');
      wrap.className = 'fic-wrap';
      wrap.setAttribute('aria-hidden', 'true');
      wrap.appendChild(icon.cloneNode(true));
      name.parentNode.insertBefore(wrap, name);
    });
  }

  function boot() {
    inject();

    var pending;
    var observer = new MutationObserver(function () {
      clearTimeout(pending);
      pending = setTimeout(inject, 60);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();



/* ============================================================================
   PRODUCT GALLERY, ENGRAVING, STONE CHOOSERS AND CART — 31/08/2026
   ----------------------------------------------------------------------------
   Five behaviours, one block, because they all read and write the same buy box
   and the PRICE has to be computed in one place. Splitting them into separate
   IIFEs would mean either duplicating the price maths or inventing a shared
   global, and the first version of this file already proved that the moment
   two things compute a price they disagree.

   1. GALLERY. Thumbnails switch stage panels. The 360 panel loads Sirv's
      script the first time it is opened and never again — live loads it on
      every product page and then fights Flickity to re-measure a canvas that
      was hidden at init. No carousel here, so no fight.

   2. ENGRAVING. A Yes/No toggle revealing a 35-character input and a font
      select. The inputs are DISABLED until Yes, which is what keeps their
      line-item properties out of the form post — a disabled field is not
      submitted, so "No" cannot leave an empty Engraving property on the order.

   3. STONE CHOOSERS. The centre-diamond and side-diamond panels. Mode tiles,
      the picker modal, and the chosen stone.

   4. PRICE AND THE ADD BUTTON. One render() computes
         ring variant  (+10% if oversize)  + engraving + centre + sides
      and one requirement() decides whether the button can be pressed at all.

   5. ADD TO CART. Up to five lines through one /cart/add.js call.

   ── STATE LIVES IN THE DOM ────────────────────────────────────────────────

   Deliberately. `data-mode` on each chooser, `data-stone` for the chosen
   diamond, `.is-on` for the chosen chip. No state object, so a section
   re-render in the theme editor cannot leave this block pointing at elements
   that no longer exist, and every handler can stay delegated from document.

   ── NOTHING IS SELECTED BY DEFAULT ────────────────────────────────────────

   Ed, 31/08/2026. So the button is BLOCKED until every rendered chooser has a
   mode, plus a stone where the mode needs one and a ticked waiver where the
   mode needs one. requirement() below is the single place that decides; its
   message is what the button says, so the shopper is never staring at a dead
   control with no explanation.

   With JavaScript off, the form posts the ring alone at the variant price —
   no add-ons, no fee lines. That is a degraded page, not a wrong order: every
   add-on is a separate line that simply never gets added.
   ========================================================================== */
(function productPage() {
  var SIRV = 'https://scripts.sirv.com/sirvjs/v3/sirv.js';

  /* Feed paging and carat-window limits. Both are live's, and both exist
     because of hard Shopify behaviour rather than taste — see the comments at
     caratParams() and fetchOrigin(). */
  var CARAT_STEP_CAP = 150;
  var FEED_PAGE_CAP = 10;
  var REVEAL_SIZE = 30;

  var COLOURS = ['D', 'E', 'F', 'G', 'H', 'I', 'J'];
  var CLARITIES = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2'];

  function money(pennies) {
    return '£' + (pennies / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function shortMoney(pennies) {
    return '£' + Math.round((Number(pennies) || 0) / 100).toLocaleString('en-GB');
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  /* ---- gallery ---------------------------------------------------------- */

  function loadSirv() {
    if (window.__fyeSirvLoaded) {
      if (window.Sirv && window.Sirv.start) window.Sirv.start();
      return;
    }
    window.__fyeSirvLoaded = true;

    var s = document.createElement('script');
    s.src = SIRV;
    s.async = true;
    document.head.appendChild(s);
  }

  function showPanel(gallery, key) {
    gallery.querySelectorAll('[data-fye-panel]').forEach(function (panel) {
      var on = panel.getAttribute('data-fye-panel') === key;
      panel.classList.toggle('is-on', on);
      if (on && panel.querySelector('[data-fye-spin]')) loadSirv();
    });

    gallery.querySelectorAll('[data-fye-thumb]').forEach(function (thumb) {
      thumb.classList.toggle('is-on', thumb.getAttribute('data-fye-thumb') === key);
    });
  }

  /* ---- variants --------------------------------------------------------- */

  function variantsOf(form) {
    var island = form.querySelector('[data-fye-variants]');
    if (!island) return null;
    try {
      return JSON.parse(island.textContent);
    } catch (e) {
      return null;
    }
  }

  function chosenVariant(form) {
    var variants = variantsOf(form);
    if (!variants) return null;

    var title = Array.prototype.map
      .call(form.querySelectorAll('[data-fye-option]'), function (sel) { return sel.value; })
      .join(' / ');

    var match = null;
    variants.forEach(function (v) { if (v.title === title) match = v; });
    return match;
  }

  function engraveFee(form) {
    var block = form.querySelector('[data-fye-engrave]');
    if (!block || block.getAttribute('data-on') !== 'yes') return 0;
    return parseInt(block.getAttribute('data-fee-price'), 10) || 0;
  }

  /* ---- choosers: reading state -----------------------------------------
     Every question below is answered off the DOM, so there is one source of
     truth and no object to keep in step. */

  function centreOf(form) { return form.querySelector('[data-fye-centre]'); }
  function sidesOf(form) { return form.querySelector('[data-fye-sides]'); }

  function modeOf(panel) {
    return panel ? (panel.getAttribute('data-mode') || '') : '';
  }

  function feePrice(panel) {
    return panel ? (parseInt(panel.getAttribute('data-fee-price'), 10) || 0) : 0;
  }

  function feeVariant(panel) {
    return panel ? (panel.getAttribute('data-fee-variant') || '').trim() : '';
  }

  function stoneOf(panel) {
    if (!panel) return null;
    var raw = panel.getAttribute('data-stone');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function chosenChip(panel) {
    return panel ? panel.querySelector('[data-fye-side-qual].is-on') : null;
  }

  function waiverOf(panel, kind) {
    return panel ? panel.querySelector('[data-fye-' + kind + '-waiver]') : null;
  }

  /* What each chooser adds to the price. Required mode charges for the stone
     itself; supplied mode charges the setting fee; none charges nothing. */
  function centreAddOn(form) {
    var panel = centreOf(form);
    var mode = modeOf(panel);
    if (mode === 'supplied') return feePrice(panel);
    if (mode !== 'required') return 0;
    var stone = stoneOf(panel);
    return stone ? (Number(stone.price) || 0) : 0;
  }

  function sidesAddOn(form) {
    var panel = sidesOf(form);
    var mode = modeOf(panel);
    if (mode === 'supplied') return feePrice(panel);
    if (mode !== 'required') return 0;
    var chip = chosenChip(panel);
    return chip ? (parseInt(chip.getAttribute('data-fye-side-price'), 10) || 0) : 0;
  }

  /* ---- choosers: setting a mode ----------------------------------------
     Shows the matching body, hides the others, and — the part that actually
     matters for the order — enables exactly the hidden inputs that belong to
     the chosen mode. A disabled field is not submitted, which is how a mode
     nobody picked leaves no trace on the order. */

  function setMode(panel, kind, mode) {
    panel.setAttribute('data-mode', mode);

    panel.querySelectorAll('[data-fye-' + kind + '-mode]').forEach(function (tile) {
      var on = tile.getAttribute('data-fye-' + kind + '-mode') === mode;
      tile.classList.toggle('is-on', on);
      tile.setAttribute('aria-checked', on ? 'true' : 'false');
    });

    panel.querySelectorAll('[data-fye-' + kind + '-body]').forEach(function (body) {
      body.hidden = body.getAttribute('data-fye-' + kind + '-body') !== mode;
    });

    /* The property that rides on the RING line. On "required" it is disabled,
       because the stone travels as its own cart line and a property saying the
       same thing twice is a contradiction waiting to happen. */
    var prop = panel.querySelector('[data-fye-' + kind + '-prop]');
    if (prop) {
      if (mode === 'supplied') {
        prop.value = kind === 'centre' ? "Customer's own diamond" : 'Supplied by customer';
        prop.disabled = false;
      } else if (mode === 'none') {
        prop.value = kind === 'centre' ? 'Semi-mount only' : 'Mount only';
        prop.disabled = false;
      } else {
        prop.value = '';
        prop.disabled = true;
      }
    }

    var service = panel.querySelector('[data-fye-' + kind + '-service]');
    if (service) service.disabled = mode !== 'supplied';

    var waiver = waiverOf(panel, kind);
    if (waiver) {
      waiver.disabled = mode !== 'supplied';
      if (mode !== 'supplied') waiver.checked = false;
    }

    /* Leaving "required" does not throw the chosen stone away — coming back to
       it should find the stone still there rather than making the shopper pick
       again. It is only ever cleared by choosing another one. */
    if (kind === 'centre' && mode === 'required') ensureStones(panel);
  }

  /* ---- choosers: the chosen stone summary ------------------------------ */

  function paintStone(panel) {
    var wrap = panel.querySelector('[data-fye-stone]');
    var btn = panel.querySelector('[data-fye-picker-open]');
    var stone = stoneOf(panel);
    if (!wrap) return;

    if (!stone) {
      wrap.hidden = true;
      wrap.innerHTML = '';
      if (btn) btn.textContent = btn.getAttribute('data-label-choose') || btn.textContent;
      return;
    }

    wrap.hidden = false;
    wrap.innerHTML =
      (stone.image
        ? '<img class="pdp__stoneimg" src="' + esc(stone.image) + '" alt="" loading="lazy" width="64" height="64">'
        : '<span class="pdp__stoneimg"></span>') +
      '<span>' +
        '<span class="pdp__stonename">' + esc(stoneTitle(stone)) + '</span><br>' +
        '<span class="pdp__stonesub">' + esc(stoneSub(stone)) + '</span>' +
      '</span>' +
      '<span class="pdp__stoneprice">' + money(Number(stone.price) || 0) + '</span>';
  }

  function stoneTitle(d) {
    return [d.shape, (d.carat ? d.carat + 'ct' : ''), d.colour, d.clarity]
      .filter(Boolean).join(' ');
  }

  function stoneSub(d) {
    var bits = [];
    if (d.origin) bits.push(d.origin);
    if (d.certLab) bits.push(d.certLab + ' certified');
    return bits.join(' · ');
  }

  /* ---- the feed --------------------------------------------------------
     One request per origin, both fired on the first open so the Natural /
     Lab-grown toggle inside the modal needs no further network. Live's W029.

     THE CARAT WINDOW IS NOT A RANGE QUERY. This store's metafield filters have
     no range operator (.gte/.lte are price-only) and they silently ignore
     trailing zeros — carat=0.30 returns nothing, carat=0.3 works. Repeated
     params DO OR correctly, so the window travels as one param per 0.01ct
     step. Past CARAT_STEP_CAP steps the URL stops being reasonable, so a wide
     window skips the filter and relies on the page cap plus the client-side
     check instead.

     NO Accept HEADER. Shopify content-negotiates /collections/... and returns
     the collection OBJECT json — ignoring ?view= — the moment one is sent. */

  function trimCarat(n) {
    return String(Math.round(n * 100) / 100)
      .replace(/^(-?\d+\.\d*?)0+$/, '$1')
      .replace(/\.$/, '');
  }

  function caratParams(panel) {
    var lo = parseFloat(panel.getAttribute('data-carat-min'));
    var hi = parseFloat(panel.getAttribute('data-carat-max'));
    if (!(hi >= lo)) return '';
    var steps = Math.round((hi - lo) * 100) + 1;
    if (steps <= 0 || steps > CARAT_STEP_CAP) return '';
    var out = '';
    for (var i = 0; i < steps; i++) {
      out += '&filter.p.m.fye.carat=' + encodeURIComponent(trimCarat(lo + i / 100));
    }
    return out;
  }

  function fetchOrigin(panel, handle, page, acc) {
    page = page || 1;
    acc = acc || [];
    var url = '/collections/' + handle + '?view=cdc-json' + caratParams(panel) + '&page=' + page;

    return fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error('feed ' + r.status);
        return r.json();
      })
      .then(function (data) {
        acc = acc.concat(data.diamonds || []);
        if (data.page < data.pages && page < FEED_PAGE_CAP) {
          return fetchOrigin(panel, handle, page + 1, acc);
        }
        return acc;
      });
  }

  function caratOk(panel, d) {
    var lo = parseFloat(panel.getAttribute('data-carat-min'));
    var hi = parseFloat(panel.getAttribute('data-carat-max'));
    if (isNaN(lo) || isNaN(hi)) return true;
    var n = Number(d.carat);
    return n >= lo && n <= hi;
  }

  /* Fancy colour feeds are MIXED-SHAPE — fancy-yellow-natural-diamonds holds
     every cut, where round-natural-diamonds holds one. So a fancy ring asks
     for its own shape and nothing else.

     Gated on the panel's flag rather than applied always: on a shape
     collection this is a no-op, and a no-op that could empty the picker if
     fye.shape and fye.centre_shape ever drifted apart is not worth having.
     Verified 01/09/2026 that both use the same words ("Radiant", "Oval"). */
  function shapeOk(panel, d) {
    if (panel.getAttribute('data-shape-filter') !== '1') return true;
    var want = String(panel.getAttribute('data-shape') || '').trim().toLowerCase();
    if (!want) return true;
    return String(d.shape || '').trim().toLowerCase() === want;
  }

  function ensureStones(panel) {
    if (panel.__fyeStones || panel.__fyeLoading) return;
    panel.__fyeLoading = true;

    var natural = panel.getAttribute('data-feed-natural');
    var lab = panel.getAttribute('data-feed-lab');
    var state = panel.querySelector('[data-fye-stone-state]');

    Promise.all([
      fetchOrigin(panel, natural).catch(function () { return []; }),
      fetchOrigin(panel, lab).catch(function () { return []; })
    ]).then(function (both) {
      var all = both[0].concat(both[1]).filter(function (d) {
        return d && d.variantId && d.available !== false && caratOk(panel, d) && shapeOk(panel, d);
      });

      panel.__fyeStones = all;
      panel.__fyeLoading = false;

      var btn = panel.querySelector('[data-fye-picker-open]');
      var help = panel.querySelector('[data-fye-stone-help]');

      if (!all.length) {
        /* An empty feed is not a broken page: the enquiry route is the answer,
           and the button stays hidden rather than opening onto nothing. */
        if (state) state.textContent = 'We have no matching stones in stock at the moment.';
        if (help) help.hidden = false;
        var emptyResults = panel.querySelector('[data-fye-picker-results]');
        if (panel.querySelector('[data-fye-picker]:not([hidden])') && emptyResults) {
          emptyResults.innerHTML = '<p class="pdp__stoneempty">We have no matching stones in stock ' +
            'at the moment. <a href="/pages/contact-us">Ask us to source one</a>.</p>';
        }
        return;
      }

      if (state) {
        state.textContent = all.length === 1
          ? '1 diamond suits this setting.'
          : all.length + ' diamonds suit this setting.';
      }
      if (btn) btn.hidden = false;
      if (help) help.hidden = false;
      initRanges(panel, all);

      /* Opened before the feed landed: replace the loading line. */
      if (panel.querySelector('[data-fye-picker]:not([hidden])')) paintPicker(panel);
    });
  }

  /* ---- the picker: filter state ---------------------------------------- */

  function pk(panel) {
    if (!panel.__fyePk) {
      panel.__fyePk = {
        type: 'natural',      /* Ed, 31/08/2026 — Natural opens first */
        colours: [],
        clarities: [],
        certs: [],
        ctMin: 0, ctMax: 0,
        pMin: 0, pMax: 0,
        sort: 'price-asc',
        pages: 1,
        sel: null
      };
    }
    return panel.__fyePk;
  }

  function bounds(list, get) {
    var lo = Infinity, hi = -Infinity;
    list.forEach(function (d) {
      var v = get(d);
      if (v < lo) lo = v;
      if (v > hi) hi = v;
    });
    if (lo === Infinity) { lo = 0; hi = 0; }
    return [lo, hi];
  }

  /* Two range inputs sharing one grid cell make a dual-range without a
     library. Bounds come from the stones actually returned, not from the
     ring's window, so the handles always have somewhere to go. */
  function initRanges(panel, list) {
    var st = pk(panel);
    var ct = bounds(list, function (d) { return Number(d.carat) || 0; });
    var pr = bounds(list, function (d) { return Number(d.price) || 0; });

    st.ctMin = ct[0]; st.ctMax = ct[1];
    st.pMin = pr[0]; st.pMax = pr[1];

    setRange(panel, 'ct', ct[0], ct[1], 0.01, ct[0], ct[1]);
    setRange(panel, 'price', pr[0], pr[1], 1000, pr[0], pr[1]);
    paintRangeLabels(panel);
  }

  function setRange(panel, key, min, max, step, lo, hi) {
    var wrap = panel.querySelector('[data-fye-range="' + key + '"]');
    if (!wrap) return;
    var a = wrap.querySelector('[data-fye-range-min]');
    var b = wrap.querySelector('[data-fye-range-max]');
    [a, b].forEach(function (input) {
      if (!input) return;
      input.min = min;
      input.max = max;
      input.step = step;
    });
    if (a) a.value = lo;
    if (b) b.value = hi;
  }

  function paintRangeLabels(panel) {
    var st = pk(panel);
    var ctLbl = panel.querySelector('[data-fye-ct-label]');
    var pLbl = panel.querySelector('[data-fye-price-label]');
    if (ctLbl) ctLbl.textContent = st.ctMin.toFixed(2) + '–' + st.ctMax.toFixed(2) + 'ct';
    if (pLbl) pLbl.textContent = shortMoney(st.pMin) + '–' + shortMoney(st.pMax);
  }

  function matches(panel, d) {
    var st = pk(panel);
    var isLab = /lab/i.test(String(d.origin || ''));
    if (st.type === 'natural' && isLab) return false;
    if (st.type === 'lab' && !isLab) return false;

    var colour = String(d.colour || '').toUpperCase();
    var clarity = String(d.clarity || '').toUpperCase();
    var cert = String(d.certLab || '').toUpperCase();

    if (st.colours.length && st.colours.indexOf(colour) < 0) return false;
    if (st.clarities.length && st.clarities.indexOf(clarity) < 0) return false;
    if (st.certs.length && st.certs.indexOf(cert) < 0) return false;

    var ct = Number(d.carat) || 0;
    if (ct < st.ctMin - 0.001 || ct > st.ctMax + 0.001) return false;

    var p = Number(d.price) || 0;
    if (p < st.pMin || p > st.pMax) return false;

    return true;
  }

  function rank(d, key) {
    if (key === 'colour') {
      var ci = COLOURS.indexOf(String(d.colour || '').toUpperCase());
      return ci < 0 ? COLOURS.length : ci;
    }
    if (key === 'clarity') {
      var li = CLARITIES.indexOf(String(d.clarity || '').toUpperCase());
      return li < 0 ? CLARITIES.length : li;
    }
    if (key === 'ct') return Number(d.carat) || 0;
    return Number(d.price) || 0;
  }

  /* Deterministic "varied" reveal, from live: sort the filtered set by price,
     split it into up to REVEAL_SIZE equal-width bands, then take the Nth
     deepest stone from each. Page one is therefore one stone per band — the
     whole price spread in 30 tiles rather than the 30 cheapest, which on a
     15,000-stone feed all look the same. No randomness. */
  function reveal(list, pages) {
    var byPrice = list.slice().sort(function (a, b) {
      return (Number(a.price) || 0) - (Number(b.price) || 0);
    });
    var n = byPrice.length;
    var bandCount = Math.max(1, Math.min(REVEAL_SIZE, n));
    var out = [];
    var more = false;

    for (var b = 0; b < bandCount; b++) {
      var start = Math.floor(b * n / bandCount);
      var end = Math.floor((b + 1) * n / bandCount);
      var depth = end - start;
      for (var p = 0; p < pages && p < depth; p++) out.push(byPrice[start + p]);
      if (depth > pages) more = true;
    }
    return { list: out, more: more };
  }

  function paintPicker(panel) {
    var st = pk(panel);
    var all = panel.__fyeStones || [];
    var results = panel.querySelector('[data-fye-picker-results]');
    var count = panel.querySelector('[data-fye-picker-count]');
    var moreBtn = panel.querySelector('[data-fye-picker-more]');
    var confirm = panel.querySelector('[data-fye-picker-confirm]');
    if (!results) return;

    var filtered = all.filter(function (d) { return matches(panel, d); });
    var rv = reveal(filtered, st.pages);

    var key = st.sort.split('-')[0];
    var dir = st.sort.split('-')[1] === 'desc' ? -1 : 1;
    var shown = rv.list.slice().sort(function (a, b) {
      return (rank(a, key) - rank(b, key)) * dir ||
             (Number(a.price) || 0) - (Number(b.price) || 0);
    });

    if (count) {
      count.textContent = filtered.length === 1
        ? '1 stone matches'
        : filtered.length + ' stones match';
    }

    if (!shown.length) {
      results.innerHTML =
        '<p class="pdp__stoneempty">No stones match those filters. ' +
        'Widen the carat range or drop a filter.</p>';
    } else {
      results.innerHTML = shown.map(function (d) { return cardHtml(panel, d); }).join('');
    }

    if (moreBtn) moreBtn.hidden = !rv.more;
    if (confirm) confirm.disabled = !st.sel;

    panel.querySelectorAll('[data-fye-chip]').forEach(function (chip) {
      var group = chip.getAttribute('data-fye-chip');
      var val = chip.getAttribute('data-val');
      chip.classList.toggle('is-on', st[group].indexOf(val) >= 0);
    });

    panel.querySelectorAll('[data-fye-stone-type]').forEach(function (btn) {
      var on = btn.getAttribute('data-fye-stone-type') === st.type;
      btn.classList.toggle('is-on', on);
      btn.setAttribute('aria-checked', on ? 'true' : 'false');
    });
  }

  function cardHtml(panel, d) {
    var st = pk(panel);
    var on = st.sel && String(st.sel) === String(d.variantId);
    var isLab = /lab/i.test(String(d.origin || ''));

    return '<button type="button" class="pdp__stonecard' + (on ? ' is-on' : '') + '" ' +
      'data-fye-stone-pick="' + esc(d.variantId) + '">' +
      '<span class="pdp__stonecardmedia">' +
        (d.image ? '<img src="' + esc(d.image) + '" alt="" loading="lazy">' : '') +
      '</span>' +
      '<span class="pdp__stonecardbody">' +
        (isLab ? '<span class="pdp__stoneflag">Lab-grown</span>' : '') +
        '<span class="pdp__stonename">' + esc(stoneTitle(d)) + '</span>' +
        '<span class="pdp__stonesub">' + esc(stoneSub(d)) + '</span>' +
        '<span class="pdp__stoneprice">' + money(Number(d.price) || 0) + '</span>' +
      '</span>' +
    '</button>';
  }

  function openPicker(panel) {
    var modal = panel.querySelector('[data-fye-picker]');
    if (!modal) return;
    pk(panel).sel = null;
    modal.hidden = false;
    document.documentElement.style.overflow = 'hidden';

    /* The modal can be opened straight from the add button, before the
       feed has been asked for. An empty grid would read as "no stones". */
    if (!panel.__fyeStones) {
      var waiting = panel.querySelector('[data-fye-picker-results]');
      if (waiting) {
        waiting.innerHTML = '<p class="pdp__stoneempty">Finding diamonds that suit this setting…</p>';
      }
      ensureStones(panel);
    } else {
      paintPicker(panel);
    }
    var close = modal.querySelector('[data-fye-picker-close]');
    if (close) close.focus();
  }

  function closePicker(panel) {
    var modal = panel.querySelector('[data-fye-picker]');
    if (!modal) return;
    modal.hidden = true;
    if (!document.querySelector('[data-fye-picker]:not([hidden])')) {
      document.documentElement.style.overflow = '';
    }
    var opener = panel.querySelector('[data-fye-picker-open]');
    if (opener) opener.focus();
  }

  /* ---- what the button is allowed to do -------------------------------
     ONE place decides. Returns the first unmet requirement, so the button can
     say what is missing instead of being mysteriously dead. `open` means the
     shopper can act on it by pressing the button itself. */

  function requirement(form) {
    var centre = centreOf(form);
    var sides = sidesOf(form);

    if (centre) {
      var cm = modeOf(centre);
      /* NOT blocked: this button is how the shopper gets into the picker.
         `mode` is applied on the way in — see the submit handler. */
      if (!cm) return { label: 'Choose your centre diamond option', open: centre, mode: 'required' };
      if (cm === 'required' && !stoneOf(centre)) {
        return { label: 'Choose centre diamond', open: centre };
      }
      if (cm === 'supplied') {
        var cw = waiverOf(centre, 'centre');
        if (cw && !cw.checked) return { label: 'Accept the setting waiver', block: true };
      }
    }

    if (sides) {
      var sm = modeOf(sides);
      if (!sm) return { label: 'Choose your side diamond option', block: true };
      if (sm === 'required' && !chosenChip(sides)) {
        return { label: 'Choose a side diamond quality', block: true };
      }
      if (sm === 'supplied') {
        var sw = waiverOf(sides, 'sides');
        if (sw && !sw.checked) return { label: 'Accept the setting waiver', block: true };
      }
    }

    return null;
  }

  /* ---- render ---------------------------------------------------------- */

  function render(form) {
    var v = chosenVariant(form);
    if (!v) return;

    var id = form.querySelector('[data-fye-variant-id]');
    if (id) id.value = v.id;

    var over = form.querySelector('[data-fye-surcharge]');
    var mul = over && !over.disabled ? 1.1 : 1;

    /* The oversize surcharge is taken on the RING LINE ONLY — every add-on
       travels as its own unflagged cart line and is not surcharged. Taking it
       on the total here would make the page disagree with the cart. */
    var base = Math.round(v.price * mul);
    var total = base + engraveFee(form) + centreAddOn(form) + sidesAddOn(form);

    var price = form.querySelector('[data-fye-price]');
    if (price) price.textContent = money(total);

    var sku = document.querySelector('[data-fye-sku]');
    if (sku && v.sku) sku.textContent = v.sku;

    var atc = form.querySelector('[data-fye-atc]');
    if (!atc) return;

    if (!atc.getAttribute('data-label-default')) {
      atc.setAttribute('data-label-default', atc.textContent.trim());
    }

    var need = requirement(form);
    if (!v.available) {
      atc.disabled = true;
      atc.textContent = atc.getAttribute('data-label-default');
    } else if (need) {
      atc.disabled = !!need.block;
      atc.textContent = need.label;
    } else {
      atc.disabled = false;
      atc.textContent = atc.getAttribute('data-label-default');
    }
  }

  function renderForm(el) {
    var form = el.closest ? el.closest('form') : null;
    if (form) render(form);
  }

  /* ---- events ----------------------------------------------------------- */

  document.addEventListener('click', function (e) {
    if (!e.target.closest) return;

    /* ---- the add button, when it is not an add button ----------------
       Before a centre stone is chosen this button reads "Choose your centre
       diamond option" and its job is to open the picker.

       This is handled on CLICK rather than on submit because the browser
       validates required fields BEFORE firing submit: with an unchosen ring
       size the submit event never arrives, and the shopper gets a bubble
       about a field that is not what is missing. Cancelling the click means
       no submit, so no validation, so no wrong message.

       Any other state falls through untouched and the form validates as
       normal — a real add to bag still demands a size. */
    var atcBtn = e.target.closest('[data-fye-atc]');
    if (atcBtn) {
      var atcForm = atcBtn.closest('form');
      var atcNeed = requirement(atcForm);
      if (atcForm && atcNeed && atcNeed.open) {
        e.preventDefault();
        if (atcNeed.mode) {
          setMode(atcNeed.open, 'centre', atcNeed.mode);
          paintStone(atcNeed.open);
          render(atcForm);
        }
        openPicker(atcNeed.open);
        return;
      }
    }

    /* gallery */
    var thumb = e.target.closest('[data-fye-thumb]');
    if (thumb) {
      var gallery = thumb.closest('[data-fye-gallery]');
      if (gallery) showPanel(gallery, thumb.getAttribute('data-fye-thumb'));
      return;
    }

    /* chooser mode tiles */
    var tile = e.target.closest('[data-fye-centre-mode], [data-fye-sides-mode]');
    if (tile) {
      var isCentre = tile.hasAttribute('data-fye-centre-mode');
      var kind = isCentre ? 'centre' : 'sides';
      var panel = tile.closest('[data-fye-' + kind + ']');
      if (panel) {
        setMode(panel, kind, tile.getAttribute('data-fye-' + kind + '-mode'));
        if (isCentre) paintStone(panel);
        renderForm(panel);
      }
      return;
    }

    /* side-diamond quality chips */
    var sideChip = e.target.closest('[data-fye-side-qual]');
    if (sideChip) {
      var sidesPanel = sideChip.closest('[data-fye-sides]');
      if (sidesPanel) {
        sidesPanel.querySelectorAll('[data-fye-side-qual]').forEach(function (c) {
          var on = c === sideChip;
          c.classList.toggle('is-on', on);
          c.setAttribute('aria-checked', on ? 'true' : 'false');
        });
        renderForm(sidesPanel);
      }
      return;
    }

    /* picker: open, close, filters, pick, confirm */
    var openBtn = e.target.closest('[data-fye-picker-open]');
    if (openBtn) {
      var op = openBtn.closest('[data-fye-centre]');
      if (op) openPicker(op);
      return;
    }

    var closeBtn = e.target.closest('[data-fye-picker-close]');
    if (closeBtn) {
      var cp = closeBtn.closest('[data-fye-centre]');
      if (cp) closePicker(cp);
      return;
    }

    var typeBtn = e.target.closest('[data-fye-stone-type]');
    if (typeBtn) {
      var tp = typeBtn.closest('[data-fye-centre]');
      if (tp) {
        pk(tp).type = typeBtn.getAttribute('data-fye-stone-type');
        pk(tp).pages = 1;
        paintPicker(tp);
      }
      return;
    }

    var filterChip = e.target.closest('[data-fye-chip]');
    if (filterChip) {
      var fp = filterChip.closest('[data-fye-centre]');
      if (fp) {
        var st = pk(fp);
        var group = filterChip.getAttribute('data-fye-chip');
        var val = filterChip.getAttribute('data-val');
        var at = st[group].indexOf(val);
        if (at < 0) st[group].push(val);
        else st[group].splice(at, 1);
        st.pages = 1;
        paintPicker(fp);
      }
      return;
    }

    var pick = e.target.closest('[data-fye-stone-pick]');
    if (pick) {
      var pp = pick.closest('[data-fye-centre]');
      if (pp) {
        pk(pp).sel = pick.getAttribute('data-fye-stone-pick');
        paintPicker(pp);
      }
      return;
    }

    var moreBtn = e.target.closest('[data-fye-picker-more]');
    if (moreBtn) {
      var mp = moreBtn.closest('[data-fye-centre]');
      if (mp) {
        pk(mp).pages += 1;
        paintPicker(mp);
      }
      return;
    }

    var confirmBtn = e.target.closest('[data-fye-picker-confirm]');
    if (confirmBtn) {
      var xp = confirmBtn.closest('[data-fye-centre]');
      if (xp) {
        var sel = pk(xp).sel;
        var found = (xp.__fyeStones || []).filter(function (d) {
          return String(d.variantId) === String(sel);
        })[0];
        if (found) {
          xp.setAttribute('data-stone', JSON.stringify(found));
          paintStone(xp);
          closePicker(xp);
          renderForm(xp);
        }
      }
      return;
    }

    /* engraving */
    var seg = e.target.closest('[data-fye-engrave-set]');
    if (!seg) return;

    var block = seg.closest('[data-fye-engrave]');
    if (!block) return;

    var want = seg.getAttribute('data-fye-engrave-set');
    block.setAttribute('data-on', want);

    block.querySelectorAll('[data-fye-engrave-set]').forEach(function (b) {
      var on = b.getAttribute('data-fye-engrave-set') === want;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-checked', on ? 'true' : 'false');
    });

    var body = block.querySelector('[data-fye-engrave-body]');
    if (body) body.hidden = want !== 'yes';

    /* Disabled fields are not posted — that is what keeps an empty Engraving
       property off the order when the answer is No. */
    block.querySelectorAll('input, select').forEach(function (field) {
      if (field.hasAttribute('data-fye-engrave-set')) return;
      field.disabled = want !== 'yes';
    });

    if (want === 'yes') {
      var text = block.querySelector('[data-fye-engrave-text]');
      if (text) text.focus();
    }

    renderForm(block);
  });

  document.addEventListener('input', function (e) {
    if (!e.target.closest) return;

    var text = e.target.closest('[data-fye-engrave-text]');
    if (text) {
      var block = text.closest('[data-fye-engrave]');
      var count = block && block.querySelector('[data-fye-engrave-count]');
      if (count) {
        count.textContent = text.value.length + '/' + (text.getAttribute('maxlength') || '');
      }
      return;
    }

    /* Dual ranges. The two handles share a track, so each pushes the other
       rather than crossing it — a min above the max would filter everything
       out and read as a broken picker. */
    var range = e.target.closest('[data-fye-range] input');
    if (range) {
      var wrap = range.closest('[data-fye-range]');
      var panel = range.closest('[data-fye-centre]');
      if (!wrap || !panel) return;

      var key = wrap.getAttribute('data-fye-range');
      var a = wrap.querySelector('[data-fye-range-min]');
      var b = wrap.querySelector('[data-fye-range-max]');
      var lo = parseFloat(a.value);
      var hi = parseFloat(b.value);

      if (lo > hi) {
        if (range === a) { lo = hi; a.value = hi; }
        else { hi = lo; b.value = lo; }
      }

      var st = pk(panel);
      if (key === 'ct') { st.ctMin = lo; st.ctMax = hi; }
      else { st.pMin = lo; st.pMax = hi; }

      st.pages = 1;
      paintRangeLabels(panel);
      paintPicker(panel);
    }
  });

  document.addEventListener('change', function (e) {
    if (!e.target.closest) return;

    var option = e.target.closest('[data-fye-option]');
    if (option) {
      renderForm(option);
      return;
    }

    var sortSel = e.target.closest('[data-fye-picker-sort]');
    if (sortSel) {
      var sp = sortSel.closest('[data-fye-centre]');
      if (sp) {
        pk(sp).sort = sortSel.value;
        paintPicker(sp);
      }
      return;
    }

    /* Ticking a waiver can unblock the button, so it has to re-render. */
    var waiver = e.target.closest('[data-fye-centre-waiver], [data-fye-sides-waiver]');
    if (waiver) renderForm(waiver);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var open = document.querySelectorAll('[data-fye-picker]:not([hidden])');
    for (var i = 0; i < open.length; i++) {
      var panel = open[i].closest('[data-fye-centre]');
      if (panel) closePicker(panel);
    }
  });

  /* ---- submit: up to five lines ----------------------------------------
     Shopify cannot post more than one line item from a product form, and every
     add-on here IS a separate line. So the submit is intercepted whenever
     there is anything to add, and everything goes in one /cart/add.js call —
     one request, so a half-added order is not possible.

     With no add-ons the form posts normally and no JS is involved. */

  function ringProps(form) {
    var props = {};
    form.querySelectorAll('[name^="properties["]').forEach(function (field) {
      if (field.disabled) return;
      if (field.type === 'checkbox' && !field.checked) return;
      var name = field.getAttribute('name').replace(/^properties\[/, '').replace(/\]$/, '');
      if (!field.value) return;
      props[name] = field.value;
    });
    return props;
  }

  function addOnLines(form, ring) {
    var lines = [];
    var tag = { 'For ring': ring.title, 'Ring SKU': ring.sku || '' };

    var block = form.querySelector('[data-fye-engrave]');
    if (block && block.getAttribute('data-on') === 'yes') {
      var engVariant = (block.getAttribute('data-fee-variant') || '').trim();
      if (engVariant) lines.push({ id: parseInt(engVariant, 10), quantity: 1, properties: tag });
    }

    var centre = centreOf(form);
    if (centre) {
      var cm = modeOf(centre);
      if (cm === 'required') {
        var stone = stoneOf(centre);
        if (stone) lines.push({ id: parseInt(stone.variantId, 10), quantity: 1, properties: tag });
      } else if (cm === 'supplied') {
        var cf = feeVariant(centre);
        if (cf) lines.push({ id: parseInt(cf, 10), quantity: 1, properties: tag });
      }
    }

    var sides = sidesOf(form);
    if (sides) {
      var sm = modeOf(sides);
      if (sm === 'required') {
        var chip = chosenChip(sides);
        if (chip) {
          lines.push({
            id: parseInt(chip.getAttribute('data-fye-side-variant'), 10),
            quantity: 1,
            properties: tag
          });
        }
      } else if (sm === 'supplied') {
        var sf = feeVariant(sides);
        if (sf) lines.push({ id: parseInt(sf, 10), quantity: 1, properties: tag });
      }
    }

    return lines.filter(function (l) { return l.id; });
  }

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
  };

  /* ---- read and re-apply a whole configuration -------------------------
     For the wishlist, and for a link a shopper sends to their partner. The
     page currently reads nothing from the URL at all — not even ?variant= —
     so a shared ring opens blank no matter how it was configured.

     Everything here goes through the SAME functions a click would: setMode,
     paintStone, render, and for the engraving and the side chips an actual
     dispatched click, so their existing handlers do the work. Re-implementing
     those side effects here is how the two would drift apart. */

  function optionSelects(form) {
    return Array.prototype.slice.call(form.querySelectorAll('[data-fye-option]'));
  }

  window.FYE.readConfig = function (form) {
    var centre = centreOf(form);
    var sides = sidesOf(form);
    var eng = form.querySelector('[data-fye-engrave]');

    var fields = {};
    if (eng) {
      eng.querySelectorAll('[name^="properties["]').forEach(function (f) {
        if (!f.disabled && f.value) fields[f.getAttribute('name')] = f.value;
      });
    }

    var chip = chosenChip(sides);
    var cw = waiverOf(centre, 'centre');
    var sw = waiverOf(sides, 'sides');

    return {
      options: optionSelects(form).map(function (s) { return s.value; }),
      centre: centre ? { mode: modeOf(centre), stone: stoneOf(centre) } : null,
      sides: sides
        ? { mode: modeOf(sides), chip: chip ? chip.getAttribute('data-fye-side-variant') : '' }
        : null,
      engrave: eng ? { on: eng.getAttribute('data-on') || 'no', fields: fields } : null,
      waiver: { centre: !!(cw && cw.checked), sides: !!(sw && sw.checked) }
    };
  };

  window.FYE.applyConfig = function (form, cfg) {
    if (!form || !cfg) return;

    /* Variant first: everything else prices against it. */
    if (cfg.options) {
      optionSelects(form).forEach(function (sel, i) {
        if (cfg.options[i] != null) sel.value = cfg.options[i];
      });
    }

    var centre = centreOf(form);
    if (centre && cfg.centre) {
      if (cfg.centre.stone) centre.setAttribute('data-stone', JSON.stringify(cfg.centre.stone));
      if (cfg.centre.mode) setMode(centre, 'centre', cfg.centre.mode);
      paintStone(centre);
    }

    var sides = sidesOf(form);
    if (sides && cfg.sides) {
      if (cfg.sides.mode) setMode(sides, 'sides', cfg.sides.mode);
      if (cfg.sides.chip) {
        var chip = sides.querySelector('[data-fye-side-variant="' + cfg.sides.chip + '"]');
        /* A click, not a class toggle: the chip's handler also prices it. */
        if (chip) chip.click();
      }
    }

    var eng = form.querySelector('[data-fye-engrave]');
    if (eng && cfg.engrave) {
      var seg = eng.querySelector('[data-fye-engrave-set="' + cfg.engrave.on + '"]');
      if (seg) seg.click();
      Object.keys(cfg.engrave.fields || {}).forEach(function (name) {
        var f = eng.querySelector('[name="' + name + '"]');
        if (f) f.value = cfg.engrave.fields[name];
      });
    }

    if (cfg.waiver) {
      var cw2 = waiverOf(centre, 'centre');
      var sw2 = waiverOf(sides, 'sides');
      if (cw2 && !cw2.disabled) cw2.checked = !!cfg.waiver.centre;
      if (sw2 && !sw2.disabled) sw2.checked = !!cfg.waiver.sides;
    }

    render(form);
  };

  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form.querySelector || !form.querySelector('[data-fye-variants]')) return;

    var v = chosenVariant(form);
    if (!v) return;

    /* A missing requirement never reaches the cart. requirement() decides;
       pressing the button when a stone is outstanding opens the picker
       instead, because that is the thing the shopper needs to do next. */
    var need = requirement(form);
    if (need) {
      e.preventDefault();
      if (need.open) {
        /* Opening the picker IS choosing the we-supply-the-stone route, so
           the mode is set on the way in rather than asked for twice.
           setMode also starts the feed load. */
        if (need.mode) {
          setMode(need.open, 'centre', need.mode);
          paintStone(need.open);
          render(form);
        }
        openPicker(need.open);
      }
      return;
    }

    var extras = addOnLines(form, v);
    if (!extras.length) return; /* plain post — no JS needed */

    e.preventDefault();

    var atc = form.querySelector('[data-fye-atc]');
    if (atc) atc.disabled = true;

    var items = [{ id: v.id, quantity: 1, properties: ringProps(form) }].concat(extras);

    fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: items })
    })
      .then(function (res) { return res.ok ? res.json() : Promise.reject(res); })
      .then(function () { window.location.href = '/cart'; })
      .catch(function () {
        /* Put the button back and let them try again, rather than leaving a
           dead control. The plain form post is still there as a fallback. */
        if (atc) atc.disabled = false;
      });
  });

  /* ---- first paint -----------------------------------------------------
     The buy box renders from Liquid with nothing selected, so the only thing
     needed on load is the button's state: a page with a chooser must not open
     showing "Add to bag" when the order is incomplete. */

  function boot() {
    document.querySelectorAll('form [data-fye-variants]').forEach(function (island) {
      var form = island.closest('form');
      if (form) render(form);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
  document.addEventListener('shopify:section:load', boot);
})();


/* ============================================================================
   OVERSIZE SURCHARGE — 31/08/2026
   Eternity, diamond and gem-set rings only.

   On these, ring size is a line-item property with no price of its own, so a
   size above the threshold sets `_size_surcharge: "Yes"` and the Oversize Ring
   Surcharge cart-transform function adds 10% at checkout.

   NOT on plain wedding rings: there the price ladder is already in the
   variants, and flagging them too would charge twice. Ed, 31/08/2026. The flag
   only exists on pages that render fye-buybox-eternity, so this is inert
   elsewhere by construction rather than by a check.

   ── HOW SIZES COMPARE ──────────────────────────────────────────────────────

   UK ring sizes run A, A.5, B … Z, Z+1, Z+1.5 … Z+9.5, which no string or
   numeric comparison gets right on its own: "Z+1" < "Z" alphabetically, and
   "A.5" is not a number. So each size is converted to a position on that
   sequence and the positions are compared.

   Anything at or past Z is beyond the plain alphabet, so it scores above every
   letter automatically.
   ========================================================================== */
(function oversizeSurcharge() {
  var LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  /* A -> 0, A.5 -> 0.5, Z -> 25, Z+1 -> 26, Z+1.5 -> 26.5 */
  function position(size) {
    if (!size) return -1;
    var s = String(size).trim().toUpperCase();

    var plus = s.match(/^Z\+([\d.]+)$/);
    if (plus) return 25 + parseFloat(plus[1]);

    var letter = s.match(/^([A-Z])(\.5)?$/);
    if (!letter) return -1;

    return LETTERS.indexOf(letter[1]) + (letter[2] ? 0.5 : 0);
  }

  document.addEventListener('change', function (e) {
    var select = e.target.closest ? e.target.closest('[data-fye-size]') : null;
    if (!select) return;

    var form = select.closest('form');
    if (!form) return;

    var over = position(select.value) > position(select.getAttribute('data-threshold'));

    /* Disabled fields are not posted, so an ordinary size carries no flag. */
    var flag = form.querySelector('[data-fye-surcharge]');
    if (flag) flag.disabled = !over;

    var note = form.querySelector('[data-fye-surcharge-note]');
    if (note) note.hidden = !over;

    var opt = form.querySelector('[data-fye-option]');
    if (opt) opt.dispatchEvent(new Event('change', { bubbles: true }));
  });
})();



/* ============================================================================
   METAL AND GOLD COLOUR — 31/08/2026, second pass
   Eternity, diamond and gem-set rings.

   REPLACES the "GOLD COLOUR" block above, which made every colour tile a link
   carrying ?gold= and reloaded the page on each change. Live's product-block
   does it without any of that: the state lives in JS, the variant is resolved
   from metal x quality, and nothing navigates. This copies that.

   ── THE MODEL, from live's product-block.js ───────────────────────────────

     data-fye-gold="Yellow"     sets the PROPERTY. Does not touch the variant
                                — UNLESS the current metal is not a gold, in
                                which case the metal moves to the preferred
                                carat (live's W785 behaviour).
     data-fye-metal="Platinum"  sets the METAL. On a non-gold the carat row
                                hides and the colour property is disabled.
     data-fye-metal="14k Gold"  same, within the golds; colour and quality
                                both survive.

   ── QUALITY FALLBACK ──────────────────────────────────────────────────────

   live's selectMetal(): if the chosen metal is not made at the current
   quality, move to a quality it IS made at, rather than leaving the buy box
   pointing at a variant that does not exist. Same here.

   ── HOW IT REACHES THE PRICE ──────────────────────────────────────────────

   The hidden metal input is a [data-fye-option], so the existing variant
   matcher already reads it. After changing it this dispatches a bubbling
   `change` from that input, which is exactly what the matcher listens for —
   so price, SKU, availability and the hidden variant id all update through
   the one code path rather than a second copy of it.
   ========================================================================== */
(function metalSelect() {
  function variants(form) {
    var island = form.querySelector('[data-fye-variants]');
    if (!island) return [];
    try {
      return JSON.parse(island.textContent);
    } catch (e) {
      return [];
    }
  }

  /* Variant titles are "Metal / Quality". */
  function partsOf(v) {
    var bits = String(v.title).split(' / ');
    return { metal: bits[0], quality: bits[1] };
  }

  function isGold(metal) {
    return /gold/i.test(metal || '');
  }

  function apply(root, metal, gold) {
    var form = root.closest('form');
    if (!form) return;

    var metalInput = form.querySelector('[data-fye-metal-input]');
    var quality = form.querySelector('[data-fye-quality]');
    if (!metalInput) return;

    /* Quality fallback — do not strand the buy box on a variant that is not
       made. Live's selectMetal does the same. */
    if (quality) {
      var all = variants(form);
      var made = all.some(function (v) {
        var pt = partsOf(v);
        return pt.metal === metal && pt.quality === quality.value && v.available;
      });

      if (!made) {
        var alt = null;
        all.forEach(function (v) {
          if (alt) return;
          var pt = partsOf(v);
          if (pt.metal === metal && v.available) alt = pt.quality;
        });
        if (alt) quality.value = alt;
      }
    }

    metalInput.value = metal;

    var label = form.querySelector('[data-fye-metal-label]') ||
                document.querySelector('[data-fye-metal-label]');
    if (label) label.textContent = isGold(metal) && gold ? gold + ' ' + metal : metal;

    /* Carat row and the colour property only mean anything on a gold. */
    var karatRow = document.querySelector('[data-fye-karatrow]');
    if (karatRow) karatRow.hidden = !isGold(metal);

    var goldInput = form.querySelector('[data-fye-gold-input]');
    if (goldInput) {
      goldInput.disabled = !isGold(metal);
      if (gold) goldInput.value = gold;
    }

    /* Highlights. */
    document.querySelectorAll('[data-fye-metal]').forEach(function (b) {
      b.classList.toggle('is-current', b.getAttribute('data-fye-metal') === metal);
    });
    document.querySelectorAll('[data-fye-gold]').forEach(function (b) {
      var on = isGold(metal) && b.getAttribute('data-fye-gold') === (goldInput ? goldInput.value : '');
      b.classList.toggle('is-current', on);
    });

    /* One code path for the price: let the existing matcher do it. */
    metalInput.dispatchEvent(new Event('change', { bubbles: true }));
  }

  document.addEventListener('click', function (e) {
    if (!e.target.closest) return;

    var goldBtn = e.target.closest('[data-fye-gold]');
    if (goldBtn) {
      var wrap = goldBtn.closest('[data-fye-metals]');
      var form = goldBtn.closest('form');
      var metalInput = form && form.querySelector('[data-fye-metal-input]');
      if (!metalInput) return;

      var metal = metalInput.value;
      /* Coming from platinum or palladium, land on the preferred carat. */
      if (!isGold(metal) && wrap) metal = wrap.getAttribute('data-preferred-karat') || metal;

      apply(goldBtn, metal, goldBtn.getAttribute('data-fye-gold'));
      return;
    }

    var metalBtn = e.target.closest('[data-fye-metal]');
    if (metalBtn) {
      var f = metalBtn.closest('form');
      var gi = f && f.querySelector('[data-fye-gold-input]');
      apply(metalBtn, metalBtn.getAttribute('data-fye-metal'), gi ? gi.value : '');
    }
  });
})();


/* ============================================================================
   CART — 01/09/2026
   ----------------------------------------------------------------------------
   Two behaviours, both cart-page only, both no-ops everywhere else.

   1. REMOVING PART OF A RING REMOVES THE SET. A configured ring is up to five
      cart lines and they are only a ring together: a setting that reaches
      checkout with no centre stone is an order we cannot fulfil, and a stone
      with no setting is worse. main-cart puts every line key of the set on
      each of its Remove links; this asks once, then takes them all.

   2. THE CENTRE-FEE RECONCILER. When a customer supplies their own centre
      diamond we sell no stone, we charge to set one, and Shopify cannot
      attach a fee to an existing line — so the fee is its own line and the
      two can drift apart in a basket left overnight.

      Ed, 01/09/2026: correct it QUIETLY and IN PLACE, and ADD THE FEE BACK if
      it was deleted while the ring stayed. Live only ever corrected a fee
      line that was still there, so deleting it bought free setting.

   ── ONE FEE LINE PER RING, NOT ONE LINE WITH A QUANTITY ───────────────────

   Live keeps a single fee line and counts it up. v3 tags every companion with
   its ring's SKU (addOnLines above), so a fee line belongs to a ring the same
   way a stone does — which is what lets main-cart show it inside the right
   group. Same variant, different "Ring SKU", so Shopify keeps them separate.

   ── NO RELOAD ─────────────────────────────────────────────────────────────

   Both paths re-render through Shopify's Section Rendering API and swap the
   section in place. A location.reload() (live's approach) throws away scroll
   position and flashes the whole page to correct one line.
   ========================================================================== */
(function cartPage() {
  if (window.location.pathname.indexOf('/cart') !== 0) return;

  var SUPPLIED = [
    "Customer's own diamond",
    'Supplied by you (setting fee applies)'
  ];

  function root() { return document.querySelector('[data-fye-cart]'); }

  /* The section id Shopify knows this by, read off its own wrapper rather
     than hardcoded — the key in templates/cart.json is free to change. */
  function sectionId() {
    var el = root();
    var wrap = el && el.closest('.shopify-section');
    return wrap && wrap.id ? wrap.id.replace(/^shopify-section-/, '') : null;
  }

  function swap(data) {
    var id = sectionId();
    var html = data && data.sections && id ? data.sections[id] : null;
    var wrap = root() && root().closest('.shopify-section');
    if (!html || !wrap) { window.location.reload(); return; }
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var fresh = doc.getElementById(wrap.id) || doc.querySelector('.shopify-section');
    if (!fresh) { window.location.reload(); return; }
    wrap.innerHTML = fresh.innerHTML;
  }

  function post(url, body) {
    var id = sectionId();
    if (id) body.sections = id;
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body)
    }).then(function (r) { return r.ok ? r.json() : Promise.reject(r); });
  }

  /* ---- 1. remove the whole set -------------------------------------- */

  document.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('[data-fye-cart-remove-set]');
    if (!link) return;

    var keys = (link.getAttribute('data-fye-cart-remove-set') || '')
      .split(',')
      .filter(Boolean);

    /* A set of one is just a line. Let the plain href do its job. */
    if (keys.length < 2) return;

    e.preventDefault();

    var ok = window.confirm(
      'This ring is made up of ' + keys.length + ' items — the setting and the ' +
      'stones chosen with it. Removing one removes them all, so your order ' +
      'cannot end up with a setting and no stones. Remove them?'
    );
    if (!ok) return;

    var updates = {};
    keys.forEach(function (k) { updates[k] = 0; });

    post('/cart/update.js', { updates: updates })
      .then(swap)
      .catch(function () { window.location.href = link.getAttribute('href'); });
  });

  /* ---- 2. the centre-fee reconciler ---------------------------------- */

  function suppliesOwnStone(item) {
    var v = (item.properties || {})['Centre Diamond'];
    return !!v && SUPPLIED.indexOf(v) >= 0;
  }

  function reconcile() {
    var el = root();
    if (!el) return;

    var fee = (el.getAttribute('data-fee-variant') || '').trim();
    if (!fee) return; /* switched off in the theme editor */

    var linkKey = el.getAttribute('data-link-key') || 'Ring SKU';

    fetch('/cart.js', { headers: { Accept: 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(function (cart) {
        var items = cart.items || [];

        /* Rings that need a fee, by SKU. */
        var need = {};
        items.forEach(function (it) {
          if (suppliesOwnStone(it) && it.sku) need[it.sku] = it.product_title;
        });

        /* Fee lines we already hold, by the ring they name. */
        var held = {};
        var strays = [];
        items.forEach(function (it) {
          if (String(it.variant_id) !== String(fee)) return;
          var owner = (it.properties || {})[linkKey];
          if (owner && need[owner]) held[owner] = it;
          else strays.push(it);
        });

        /* A fee line naming no ring, or a ring that has gone. Both are the
           customer paying to set a stone nobody is setting. */
        var updates = {};
        strays.forEach(function (it) { updates[it.key] = 0; });
        Object.keys(held).forEach(function (sku) {
          if (held[sku].quantity !== 1) updates[held[sku].key] = 1;
        });

        /* A ring whose fee line was deleted. Live left these alone, which
           meant free setting. */
        var adds = [];
        Object.keys(need).forEach(function (sku) {
          if (held[sku]) return;
          var props = { 'For ring': need[sku] };
          props[linkKey] = sku;
          adds.push({ id: parseInt(fee, 10), quantity: 1, properties: props });
        });

        if (!Object.keys(updates).length && !adds.length) return;

        var step = Object.keys(updates).length
          ? post('/cart/update.js', { updates: updates })
          : Promise.resolve(null);

        step
          .then(function (res) {
            return adds.length ? post('/cart/add.js', { items: adds }) : res;
          })
          .then(swap)
          .catch(function () { /* leave the basket as the shopper left it */ });
      })
      .catch(function () {});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', reconcile);
  } else {
    reconcile();
  }
})();



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
    /* The gallery heart lives outside the buy-box form, so closest() finds
       nothing. A product page has exactly one buy box, so falling back to it
       is unambiguous — and without this the overlay heart would look correct
       and do nothing at all. */
    var form = btn.closest('form');
    if (!form) {
      var island = document.querySelector('form [data-fye-variants]');
      form = island ? island.closest('form') : null;
    }
    var box = form && window.FYE.buyBox ? window.FYE.buyBox(form) : null;
    if (!box) return null;

    /* Scoped deliberately. A bare scope.querySelector('img') on a page with
       no product wrapper walks the whole document and finds the header logo,
       which would then be saved as the ring's picture. Better no image than
       the wrong one — the wishlist page fetches the real one anyway, and only
       falls back to this for a product that has since been unpublished. */
    var scope = form.closest('[data-fye-product]') || document;
    var titleEl = scope.querySelector('[data-fye-product-title]') ||
                  document.querySelector('.pdp__title') ||
                  document.querySelector('h1');
    var imgEl = scope.querySelector('[data-fye-stage] img') ||
                document.querySelector('.pdp__media img, .pdp__stage img, .pdp__gallery img');

    return {
      handle: (form.getAttribute('data-fye-handle') ||
               window.location.pathname.split('/products/')[1] || '').split('?')[0],
      variant: String(box.variant.id),
      title: titleEl ? titleEl.textContent.trim() : '',
      image: imgEl ? imgEl.getAttribute('src') : '',
      props: box.props || {},
      lines: box.lines || [],
      /* The choosers in full, including the stone's own JSON. props and lines
         are enough to BUY the ring again; only this is enough to SHOW it
         configured on the product page. */
      cfg: window.FYE.readConfig ? window.FYE.readConfig(form) : null,
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


/* ============================================================================
   POPUPS — appended 01/09/2026
   sections/fye-popups.liquid

   Any element with data-fye-popup="<key>" opens the <dialog> carrying
   data-fye-popup-panel="<key>". Klaviyo is gone; the form inside is Shopify's
   own contact form.

   <dialog> + showModal() is the one deliberate exception to the theme's
   data-fye-drawer pattern: it brings a focus trap, an inert background and
   Escape with it, all of which a modal over a form needs and none of which the
   drawer pattern has. Drawers are unchanged.
   ========================================================================== */
(function () {
  function panel(key) {
    if (!key) return null;
    return document.querySelector('[data-fye-popup-panel="' + key.replace(/"/g, '') + '"]');
  }

  function open(el) {
    if (!el) return;
    if (typeof el.showModal === 'function') {
      if (!el.open) el.showModal();
    } else {
      // No <dialog> support: fall back to a plain open attribute so the
      // content is at least reachable rather than invisible.
      el.setAttribute('open', '');
    }
    var first = el.querySelector('input:not([type="hidden"]), select, textarea, button, a[href]');
    if (first) {
      try { first.focus({ preventScroll: true }); } catch (e) { first.focus(); }
    }
  }

  function close(el) {
    if (!el) return;
    if (typeof el.close === 'function' && el.open) {
      el.close();
    } else {
      el.removeAttribute('open');
    }
  }

  document.addEventListener('click', function (e) {
    if (!e.target || !e.target.closest) return;

    var trigger = e.target.closest('[data-fye-popup]');
    if (trigger) {
      var el = panel(trigger.getAttribute('data-fye-popup'));
      if (el) {
        // Only swallow the click when there is really a popup to show, so a
        // trigger whose key has drifted still behaves like whatever it is
        // (usually a link) instead of doing nothing at all.
        e.preventDefault();
        open(el);
      }
      return;
    }

    if (e.target.closest('[data-fye-popup-close]')) {
      close(e.target.closest('dialog'));
      return;
    }

    // Backdrop: a click that lands on the dialog element itself is outside the
    // panel, because .pop__in covers the whole of the inside.
    if (e.target.matches && e.target.matches('dialog[data-fye-popup-panel]')) {
      close(e.target);
    }
  });

  /* The enquiry email's whole readability depends on this.

     Shopify's notification email does not surface custom contact[...] fields
     in any useful way, so on 01/09/2026 a submission arrived with no
     indication which of seven popups had sent it. The message body IS always
     shown, so the body is composed here from everything that matters.

     Liquid has already put a usable fallback in the hidden field — the popup's
     own name — which is what a visitor with JavaScript off sends. This only
     ever adds to that. */
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form || !form.closest) return;

    var pop = form.closest('[data-fye-popup-panel]');
    if (!pop) return;

    var body = form.querySelector('[data-fye-popup-body]');
    if (!body) return;

    var lines = [];

    var label = pop.getAttribute('data-fye-popup-label');
    if (label) lines.push(label);

    /* Named fields, in document order. Added 03/09/2026 for the ring sizer,
       whose postal address has to arrive in the body because custom
       contact[...] fields do not show usefully in the notification email.
       Any form opts a field in with data-fye-popup-line="Label"; empty
       fields are skipped, so the block only prints what was typed. */
    var lined = form.querySelectorAll('[data-fye-popup-line]');
    if (lined.length) {
      var block = [];
      Array.prototype.forEach.call(lined, function (f) {
        var v = (f.value || '').trim();
        if (v) block.push(f.getAttribute('data-fye-popup-line') + ': ' + v);
      });
      if (block.length) {
        lines.push('');
        lines = lines.concat(block);
      }
    }

    var msg = form.querySelector('[data-fye-popup-message]');
    if (msg && msg.value && msg.value.trim()) {
      lines.push('');
      lines.push(msg.value.trim());
    }

    var journey = form.querySelector('[data-fye-popup-journey]');
    if (journey && journey.value) {
      lines.push('');
      lines.push('Where they are in their journey: ' + journey.value);
    }

    var consent = form.querySelector('[data-fye-popup-consent]');
    if (consent) {
      if (!journey || !journey.value) lines.push('');
      lines.push('Happy to be emailed: ' + (consent.checked ? 'Yes' : 'No'));
    }

    /* Where they were when they asked. On a guide popup this is the useful
       part — the same popup opens from the blog, the ring pages and the
       guides index, and the answer changes what you say back. The title
       reads better than the path; both go in, because a title can be
       ambiguous across near-identical pages and a path never is. */
    lines.push('');
    lines.push('Sent from: ' + document.title + ' (' + window.location.pathname + ')');

    body.value = lines.join('\n');

    /* Shopify's redirect carries no popup key, so the answer is kept here for
       the next page load. sessionStorage rather than a query parameter: the
       parameter would survive sharing and reopen a stranger's "thank you". */
    try {
      sessionStorage.setItem('fye_popup_sent', pop.getAttribute('data-fye-popup-panel') || '');
    } catch (err) {}
  });

  /* Reopen the popup that was just submitted, so the visitor lands on its
     success panel and its download rather than on the page they started from
     with no acknowledgement at all. */
  function reopenAfterSend() {
    var key = null;
    try { key = sessionStorage.getItem('fye_popup_sent'); } catch (err) {}
    try { sessionStorage.removeItem('fye_popup_sent'); } catch (err) {}

    // ?fyep= is honoured as a fallback: older links and manual tests use it.
    if (!key) {
      var match = /[?&]fyep=([^&#]+)/.exec(window.location.search);
      if (match) key = decodeURIComponent(match[1]);
    }
    if (!key) return;

    var el = panel(key);
    if (!el) return;

    /* Only reopen when this popup is ACTUALLY showing its success panel.
       Without this test a stale key reopens an empty form in the visitor's
       face, which is exactly the bug this patch exists to fix. */
    if (!el.querySelector('[data-fye-popup-done]')) return;

    open(el);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', reopenAfterSend);
  } else {
    reopenAfterSend();
  }
})();


/* ============================================================================
   SMOKE TEST LOADER — appended 02/09/2026

   Pulls in assets/fye-debug.js, which defines window.fyeSmoke(), but ONLY when
   asked for:

     ...?fyedebug=1        loads it, and remembers for the rest of the session
     ...?fyedebug=0        forgets it

   Real visitors never download it. The flag is kept in sessionStorage so a
   whole flow can be clicked through without re-adding the parameter, and dies
   with the tab.

   Deliberately not in theme.liquid: Liquid cannot read query parameters, so
   gating there would mean loading it for everyone or only in the theme editor.
   ========================================================================== */
(function () {
  var KEY = 'fye_debug';
  var on = false;

  try {
    var m = /[?&]fyedebug=([^&#]*)/.exec(location.search);
    if (m) {
      on = m[1] !== '0' && m[1] !== 'false';
      if (on) sessionStorage.setItem(KEY, '1');
      else sessionStorage.removeItem(KEY);
    } else {
      on = sessionStorage.getItem(KEY) === '1';
    }
  } catch (err) {
    on = /[?&]fyedebug=1/.test(location.search);
  }

  /* The gate now lives inline in layout/theme.liquid, where it cannot go
     stale — see the comment there. This block stays only so an old cached
     copy of THIS file does not load a second one. */
  if (window.__fyeDebugGate) return;
  if (!on || window.fyeSmoke) return;

  var el = document.createElement('script');

  /* Resolved from this script's own src so it works on the CDN without Liquid
     having to write the URL in — but the inherited ?v= MUST be stripped and
     replaced. It is fye-ui.js's version hash, not fye-debug.js's: editing the
     debug file alone leaves the URL identical and the browser serves its
     cached copy forever. That cost two runs of confusion on 02/09/2026, where
     sharpened checks appeared to have no effect at all.

     A per-load buster is right here: this asset is only ever fetched when
     someone has explicitly asked for it, so it should never be cached. */
  var mine = document.querySelector('script[src*="fye-ui.js"]');
  var base = mine
    ? mine.src.split('?')[0].replace(/fye-ui\.js$/, 'fye-debug.js')
    : '/assets/fye-debug.js';
  el.src = base + '?fyedebug=' + Date.now();
  el.onerror = function () {
    console.warn('fyeSmoke: assets/fye-debug.js did not load — is it in the theme?');
  };
  document.head.appendChild(el);
})();


/* ============================================================================
   GUIDE DOWNLOAD PAGE — appended 02/09/2026
   sections/guide-download.liquid

   Sends the browser to the PDF after a delay, once per session per guide, and
   reports the download to gtag/fbq if either is present. Ported from live's
   inline script; the numbers and the sessionStorage key semantics are
   unchanged.

   WHY THE GUARDS: a bfcache restore (back button) or a backgrounded tab both
   fire timers, and without the checks someone returning to this page gets a
   second unexpected download. Live worked that out and it is kept.
   ========================================================================== */
(function () {
  var el = document.querySelector('[data-fye-guide-dl]');
  if (!el) return;

  var pdf = el.getAttribute('data-pdf');
  if (!pdf) return;
  var name = el.getAttribute('data-name') || 'guide';
  var delay = parseInt(el.getAttribute('data-delay') || '1200', 10);
  var key = 'fye_guide_' + name;

  function track(method) {
    try {
      if (typeof gtag === 'function') {
        gtag('event', 'guide_download', { guide_name: name, guide_url: pdf, method: method });
      }
      if (typeof fbq === 'function') {
        fbq('trackCustom', 'GuideDownload', { guide_name: name, method: method });
      }
    } catch (err) {}
  }

  var btn = el.querySelector('[data-fye-guide-btn]');
  if (btn) {
    btn.addEventListener('click', function () { track('manual'); });
  }

  var restored = false;
  window.addEventListener('pageshow', function (e) { if (e.persisted) restored = true; });

  var already = false;
  try { already = sessionStorage.getItem(key) === '1'; } catch (err) {}
  if (already) return;

  window.setTimeout(function () {
    if (restored || document.visibilityState !== 'visible') return;
    try { sessionStorage.setItem(key, '1'); } catch (err) {}
    track('automatic');
    window.location.href = pdf;
  }, delay);
})();

/* ============================================================================
   RING FINDER — sections/fye-ring-finder.liquid, page.find-your-ring.
   Added 03/09/2026, results made inline the same day.

   One step at a time. Every answer becomes a native Shopify filter param;
   "I'm flexible" (empty value) adds nothing. When the last question is
   answered the matching rings are fetched from the collection itself —
   /collections/<handle>?<filters>&view=fye-finder, which is
   templates/collection.fye-finder.liquid under layout none — so the filtering
   is Shopify's own and the shopper never has to press a button to see stock.

   A param beginning fye_ is NOT sent to the collection (nothing can filter on
   it); it travels with the enquiry instead.

   Returns early when the section is absent, so this costs nothing on every
   other page. All clicks are delegated from document (conventions §6).
   ========================================================================== */
(function () {
  'use strict';
  var root = document.querySelector('[data-fye-finder]');
  if (!root) return;

  var NS = 'filter.p.m.filters.';
  var state = { journey: null, url: '', label: '', answers: [] };
  var req = 0;

  function all(sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); }
  function one(sel) { return root.querySelector(sel); }
  function panel(name) { return one('[data-fye-finder-panel="' + name + '"]'); }
  function steps() {
    return all('[data-fye-finder-step]').filter(function (s) {
      return (s.getAttribute('data-fye-finder-journey') || '').trim() === state.journey;
    });
  }

  // One answer -> zero or more "key=value" strings, already encoded.
  function encode(param, value) {
    if (!value) return [];
    var out = [];
    if (value.indexOf('=') > -1) {
      value.split('&').forEach(function (pair) {
        var i = pair.indexOf('=');
        out.push(NS + pair.slice(0, i).trim() + '=' + encodeURIComponent(pair.slice(i + 1).trim()));
      });
      return out;
    }
    if (!param || param.indexOf('fye_') === 0) return out;
    if (value.indexOf('..') > -1) {
      var r = value.split('..');
      if (r[0]) out.push(NS + param + '.gte=' + encodeURIComponent(r[0]));
      if (r[1]) out.push(NS + param + '.lte=' + encodeURIComponent(r[1]));
      return out;
    }
    return [NS + param + '=' + encodeURIComponent(value)];
  }

  function chosen() {
    return state.answers.filter(function (a) { return a.value; });
  }

  function say(n, shown) {
    if (n === 0) return 'No exact match in stock';
    if (n === 1) return 'One design matches';
    if (shown < n) return n + ' designs match, showing the first ' + shown;
    return n + ' designs match';
  }

  function results() {
    var parts = [];
    state.answers.forEach(function (a) { parts = parts.concat(encode(a.param, a.value)); });
    var query = parts.join('&');
    var collUrl = state.url + (query ? '?' + query : '');
    var link = one('[data-fye-finder-results]');
    var grid = one('[data-fye-finder-grid]');
    var count = one('[data-fye-finder-count]');
    var chips = one('[data-fye-finder-chips]');
    var field = one('[data-fye-finder-answers-field]');

    var picked = chosen();
    if (chips) {
      chips.textContent = picked.length
        ? picked.map(function (a) { return a.label; }).join('  \u00b7  ')
        : 'You kept every option open, so this is the whole collection.';
    }
    if (field) {
      field.value = state.label + ' — ' + (state.answers.length
        ? state.answers.map(function (a) { return a.q + ': ' + a.label; }).join('; ')
        : 'no answers given');
    }
    link.setAttribute('href', collUrl);
    link.hidden = true;

    count.textContent = 'Finding rings\u2026';
    grid.setAttribute('aria-busy', 'true');
    var mine = ++req;

    fetch(state.url + '?' + (query ? query + '&' : '') + 'view=fye-finder', {
      headers: { 'X-Requested-With': 'fetch' }
    })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function (html) {
        if (mine !== req) return;
        var box = document.createElement('div');
        box.innerHTML = html;
        var wrap = box.querySelector('[data-count]');
        var n = wrap ? parseInt(wrap.getAttribute('data-count'), 10) : 0;
        var shown = wrap ? parseInt(wrap.getAttribute('data-shown'), 10) : 0;
        grid.textContent = '';
        if (wrap) grid.appendChild(wrap);
        grid.removeAttribute('aria-busy');
        count.textContent = say(n, shown);
        link.hidden = n === 0;
      })
      .catch(function () {
        if (mine !== req) return;
        grid.textContent = '';
        grid.removeAttribute('aria-busy');
        count.textContent = 'We could not load the rings just now.';
        link.hidden = false;
      });
  }

  function render() {
    all('[data-fye-finder-panel], [data-fye-finder-step]').forEach(function (p) { p.hidden = true; });
    var prog = one('[data-fye-finder-progress]');
    var back = one('[data-fye-finder-back]');
    var show;

    if (!state.journey) {
      show = panel('journeys');
      prog.hidden = true;
      back.hidden = true;
    } else {
      var list = steps();
      var i = state.answers.length;
      back.hidden = false;
      if (!list.length) {
        console.warn('[fye finder] no step blocks match journey key "' + state.journey +
          '". Check each step block\'s Journey key against the journey block\'s Key.');
      }
      if (i < list.length) {
        show = list[i];
        prog.textContent = state.label + ' \u00b7 Step ' + (i + 1) + ' of ' + list.length;
        prog.hidden = false;
      } else {
        show = panel('results');
        prog.textContent = state.label;
        prog.hidden = false;
        results();
      }
    }
    show.hidden = false;
    var q = show.querySelector('[data-fye-finder-question]');
    if (q) q.focus({ preventScroll: true });
    var top = root.getBoundingClientRect().top;
    if (top < 0) window.scrollBy({ top: top - 24, behavior: 'smooth' });
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!(t instanceof Element) || !root.contains(t)) return;

    var j = t.closest('a[data-fye-finder-journey]');
    if (j) {
      e.preventDefault();
      state = {
        journey: (j.getAttribute('data-fye-finder-journey') || '').trim(),
        url: j.getAttribute('data-fye-finder-collection') || j.getAttribute('href'),
        label: j.getAttribute('data-fye-finder-label') || j.textContent.trim(),
        answers: []
      };
      render();
      return;
    }

    var o = t.closest('[data-fye-finder-option]');
    if (o) {
      var step = o.closest('[data-fye-finder-step]');
      var q = step.querySelector('[data-fye-finder-question]');
      state.answers.push({
        q: q ? q.textContent.trim() : '',
        label: o.getAttribute('data-fye-finder-label') || o.textContent.trim(),
        param: step.getAttribute('data-fye-finder-param') || '',
        value: o.getAttribute('data-fye-finder-value') || ''
      });
      render();
      return;
    }

    if (t.closest('[data-fye-finder-back]')) {
      if (state.answers.length) state.answers.pop();
      else state.journey = null;
      render();
      return;
    }

    if (t.closest('[data-fye-finder-restart]')) {
      state = { journey: null, url: '', label: '', answers: [] };
      render();
    }
  });
})();
