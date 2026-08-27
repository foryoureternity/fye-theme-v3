/* ============================================================================
   fix-footer-accordion.mjs — 28/08/2026
   ----------------------------------------------------------------------------
     cd ~/Dropbox/GIT-repositaries/fye-theme-v3
     node docs/tools/fix-footer-accordion.mjs

   Delete once run and synced.

   Mobile footer becomes five expanding sections, as live: SHOP, DIAMONDS &
   GEMSTONES, GUIDES & ADVICE, HELP & COMPANY, TALK TO US — each a tappable row
   with a hairline above and a + on the right. Desktop keeps the five columns.

   BUILT AS <details>, NOT AS DIVS WITH A CLICK HANDLER
   The disclosure widget is native: it is keyboard operable, announced properly,
   findable by in-page search, and it opens without JavaScript. The only thing
   script does here is decide the DEFAULT state per breakpoint.

   And the default matters: the markup renders <details open>. So with no
   JavaScript at all, every section is expanded — today's behaviour, nothing
   lost. Script CLOSES them below 769px and reopens them above. A JS failure
   therefore degrades to "all open", never to "all shut and untappable", which
   is the failure mode that would hide the whole footer on a phone.

   That is why this is not the CSS-only trick of overriding the closed state's
   display on desktop: that relies on overriding a UA-internal slot, and when it
   breaks it breaks by hiding content.

   The + is a pseudo-element, not an icon render — it is decoration on a control
   that already announces its own state, so it must not be a second focus stop.
   It becomes a - when open.

   Two details worth noting:
   - summary needs list-style: none AND ::-webkit-details-marker to lose the
     default triangle across browsers.
   - on desktop the summary gets pointer-events: none and cursor: default, so a
     heading that is not a control does not behave like one.

   CSS goes at the END of the section's stylesheet. Three times tonight a rule
   failed because it sat above what it meant to override.
   ========================================================================== */

import { readFile, writeFile } from 'node:fs/promises';

/* ---- 1. footer markup ---------------------------------------------------- */

const FILE = 'sections/footer.liquid';
let src = await readFile(FILE, 'utf8');

const edits = [
  {
    label: 'link columns become <details>',
    find: `          <div class="ftr__col" {{ block.shopify_attributes }}>
            {%- if block.settings.heading != blank -%}
              <h3 class="ftr__head">{{ block.settings.heading }}</h3>
            {%- endif -%}
            {%- assign list = linklists[block.settings.menu] -%}`,
    replace: `          <details class="ftr__col ftr__acc" open {{ block.shopify_attributes }}>
            <summary class="ftr__head">{{ block.settings.heading | default: 'More' }}</summary>
            {%- assign list = linklists[block.settings.menu] -%}`
  },
  {
    label: 'close the link column',
    find: `            {%- endif -%}
          </div>
        {%- endif -%}
      {%- endfor -%}`,
    replace: `            {%- endif -%}
          </details>
        {%- endif -%}
      {%- endfor -%}`
  },
  {
    label: 'talk column becomes <details>',
    find: `      <div class="ftr__col ftr__talk">
        {%- if section.settings.talk_heading != blank -%}
          <h3 class="ftr__head">{{ section.settings.talk_heading }}</h3>
        {%- endif -%}`,
    replace: `      <details class="ftr__col ftr__talk ftr__acc" open>
        <summary class="ftr__head">{{ section.settings.talk_heading | default: 'Talk to us' }}</summary>`
  },
  {
    label: 'close the talk column',
    find: `        </div>
      </div>
    </div>

    <hr class="ftr__rule">`,
    replace: `        </div>
      </details>
    </div>

    <hr class="ftr__rule">`
  }
];

for (const { label, find, replace } of edits) {
  const n = src.split(find).length - 1;
  if (n !== 1) {
    console.log(`SKIP  ${label} — ${n} matches`);
    continue;
  }
  src = src.replace(find, replace);
  console.log(`  ok  ${label}`);
}

/* ---- 2. footer CSS, appended at the end of the stylesheet ---------------- */

