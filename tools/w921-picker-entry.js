#!/usr/bin/env node
/* ============================================================================
   w921-picker-entry.js — patch for assets/fye-ui.js and sections/main-product
   ----------------------------------------------------------------------------
   Run once, from the repo root:

       node tools/w921-picker-entry.js

   WHY A SCRIPT AND NOT REWRITTEN FILES

   fye-ui.js is past the size this session can read back whole, and rewriting
   it from memory would risk silently reverting the `woo` typo fix applied to
   it by hand. main-product.liquid is 55KB for the sake of two CSS rules. A
   patch that asserts on its anchors either applies exactly or refuses — it
   cannot half-land.

   WHAT IT DOES — Ed, 01/09/2026

   1. "Add to bag" OPENS THE PICKER. Before a stone is chosen the button reads
      "Choose your centre diamond option"; it used to be disabled, so the
      shopper was told what was missing and given no way to supply it. It is
      now live, and pressing it sets the mode to "required" and opens the
      picker — because opening the picker IS choosing the we-supply-the-stone
      route, and making them say so twice is ceremony.

   2. THE PICKER COPES WITH A FEED THAT HAS NOT LANDED. The feed used to be
      requested only when the mode tile was clicked, so opening the modal
      straight from the button could show an empty grid that looked like "no
      stones". It now shows a loading line and paints itself when the stones
      arrive.

   3. THE ORIGIN TOGGLE MOVES TO THE MODAL HEAD (the CSS half). Natural vs
      lab-grown was inside the filter block, which is a collapsed <details> on
      a phone — the one question that changes every price on screen was hidden
      behind a tap. The markup move is already in fye-buybox-centre.liquid;
      this adds the two rules that place it.

   IDEMPOTENT: running it twice is safe; the second run reports what is already
   applied and writes nothing.
   ========================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');

const JS = path.join(process.cwd(), 'assets', 'fye-ui.js');
const SECTION = path.join(process.cwd(), 'sections', 'main-product.liquid');

function die(msg) {
  console.error('REFUSED: ' + msg);
  console.error('No files have been modified.');
  process.exit(1);
}

const countOf = (hay, needle) => hay.split(needle).length - 1;

/* Every edit is [find, replace]. Each `find` must appear EXACTLY once, or the
   file has moved on and a blind patch would land in the wrong place. */
function applyEdits(file, label, marker, edits) {
  if (!fs.existsSync(file)) die(label + ' not found — run from the repo root.');

  let src = fs.readFileSync(file, 'utf8');
  const before = Buffer.byteLength(src, 'utf8');

  if (src.indexOf(marker) !== -1) {
    console.log(label + ': already applied, nothing written.');
    return null;
  }

  edits.forEach(function (pair, i) {
    const n = countOf(src, pair[0]);
    if (n !== 1) die(label + ' edit ' + (i + 1) + ': expected 1 match, found ' + n);
  });

  edits.forEach(function (pair) {
    src = src.replace(pair[0], pair[1]);
  });

  const after = Buffer.byteLength(src, 'utf8');
  if (after <= before) die(label + ': patched file is not larger (' + before + ' -> ' + after + ')');

  fs.writeFileSync(file, src, 'utf8');
  console.log(label + ': ' + before + ' -> ' + after + ' bytes (+' + (after - before) + ')');
  return after;
}

/* ---------------------------------------------------------------- fye-ui.js */

