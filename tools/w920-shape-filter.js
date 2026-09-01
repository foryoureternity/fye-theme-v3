#!/usr/bin/env node
/* ============================================================================
   w920-shape-filter.js — one-off patch for assets/fye-ui.js
   ----------------------------------------------------------------------------
   Run once, from the repo root:

       node tools/w920-shape-filter.js

   WHY THIS IS A SCRIPT AND NOT A REWRITTEN FILE

   fye-ui.js is past the size this session can read back whole, and rewriting
   it from memory would risk silently reverting the `woo` typo fix already
   applied to it by hand. A patch that asserts on its anchors either applies
   exactly or refuses — it cannot half-land.

   WHAT IT DOES

   The fancy-colour centre-stone feeds (fancy-yellow-natural-diamonds and its
   lab-grown twin) are MIXED-SHAPE: unlike round-natural-diamonds they hold
   every cut, so a Radiant semi-mount would otherwise offer Asscher, Heart and
   Trapezoid stones. This adds a shape check alongside the existing carat one.

   It is gated on data-shape-filter="1", which only fye-buybox-centre sets and
   only for a fancy ring. On the shape collections the check would be a no-op —
   and a no-op that could empty the picker if the two shape vocabularies ever
   drifted is not worth carrying.

   IDEMPOTENT: running it twice is safe; the second run reports "already
   applied" and writes nothing.
   ========================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');

const FILE = path.join(process.cwd(), 'assets', 'fye-ui.js');

const MARKER = 'function shapeOk(panel, d)';

/* Inserted immediately before ensureStones, next to caratOk which it mirrors. */
const FN = `  /* Fancy colour feeds are MIXED-SHAPE — fancy-yellow-natural-diamonds holds
     every cut, where round-natural-diamonds holds one. So a fancy ring asks
     for its own shape and nothing else.

     Gated on the panel's flag rather than applied always: on a shape
     collection this is a no-op, and a no-op that could empty the picker if
     fye.shape and fye.centre_shape ever drifted apart is not worth having.
     Verified 01/09/2026 that both use the same words ("Radiant", "Oval"). */
  function shapeOk(panel, d) {
    if (panel.getAttribute('data-shape-filter') !== '1') return true;
    var want = String(panel.getAttribute('data-shape') || '').trim().toLowerCase();
    if (!want) return true;
    return String(d.shape || '').trim().toLowerCase() === want;
  }

`;

const ANCHOR_FN = '  function ensureStones(panel) {';
const ANCHOR_CALL = '&& caratOk(panel, d);';
const REPLACE_CALL = '&& caratOk(panel, d) && shapeOk(panel, d);';

function die(msg) {
  console.error('REFUSED: ' + msg);
  console.error('fye-ui.js has NOT been modified.');
  process.exit(1);
}

if (!fs.existsSync(FILE)) die('assets/fye-ui.js not found — run from the repo root.');

let src = fs.readFileSync(FILE, 'utf8');
const before = Buffer.byteLength(src, 'utf8');

if (src.indexOf(MARKER) !== -1) {
  console.log('Already applied — shapeOk is present. Nothing written.');
  process.exit(0);
}

/* Both anchors must appear EXACTLY once. Anything else means the file has
   moved on and a blind patch would land in the wrong place. */
const countOf = (hay, needle) => hay.split(needle).length - 1;

const nFn = countOf(src, ANCHOR_FN);
if (nFn !== 1) die('expected 1 occurrence of the ensureStones anchor, found ' + nFn);

const nCall = countOf(src, ANCHOR_CALL);
if (nCall !== 1) die('expected 1 occurrence of the caratOk filter line, found ' + nCall);

src = src.replace(ANCHOR_FN, FN + ANCHOR_FN);
src = src.replace(ANCHOR_CALL, REPLACE_CALL);

/* A patch that shrinks this file is a patch that went wrong. */
const after = Buffer.byteLength(src, 'utf8');
if (after <= before) die('patched file is not larger than the original (' + before + ' -> ' + after + ')');

fs.writeFileSync(FILE, src, 'utf8');

console.log('Patched assets/fye-ui.js');
console.log('  ' + before + ' -> ' + after + ' bytes (+' + (after - before) + ')');
console.log('  added shapeOk(), and wired it into the ensureStones filter.');
