// w984-finder-fork.mjs — single use. Run once from the repo root, then delete.
//
//   node tools/w984-finder-fork.mjs
//
// Ed, 03/09/2026 (4): engagement and diamond journeys open on a fork —
// start with the setting, or start with the stone — and metal is asked as
// colour first, then carat only when a gold was chosen.
//
// The section and templates/page.find-your-ring.json are already rewritten.
// This patch replaces the ring finder IIFE in assets/fye-ui.js and records the
// session. Guarded on the change, so a second run is a no-op.

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const P = (p) => resolve(root, p);
const MARKER = '   RING FINDER — sections/fye-ring-finder.liquid';

const IIFE = String.raw`/* ============================================================================
   RING FINDER — sections/fye-ring-finder.liquid, page.find-your-ring.
   Built 03/09/2026; inline results and the fork added the same day.

   One question at a time. Each answer becomes a native Shopify filter param;
   "I'm flexible" (empty value) adds nothing. When the last question is
   answered the matching rings are fetched from the collection itself —
   /collections/<handle>?<filters>&view=fye-finder, which is
   templates/collection.fye-finder.liquid under layout none — so the filtering
   is Shopify's own and the shopper never presses a button to see stock.

   THE FORK reorders questions, it does not add them. Each step carries a
   group (setting / stone / none) and the fork picks which group is asked
   first; ungrouped steps always come last. One set of step blocks therefore
   serves both routes.

   CONDITIONAL STEPS are asked only when an earlier answer to their
   when-param contains their when-value — that is how carat is asked only for
   golds. The step total counts a pending conditional step optimistically, so
   the number can shrink but never grow mid-journey.

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
  var state = { journey: null, url: '', label: '', first: null, answers: [] };
  var req = 0;

  function all(sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); }
  function one(sel) { return root.querySelector(sel); }
  function panel(name) { return one('[data-fye-finder-panel="' + name + '"]'); }
  function attr(el, name) { return (el.getAttribute('data-fye-finder-' + name) || '').trim(); }

  function fork() {
    return all('[data-fye-finder-fork]').filter(function (f) {
      return attr(f, 'journey') === state.journey;
    })[0];
  }

  function answerFor(param) {
    for (var i = 0; i < state.answers.length; i++) {
      if (state.answers[i].param === param) return state.answers[i];
    }
    return null;
  }

  // yes = ask it · no = skip it · pending = its trigger is unanswered, so it
  // still counts toward the total.
  function condition(step) {
    var p = attr(step, 'when-param');
    var v = attr(step, 'when-value');
    if (!p || !v) return 'yes';
    var a = answerFor(p);
    if (!a) return 'pending';
    return (a.label + ' ' + a.value).toLowerCase().indexOf(v.toLowerCase()) > -1 ? 'yes' : 'no';
  }

  // Ungrouped last; within a group, block order. Sort is made stable by
  // carrying the original index.
  function ordered() {
    return all('[data-fye-finder-step]')
      .filter(function (s) { return attr(s, 'journey') === state.journey; })
      .map(function (s, i) {
        var g = attr(s, 'group');
        return { el: s, i: i, rank: g ? (g === state.first ? 0 : 1) : 2 };
      })
      .sort(function (a, b) { return a.rank - b.rank || a.i - b.i; });
  }

  function steps() {
    var seq = ordered();
    var ask = [];
    var total = 0;
    seq.forEach(function (s) {
      var c = condition(s.el);
      if (c === 'yes') ask.push(s.el);
      if (c !== 'no') total++;
    });
    return { ask: ask, total: total };
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
    var link = one('[data-fye-finder-results]');
    var grid = one('[data-fye-finder-grid]');
    var count = one('[data-fye-finder-count]');
    var chips = one('[data-fye-finder-chips]');
    var field = one('[data-fye-finder-answers-field]');
    var picked = state.answers.filter(function (a) { return a.value; });

    if (chips) {
      chips.textContent = picked.length
        ? picked.map(function (a) { return a.label; }).join('  \u00b7  ')
        : 'You kept every option open, so this is the whole collection.';
    }
    if (field) {
      var route = state.first ? ' (started with the ' + state.first + ')' : '';
      field.value = state.label + route + ' \u2014 ' + (state.answers.length
        ? state.answers.map(function (a) { return a.q + ': ' + a.label; }).join('; ')
        : 'no answers given');
    }
    link.setAttribute('href', state.url + (query ? '?' + query : ''));
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
    all('[data-fye-finder-panel], [data-fye-finder-step], [data-fye-finder-fork]')
      .forEach(function (p) { p.hidden = true; });
    var prog = one('[data-fye-finder-progress]');
    var back = one('[data-fye-finder-back]');
    var show;

    if (!state.journey) {
      show = panel('journeys');
      prog.hidden = true;
      back.hidden = true;
    } else {
      back.hidden = false;
      var f = fork();
      if (f && !state.first) {
        show = f;
        prog.textContent = state.label;
        prog.hidden = false;
      } else {
        var seq = steps();
        var i = state.answers.length;
        if (!seq.total) {
          console.warn('[fye finder] no step blocks match journey key "' + state.journey +
            '". Check each step block\'s Journey key against the journey block\'s Key.');
        }
        if (i < seq.ask.length) {
          show = seq.ask[i];
          prog.textContent = state.label + ' \u00b7 Step ' + (i + 1) + ' of ' + seq.total;
          prog.hidden = false;
        } else {
          show = panel('results');
          prog.textContent = state.label;
          prog.hidden = false;
          results();
        }
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
        journey: attr(j, 'journey'),
        url: j.getAttribute('data-fye-finder-collection') || j.getAttribute('href'),
        label: attr(j, 'label') || j.textContent.trim(),
        first: null,
        answers: []
      };
      render();
      return;
    }

    var r = t.closest('[data-fye-finder-route]');
    if (r) {
      state.first = attr(r, 'route');
      state.answers = [];
      render();
      return;
    }

    var o = t.closest('[data-fye-finder-option]');
    if (o) {
      var step = o.closest('[data-fye-finder-step]');
      var q = step.querySelector('[data-fye-finder-question]');
      state.answers.push({
        q: q ? q.textContent.trim() : '',
        label: attr(o, 'label') || o.textContent.trim(),
        param: attr(step, 'param'),
        value: attr(o, 'value')
      });
      render();
      return;
    }

    if (t.closest('[data-fye-finder-back]')) {
      if (state.answers.length) state.answers.pop();
      else if (state.first) state.first = null;
      else state.journey = null;
      render();
      return;
    }

    if (t.closest('[data-fye-finder-restart]')) {
      state = { journey: null, url: '', label: '', first: null, answers: [] };
      render();
    }
  });

  // A filename typo in the theme editor should cost a missing icon, not a
  // broken-image glyph in the middle of a tile.
  all('[data-fye-finder-icon]').forEach(function (img) {
    if (img.complete && img.naturalWidth === 0) img.remove();
    else img.addEventListener('error', function () { img.remove(); });
  });
})();
`;

