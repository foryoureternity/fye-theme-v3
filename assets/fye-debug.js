/* ============================================================================
   fye-debug.js — the smoke test. NOT loaded for visitors.

   Loaded only when the URL carries ?fyedebug=1 (or once sessionStorage has
   fye_debug set, so it survives clicking through a flow). The loader lives at
   the end of assets/fye-ui.js.

   Written 02/09/2026. The docs had been carrying "fyeSmoke() has not been run"
   since August for a helper that WAS NEVER BUILT — it existed in prose only.
   This is it, for real.

   Usage, in the browser console:
     fyeSmoke()            run every check, print a report
     fyeSmoke('targets')   run one group
     fyeSmoke.groups       list the group names

   It NEVER mutates the page. Every check is a read. Run it, fix, reload.

   Widths cannot be driven from here — a script cannot resize the window it is
   in. Use devtools responsive mode and re-run at each of 1440 / 899 / 748 /
   559, which are this theme's own breakpoints (900 and 560 are where the
   layouts reflow, so 899 and 559 are the interesting ones).
   ========================================================================== */
(function () {
  'use strict';

  var MIN_TARGET = 44;   // brand rule: no tap target under 44px, ON TOUCH
  var MIN_TYPE = 12;     // reading text under this is unreadable on a phone
  var MIN_MICRO = 10;    // eyebrows and field labels are 11px BY DESIGN

  /* 44px is a touch rule, not a universal one: an 18px utility-bar link under
     a mouse at 1470px is fine, and flagging it buries the real faults. The
     theme reflows at 900, so that is the line. */
  function touchish() {
    try {
      if (window.matchMedia('(pointer: coarse)').matches) return true;
    } catch (err) {}
    return document.documentElement.clientWidth <= 900;
  }

  /* An eyebrow, a field label, a trust-strip caption: uppercase, tracked,
     11px, straight from the design system. Judged at 10px, not 12px. */
  function isMicroLabel(el, cs) {
    if (cs.textTransform === 'uppercase') return true;
    if (parseFloat(cs.letterSpacing) >= 0.5) return true;
    if (el.tagName === 'LABEL' || el.tagName === 'LEGEND') return true;
    // A numeric badge (cart count, filter tally) is a glyph, not reading text.
    if (/^\d{1,3}$/.test((el.textContent || '').trim())) return true;
    return false;
  }

  function visible(el) {
    if (!el || !el.getBoundingClientRect) return false;
    var cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return false;
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  function where(el) {
    var bits = [el.tagName.toLowerCase()];
    if (el.id) bits.push('#' + el.id);
    if (el.className && typeof el.className === 'string') {
      var first = el.className.trim().split(/\s+/).slice(0, 2).join('.');
      if (first) bits.push('.' + first);
    }
    var sect = el.closest('[data-screen-label]');
    var label = sect ? sect.getAttribute('data-screen-label') : null;
    return bits.join('') + (label ? '  [' + label + ']' : '');
  }

  function text(el) {
    return (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60);
  }

  /* ---- the checks. Each returns an array of plain strings. --------------- */

  var verbose = false;

  var checks = {

    /* The single most common responsive fault: something pushes the page
       wider than the viewport and the whole document scrolls sideways. */
    overflow: function () {
      var out = [];
      var vw = document.documentElement.clientWidth;
      if (document.documentElement.scrollWidth > vw + 1) {
        out.push('DOCUMENT scrolls sideways: ' + document.documentElement.scrollWidth + 'px in a ' + vw + 'px viewport');
      }
      var all = document.body.querySelectorAll('*');
      var seen = 0;
      for (var i = 0; i < all.length && seen < 12; i++) {
        var el = all[i];
        if (!visible(el)) continue;
        var cs = getComputedStyle(el);
        if (cs.position === 'fixed') continue;           // headers legitimately span
        var r = el.getBoundingClientRect();
        if (r.right > vw + 2 || r.left < -2) {
          out.push('overflows by ' + Math.round(Math.max(r.right - vw, -r.left)) + 'px: ' + where(el));
          seen++;
        }
      }
      return out;
    },

    /* 44px minimum, and it is measured, not assumed — padding on an inline
       link is the usual reason a 15px link passes or fails. */
    targets: function () {
      var out = [];
      if (!touchish()) {
        return ['skipped — 44px is a touch rule. Re-run at 899px or narrower, or in devtools device mode.'];
      }
      var sel = 'a, button, [role="button"], input:not([type="hidden"]), select, textarea, summary';
      document.querySelectorAll(sel).forEach(function (el) {
        if (!visible(el)) return;
        if (el.closest('[data-fye-debug-skip]')) return;
        // Deliberately hidden affordances (the skip link) are not targets.
        if (el.closest('.visually-hidden')) return;
        if (el.classList.contains('visually-hidden')) return;

        /* Inert by design is not a target. The footer's column headings are
           <summary> elements with pointer-events:none above 769px — headings
           there, tappable rows only below 768px. */
        if (getComputedStyle(el).pointerEvents === 'none') return;

        // Inline links in running text are words in a sentence, not controls.
        if (el.tagName === 'A' && el.closest('p, li, .prose, .lead, .fine, .crumbs, nav[aria-label*="readcrumb"]')) return;

        var r = el.getBoundingClientRect();

        /* A checkbox or radio is 18px on purpose — what gets tapped is the
           label wrapping it. Measure that instead. */
        if (el.type === 'checkbox' || el.type === 'radio') {
          var lab = el.closest('label');
          if (lab) {
            var lr = lab.getBoundingClientRect();
            if (lr.height >= MIN_TARGET - 0.5) return;
          }
        }

        if (r.height < MIN_TARGET - 0.5 || r.width < 24) {
          out.push(Math.round(r.width) + '×' + Math.round(r.height) + '  "' + text(el) + '"  ' + where(el));
        }
      });
      return out;
    },

    type: function () {
      var out = [];
      document.body.querySelectorAll('*').forEach(function (el) {
        if (!visible(el)) return;
        if (!el.firstChild || el.firstChild.nodeType !== 3) return;   // own text only
        if (!text(el)) return;
        var cs = getComputedStyle(el);
        var px = parseFloat(cs.fontSize);
        if (!px) return;
        var floor = isMicroLabel(el, cs) ? MIN_MICRO : MIN_TYPE;
        if (px < floor) {
          out.push(px.toFixed(1) + 'px  (floor ' + floor + ')  "' + text(el) + '"  ' + where(el));
        }
      });
      return out;
    },

    /* The fault that cost a dead homepage button: a trigger whose key has no
       matching popup block, or a popup nothing can open. */
    popups: function () {
      var out = [];
      var panels = {};
      document.querySelectorAll('[data-fye-popup-panel]').forEach(function (p) {
        panels[p.getAttribute('data-fye-popup-panel')] = true;
      });
      var triggers = {};
      document.querySelectorAll('[data-fye-popup]').forEach(function (t) {
        var key = t.getAttribute('data-fye-popup');
        triggers[key] = true;
        if (!panels[key]) {
          out.push('trigger opens nothing — key "' + key + '"  "' + text(t) + '"  ' + where(t));
        }
      });
      /* The other direction — a popup with no trigger HERE — is normal: they
         all live in footer-group.json so one copy serves every page. Nine
         lines of it on every run buried the half that matters. Ask for it:
         fyeSmoke('popups', true) */
      if (verbose) {
        Object.keys(panels).forEach(function (key) {
          if (key === 'contact-page') return;            // a page section, not a popup
          if (!triggers[key]) out.push('(verbose) popup "' + key + '" has no trigger on this page');
        });
      }
      // A class-only hook is the historical trap — flag any left behind.
      document.querySelectorAll('[class*="open-"]').forEach(function (el) {
        if (!el.hasAttribute('data-fye-popup')) {
          out.push('class hook with no data-fye-popup beside it: ' + where(el));
        }
      });
      return out;
    },

    images: function () {
      var out = [];
      document.querySelectorAll('img').forEach(function (im) {
        if (im.getAttribute('alt') === null) out.push('no alt attribute: ' + (im.currentSrc || im.src || '').split('/').pop().split('?')[0] + '  ' + where(im));
        if (im.complete && im.naturalWidth === 0) out.push('BROKEN image: ' + (im.currentSrc || im.src || '').split('/').pop().split('?')[0] + '  ' + where(im));
      });
      return out;
    },

    forms: function () {
      var out = [];
      document.querySelectorAll('input:not([type="hidden"]), select, textarea').forEach(function (el) {
        if (!visible(el)) return;
        var labelled = el.getAttribute('aria-label') ||
                       el.getAttribute('aria-labelledby') ||
                       el.closest('label') ||
                       (el.id && document.querySelector('label[for="' + el.id + '"]'));
        if (!labelled) out.push('control with no label: ' + where(el));
        if (el.name && el.name.indexOf('contact[') === 0 && !el.name.match(/\]$/)) {
          out.push('malformed contact field name: ' + el.name);
        }
      });
      return out;
    },

    /* Undefined link colour shows as browser blue and is invisible until
       someone adds a link in the editor — cheap to catch, embarrassing to ship. */
    palette: function () {
      var out = [];
      document.querySelectorAll('a').forEach(function (a) {
        if (!visible(a)) return;
        var c = getComputedStyle(a).color.replace(/\s/g, '');
        if (c === 'rgb(0,0,238)' || c === 'rgb(0,0,255)') {
          out.push('browser-default blue link: "' + text(a) + '"  ' + where(a));
        }
      });
      return out;
    },

    structure: function () {
      var out = [];
      var h1 = document.querySelectorAll('h1');
      if (h1.length === 0) out.push('no h1 on the page');
      if (h1.length > 1) out.push(h1.length + ' h1 elements — should be one');

      var last = 0;
      document.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(function (h) {
        if (!visible(h)) return;
        var lvl = +h.tagName[1];
        if (last && lvl > last + 1) out.push('heading jumps h' + last + ' → h' + lvl + ': "' + text(h) + '"');
        last = lvl;
      });

      var ids = {};
      document.querySelectorAll('[id]').forEach(function (el) {
        if (ids[el.id]) out.push('duplicate id "' + el.id + '"');
        ids[el.id] = true;
      });
      return out;
    },

    /* Liquid that printed instead of rendering — a rich-text field output
       without metafield_tag looks exactly like this. */
    liquid: function () {
      var out = [];
      var body = document.body.innerText || '';
      ['{{', '{%', 'Liquid error', '"type"=>"root"', '{"type":"root"'].forEach(function (needle) {
        var i = body.indexOf(needle);
        if (i !== -1) out.push('raw ' + needle + ' on the page: …' + body.slice(Math.max(0, i - 40), i + 60).replace(/\s+/g, ' ') + '…');
      });
      return out;
    }
  };

  /* ---- runner ----------------------------------------------------------- */

  function run(only, beVerbose) {
    verbose = !!beVerbose;
    var names = only ? [only] : Object.keys(checks);
    var vw = document.documentElement.clientWidth;
    var fails = 0, total = 0;

    console.log('%cfyeSmoke  ' + vw + 'px  ' + location.pathname,
                'font-weight:600;color:#233D47;background:#F2F1E8;padding:2px 6px');

    names.forEach(function (name) {
      if (!checks[name]) { console.warn('no such check: ' + name); return; }
      var issues;
      try {
        issues = checks[name]() || [];
      } catch (err) {
        console.error(name + ' — the check itself threw:', err);
        return;
      }
      total++;
      if (!issues.length) {
        console.log('%c  pass  %c' + name, 'color:#6E836E;font-weight:600', 'color:#233D47');
        return;
      }
      fails++;
      console.groupCollapsed('%c  ' + issues.length + '  %c' + name,
                             'color:#8a4a4a;font-weight:600', 'color:#233D47');
      issues.forEach(function (line) { console.log(line); });
      console.groupEnd();
    });

    console.log(fails === 0
      ? '%call ' + total + ' groups clean at ' + vw + 'px'
      : '%c' + fails + ' of ' + total + ' groups need a look at ' + vw + 'px',
      'color:' + (fails === 0 ? '#6E836E' : '#8a4a4a') + ';font-weight:600');

    console.log('%cre-run at 1440 / 899 / 748 / 559 in devtools responsive mode — a script cannot resize its own window',
                'color:#879B87');
  }

  run.groups = Object.keys(checks);
  run.checks = checks;
  window.fyeSmoke = run;

  console.log('%cfyeSmoke ready%c — call fyeSmoke() or fyeSmoke(\'targets\')',
              'font-weight:600;color:#233D47', 'color:#879B87');
})();
