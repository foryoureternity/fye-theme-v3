#!/usr/bin/env node
/* ============================================================================
   w924-stone-buybox.js — patch for sections/fye-stone-product.liquid
   ----------------------------------------------------------------------------
   Run once, from the repo root:

       node tools/w924-stone-buybox.js

   FOUR CHANGES — Ed, 01/09/2026

   1. DROP THE CERTIFICATE NUMBER ROW. The certificate LAB stays (GIA, IGI,
      Independent) because that is the reassurance; the serial is a reference
      the customer has no use for before buying, and on ~27,000 public pages it
      is a machine-readable index of our whole inventory. Where cert_url exists
      it now hangs off the lab name instead, so verification is still one click.

   2. TABLE ABOVE THE BUTTONS. A loose stone is bought on its specification —
      shape, carat, colour, clarity — so the facts must be read BEFORE the
      commitment, not below it. On a ring the options are the decision and the
      button follows them; here the table plays that part.

   3. WISHLIST. Every other product page has one and this did not, so a stone
      could not be saved for later — on a page where "come back with my partner"
      is the normal behaviour. Uses the same fye-wishlist-button snippet as the
      ring pages, so one storage format covers both.

   4. "CONTACT US ABOUT THIS DIAMOND". A real outline button rather than the
      quiet text link, and it renders with a default destination rather than
      waiting on a setting: unlike "set this in a ring", where the destination
      is genuinely undecided, an enquiry has an obvious home at
      /pages/contact-us. Its LABEL follows the stone — a sapphire says
      "Contact us about this sapphire", because calling a ruby a diamond in a
      button is the kind of error that gets noticed.

   VERSION 2. v1 refused on its own final guard: it searched the whole file for
   the string "Certificate number" and found it in a CSS COMMENT — the note
   explaining the label column width — not in the markup, which had patched
   correctly. The guard now looks for the actual table row, and edit 6 updates
   that comment, which is stale either way now the longest label has changed.

   The lesson is worth keeping: a guard that greps a whole file for a human
   phrase will trip over prose. Assert on the markup you actually removed.

   IDEMPOTENT: running it twice is safe.
   ========================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');

const FILE = path.join(process.cwd(), 'sections', 'fye-stone-product.liquid');
const MARKER = 'stone__actions';

function die(msg) {
  console.error('REFUSED: ' + msg);
  console.error('fye-stone-product.liquid has NOT been modified.');
  process.exit(1);
}

if (!fs.existsSync(FILE)) die('sections/fye-stone-product.liquid not found — run from the repo root.');

let src = fs.readFileSync(FILE, 'utf8');
const before = Buffer.byteLength(src, 'utf8');

if (src.indexOf(MARKER) !== -1) {
  console.log('Already applied. Nothing written.');
  process.exit(0);
}

const countOf = (hay, needle) => hay.split(needle).length - 1;

/* ---------------------------------------------------------------- the edits */

const NOUN_FIND = "  assign spin = mf.video_url\n-%}";
const NOUN_REPLACE = `  comment
    What to call this stone in a sentence. The enquiry button reads "Contact us
    about this diamond" on a diamond and "…this sapphire" on a sapphire —
    calling a ruby a diamond in a button is the kind of error customers notice.
  endcomment
  assign stone_noun = 'diamond'
  if is_gem
    assign stone_noun = 'gemstone'
    if mf.gem_type != blank
      assign stone_noun = mf.gem_type | downcase
    endif
  endif

  assign spin = mf.video_url
-%}`;

const CERT_FIND = `            {%- if mf.cert_lab != blank -%}
              <tr>
                <th scope="row">Certificate</th>
                <td>{% if mf.cert_lab == 'OTHER' %}Independent{% else %}{{ mf.cert_lab }}{% endif %}</td>
              </tr>
            {%- endif -%}

            {%- if mf.cert_number != blank -%}
              <tr>
                <th scope="row">Certificate number</th>
                <td>
                  {%- if mf.cert_url != blank -%}
                    <a href="{{ mf.cert_url }}" rel="nofollow noopener" target="_blank">{{ mf.cert_number }}</a>
                  {%- else -%}
                    {{ mf.cert_number }}
                  {%- endif -%}
                </td>
              </tr>
            {%- endif -%}`;

