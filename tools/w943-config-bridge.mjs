// w943-config-bridge.mjs — let the buy box be read and re-applied.
//
// Restoring a configuration from a link needs two things the page does not
// expose: a full reading of the choosers, and a way to put one back. Both live
// inside the productPage IIFE because that is where setMode and paintStone
// are, so they are added to the existing window.FYE bridge rather than
// re-implemented outside it — the same reason buyBox() is there.
//
// Note what readConfig captures that the wishlist did not: the STONE ITSELF.
// stoneOf() returns the whole diamond as JSON (shape, carat, colour, clarity,
// price, image), and without it a restored page could name the stone but not
// show it. Saving variant ids alone was never going to be enough.
//
//     node tools/w943-config-bridge.mjs
// Delete once run and pushed.

import { readFileSync, writeFileSync } from 'node:fs';

const UI = 'assets/fye-ui.js';
const src = readFileSync(UI, 'utf8');

if (src.includes('window.FYE.readConfig')) {
  console.log('Already applied. Nothing to do.');
  process.exit(0);
}

const find = `  window.FYE.buyBox = function (form) {
    var v = chosenVariant(form);
    if (!v) return null;
    return { variant: v, props: ringProps(form), lines: addOnLines(form, v) };
  };`;

const hits = src.split(find).length - 1;
if (hits !== 1) {
  console.error(`REFUSED: anchor matched ${hits} times, expected 1.`);
  process.exit(1);
}

const add = find + `

  /* ---- read and re-apply a whole configuration -------------------------
     For the wishlist, and for a link a shopper sends to their partner. The
     page currently reads nothing from the URL at all — not even ?variant= —
     so a shared ring opens blank no matter how it was configured.

     Everything here goes through the SAME functions a click would: setMode,
     paintStone, render, and for the engraving and the side chips an actual
     dispatched click, so their existing handlers do the work. Re-implementing
     those side effects here is how the two would drift apart. */

  function optionSelects(form) {
    return Array.prototype.slice.call(form.querySelectorAll('[data-fye-option]'));
  }

  window.FYE.readConfig = function (form) {
    var centre = centreOf(form);
    var sides = sidesOf(form);
    var eng = form.querySelector('[data-fye-engrave]');

    var fields = {};
    if (eng) {
      eng.querySelectorAll('[name^="properties["]').forEach(function (f) {
        if (!f.disabled && f.value) fields[f.getAttribute('name')] = f.value;
      });
    }

    var chip = chosenChip(sides);
    var cw = waiverOf(centre, 'centre');
    var sw = waiverOf(sides, 'sides');

    return {
      options: optionSelects(form).map(function (s) { return s.value; }),
      centre: centre ? { mode: modeOf(centre), stone: stoneOf(centre) } : null,
      sides: sides
        ? { mode: modeOf(sides), chip: chip ? chip.getAttribute('data-fye-side-variant') : '' }
        : null,
      engrave: eng ? { on: eng.getAttribute('data-on') || 'no', fields: fields } : null,
      waiver: { centre: !!(cw && cw.checked), sides: !!(sw && sw.checked) }
    };
  };

  window.FYE.applyConfig = function (form, cfg) {
    if (!form || !cfg) return;

    /* Variant first: everything else prices against it. */
    if (cfg.options) {
      optionSelects(form).forEach(function (sel, i) {
        if (cfg.options[i] != null) sel.value = cfg.options[i];
      });
    }

    var centre = centreOf(form);
    if (centre && cfg.centre) {
      if (cfg.centre.stone) centre.setAttribute('data-stone', JSON.stringify(cfg.centre.stone));
      if (cfg.centre.mode) setMode(centre, 'centre', cfg.centre.mode);
      paintStone(centre);
    }

    var sides = sidesOf(form);
    if (sides && cfg.sides) {
      if (cfg.sides.mode) setMode(sides, 'sides', cfg.sides.mode);
      if (cfg.sides.chip) {
        var chip = sides.querySelector('[data-fye-side-variant="' + cfg.sides.chip + '"]');
        /* A click, not a class toggle: the chip's handler also prices it. */
        if (chip) chip.click();
      }
    }

    var eng = form.querySelector('[data-fye-engrave]');
    if (eng && cfg.engrave) {
      var seg = eng.querySelector('[data-fye-engrave-set="' + cfg.engrave.on + '"]');
      if (seg) seg.click();
      Object.keys(cfg.engrave.fields || {}).forEach(function (name) {
        var f = eng.querySelector('[name="' + name + '"]');
        if (f) f.value = cfg.engrave.fields[name];
      });
    }

    if (cfg.waiver) {
      var cw2 = waiverOf(centre, 'centre');
      var sw2 = waiverOf(sides, 'sides');
      if (cw2 && !cw2.disabled) cw2.checked = !!cfg.waiver.centre;
      if (sw2 && !sw2.disabled) sw2.checked = !!cfg.waiver.sides;
    }

    render(form);
  };`;

writeFileSync(UI, src.replace(find, add));
console.log(`  ${UI}: ${src.length} -> ${readFileSync(UI, 'utf8').length} bytes\n`);
