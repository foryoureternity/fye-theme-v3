/* ============================================================================
   fye-wishlist.js — the saved list, rendered.
   Loaded only by templates/page.wishlist.json. 01/09/2026.

   The store itself lives in fye-ui.js (window.FYE.wishlist) because the hearts
   are on every page; only the PAGE needs this file.

   ── PRICES ARE FETCHED, NEVER REMEMBERED ──────────────────────────────────

   One /products/<handle>.js per distinct ring, deduped and run in parallel,
   and the price shown is whatever that returns today. Nothing about money is
   read from the saved copy. A ring saved in March and opened in September
   must not quote March's price.

   THE ONE HONEST LIMITATION. A configured ring's companion lines (centre
   stone, side pair, setting fees) are saved as variant ids, and Shopify has
   no way to price a variant id without knowing its product handle — so the
   figure on a card is the SETTING's live price, with the configuration listed
   beneath it, not a configured total. Making it a true total means saving each
   companion's handle at save time too; that is a small change to addOnLines in
   fye-ui.js, not a redesign of this file.

   ── SHARING ───────────────────────────────────────────────────────────────

   ?w= carries the whole list, base64url-encoded, because there is nowhere
   else to put it: no account, nothing server-side. Opening a shared link
   shows the sender's list without touching the recipient's own, and offers to
   save it. A recipient's own list is never silently overwritten.
   ========================================================================== */
