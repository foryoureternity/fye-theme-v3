// x007-conditional-steps.mjs — single use. Run once from the repo root, then delete.
//
//   node tools/x007-conditional-steps.mjs
//
// Ed, 05/09/2026: "no, it doesn't skip" — the carat question is asked after
// platinum and palladium.
//
// He was right and I was wrong. I read the TEMPLATE, saw eng_carat correctly
// depending on fye_metal containing "Gold", and reported that it already
// behaved. The other half never existed: `steps()` in assets/fye-ui.js filters
// on the journey key and nothing else, so `data-fye-finder-when-param` and
// `-when-value` are written into the HTML by the section and never read. Every
// conditional step is simply the next step in the list. Nothing was broken —
// it was never implemented, and the section's own documentation described
// behaviour that did not exist.
//
// THE INDEX PROBLEM. `render()` uses `state.answers.length` as the index into
// the step list, and the progress line reads "Step 3 of N" from `list.length`.
// Filter the list naively and the TOTAL grows from six to seven the moment
// someone picks a gold — a step count that increases mid-journey reads as a
// moving target, which is the one direction that feels worse than being one
// step out. So:
//
//   · the SEQUENCE excludes a conditional step whose dependency is unmet, and
//   · the TOTAL counts a still-undecided conditional step optimistically.
//
// A shopper who picks platinum therefore finishes one step early rather than
// watching the total change. Conditional steps must come AFTER the step they
// depend on for this to hold, which is true in the template and is now
// asserted at run time with a console warning rather than left as folklore.

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const f = resolve(root, 'assets/fye-ui.js');
const src = readFileSync(f, 'utf8');

if (src.includes('when-param')) {
  console.log('conditional steps already implemented, nothing to do');
  process.exit(0);
}

function once(hay, needle, where) {
  const n = hay.split(needle).length - 1;
  if (n !== 1) throw new Error(where + ': expected 1 match for ' + JSON.stringify(needle.slice(0, 60)) + ', found ' + n);
}

let out = src;

/* 1 ---- steps(): journey, then the condition ------------------------------ */
const OLD_STEPS =
  "  function steps() {\n" +
  "    return all('[data-fye-finder-step]').filter(function (s) {\n" +
  "      return (s.getAttribute('data-fye-finder-journey') || '').trim() === state.journey;\n" +
  '    });\n' +
  '  }\n';

const NEW_STEPS =
  "  function mySteps() {\n" +
  "    return all('[data-fye-finder-step]').filter(function (s) {\n" +
  "      return (s.getAttribute('data-fye-finder-journey') || '').trim() === state.journey;\n" +
  '    });\n' +
  '  }\n' +
  '\n' +
  '  // A step may declare that it is only worth asking given an earlier answer:\n' +
  "  // the carat of a gold is a question, the carat of a platinum ring is not.\n" +
  '  // Returns null when the step is unconditional, true/false otherwise.\n' +
  '  function condition(s) {\n' +
  "    var p = (s.getAttribute('data-fye-finder-when-param') || '').trim();\n" +
  "    var v = (s.getAttribute('data-fye-finder-when-value') || '').trim();\n" +
  '    if (!p || !v) return null;\n' +
  '    var asked = false;\n' +
  '    var met = false;\n' +
  '    state.answers.forEach(function (a) {\n' +
  '      if (a.param !== p) return;\n' +
  '      asked = true;\n' +
  '      // CONTAINS, not equals: one value ("Gold") covers yellow, white and\n' +
  "      // rose without listing them, and 'I'm flexible' carries no value and\n" +
  '      // therefore never satisfies a condition.\n' +
  "      if ((a.value || '').toLowerCase().indexOf(v.toLowerCase()) > -1) met = true;\n" +
  '    });\n' +
  '    return asked ? met : false;\n' +
  '  }\n' +
  '\n' +
  '  // The steps actually to be asked, in order.\n' +
  '  function steps() {\n' +
  '    return mySteps().filter(function (s) { return condition(s) !== false; });\n' +
  '  }\n' +
  '\n' +
  '  // The progress total. A conditional step whose dependency has not been\n' +
  '  // answered yet is counted optimistically, so the total can only fall as a\n' +
  '  // journey proceeds, never rise. A total that grows mid-journey reads as a\n' +
  '  // moving target; finishing one step early does not.\n' +
  '  function total() {\n' +
  '    var answered = {};\n' +
  '    state.answers.forEach(function (a) { if (a.param) answered[a.param] = true; });\n' +
  '    return mySteps().filter(function (s) {\n' +
  "      var p = (s.getAttribute('data-fye-finder-when-param') || '').trim();\n" +
  '      if (!p) return true;\n' +
  '      if (!answered[p]) return true;            // not yet decided — assume asked\n' +
  '      return condition(s) === true;\n' +
  '    }).length;\n' +
  '  }\n';

