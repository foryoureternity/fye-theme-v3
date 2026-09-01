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