const SESSION = `

---

## Revision — 03/09/2026 (4): the fork, and metal in two steps

Ed: engagement rings should open on "either choose your setting or choose your
stone", then run the options; metal wants colour swatches and a carat follow-up.

### The fork reorders, it does not branch

Both routes ask the same questions, so duplicating the step list would have
meant ~40 blocks against Shopify's cap of 50, with two copies of every option
list to keep in sync. Instead each step carries a **group** — setting, stone or
none — and the fork picks which group is asked first; ungrouped steps always
come last. One set of blocks, both routes, 23 blocks in total.

    eng, setting first:  style, shoulders, stone type, cut, size, metal, [carat]
    eng, stone first:    stone type, cut, size, style, shoulders, metal, [carat]
    dia, setting first:  setting, stone, shape, coverage, metal, [carat]
    dia, stone first:    stone, shape, setting, coverage, metal, [carat]

Decisions (Ed): the fork is **not counted as a step**, has **no "I'm flexible"**
(it is a route, not a filter), and is on **both** engagement and diamond. Plain
wedding rings has no fork and runs in block order.

### Metal is now two questions

Four colour swatches — Platinum, Yellow Gold, White Gold, Rose Gold — then
**carat (9/14/18ct) only when the answer contains "Gold"**. That is a new
general capability: any step can set *Depends on* + *Answer contains* and is
asked only when an earlier answer matches. The step total counts a pending
conditional step optimistically, so the count can shrink but never grow
mid-journey.

On plain rings both halves filter (\`metal_colour\`, \`carat\`), which replaces
the old combined \`carat=18ct&metal_colour=Rose Gold\` value. On engagement and
diamond both are carried (\`fye_metal\`, \`fye_carat\`) and reach the enquiry.

### Icons, ready for more

Option lines are now \`Label | value | icon.svg | note\`, and each step and fork
sets **icon size** (40/56/88) and **icon style**. Line art fades a step on
hover; colour art — swatches now, photography later — does not, because a
dimmed photograph reads as a fault. Swatches are square: the brand has no
rounded corners outside the logo. fye-ui.js removes any icon that fails to
load, so a filename typo costs a missing icon rather than a broken-image glyph.

**Ed to upload to Content › Files** (the option lines already reference them):
\`metal-platinum.svg\`, \`metal-yellow-gold.svg\`, \`metal-white-gold.svg\`,
\`metal-rose-gold.svg\`. Fork tiles reuse existing art
(\`solitaire-4VMZDYZQ.svg\`, \`pave-YYUQTFKW.svg\`, \`icon101.svg\`).

### Open

- **A fifth metal was asked for and is not built.** The four above are the
  \`filters.metal_colour\` values the catalogue actually holds; a fifth wrong
  value would silently return zero rings on the plain journey. Name it and it
  is one line.
- \`filters.centre_weight\` may not be populated — walk engagement with a centre
  stone size and check the count is not 0.
- The collection page's visible sidebar is still xCloud's: it will not show the
  finder's filters as ticked, and clicking a sidebar box routes to
  \`/a/search\` and drops them. Native facets are all enabled now, so the theme
  could render \`collection.filters\` itself and the app could go.
`;