const JS_EDITS = [
  /* 1. The no-mode case stops being a dead button and becomes the way in. */
  [
    "      if (!cm) return { label: 'Choose your centre diamond option', block: true };",
    "      /* NOT blocked: this button is how the shopper gets into the picker.\n" +
    "         `mode` is applied on the way in — see the submit handler. */\n" +
    "      if (!cm) return { label: 'Choose your centre diamond option', open: centre, mode: 'required' };"
  ],

  /* 2. Submit: set the mode, then open. */
  [
    "    if (need) {\n      e.preventDefault();\n      if (need.open) openPicker(need.open);\n      return;\n    }",
    "    if (need) {\n" +
    "      e.preventDefault();\n" +
    "      if (need.open) {\n" +
    "        /* Opening the picker IS choosing the we-supply-the-stone route, so\n" +
    "           the mode is set on the way in rather than asked for twice.\n" +
    "           setMode also starts the feed load. */\n" +
    "        if (need.mode) {\n" +
    "          setMode(need.open, 'centre', need.mode);\n" +
    "          paintStone(need.open);\n" +
    "          render(form);\n" +
    "        }\n" +
    "        openPicker(need.open);\n" +
    "      }\n" +
    "      return;\n" +
    "    }"
  ],

  /* 3. Opening before the feed has landed shows a loading line, not an empty
        grid that reads as "no stones". */
  [
    "    modal.hidden = false;\n    document.documentElement.style.overflow = 'hidden';\n    paintPicker(panel);",
    "    modal.hidden = false;\n" +
    "    document.documentElement.style.overflow = 'hidden';\n" +
    "\n" +
    "    /* The modal can be opened straight from the add button, before the\n" +
    "       feed has been asked for. An empty grid would read as \"no stones\". */\n" +
    "    if (!panel.__fyeStones) {\n" +
    "      var waiting = panel.querySelector('[data-fye-picker-results]');\n" +
    "      if (waiting) {\n" +
    "        waiting.innerHTML = '<p class=\"pdp__stoneempty\">Finding diamonds that suit this setting…</p>';\n" +
    "      }\n" +
    "      ensureStones(panel);\n" +
    "    } else {\n" +
    "      paintPicker(panel);\n" +
    "    }"
  ],

  /* 4. Stones arrived while the modal is open — paint into it. */
  [
    "      if (btn) btn.hidden = false;\n      if (help) help.hidden = false;\n      initRanges(panel, all);",
    "      if (btn) btn.hidden = false;\n" +
    "      if (help) help.hidden = false;\n" +
    "      initRanges(panel, all);\n" +
    "\n" +
    "      /* Opened before the feed landed: replace the loading line. */\n" +
    "      if (panel.querySelector('[data-fye-picker]:not([hidden])')) paintPicker(panel);"
  ],

  /* 5. Same, for the genuinely-empty case. */
  [
    "        if (state) state.textContent = 'We have no matching stones in stock at the moment.';\n        if (help) help.hidden = false;\n        return;",
    "        if (state) state.textContent = 'We have no matching stones in stock at the moment.';\n" +
    "        if (help) help.hidden = false;\n" +
    "        var emptyResults = panel.querySelector('[data-fye-picker-results]');\n" +
    "        if (panel.querySelector('[data-fye-picker]:not([hidden])') && emptyResults) {\n" +
    "          emptyResults.innerHTML = '<p class=\"pdp__stoneempty\">We have no matching stones in stock ' +\n" +
    "            'at the moment. <a href=\"/pages/contact-us\">Ask us to source one</a>.</p>';\n" +
    "        }\n" +
    "        return;"
  ]
];

/* -------------------------------------------------------- main-product.liquid
   Two rules, inserted before the filter block's own. The head becomes a
   wrapping flex row and the toggle claims a full-width third line, so the
   close button stays top-right and the toggle never squeezes the title. */

const CSS = `/* The origin toggle sits in the modal HEAD, not in the filter block — Ed,
   01/09/2026. Natural vs lab-grown is the first question a shopper answers and
   it changes every price in the grid, so it must not be behind a collapsed
   <details> on a phone.

   It takes a full-width row of its own rather than sharing the title's line:
   three 72px buttons beside a title and a close button do not fit 375px, and
   a toggle that wraps unpredictably is worse than one that always sits in the
   same place. */
.fye .pdp__modalhead {
  flex-wrap: wrap;
}

.fye .pdp__modalorigin {
  order: 3;
  flex: 1 0 100%;
}

`;

const SECTION_EDITS = [
  ['.fye .pdp__filters {', CSS + '.fye .pdp__filters {']
];

/* ------------------------------------------------------------------ run it */

const a = applyEdits(JS, 'assets/fye-ui.js', "open: centre, mode: 'required'", JS_EDITS);
const b = applyEdits(SECTION, 'sections/main-product.liquid', '.fye .pdp__modalorigin', SECTION_EDITS);

if (a === null && b === null) {
  console.log('Nothing to do.');
} else {
  console.log('Done. Hard-reload the preview and check a resolved custom property,');
  console.log('not a screenshot: getComputedStyle(document.querySelector(".pdp__modalhead")).flexWrap');
}