once(out, OLD_STEPS, '1. steps()');
out = out.replace(OLD_STEPS, NEW_STEPS);

/* 2 ---- the progress line counts optimistically --------------------------- */
const OLD_PROG = "        prog.textContent = state.label + ' \\u00b7 Step ' + (i + 1) + ' of ' + list.length;\n";
const NEW_PROG = "        prog.textContent = state.label + ' \\u00b7 Step ' + (i + 1) + ' of ' + Math.max(total(), list.length);\n";
once(out, OLD_PROG, '2. progress line');
out = out.replace(OLD_PROG, NEW_PROG);

/* 3 ---- warn if a condition points at a LATER step ------------------------
   The whole scheme rests on a conditional step coming after the step it
   depends on. That held in the template and was written down as a comment,
   which is not the same as being checked. */
const OLD_WARN =
  '      if (!list.length) {\n' +
  '        console.warn(\'[fye finder] no step blocks match journey key "\' + state.journey +\n' +
  "          '\". Check each step block\\'s Journey key against the journey block\\'s Key.');\n" +
  '      }\n';
const NEW_WARN = OLD_WARN +
  '      // A condition can only be evaluated once its dependency has been\n' +
  '      // answered, so it must point at an EARLIER step. Warn rather than\n' +
  '      // silently skipping a step that can never be reached.\n' +
  '      if (i === 0) {\n' +
  '        var order = mySteps();\n' +
  '        order.forEach(function (s, n) {\n' +
  "          var p = (s.getAttribute('data-fye-finder-when-param') || '').trim();\n" +
  '          if (!p) return;\n' +
  '          var at = -1;\n' +
  '          order.forEach(function (o, m) {\n' +
  "            if ((o.getAttribute('data-fye-finder-param') || '').trim() === p) at = m;\n" +
  '          });\n' +
  '          if (at === -1) {\n' +
  "            console.warn('[fye finder] a step depends on \"' + p + '\", which no step in this journey asks. It will never be shown.');\n" +
  '          } else if (at > n) {\n' +
  "            console.warn('[fye finder] a step depends on \"' + p + '\", which is asked LATER in this journey. Move it earlier or the step will never be shown.');\n" +
  '          }\n' +
  '        });\n' +
  '      }\n';
once(out, OLD_WARN, '3. warn block');
out = out.replace(OLD_WARN, NEW_WARN);

writeFileSync(f, out, 'utf8');
const after = readFileSync(f, 'utf8');
['function condition(', 'function total(', 'when-param'].forEach((s) => {
  if (!after.includes(s)) throw new Error('write did not land: missing ' + s);
});
console.log('assets/fye-ui.js: conditional steps implemented');
console.log('');
console.log('TEST: engagement -> ... -> metal = Platinum   -> goes straight to results, total says 6');
console.log('      engagement -> ... -> metal = Yellow Gold -> asks the carat, total says 7');
console.log('      the total must never RISE as you answer');
console.log('');
console.log('then: rm tools/x007-conditional-steps.mjs && ./tools/fye ship "finder: conditional steps"');