const CERT_REPLACE = `            {%- comment -%}
              THE SERIAL IS NOT SHOWN — Ed, 01/09/2026. The lab is the
              reassurance; the serial is a reference the customer has no use for
              before buying, and on ~27,000 public pages it would publish a
              machine-readable index of our entire inventory.

              Where cert_url exists the lab name itself becomes the link, so
              verification is still one click and the serial is on the page it
              leads to.

              "OTHER" appears as a lab name on some gemstones and tells a
              customer nothing, so it reads "Independent" rather than raw.
            {%- endcomment -%}
            {%- if mf.cert_lab != blank -%}
              {%- capture lab_name -%}
                {% if mf.cert_lab == 'OTHER' %}Independent{% else %}{{ mf.cert_lab }}{% endif %}
              {%- endcapture -%}
              <tr>
                <th scope="row">Certificate</th>
                <td>
                  {%- if mf.cert_url != blank -%}
                    <a href="{{ mf.cert_url }}" rel="nofollow noopener" target="_blank">{{ lab_name | strip }} — verify</a>
                  {%- else -%}
                    {{ lab_name | strip }}
                  {%- endif -%}
                </td>
              </tr>
            {%- endif -%}`;

const BUY_FIND = `        {%- comment -%}
          One variant, no options, nothing to configure — so this form posts a
          fixed id and needs no JavaScript at all. No engraving, no size.
          Ed, 01/09/2026.
        {%- endcomment -%}
        {%- form 'product', p, class: 'stone__form' -%}
          <input type="hidden" name="id" value="{{ v.id }}">
          <button class="btn btn--block" type="submit" name="add"{% unless v.available %} disabled{% endunless %}>
            {%- if v.available -%}
              {{ s.atc_label | default: 'Add to bag' }}
            {%- else -%}
              {{ s.mto_label | default: 'Reserved — ask about similar stones' }}
            {%- endif -%}
          </button>
        {%- endform -%}

        {%- comment -%}
          "Set this in a ring" and the enquiry route. Both render only when a
          link is configured: what this button should DO is an open question
          with Ed, and a guessed destination on 27,000 pages is worse than no
          button.
        {%- endcomment -%}
        {%- if s.setting_label != blank and s.setting_link != blank -%}
          <a class="btn btn--outline btn--block" href="{{ s.setting_link }}">{{ s.setting_label }}</a>
        {%- endif -%}

        {%- if s.enquire_label != blank and s.enquire_link != blank -%}
          <a class="stone__enquire" href="{{ s.enquire_link }}">{{ s.enquire_label }}</a>
        {%- endif -%}

        {%- comment -%}`;

const BUY_REPLACE = `        {%- comment -%}`;

const AFTER_TABLE_FIND = `        {%- if s.reassurance != blank -%}
          <p class="stone__reassure fine">{{ s.reassurance }}</p>
        {%- endif -%}`;

