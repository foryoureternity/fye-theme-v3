/* ============================================================================
   fix-nav-link.mjs — 28/08/2026
   ----------------------------------------------------------------------------
     cd ~/Dropbox/GIT-repositaries/fye-theme-v3
     node docs/tools/fix-nav-link.mjs

   Delete once run and synced.

   THE ACTUAL BUG, at last. The console said:

     kids: ['hdr__nav-link is-active', 'mm__main', 'mm__side']

   The nav LINK was a child of .mega__in. That is only possible if its </a>
   never closed: the browser then reparents the panel inside the open anchor and
   the grid gets three children instead of two, the first being the nav link.
   Hence the whole panel shunted into the second column and everything
   overlapping — the grid was doing exactly what it was told, with the wrong
   children.

   Cause: when rebuild-mega-live.mjs sliced the panel region in, its start
   anchor matched a point ABOVE the anchor's closing tag, so `</a>` went with
   the replaced text. The CSS was never at fault, which is why three rounds of
   looking at it found nothing.

   THE FIX
   Rebuild the <li> opening — nav item, anchor, title, chevron, closing </a> —
   canonically, from the start of the <li> to the start of the panel block. No
   partial patching: the whole opening is rewritten so it cannot be
   half-correct.

   THE LESSON, and it is the fifth cascade-family bug today but a different
   family entirely: when a slice-based edit goes wrong it does not fail loudly,
   it produces VALID markup with the wrong nesting. Prefer replacing whole
   balanced elements, and when a layout misbehaves check the DOM's children
   before reading the CSS again — one console line named this in seconds after
   three rounds of stylesheet archaeology.
   ========================================================================== */

import { readFile, writeFile } from 'node:fs/promises';

const FILE = 'sections/header-bottom.liquid';
let src = await readFile(FILE, 'utf8');

const liStart = src.indexOf('<li class="hdr__nav-item');
const panelStart = src.indexOf(`{%- if block.type == 'mega' -%}`, liStart);

if (liStart === -1 || panelStart === -1) {
  console.log('SKIP  could not locate the nav item or the panel block');
} else {
  const before = src.slice(liStart, panelStart);
  console.log('---- replacing ----');
  console.log(before.replace(/\n/g, '\n  ').slice(0, 600));

  const canonical = `<li class="hdr__nav-item{% if block.type == 'mega' %} has-mega{% endif %}" {{ block.shopify_attributes }}>
            <a class="hdr__nav-link{% if is_active %} is-active{% endif %}" href="{{ block.settings.url | default: '#' }}">
              <span>{{ block.settings.title }}</span>
              {%- if block.type == 'mega' -%}{% render 'icon', name: 'chevron-down', size: 13 %}{%- endif -%}
            </a>

            `;

  src = src.slice(0, liStart) + canonical + src.slice(panelStart);
  await writeFile(FILE, src, 'utf8');
  console.log(`\nFIXED ${FILE} — nav link closed before the panel opens`);
}
