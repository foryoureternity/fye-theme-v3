/* ============================================================================
   rewrite-news-consult.mjs — 27/08/2026
   ----------------------------------------------------------------------------
     cd ~/Dropbox/GIT-repositaries/fye-theme-v3
     node docs/tools/rewrite-news-consult.mjs

   Delete once run and synced.

   Rewrites the layout of two sections to match live. Every setting ID is kept
   exactly as it was, so index.json needs no changes:
     latest-news-EM   heading, blog, bg_color   (+ two new labels, defaulted)
     fye-consultation eyebrow, heading, lead, btn_label, btn_link, band
                      + contact blocks (type, label, link)
   ========================================================================== */

import { writeFile } from 'node:fs/promises';

/* ==========================================================================
   1. latest-news-EM
   ========================================================================== */

const news = `{%- comment -%}
  latest-news-EM — the homepage news band. 1 use: index.

  Setting IDs frozen: \`heading\`, \`blog\`, \`bg_color\`. Two new label settings
  default, so existing JSON keeps working untouched.

  REBUILT 27/08/2026 to match live
  My first pass was uppercase tracked titles, dates, hairline rules and no
  buttons, which left the right column two-thirds empty and made the band
  taller than live's while carrying less. Live does more work per article:

    - flanked centred heading, the sitewide device
    - lead article left: large image with a panel overlapping its bottom-left
      corner holding title, excerpt and a small filled button
    - three articles right: image left, title + excerpt + button right
    - a centred closing button

  Titles are SENTENCE CASE, not the brand's uppercase. Article titles are
  sentences and uppercase at that length cannot be read — the same judgement
  as the hero's sentence-case h1. Uppercase stays on eyebrows and buttons.

  Dates are dropped: live does not show them, and a date on evergreen advice
  makes it look stale the moment it is a year old.
{%- endcomment -%}
{%- liquid
  assign s = section.settings
  assign band = s.bg_color | default: 'ivory'
  assign the_blog = blogs[s.blog]
  assign arts = the_blog.articles
  assign lead = arts[0]
  assign btn_label = s.btn_label | default: 'Read more'
  assign all_label = s.view_all_label | default: 'View more'
-%}

<div class="band band--{{ band }}">
  <div class="wrap">

    {%- if s.heading != blank -%}
      <div class="sect-head">
        <h2 class="heading-flank">{{ s.heading }}</h2>
      </div>
    {%- endif -%}

    {%- if arts.size == 0 -%}
      <p class="lead">No articles yet.</p>
    {%- else -%}

      <div class="news__grid">

        {%- if lead != blank -%}
          {%- liquid
            assign lead_alt = lead.title | strip_html | escape
            assign lead_excerpt = lead.excerpt_or_content | strip_html | truncatewords: 22
          -%}
          <div class="news__lead">
            <a class="news__lead-img" href="{{ lead.url }}" aria-label="{{ lead_alt }}">
              {%- if lead.image != blank -%}
                {{ lead.image | image_url: width: 1400 | image_tag:
                   loading: 'lazy', widths: '500,700,900,1200,1400',
                   sizes: '(max-width: 900px) 100vw, 50vw', alt: lead_alt }}
              {%- else -%}
                <span class="news__ph news__ph--lead"></span>
              {%- endif -%}
            </a>
            <div class="news__lead-words">
              <a class="news__title news__title--lead" href="{{ lead.url }}">{{ lead.title }}</a>
              <p class="news__excerpt">{{ lead_excerpt }}</p>
              <a class="news__more" href="{{ lead.url }}">{{ btn_label }}</a>
            </div>
          </div>
        {%- endif -%}

        <div class="news__list">
          {%- for article in arts offset: 1 limit: 3 -%}
            {%- liquid
              assign art_alt = article.title | strip_html | escape
              assign art_excerpt = article.excerpt_or_content | strip_html | truncatewords: 16
            -%}
            <div class="news__row">
              <a class="news__row-img" href="{{ article.url }}" aria-label="{{ art_alt }}">
                {%- if article.image != blank -%}
                  {{ article.image | image_url: width: 700 | image_tag:
                     loading: 'lazy', widths: '300,500,700',
                     sizes: '(max-width: 900px) 40vw, 20vw', alt: art_alt }}
                {%- else -%}
                  <span class="news__ph"></span>
                {%- endif -%}
              </a>
              <div class="news__row-words">
                <a class="news__title" href="{{ article.url }}">{{ article.title }}</a>
                <p class="news__excerpt">{{ art_excerpt }}</p>
                <a class="news__more" href="{{ article.url }}">{{ btn_label }}</a>
              </div>
            </div>
          {%- endfor -%}
        </div>

      </div>

      {%- if the_blog.url != blank -%}
        <div class="news__foot">
          <a class="btn btn--outline" href="{{ the_blog.url }}">{{ all_label }}</a>
        </div>
      {%- endif -%}

    {%- endif -%}

  </div>
</div>

{% stylesheet %}
.fye .news__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--s9);
  align-items: start;
}

.fye .news__lead { position: relative; }
.fye .news__lead-img { display: block; }
.fye .news__lead-img :where(img) {
  display: block; width: 100%; height: auto;
  aspect-ratio: 4 / 3; object-fit: cover;
}

/* The words overlap the photograph's bottom-left corner — live's device, and
   what makes the lead read as the lead rather than a bigger sibling. */
.fye .news__lead-words {
  position: relative;
  z-index: 1;
  width: min(78%, 420px);
  margin-top: -16%;
  padding: var(--s6);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--s4);
  background: #fff;
}
/* On a white band the panel needs to differ from the ground it sits on. */
.fye .band--white .news__lead-words { background: var(--ivory); }

.fye .news__list { display: flex; flex-direction: column; gap: var(--s8); }
.fye .news__row {
  display: grid;
  grid-template-columns: 42% 1fr;
  gap: var(--s6);
  align-items: start;
}
.fye .news__row-img { display: block; }
.fye .news__row-img :where(img) {
  display: block; width: 100%; height: auto;
  aspect-ratio: 3 / 2; object-fit: cover;
}
.fye .news__row-words { display: flex; flex-direction: column; align-items: flex-start; gap: var(--s3); }

.fye .news__title {
  font-family: var(--font-display);
  font-size: 20px;
  line-height: 1.3;
  letter-spacing: 0.01em;
  text-transform: none;
  color: var(--ink);
  text-decoration: none;
  text-wrap: pretty;
  transition: color var(--dur) var(--ease);
}
.fye .news__title--lead { font-size: 24px; }
.fye .news__title:hover { color: var(--sage); }

.fye .news__excerpt {
  margin: 0;
  font-size: var(--fs-small);
  line-height: 1.6;
  color: var(--ink-soft);
  text-wrap: pretty;
}

/* Small filled button. Not .btn — that is the section scale, and four of them
   at that size would shout down the articles they belong to. */
.fye .news__more {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 var(--s4);
  background: var(--teal);
  color: var(--on-dark);
  font-size: var(--fs-eyebrow);
  font-weight: var(--fw-medium);
  letter-spacing: var(--tr-eyebrow);
  text-transform: uppercase;
  text-decoration: none;
  transition: background var(--dur) var(--ease);
}
.fye .news__more:hover { background: var(--sage); color: var(--teal); }

.fye .news__ph { display: block; aspect-ratio: 3 / 2; background: var(--ivory); border: var(--hairline); }
.fye .news__ph--lead { aspect-ratio: 4 / 3; }
.fye .news__foot { display: flex; justify-content: center; margin-top: var(--s9); }

@media (max-width: 900px) {
  .fye .news__grid { grid-template-columns: 1fr; gap: var(--s8); }
  /* Overlap is a wide-screen device. Stacked, it just crops the photograph. */
  .fye .news__lead-words,
  .fye .band--white .news__lead-words {
    width: 100%; margin-top: 0; padding: var(--s5) 0 0; background: transparent;
  }
}
@media (max-width: 560px) {
  .fye .news__row { grid-template-columns: 1fr; gap: var(--s4); }
}
{% endstylesheet %}

{% schema %}
{
  "name": "Latest news",
  "tag": "section",
  "settings": [
    { "type": "text", "id": "heading", "label": "Heading", "default": "Latest news" },
    { "type": "blog", "id": "blog", "label": "Blog" },
    { "type": "text", "id": "btn_label", "label": "Article button label", "default": "Read more" },
    { "type": "text", "id": "view_all_label", "label": "Closing button label", "default": "View more" },
    { "type": "header", "content": "Background" },
    {
      "type": "select", "id": "bg_color", "label": "Background", "default": "ivory",
      "options": [
        { "value": "white", "label": "White" },
        { "value": "ivory", "label": "Champagne ivory" },
        { "value": "mist",  "label": "Mist blue" }
      ]
    }
  ],
  "presets": [{ "name": "Latest news" }]
}
{% endschema %}
`;

