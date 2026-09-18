/* fye-finish.js — the plain-ring finish picker.

   Its markup is snippets/fye-buybox-finish.liquid; read that file's header
   for the decisions. This file only carries the behaviour.

   NOT part of fye-ui.js, on purpose. fye-ui.js is 140KB and loads on every
   page; this is ~3KB and is wanted on plain wedding ring pages only, so the
   snippet loads it itself with defer. If a second section ever renders a
   finish picker, that is still true.

   Contract with the markup, all data attributes, no classes as hooks except
   the `is-on` / `hidden` states the theme already uses elsewhere:

     [data-fye-finish]            root
     [data-fye-finish-set]        "no" | "yes" segmented buttons
     [data-fye-finish-pick]       the chosen-finish row in the buy box
     [data-fye-finish-prop]       hidden input, name="properties[Finish]"
     [data-fye-finish-modal]      the modal shell
     [data-fye-ftile]             a tile, carrying data-name/-prop/-hm/-search

   Two states, deliberately separate:

     applied   what the buy box shows and what the cart will receive
     draft     what is highlighted inside the modal

   Cancel and Escape throw the draft away. Confirm promotes it. That is the
   whole reason they are not one variable.
*/
(function () {
  'use strict';

  var root = document.querySelector('[data-fye-finish]');
  if (!root) return;

  var POLISHED = {
    prop: 'Polished',
    name: 'Polished',
    hm: '',
    meta: 'Standard finish',
    draftMeta: 'The standard finish, no extra work'
  };

  var q = function (sel, scope) { return (scope || root).querySelector(sel); };
  var all = function (sel, scope) { return Array.prototype.slice.call((scope || root).querySelectorAll(sel)); };

  var modal = q('[data-fye-finish-modal]');
  var panel = q('[data-fye-finish-panel]');
  var pick = q('[data-fye-finish-pick]');
  var prop = q('[data-fye-finish-prop]');
  var hint = q('[data-fye-finish-hint]');
  var reset = q('[data-fye-finish-reset]');
  var search = q('[data-fye-finish-search]');
  var count = q('[data-fye-finish-count]');
  var tiles = all('[data-fye-ftile]');

  var out = {
    thumb: q('[data-fye-finish-thumb]'),
    name: q('[data-fye-finish-name]'),
    meta: q('[data-fye-finish-meta]')
  };
  var foot = {
    thumb: q('[data-fye-finish-draftimg]'),
    name: q('[data-fye-finish-draftname]'),
    meta: q('[data-fye-finish-draftmeta]')
  };

  var applied = tiles[0] || null;   /* the Polished tile */
  var draft = applied;
  var lastFocus = null;

  /* ---- reading a tile ---------------------------------------------------
     A tile is the source of truth for its own copy, so the property string
     is composed once, in Liquid, where the HM number lives. Nothing here
     rebuilds "Name (HM 38)" from parts. */

  function read(tile) {
    if (!tile) return POLISHED;
    var img = tile.querySelector('img');
    return {
      prop: tile.getAttribute('data-prop') || POLISHED.prop,
      name: tile.getAttribute('data-name') || POLISHED.name,
      hm: tile.getAttribute('data-hm') || '',
      src: img ? img.getAttribute('src') : '',
      isPolished: tile === tiles[0]
    };
  }

  /* ---- painting --------------------------------------------------------- */

  function paintApplied() {
    var f = read(applied);
    if (prop) prop.value = f.prop;
    if (out.name) out.name.textContent = f.name;
    if (out.meta) out.meta.textContent = f.isPolished ? POLISHED.meta : f.hm;
    if (out.thumb && f.src) out.thumb.src = f.src;
    if (reset) reset.hidden = f.isPolished;
  }

  function paintDraft() {
    var f = read(draft);
    if (foot.name) foot.name.textContent = f.name;
    if (foot.meta) foot.meta.textContent = f.isPolished ? POLISHED.draftMeta : f.hm;
    if (foot.thumb && f.src) foot.thumb.src = f.src;

    tiles.forEach(function (t) {
      var on = t === draft;
      t.classList.toggle('is-on', on);
      t.setAttribute('aria-checked', on ? 'true' : 'false');
    });
  }

  /* ---- the toggle -------------------------------------------------------
     Yes opens the picker immediately: the toggle is the way in, not a switch
     with nothing behind it. No returns the ring to polished outright, so a
     shopper who changes their mind does not leave a finish on the order. */

  function setToggle(on) {
    all('[data-fye-finish-set]').forEach(function (b) {
      var isOn = (b.getAttribute('data-fye-finish-set') === 'yes') === on;
      b.classList.toggle('is-on', isOn);
      b.setAttribute('aria-checked', isOn ? 'true' : 'false');
    });
    if (pick) pick.hidden = !on;
    if (hint) hint.hidden = on;
  }

  /* ---- the modal --------------------------------------------------------
     `hidden` plus the root-element scroll lock, matching the diamond
     picker in fye-ui.js. Focus moves to
     the panel and returns to whatever opened it, because a modal that leaves
     the caret at the top of the document is unusable by keyboard. */

  function open() {
    if (!modal) return;
    lastFocus = document.activeElement;
    draft = applied;
    paintDraft();
    filter('');
    if (search) search.value = '';
    modal.hidden = false;
    /* This theme locks scroll on the root element, not with a body
       class: see openDrawer / openPicker in fye-ui.js. No such body
       class rule exists anywhere in v3, so the page would otherwise
       have carried on scrolling behind the modal. */
    document.documentElement.style.overflow = 'hidden';
    if (panel) panel.focus();
  }

  function close() {
    if (!modal) return;
    modal.hidden = true;
    /* Release only once nothing else is holding the lock, matching
       closeDrawer / closePicker in fye-ui.js. */
    if (!document.querySelector('[data-fye-picker]:not([hidden])') &&
        !document.querySelector('[data-fye-drawer].is-open')) {
      document.documentElement.style.overflow = '';
    }
    draft = applied;
    paintDraft();
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* ---- search -----------------------------------------------------------
     Matches the customer name and the HM number, because a shopper on the
     phone to us will be reading the number back. Tiles are hidden rather
     than removed, so the grid does not reflow into a different order when
     the field is cleared. */

  function filter(term) {
    var t = String(term || '').trim().toLowerCase();
    var shown = 0;

    tiles.forEach(function (tile) {
      var hay = tile.getAttribute('data-search') || '';
      var hit = !t || hay.indexOf(t) > -1;
      tile.hidden = !hit;
      if (hit) shown++;
    });

    if (count) {
      count.textContent = t
        ? shown + (shown === 1 ? ' match' : ' matches')
        : tiles.length + ' finishes';
    }
  }

  /* ---- wiring ----------------------------------------------------------- */

  root.addEventListener('click', function (e) {
    var el;

    if ((el = e.target.closest('[data-fye-finish-set]'))) {
      var yes = el.getAttribute('data-fye-finish-set') === 'yes';
      setToggle(yes);
      if (yes) {
        open();
      } else {
        applied = tiles[0];
        paintApplied();
        close();
      }
      return;
    }

    if (e.target.closest('[data-fye-finish-open]')) { open(); return; }
    if (e.target.closest('[data-fye-finish-close]')) { close(); return; }
    if (e.target.closest('[data-fye-finish-cancel]')) { close(); return; }

    if (e.target.closest('[data-fye-finish-reset]')) {
      applied = tiles[0];
      paintApplied();
      return;
    }

    if ((el = e.target.closest('[data-fye-ftile]'))) {
      draft = el;
      paintDraft();
      return;
    }

    if (e.target.closest('[data-fye-finish-confirm]')) {
      applied = draft;
      paintApplied();
      close();
    }
  });

  if (search) {
    search.addEventListener('input', function () { filter(search.value); });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal && !modal.hidden) close();
  });

  setToggle(false);
  paintApplied();
  paintDraft();
}());