const css = `
/* ============================================================================
   ACCORDION COLUMNS — 28/08/2026
   The columns are <details open>. Desktop shows them as plain columns with an
   inert heading; below 769px they become tappable rows. Script sets the
   default state per breakpoint (see fye-ui.js) — with no script they stay open,
   which is the safe failure.
   ========================================================================== */

/* Kill the default marker everywhere. Both properties are needed. */
.fye .ftr__acc > summary { list-style: none; }
.fye .ftr__acc > summary::-webkit-details-marker { display: none; }

@media (min-width: 769px) {
  /* A heading that is not a control should not behave like one. */
  .fye .ftr__acc > summary { pointer-events: none; cursor: default; }
}

@media (max-width: 768px) {
  .fye .ftr__cols {
    display: block;
    padding-bottom: var(--s7);
  }

  .fye .ftr__acc {
    border-top: 1px solid rgba(35, 61, 71, 0.22);
  }
  .fye .ftr__acc:last-of-type { border-bottom: 1px solid rgba(35, 61, 71, 0.22); }

  .fye .ftr__acc > summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--s4);
    /* 56px is the tap target; the type is the same 20px display face as the
       desktop heading, so nothing about the brand changes on a phone. */
    min-height: 56px;
    margin: 0;
    padding: var(--s3) 0;
    cursor: pointer;
    font-size: 17px;
    letter-spacing: 0.08em;
  }
  .fye .ftr__acc > summary::after {
    content: "+";
    flex: none;
    font-family: var(--font-body);
    font-size: 22px;
    font-weight: var(--fw-light);
    line-height: 1;
    transition: transform var(--dur) var(--ease);
  }
  .fye .ftr__acc[open] > summary::after { content: "\\2212"; }

  /* Everything that is not the summary is the panel. */
  .fye .ftr__acc > *:not(summary) { margin-bottom: var(--s5); }
  .fye .ftr__acc > *:first-of-type { margin-top: 0; }
  .fye .ftr__list li { margin-bottom: var(--s2); }
  .fye .ftr__list a { font-size: 16px; }

  /* The talk column's own furniture needs to sit inside the panel, not float. */
  .fye .ftr__talk .ftr__cta { width: 100%; }
  .fye .ftr__talk .ftr__social { margin-top: var(--s6); margin-bottom: var(--s6); }
}
`;

const closer = '{% endstylesheet %}';
if (src.includes('ACCORDION COLUMNS — 28/08/2026')) {
  console.log('SKIP  accordion CSS already present');
} else if (!src.includes(closer)) {
  console.log('SKIP  {% endstylesheet %} not found');
} else {
  src = src.replace(closer, `${css}${closer}`);
  console.log('  ok  accordion CSS appended at the end of the stylesheet');
}

await writeFile(FILE, src, 'utf8');
console.log(`FIXED ${FILE}`);

/* ---- 3. the breakpoint default, appended to fye-ui.js -------------------- */

const UI = 'assets/fye-ui.js';
let ui = await readFile(UI, 'utf8');

const js = `

/* ============================================================================
   FOOTER ACCORDIONS — 28/08/2026
   The footer's link columns are <details open>, so with no JavaScript every
   section is expanded: the pre-accordion behaviour, and a safe failure. This
   only sets the DEFAULT state for the breakpoint — closed below 769px, open
   above — and it never fights a reader who has opened something: once any
   summary in the footer has been clicked, the automatic sync stops for that
   page view.
   ========================================================================== */
(function footerAccordions() {
  var mq = window.matchMedia('(max-width: 768px)');
  var touched = false;

  function panels() {
    return Array.prototype.slice.call(document.querySelectorAll('.ftr__acc'));
  }

  function sync() {
    if (touched) return;
    var mobile = mq.matches;
    panels().forEach(function (el) {
      if (mobile) el.removeAttribute('open');
      else el.setAttribute('open', '');
    });
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('.ftr__acc > summary')) touched = true;
  });

  if (mq.addEventListener) mq.addEventListener('change', sync);
  else if (mq.addListener) mq.addListener(sync);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', sync);
  } else {
    sync();
  }
})();
`;

if (ui.includes('FOOTER ACCORDIONS — 28/08/2026')) {
  console.log(`SKIP  ${UI} — accordion script already present`);
} else {
  await writeFile(UI, ui + js, 'utf8');
  console.log(`FIXED ${UI} — breakpoint default state for the footer accordions`);
}
