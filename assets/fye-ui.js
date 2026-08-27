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

  /* ---- Drawers ----------------------------------------------------------
     There is more than one drawer on a page now — the mobile nav, and the
     page/collection sidebar below 900px — so drawers are NAMED:

       opener:  <button data-fye-drawer-open="sbar-123" aria-controls="sbar-123">
       drawer:  <div data-fye-drawer="sbar-123">
       closer:  <button data-fye-drawer-close>   (closes the one it sits in)

     The name is matched exactly, so the original valueless pair
     (data-fye-drawer-open / data-fye-drawer, both empty) still finds each
     other and the header keeps working untouched. Prefer named drawers for
     anything new.
     -------------------------------------------------------------------- */

  function findDrawer(name) {
    var all = document.querySelectorAll('[data-fye-drawer]');
    var wanted = name || '';
    for (var i = 0; i < all.length; i++) {
      if ((all[i].getAttribute('data-fye-drawer') || '') === wanted) return all[i];
    }
    return null;
  }

  function opener(name) {
    var all = document.querySelectorAll('[data-fye-drawer-open]');
    var wanted = name || '';
    for (var i = 0; i < all.length; i++) {
      if ((all[i].getAttribute('data-fye-drawer-open') || '') === wanted) return all[i];
    }
    return null;
  }

  function openDrawer(el) {
    if (!el) return;
    var name = el.getAttribute('data-fye-drawer') || '';
    el.classList.add('is-open');
    document.documentElement.style.overflow = 'hidden';
    var btn = opener(name);
    if (btn) btn.setAttribute('aria-expanded', 'true');
    var focusable = el.querySelector('a, button, input, select');
    if (focusable) focusable.focus();
  }

  function closeDrawer(el) {
    if (!el) return;
    var name = el.getAttribute('data-fye-drawer') || '';
    el.classList.remove('is-open');
    /* Only release the scroll lock once nothing is left open. */
    if (!document.querySelector('[data-fye-drawer].is-open')) {
      document.documentElement.style.overflow = '';
    }
    var btn = opener(name);
    if (btn) {
      btn.setAttribute('aria-expanded', 'false');
      btn.focus();
    }
  }

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
      /* Close the drawer this button lives in; fall back to the unnamed one. */
      closeDrawer(hit.closest('[data-fye-drawer]') || findDrawer(''));
      return;
    }

    /* Click the scrim (the drawer element itself, not its panel) to dismiss. */
    if (e.target.matches('[data-fye-drawer]')) {
      closeDrawer(e.target);
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

    /* ---- Generic disclosure --------------------------------------------
       Used by the sidebar's nested collection lists, among others. */
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
})();
