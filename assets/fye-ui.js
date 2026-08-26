/* ============================================================================
   fye-ui.js — FYE v3 interaction layer
   ----------------------------------------------------------------------------
   Vanilla, no dependencies, no jQuery. Replaces the old theme's 535KB T4S core.

   Everything here is delegated from document, so it works for markup added
   later (section re-render in the theme editor, AJAX, etc.) without re-binding.
   Add behaviours as small named functions; keep this file small enough to read.
   ========================================================================== */
(function () {
  'use strict';

  /* ---- Mobile nav drawer ------------------------------------------------ */
  var drawer = function () {
    var el = document.querySelector('[data-fye-drawer]');
    if (!el) return null;
    return {
      el: el,
      open: function () {
        el.classList.add('is-open');
        document.documentElement.style.overflow = 'hidden';
        var btn = document.querySelector('[data-fye-drawer-open]');
        if (btn) btn.setAttribute('aria-expanded', 'true');
        var focusable = el.querySelector('a, button');
        if (focusable) focusable.focus();
      },
      close: function () {
        el.classList.remove('is-open');
        document.documentElement.style.overflow = '';
        var btn = document.querySelector('[data-fye-drawer-open]');
        if (btn) {
          btn.setAttribute('aria-expanded', 'false');
          btn.focus();
        }
      }
    };
  };

  document.addEventListener('click', function (e) {
    var d;

    if (e.target.closest('[data-fye-drawer-open]')) {
      e.preventDefault();
      d = drawer();
      if (d) d.open();
      return;
    }

    if (e.target.closest('[data-fye-drawer-close]')) {
      e.preventDefault();
      d = drawer();
      if (d) d.close();
      return;
    }

    /* Click the scrim (the drawer element itself, not its panel) to dismiss. */
    if (e.target.matches('[data-fye-drawer]')) {
      d = drawer();
      if (d) d.close();
      return;
    }

    /* ---- Back to top --------------------------------------------------- */
    if (e.target.closest('[data-fye-top]')) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
      });
      return;
    }

    /* ---- Generic disclosure -------------------------------------------- */
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
    var d = drawer();
    if (d && d.el.classList.contains('is-open')) d.close();
  });
})();
