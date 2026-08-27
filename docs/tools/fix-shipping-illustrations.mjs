/* ============================================================================
   fix-shipping-illustrations.mjs — point the shipping section at the snippet
   ----------------------------------------------------------------------------
     cd ~/Dropbox/GIT-repositaries/fye-theme-v3
     node docs/tools/fix-shipping-illustrations.mjs

   Run AFTER extract-illustrations.mjs. Delete both once run and synced.

   The `shipping` section was written to render an SVG pasted into each block's
   `html` setting. Now that the eight drawings live in snippets/illustration
   .liquid, a block names one instead. `html` still works and still wins, for
   a one-off drawing that is not part of the set.
   ========================================================================== */

import { readFile, writeFile } from 'node:fs/promises';

const FILE = 'sections/shipping.liquid';

const EDITS = [
  {
    find: `              {%- if b.html != blank -%}
                {{ b.html }}
              {%- elsif b.icon != blank -%}
                {%- render 'icon', name: b.icon, class: 'icon--lg' -%}
              {%- endif -%}`,
    replace: `              {%- if b.html != blank -%}
                {{ b.html }}
              {%- elsif b.illustration != blank -%}
                {%- render 'illustration', name: b.illustration -%}
              {%- elsif b.icon != blank -%}
                {%- render 'icon', name: b.icon, class: 'icon--lg' -%}
              {%- endif -%}`
  },
  {
    find: `        { "type": "richtext", "id": "text", "label": "Text" },
        { "type": "html", "id": "html", "label": "Illustration", "info": "An FYE line drawing as inline SVG. Leave empty to use a named icon instead." },
        { "type": "text", "id": "icon", "label": "Icon name", "info": "Used only when there is no illustration — e.g. shipping, warranty, resize, ethical, certificate." }`,
    replace: `        { "type": "richtext", "id": "text", "label": "Text" },
        {
          "type": "select", "id": "illustration", "label": "Illustration", "default": "diamond",
          "info": "An FYE line drawing from snippets/illustration.liquid.",
          "options": [
            { "value": "diamond",   "label": "Faceted diamond" },
            { "value": "pricing",   "label": "Price tag" },
            { "value": "rings",     "label": "Interlocking rings" },
            { "value": "education", "label": "Diamond and tick" },
            { "value": "custom",    "label": "Customisable" },
            { "value": "shipping",  "label": "Delivery van" },
            { "value": "resize",    "label": "Resizing arrows" },
            { "value": "warranty",  "label": "Shield and tick" }
          ]
        },
        { "type": "html", "id": "html", "label": "One-off SVG", "info": "Only for a drawing that is not in the set above. Wins over the illustration when set." },
        { "type": "text", "id": "icon", "label": "Icon name", "info": "Last resort — a UI icon from snippets/icon.liquid." }`
  },
  {
    find: `  THE \`html\` BLOCK SETTING IS THE POINT OF THIS SECTION, and it is the one
  place in the theme where raw HTML in a setting is right. Each block holds a
  bespoke FYE line drawing as inline SVG — the faceted-diamond mark, the two
  interlocking rings, the shield-and-tick — drawn for the brand at 0.75px
  stroke in Eternal Teal. They are not in snippets/icon.liquid because they are
  illustrations, not UI icons, and they are per-page content rather than a
  fixed set. Rendered raw, unescaped, deliberately.

  A block with no \`html\` falls back to the \`icon\` field read as a name from
  snippets/icon.liquid, so a new row can be added without drawing anything.`,
    replace: `  THE DRAWINGS MOVED OUT OF THE CONTENT. Each block used to hold a bespoke FYE
  line drawing as raw inline SVG — the faceted diamond, the interlocking rings,
  the shield and tick, 2-4KB apiece. The same eight appeared on all three ring
  pages: ~90KB of duplicated artwork maintained in three places, and already
  drifting (the wedding page's resize drawing had a corrupted \`stroke-w idth\`
  attribute the engagement page's did not). They now live in
  snippets/illustration.liquid and a block names one.

  Three ways to fill the mark, in the order they are tried:
    \`html\`         — a one-off SVG pasted in. Still supported, still wins.
    \`illustration\` — a name from snippets/illustration.liquid. The normal case.
    \`icon\`         — a UI icon from snippets/icon.liquid, as a last resort.`
  }
];

let text = await readFile(FILE, 'utf8');
let ok = true;

for (const { find, replace } of EDITS) {
  const hits = text.split(find).length - 1;
  if (hits !== 1) {
    console.log(`FAIL — expected 1 match, found ${hits}: ${JSON.stringify(find.slice(0, 70))}`);
    ok = false;
    continue;
  }
  text = text.replace(find, replace);
}

if (!ok) {
  console.log(`\n${FILE} NOT written.`);
} else {
  await writeFile(FILE, text, 'utf8');
  console.log(`FIXED ${FILE} — blocks now name an illustration`);
}
