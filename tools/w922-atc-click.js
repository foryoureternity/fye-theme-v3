#!/usr/bin/env node
/* ============================================================================
   w922-atc-click.js — patch for assets/fye-ui.js
   ----------------------------------------------------------------------------
   Run once, from the repo root:

       node tools/w922-atc-click.js

   THE BUG — Ed, 01/09/2026

   Pressing "Choose your centre diamond option" popped the browser's own
   "please select an item in the list" bubble over the ring-size field instead
   of opening the picker.

   WHY. W921 opened the picker from the form's `submit` event. But a browser
   runs CONSTRAINT VALIDATION FIRST: if a required field is empty the submit
   event is never fired at all, so our handler never ran and the shopper got a
   validation message about a field they had not reached yet.

   That message is correct when the button really is "Add to bag" — a ring
   cannot be ordered without a size. It is nonsense when the button is asking
   for a centre diamond, because size is not what is missing.

   THE FIX. Intercept on CLICK, which fires before validation. When the button
   is in a state that has somewhere to send the shopper (`need.open`), the
   click is cancelled outright — no submit, so no validation — the mode is set
   and the picker opens. In every other state the click is left alone and the
   form validates exactly as before.

   The submit-side handling from W921 stays where it is. It is unreachable in
   this case now, but it is the correct behaviour for a form that submits by
   some other route (Enter in a text field, say), and removing it would make
   that path silently wrong.

   IDEMPOTENT: running it twice is safe.
   ========================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');

const FILE = path.join(process.cwd(), 'assets', 'fye-ui.js');
const MARKER = 'var atcNeed = requirement(atcForm)';

function die(msg) {
  console.error('REFUSED: ' + msg);
  console.error('fye-ui.js has NOT been modified.');
  process.exit(1);
}

if (!fs.existsSync(FILE)) die('assets/fye-ui.js not found — run from the repo root.');

let src = fs.readFileSync(FILE, 'utf8');
const before = Buffer.byteLength(src, 'utf8');

if (src.indexOf(MARKER) !== -1) {
  console.log('Already applied. Nothing written.');
  process.exit(0);
}

if (src.indexOf("open: centre, mode: 'required'") === -1) {
  die('W921 does not appear to be applied — run tools/w921-picker-entry.js first.');
}

/* The product block's own click listener. Unique: the other two listeners in
   this file (drawers, footer accordions) do not open with a gallery comment. */
const ANCHOR = "  document.addEventListener('click', function (e) {\n" +
               "    if (!e.target.closest) return;\n" +
               "\n" +
               "    /* gallery */";

const REPLACE = "  document.addEventListener('click', function (e) {\n" +
  "    if (!e.target.closest) return;\n" +
  "\n" +
  "    /* ---- the add button, when it is not an add button ----------------\n" +
  "       Before a centre stone is chosen this button reads \"Choose your centre\n" +
  "       diamond option\" and its job is to open the picker.\n" +
  "\n" +
  "       This is handled on CLICK rather than on submit because the browser\n" +
  "       validates required fields BEFORE firing submit: with an unchosen ring\n" +
  "       size the submit event never arrives, and the shopper gets a bubble\n" +
  "       about a field that is not what is missing. Cancelling the click means\n" +
  "       no submit, so no validation, so no wrong message.\n" +
  "\n" +
  "       Any other state falls through untouched and the form validates as\n" +
  "       normal — a real add to bag still demands a size. */\n" +
  "    var atcBtn = e.target.closest('[data-fye-atc]');\n" +
  "    if (atcBtn) {\n" +
  "      var atcForm = atcBtn.closest('form');\n" +
  "      var atcNeed = requirement(atcForm);\n" +
  "      if (atcForm && atcNeed && atcNeed.open) {\n" +
  "        e.preventDefault();\n" +
  "        if (atcNeed.mode) {\n" +
  "          setMode(atcNeed.open, 'centre', atcNeed.mode);\n" +
  "          paintStone(atcNeed.open);\n" +
  "          render(atcForm);\n" +
  "        }\n" +
  "        openPicker(atcNeed.open);\n" +
  "        return;\n" +
  "      }\n" +
  "    }\n" +
  "\n" +
  "    /* gallery */";

const n = src.split(ANCHOR).length - 1;
if (n !== 1) die('expected 1 occurrence of the product click-listener anchor, found ' + n);

src = src.replace(ANCHOR, REPLACE);

const after = Buffer.byteLength(src, 'utf8');
if (after <= before) die('patched file is not larger (' + before + ' -> ' + after + ')');

fs.writeFileSync(FILE, src, 'utf8');

console.log('Patched assets/fye-ui.js');
console.log('  ' + before + ' -> ' + after + ' bytes (+' + (after - before) + ')');
console.log('  the add button now opens the picker on click, before validation runs.');