/* ==========================================================================
   2. fye-consultation
   ========================================================================== */

const consult = `{%- comment -%}
  fye-consultation — the closing "book a consultation" band.

  Setting IDs frozen: \`eyebrow\`, \`heading\`, \`lead\`, \`btn_label\`, \`btn_link\`,
  \`band\`; contact blocks keep \`type\`, \`label\`, \`link\`.

  REBUILT 27/08/2026 to match live
  Mine was a centred stack using the flanked heading. Once the flank fix let
  those hairlines run the full container width, the band read as mostly empty
  air — a lot of height for four short lines.

  Live is two columns: eyebrow, heading and lead left; the button and the three
  contact links right. Same content, two-thirds the height, and the button sits
  beside the heading rather than three rows below it. No flanked heading here —
  the device belongs on centred section headers, and this heading is not one.
{%- endcomment -%}
{%- liquid
  assign s = section.settings
  assign band = s.band | default: 'teal'
-%}

<div class="band band--{{ band }}">
  <div class="wrap consult__inner">

    <div class="consult__words">
      {%- if s.eyebrow != blank -%}
        <p class="eyebrow">{{ s.eyebrow }}</p>
      {%- endif -%}
      {%- if s.heading != blank -%}
        <h2 class="consult__heading">{{ s.heading }}</h2>
      {%- endif -%}
      {%- if s.lead != blank -%}
        <p class="lead consult__lead">{{ s.lead }}</p>
      {%- endif -%}
    </div>

    <div class="consult__actions">
      {%- if s.btn_label != blank -%}
        <a class="btn consult__btn" href="{{ s.btn_link | default: '#' }}">{{ s.btn_label }}</a>
      {%- endif -%}

      {%- if section.blocks.size > 0 -%}
        <div class="consult__contacts">
          {%- for block in section.blocks -%}
            {%- liquid
              assign b = block.settings
              assign href = b.link
              if href == blank
                case b.type
                  when 'phone'
                    assign href = b.label | remove: ' ' | prepend: 'tel:'
                  when 'email'
                    assign href = b.label | prepend: 'mailto:'
                  when 'whatsapp'
                    assign href = 'https://wa.me/442081786687'
                endcase
              endif
              assign icon_name = b.type
              if b.type == 'phone'
                assign icon_name = 'phone'
              endif
            -%}
            <a class="consult__contact-link" href="{{ href }}" {{ block.shopify_attributes }}>
              {%- render 'icon', name: icon_name, class: 'icon--sm' -%}
              <span>{{ b.label }}</span>
            </a>
          {%- endfor -%}
        </div>
      {%- endif -%}
    </div>

  </div>
</div>

{% stylesheet %}
/* Words left, actions right. auto on the second column so the button keeps its
   natural width and the copy takes the rest. */
.fye .consult__inner {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--s9);
  align-items: center;
}
.fye .consult__words { display: flex; flex-direction: column; align-items: flex-start; gap: var(--s4); }
.fye .consult__heading { margin: 0; text-wrap: pretty; }
.fye .consult__lead { margin: 0; max-width: 52ch; }

/* Button above, contacts beneath, both aligned to the right edge — live's
   arrangement, and it keeps the button clear of the contact row. */
.fye .consult__actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--s6);
}
.fye .consult__contacts { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: var(--s6); }
.fye .consult__contact-link {
  display: inline-flex;
  align-items: center;
  gap: var(--s2);
  font-size: var(--fs-small);
  text-decoration: none;
}
.fye .consult__contact-link:hover { text-decoration: underline; text-underline-offset: 4px; }

@media (max-width: 900px) {
  .fye .consult__inner { grid-template-columns: 1fr; gap: var(--s7); }
  .fye .consult__actions { align-items: flex-start; }
  .fye .consult__contacts { justify-content: flex-start; gap: var(--s5); }
}
{% endstylesheet %}

{% schema %}
{
  "name": "Consultation CTA",
  "tag": "section",
  "settings": [
    { "type": "text", "id": "eyebrow", "label": "Eyebrow", "default": "Personal guidance" },
    { "type": "text", "id": "heading", "label": "Heading", "default": "Still unsure where to start?" },
    { "type": "text", "id": "lead", "label": "Text" },
    { "type": "text", "id": "btn_label", "label": "Button label", "default": "Book a free consultation" },
    { "type": "url", "id": "btn_link", "label": "Button link" },
    { "type": "header", "content": "Background" },
    {
      "type": "select", "id": "band", "label": "Background", "default": "teal",
      "options": [
        { "value": "teal",  "label": "Eternal teal" },
        { "value": "sage",  "label": "Sage green" },
        { "value": "ivory", "label": "Champagne ivory" },
        { "value": "mist",  "label": "Mist blue" }
      ]
    }
  ],
  "blocks": [
    {
      "type": "contact",
      "name": "Contact",
      "settings": [
        {
          "type": "select", "id": "type", "label": "Type", "default": "phone",
          "options": [
            { "value": "phone",    "label": "Phone" },
            { "value": "email",    "label": "Email" },
            { "value": "whatsapp", "label": "WhatsApp" }
          ]
        },
        { "type": "text", "id": "label", "label": "Label" },
        { "type": "url", "id": "link", "label": "Link", "info": "Optional. Built from the label when empty." }
      ]
    }
  ],
  "presets": [
    {
      "name": "Consultation CTA",
      "blocks": [{ "type": "contact" }, { "type": "contact" }, { "type": "contact" }]
    }
  ]
}
{% endschema %}
`;

await writeFile('sections/latest-news-EM.liquid', news, 'utf8');
console.log("FIXED sections/latest-news-EM.liquid");

await writeFile('sections/fye-consultation.liquid', consult, 'utf8');
console.log("FIXED sections/fye-consultation.liquid");