(function wishlistPage() {
  var root = document.querySelector('[data-fye-wishlist]');
  if (!root) return;

  /* Resolved in boot(), not here. fye-ui.js defines the store, and nothing
     guarantees it has run by the time this file is parsed — reading it now and
     bailing is what left this page blank while the header count rose. */
  var store = null;

  var grid = root.querySelector('[data-wish-grid]');
  var empty = root.querySelector('[data-wish-empty]');
  var summary = root.querySelector('[data-wish-summary]');
  var tools = root.querySelectorAll('[data-wish-tools]');

  var cache = {};
  var shared = null; /* a list arriving by ?w=, kept apart from the shopper's */

  function money(pennies) {
    return '£' + (Number(pennies) / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* ---- the share URL ----------------------------------------------------
     Only the identifying half travels: handle, variant, properties, lines and
     the note. No prices — the recipient's page fetches its own. */

  function encode(list) {
    var slim = list.map(function (it) {
      return { h: it.handle, v: it.variant, p: it.props, l: it.lines, n: it.note || '' };
    });
    var json = JSON.stringify(slim);
    var b64 = window.btoa(unescape(encodeURIComponent(json)));
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function decode(param) {
    try {
      var b64 = param.replace(/-/g, '+').replace(/_/g, '/');
      var json = decodeURIComponent(escape(window.atob(b64)));
      var slim = JSON.parse(json);
      if (!Array.isArray(slim)) return null;
      return slim.map(function (o) {
        var item = {
          handle: o.h, variant: String(o.v), props: o.p || {}, lines: o.l || [],
          note: o.n || '', title: '', image: '', added: Date.now()
        };
        item.id = store.identify(item);
        return item;
      });
    } catch (e) {
      return null;
    }
  }

  function shareUrl(list) {
    return window.location.origin + window.location.pathname + '?w=' + encode(list);
  }

  /* ---- live product data ------------------------------------------------ */

  function load(handle) {
    if (cache[handle]) return cache[handle];
    cache[handle] = fetch('/products/' + handle + '.js', { headers: { Accept: 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; });
    return cache[handle];
  }

  /* ---- one card ---------------------------------------------------------- */

  function specOf(item) {
    /* The configuration, in the order a jeweller would read it. Machine keys
       never surface: '_' prefixed values and the Ring SKU link are plumbing,
       not information. */
    var out = [];
    Object.keys(item.props || {}).forEach(function (k) {
      if (k.charAt(0) === '_' || k === 'Ring SKU' || k === 'For ring') return;
      if (!item.props[k]) return;
      out.push('<li><b>' + esc(k) + ':</b> ' + esc(item.props[k]) + '</li>');
    });
    return out.join('');
  }

  function card(item, product, readOnly) {
    var variant = null;
    if (product) {
      product.variants.forEach(function (v) {
        if (String(v.id) === String(item.variant)) variant = v;
      });
    }

    var gone = !product;
    var title = product ? product.title : (item.title || 'This ring');
    var url = product ? '/products/' + product.handle + '?variant=' + item.variant : null;
    var img = product
      ? (variant && variant.featured_image ? variant.featured_image.src : product.featured_image)
      : item.image;

    var configured = (item.lines || []).length > 0;
    var priceHtml;

    if (gone) {
      priceHtml = '<p class="wcard__gone">No longer available. Ask us and we will find you something close.</p>';
    } else if (!variant) {
      priceHtml = '<p class="wcard__gone">This option is no longer made.</p>';
    } else if (!variant.available) {
      priceHtml = '<p class="wcard__gone">Currently unavailable.</p>';
    } else {
      priceHtml = '<p class="wcard__price">' + money(variant.price) + '</p>';
      if (configured) {
        /* Said plainly rather than shown as a total we cannot stand behind —
           see the header. */
        priceHtml += '<p class="wcard__stale">Setting only. Your stones are listed below.</p>';
      }
    }

    var spec = specOf(item);

    return '' +
      '<article class="wcard" data-wish-item="' + esc(item.id) + '">' +
        (url
          ? '<a class="wcard__media" href="' + esc(url) + '">'
          : '<span class="wcard__media">') +
          (img
            ? '<img class="wcard__img" src="' + esc(img) + '" alt="" loading="lazy">'
            : '<span class="wcard__img"></span>') +
        (url ? '</a>' : '</span>') +
        /* The remove control used to be a small cross over the corner of the
           image. It was there and nobody found it, so it is a labelled button
           in the row below now — the same word the cart uses. */
        (url
          ? '<a class="wcard__name" href="' + esc(url) + '">' + esc(title) + '</a>'
          : '<span class="wcard__name">' + esc(title) + '</span>') +
        priceHtml +
        (spec ? '<ul class="wcard__spec">' + spec + '</ul>' : '') +
        (readOnly ? (item.note ? '<p class="wcard__stale">' + esc(item.note) + '</p>' : '') :
          '<textarea class="wcard__note" data-wish-note rows="1" ' +
          'placeholder="Note to self">' + esc(item.note || '') + '</textarea>') +
        '<div class="wcard__actions">' +
          (variant && variant.available && !readOnly
            ? '<button type="button" class="btn btn--sm" data-wish-add>Add to basket</button>'
            : '') +
          (readOnly ? '' :
            '<button type="button" class="wcard__remove" data-wish-remove>Remove' +
            '<span class="visually-hidden"> ' + esc(title) + '</span></button>') +
        '</div>' +
      '</article>';
  }

  /* ---- painting ---------------------------------------------------------- */

  function show(el, on) { if (el) el.hidden = !on; }

  function render() {
    var list = shared || store.all();
    var readOnly = !!shared;

    if (!list.length) {
      show(grid, false);
      show(summary, false);
      tools.forEach(function (el) { show(el, false); });
      show(empty, true);
      return;
    }

    show(empty, false);
    show(grid, true);
    show(summary, true);
    tools.forEach(function (el) { show(el, !readOnly); });

    /* "item", not "ring" — the site sells loose diamonds today and will sell
       other jewellery soon. Ed, 01/09/2026. */
    var noun = list.length === 1 ? ' item' : ' items';
    summary.textContent = readOnly
      ? 'A list someone shared with you — ' + list.length + noun + '.'
      : list.length + noun + ' saved.';

    Promise.all(list.map(function (it) { return load(it.handle); }))
      .then(function (products) {
        grid.innerHTML = list.map(function (it, i) {
          return card(it, products[i], readOnly);
        }).join('');

        if (readOnly) {
          grid.insertAdjacentHTML('afterend',
            '<div class="wish-page__foot" data-wish-keep>' +
              '<button type="button" class="btn" data-wish-save-shared>Save this list to my device</button>' +
              '<a class="wish-page__clear" href="' + window.location.pathname + '">View my own list</a>' +
            '</div>');
        }
      });
  }

  /* ---- actions ----------------------------------------------------------- */

  function itemOf(el) {
    var wrap = el.closest('[data-wish-item]');
    if (!wrap) return null;
    var id = wrap.getAttribute('data-wish-item');
    var found = null;
    (shared || store.all()).forEach(function (it) { if (it.id === id) found = it; });
    return found;
  }

  root.addEventListener('click', function (e) {
    var t = e.target;

    var remove = t.closest('[data-wish-remove]');
    if (remove) {
      var gone = itemOf(remove);
      if (gone) { store.remove(gone.id); render(); }
      return;
    }

    var add = t.closest('[data-wish-add]');
    if (add) {
      var item = itemOf(add);
      if (!item) return;
      add.disabled = true;
      /* The saved companion lines are exactly what add-to-cart would have
         posted, which is the whole reason for saving them. */
      var items = [{ id: parseInt(item.variant, 10), quantity: 1, properties: item.props }]
        .concat(item.lines || []);
      fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: items })
      })
        .then(function (r) { return r.ok ? r.json() : Promise.reject(r); })
        .then(function () { window.location.href = '/cart'; })
        .catch(function () { add.disabled = false; });
      return;
    }

    var keep = t.closest('[data-wish-save-shared]');
    if (keep && shared) {
      /* Merge, never replace: the recipient may have their own rings saved,
         and losing those to open a link would be unforgivable. */
      var mine = store.all();
      var have = {};
      mine.forEach(function (it) { have[it.id] = true; });
      shared.forEach(function (it) { if (!have[it.id]) mine.push(it); });
      store.replace(mine);
      window.location.href = window.location.pathname;
      return;
    }

    var clear = t.closest('[data-wish-clear]');
    if (clear) {
      if (window.confirm('Remove everything saved on this device?')) {
        store.replace([]);
        render();
      }
      return;
    }

    var share = t.closest('[data-wish-share]');
    if (share && share.getAttribute('data-wish-share') === 'copy') {
      var url = shareUrl(store.all());
      var label = share.querySelector('span');
      navigator.clipboard.writeText(url).then(function () {
        if (label) {
          var was = label.textContent;
          label.textContent = 'Link copied';
          setTimeout(function () { label.textContent = was; }, 2000);
        }
      });
    }
  });

  root.addEventListener('change', function (e) {
    var note = e.target.closest('[data-wish-note]');
    if (!note || shared) return;
    var item = itemOf(note);
    if (item) store.note(item.id, note.value);
  });

  /* Share hrefs are set on render rather than on click, so a long-press or a
     middle-click behaves like an ordinary link. */
  function paintShare() {
    var url = shareUrl(store.all());
    var text = 'What I have saved at For Your Eternity';
    var wa = root.querySelector('[data-wish-share="whatsapp"]');
    var em = root.querySelector('[data-wish-share="email"]');
    if (wa) wa.href = 'https://wa.me/?text=' + encodeURIComponent(text + ' — ' + url);
    if (em) {
      em.href = 'mailto:?subject=' + encodeURIComponent(text) +
                '&body=' + encodeURIComponent(text + '\n\n' + url);
    }
  }

  /* ---- boot -------------------------------------------------------------- */

  var tries = 0;

  function boot() {
    store = (window.FYE && window.FYE.wishlist) || null;

    if (!store) {
      /* About five seconds, then stop. A slow connection is worth waiting for;
         a missing fye-ui.js is not, and an honest message beats a page that
         sits empty forever pretending the shopper saved nothing. */
      if (tries++ < 100) { window.setTimeout(boot, 50); return; }
      show(grid, false);
      show(summary, true);
      if (summary) {
        summary.textContent = 'Your saved rings could not be loaded. Please refresh the page.';
      }
      return;
    }

    var param = new URLSearchParams(window.location.search).get('w');
    if (param) shared = decode(param);

    render();
    if (!shared) paintShare();
    document.addEventListener('fye:wishlist', function () {
      if (!shared) paintShare();
      render();
    });
  }

  boot();
})();
