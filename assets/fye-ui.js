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