const AFTER_TABLE_REPLACE = `        {%- comment -%}
          ---- Buying, BELOW the table — Ed, 01/09/2026 ----
          A loose stone is bought on its specification, so the facts are read
          before the commitment. On a ring the options ARE the decision and the
          button follows them; here the table plays that part.

          One variant, no options, nothing to configure — so this form posts a
          fixed id and needs no JavaScript at all. No engraving, no size.
        {%- endcomment -%}
        <div class="stone__actions">
          {%- form 'product', p, class: 'stone__form' -%}
            <input type="hidden" name="id" value="{{ v.id }}">
            <button class="btn btn--block" type="submit" name="add"{% unless v.available %} disabled{% endunless %}>
              {%- if v.available -%}
                {{ s.atc_label | default: 'Add to bag' }}
              {%- else -%}
                {{ s.mto_label | default: 'Reserved — ask about similar stones' }}
              {%- endif -%}
            </button>
          {%- endform -%}

          {%- comment -%}
            The enquiry button. Unlike "set this in a ring", whose destination
            is still an open question, an enquiry has an obvious home — so this
            renders with a default rather than waiting on a setting.
          {%- endcomment -%}
          {%- capture enquire_text -%}
            {%- if s.enquire_label != blank -%}
              {{ s.enquire_label }}
            {%- else -%}
              Contact us about this {{ stone_noun }}
            {%- endif -%}
          {%- endcapture -%}
          <a class="btn btn--outline btn--block"
             href="{{ s.enquire_link | default: '/pages/contact-us' }}">{{ enquire_text | strip }}</a>

          {%- comment -%}
            "Set this in a ring" still waits on a destination: a guessed link on
            27,000 pages is worse than no button.
          {%- endcomment -%}
          {%- if s.setting_label != blank and s.setting_link != blank -%}
            <a class="btn btn--outline btn--block" href="{{ s.setting_link }}">{{ s.setting_label }}</a>
          {%- endif -%}

          {%- comment -%}
            The same wishlist snippet the ring pages use, so one saved list
            covers rings and stones alike. "Come back with my partner" is the
            normal behaviour on this page, and it had no way to.
          {%- endcomment -%}
          {%- render 'fye-wishlist-button', product: p -%}
        </div>

        {%- if s.reassurance != blank -%}
          <p class="stone__reassure fine">{{ s.reassurance }}</p>
        {%- endif -%}`;

const CSS_FIND = `.fye .stone__form { margin: 0; }

.fye .stone__enquire {
  align-self: flex-start;
  font-size: var(--fs-fine);
  color: var(--ink-soft);
  border-bottom: 1px solid currentColor;
}

.fye .stone__enquire:hover { color: var(--sage); }`;

const CSS_REPLACE = `.fye .stone__form { margin: 0; }

/* The buttons sit below the table as one group, so the gap between the last
   row and the first button is a single decision rather than two stacked
   margins. */
.fye .stone__actions {
  display: flex;
  flex-direction: column;
  gap: var(--s3);
  margin-top: var(--s5);
}`;

/* Edit 6: the label-column comment. It named the certificate serial as the
   longest label, which is both stale and the thing that tripped v1's guard. */
const COMMENT_FIND = `/* The label column is sized so the longest field name ("Certificate number")
   does not wrap, which would break the row rhythm on a page whose whole job
   is legibility. */`;

const COMMENT_REPLACE = `/* The label column is sized so the longest field name — "Fluorescence",
   "Mine origin" — does not wrap, which would break the row rhythm on a page
   whose whole job is legibility. */`;

const EDITS = [
  [NOUN_FIND, NOUN_REPLACE],
  [CERT_FIND, CERT_REPLACE],
  [BUY_FIND, BUY_REPLACE],
  [AFTER_TABLE_FIND, AFTER_TABLE_REPLACE],
  [CSS_FIND, CSS_REPLACE],
  [COMMENT_FIND, COMMENT_REPLACE]
];

EDITS.forEach(function (pair, i) {
  const n = countOf(src, pair[0]);
  if (n !== 1) die('edit ' + (i + 1) + ': expected 1 match, found ' + n);
});

EDITS.forEach(function (pair) {
  src = src.replace(pair[0], pair[1]);
});

/* Assert on the MARKUP that was removed, not on a human phrase that also
   appears in prose — that is what tripped v1. */
if (src.indexOf('<th scope="row">Certificate number</th>') !== -1) {
  die('the certificate number ROW is still present after patching');
}
if (src.indexOf('mf.cert_number') !== -1) {
  die('cert_number is still read somewhere after patching');
}
if (src.indexOf('fye-wishlist-button') === -1) {
  die('the wishlist button did not land');
}

fs.writeFileSync(FILE, src, 'utf8');

const after = Buffer.byteLength(src, 'utf8');
console.log('Patched sections/fye-stone-product.liquid');
console.log('  ' + before + ' -> ' + after + ' bytes');
console.log('  cert serial removed · table above the buttons · wishlist · enquiry button');
