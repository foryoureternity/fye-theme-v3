/*
 * layout-smoke-test.js — FYE v3
 *
 * Paste into the browser console on any v3 page. Returns a compact report of
 * the layout faults that have actually cost this build time, rather than a
 * generic audit. Nothing is mutated; safe to run on live.
 *
 * Written 31/08/2026. Each check exists because the fault it finds got shipped:
 *
 *   overflow      the 845px phantom width from .visually-hidden (27/08)
 *   srOnly        that same class: a 1px box with no clipping is not hidden
 *   tap           44px minimum, brand rule for mobile
 *   bands         two same-colour sections meeting = 160px of dead space
 *   media         a media query sitting above the base rules it overrides
 *   unclosed      a missing </a> looks exactly like a CSS bug
 *
 * Usage:
 *   fyeSmoke()            // report at the current viewport
 *   fyeSmoke({verbose:1}) // include the passing checks too
 *
 * Resize the window and re-run for each breakpoint: 1440, 899, 748, 559.
 */
(function () {
  'use strict';

  function px(n) { return Math.round(n * 10) / 10; }
  function label(el) {
    if (!el || el === document.documentElement) return 'html';
    var s = el.tagName.toLowerCase();
    if (el.id) return s + '#' + el.id;
    var cls = (el.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean).slice(0, 2);
    return cls.length ? s + '.' + cls.join('.') : s;
  }
  function path(el) {
    var out = [], n = el, i = 0;
    while (n && n.nodeType === 1 && i++ < 4) { out.unshift(label(n)); n = n.parentElement; }
    return out.join(' > ');
  }

  /* 1. Horizontal overflow, and who is causing it. ------------------------ */
  function checkOverflow() {
    var docW = document.documentElement.clientWidth;
    var scrollW = document.documentElement.scrollWidth;
    var over = [];
    if (scrollW > docW + 1) {
      var all = document.querySelectorAll('body *');
      for (var i = 0; i < all.length; i++) {
        var el = all[i];
        var r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) continue;
        if (r.right > docW + 1) {
          // Report only the outermost offender in each branch — a wide parent
          // makes every child look guilty and buries the actual cause.
          var parent = el.parentElement;
          if (parent && parent.getBoundingClientRect().right > docW + 1) continue;
          over.push({ el: path(el), right: px(r.right), width: px(r.width), overBy: px(r.right - docW) });
        }
      }
      over.sort(function (a, b) { return b.overBy - a.overBy; });
    }
    return {
      name: 'overflow',
      pass: scrollW <= docW + 1,
      detail: scrollW <= docW + 1
        ? 'clientWidth ' + docW + ', no horizontal scroll'
        : 'scrollWidth ' + scrollW + ' vs clientWidth ' + docW + ' (+' + (scrollW - docW) + 'px)',
      items: over.slice(0, 12)
    };
  }

  /* 2. Screen-reader-only text that is not actually clipped. -------------- */
  function checkSrOnly() {
    var bad = [];
    var candidates = document.querySelectorAll(
      '.visually-hidden, .sr-only, .screen-reader-text, [class*="visually-hidden"]'
    );
    for (var i = 0; i < candidates.length; i++) {
      var el = candidates[i];
      var cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      var r = el.getBoundingClientRect();
      var clipped = (cs.clipPath && cs.clipPath !== 'none') ||
                    (cs.clip && cs.clip !== 'auto') ||
                    cs.overflow === 'hidden';
      var offscreen = r.right < 0 || r.bottom < 0;
      var tiny = r.width <= 2 && r.height <= 2;
      if (!clipped && !offscreen && !(tiny && cs.overflow === 'hidden')) {
        bad.push({
          el: path(el), rect: px(r.left) + ',' + px(r.top) + ' ' + px(r.width) + 'x' + px(r.height),
          overflow: cs.overflow, clipPath: cs.clipPath, position: cs.position
        });
      }
    }
    return {
      name: 'srOnly',
      pass: bad.length === 0,
      detail: bad.length ? bad.length + ' hidden-text element(s) not clipped' : 'all clipped',
      items: bad
    };
  }

  /* 3. Tap targets under 44px, visible and interactive only. -------------- */
  function checkTapTargets(min) {
    min = min || 44;
    var small = [];
    var els = document.querySelectorAll('a[href], button, input:not([type="hidden"]), select, textarea, summary, [role="button"], [tabindex]:not([tabindex="-1"])');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || cs.pointerEvents === 'none') continue;
      var r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      // Inline links inside a paragraph are text, not tap targets — skip them.
      if (el.tagName === 'A' && cs.display.indexOf('inline') === 0) {
        var p = el.closest('p, li, .rte, .t4s-rte');
        if (p) continue;
      }
      if (r.width < min || r.height < min) {
        small.push({ el: path(el), size: px(r.width) + 'x' + px(r.height), text: (el.textContent || '').trim().slice(0, 28) });
      }
    }
    return {
      name: 'tap',
      pass: small.length === 0,
      detail: small.length ? small.length + ' target(s) under ' + min + 'px' : 'all >= ' + min + 'px',
      items: small.slice(0, 20)
    };
  }

  /* 4. Adjacent same-ground sections — the band-collapse rule. ------------ */
  function checkBands() {
    var runs = [], prev = null;
    var sections = document.querySelectorAll('.shopify-section, [class*="band--"]');
    for (var i = 0; i < sections.length; i++) {
      var sec = sections[i];
      var band = sec.querySelector('[class*="band--"]') || sec;
      var bg = getComputedStyle(band).backgroundColor;
      if (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') { prev = null; continue; }
      if (prev && prev.bg === bg) {
        var gap = px(band.getBoundingClientRect().top - prev.bottom);
        runs.push({ a: prev.el, b: path(band), bg: bg, gapPx: gap });
      }
      prev = { bg: bg, el: path(band), bottom: band.getBoundingClientRect().bottom };
    }
    return {
      name: 'bands',
      pass: runs.length === 0,
      detail: runs.length ? runs.length + ' same-ground neighbour(s) — check the :has() collapse rule' : 'no same-ground neighbours',
      items: runs
    };
  }

  /* 5. Media queries declared before the base rules they override. -------- */
  function checkMediaOrder() {
    var offenders = [];
    for (var s = 0; s < document.styleSheets.length; s++) {
      var sheet = document.styleSheets[s], rules;
      try { rules = sheet.cssRules; } catch (e) { continue; } // cross-origin
      if (!rules) continue;
      var sawMedia = false, firstMediaIndex = -1;
      for (var r = 0; r < rules.length; r++) {
        var rule = rules[r];
        if (rule.type === CSSRule.MEDIA_RULE) {
          if (!sawMedia) { sawMedia = true; firstMediaIndex = r; }
        } else if (rule.type === CSSRule.STYLE_RULE && sawMedia) {
          offenders.push({
            sheet: (sheet.href || 'inline').split('/').pop(),
            firstMediaAt: firstMediaIndex,
            baseRuleAt: r,
            selector: rule.selectorText.slice(0, 70)
          });
          break; // one report per sheet is enough to send you looking
        }
      }
    }
    return {
      name: 'mediaOrder',
      pass: offenders.length === 0,
      detail: offenders.length ? offenders.length + ' sheet(s) with base rules after a media query' : 'media queries last in every readable sheet',
      items: offenders
    };
  }

  /* 6. Nesting the parser had to repair — a missing close tag. ------------ */
  function checkNesting() {
    var bad = [];
    var anchors = document.querySelectorAll('a a, button button, a button, p div, p p');
    for (var i = 0; i < anchors.length && i < 20; i++) {
      bad.push({ el: path(anchors[i]), note: 'illegal nesting — likely a missing close tag upstream' });
    }
    return {
      name: 'nesting',
      pass: bad.length === 0,
      detail: bad.length ? bad.length + ' illegally nested element(s)' : 'no illegal nesting',
      items: bad
    };
  }

  window.fyeSmoke = function (opts) {
    opts = opts || {};
    var checks = [
      checkOverflow(), checkSrOnly(), checkTapTargets(opts.minTap),
      checkBands(), checkMediaOrder(), checkNesting()
    ];
    var failed = checks.filter(function (c) { return !c.pass; });

    console.log('%cFYE layout smoke test', 'font:600 13px system-ui', '— ' +
      window.innerWidth + 'x' + window.innerHeight + ' — ' + location.pathname);

    checks.forEach(function (c) {
      if (c.pass && !opts.verbose) { console.log('  ok   ' + c.name + ' — ' + c.detail); return; }
      if (c.pass) { console.log('  ok   ' + c.name + ' — ' + c.detail); return; }
      console.group('%c  FAIL ' + c.name + ' — ' + c.detail, 'color:#b00');
      if (c.items.length) console.table(c.items);
      console.groupEnd();
    });

    return { viewport: window.innerWidth, failed: failed.map(function (c) { return c.name; }), checks: checks };
  };

  console.log('fyeSmoke() ready — run it at 1440, 899, 748 and 559.');
})();
