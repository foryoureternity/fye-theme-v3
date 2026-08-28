/* ============================================================================
   fix-nav-link-02.mjs — 28/08/2026
   ----------------------------------------------------------------------------
     cd ~/Dropbox/GIT-repositaries/fye-theme-v3
     node docs/tools/fix-nav-link-02.mjs

   Delete once run and synced.

   SAME BUG AS LAST NIGHT, SAME CAUSE, MY FAULT TWICE.

   The console again showed the nav link as a CHILD of .mega__in:

     kids: ['hdr__nav-link is-active', 'mm__main', 'mm__side']

   which is only possible with an unclosed </a>. mega-exact.mjs located the
   panel with:

     hdr.indexOf("{%- if block.type == 'mega' -%}")

   but that exact string appears TWICE, and the first occurrence is the
   CHEVRON, inside the anchor:

     <a class="hdr__nav-link" ...>
       <span>{{ title }}</span>
       {%- if block.type == 'mega' -%}{% render 'icon' ... %}{%- endif -%}   <-- matched here
     </a>

   So the slice began mid-anchor and swallowed the closing tag. The widths
   being 0 in the probe is just the panel sitting closed; the child list is the
   real finding.

   THE FIX
   Anchor on a string unique to the PANEL — its `{%- liquid` line follows
   immediately — then rewrite the whole <li> opening canonically. The nav item,
   anchor, title, chevron and </a> are emitted as one balanced block, so it
   cannot end up half-written.

   THE RULE, now learned the hard way twice: never locate a Liquid region by a
   condition string. Conditions repeat. Anchor on markup that occurs once, and
   replace whole balanced elements.
   ========================================================================== */

import { readFile, writeFile } from 'node:fs/promises';

const FILE = 'sections/header-bottom.liquid';
let src = await readFile(FILE, 'utf8');

/* Unique to the panel: the condition plus the liquid tag that follows it. */
const PANEL = `{%- if block.type == 'mega' -%}\n              {%- liquid`;
const panelAt = src.indexOf(PANEL);
const liAt = src.indexOf('<li class="hdr__nav-item');

if (panelAt === -1 || liAt === -1 || liAt > panelAt) {
  console.log('SKIP  could not locate the nav item and the panel');
  console.log(`      liAt=${liAt} panelAt=${panelAt}`);
} else {
  console.log('---- replacing ----');
  console.log(src.slice(liAt, panelAt).replace(/\n/g, '\n  '));

  const canonical = `<li class="hdr__nav-item{% if block.type == 'mega' %} has-mega{% endif %}" {{ block.shopify_attributes }}>
            {%- comment -%}
              The anchor is emitted as one balanced block. Twice now a slice
              anchored on "if block.type == 'mega'" has matched the CHEVRON
              inside this anchor rather than the panel below it, taking the
              </a> with it and nesting the whole panel inside the link.
            {%- endcomment -%}
            <a class="hdr__nav-link{% if is_active %} is-active{% endif %}" href="{{ block.settings.url | default: '#' }}">
              <span>{{ block.settings.title }}</span>
              {%- if block.type == 'mega' -%}{% render 'icon', name: 'chevron-down', size: 13 %}{%- endif -%}
            </a>

            `;

  src = src.slice(0, liAt) + canonical + src.slice(panelAt);
  await writeFile(FILE, src, 'utf8');
  console.log(`\nFIXED ${FILE} — anchor closed before the panel opens`);
}