const edits = [];

{
  const f = P('assets/fye-ui.js');
  const src = readFileSync(f, 'utf8');
  if (src.includes('data-fye-finder-route')) { console.log('1. fye-ui.js: already the fork version, skipping'); }
  else {
    const n = src.split(MARKER).length - 1;
    if (n !== 1) throw new Error('1. fye-ui.js: expected 1 ring finder block, found ' + n + '. Run w981/w983 first?');
    const cut = src.lastIndexOf('/* ===', src.indexOf(MARKER));
    if (cut < 0) throw new Error('1. fye-ui.js: could not find the start of the ring finder comment');
    edits.push({ f, out: src.slice(0, cut) + IIFE, check: 'data-fye-finder-route' });
  }
}

{
  const f = P('docs/build-state.md');
  const src = readFileSync(f, 'utf8');
  if (src.includes('Revision — 03/09/2026 (4)')) { console.log('2. build-state.md: already present, skipping'); }
  else edits.push({ f, out: src.replace(/\s*$/, '\n') + SESSION, check: 'the fork, and metal in two steps' });
}

for (const e of edits) {
  const before = readFileSync(e.f, 'utf8').length;
  writeFileSync(e.f, e.out, 'utf8');
  const after = readFileSync(e.f, 'utf8');
  if (!after.includes(e.check)) throw new Error(e.f + ' missing ' + e.check + ' after write');
  console.log('wrote ' + e.f.replace(root + '/', '') + '  ' + before + ' -> ' + after.length);
}
console.log(edits.length + ' file(s) changed.');
console.log('next: node tools/w977-validate-templates.mjs page.find-your-ring');
console.log('then: rm tools/w984-finder-fork.mjs && ./tools/fye ship "finder: fork, metal colour + carat"');
