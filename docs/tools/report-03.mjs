/* ============================================================================
   report-03.mjs — 27/08/2026. Read-only.
   ----------------------------------------------------------------------------
     cd ~/Dropbox/GIT-repositaries/fye-theme-v3
     node docs/tools/report-03.mjs

   I am about to rewrite the layout of two sections — latest news and the
   consultation band — so I need their real filenames, their setting IDs and
   their block types before I touch either. Rewriting a section without its
   frozen setting IDs is how you silently blank the content on 27 templates.

   Prints, for every section file matching news / consult / consultation:
     - the filename
     - every setting id + type in its schema
     - every block type + its setting ids
     - the markup class names, so I can see the current structure
   ========================================================================== */

import { readFile, readdir } from 'node:fs/promises';

const names = (await readdir('sections')).filter((n) =>
  /news|consult/i.test(n) && n.endsWith('.liquid')
);

console.log(`---- matching section files ----\n  ${names.join('\n  ') || '(none)'}`);

for (const name of names) {
  const src = await readFile(`sections/${name}`, 'utf8');
  console.log(`\n\n======== sections/${name} (${src.length} bytes) ========`);

  const m = src.match(/\{%\s*schema\s*%\}([\s\S]*?)\{%\s*endschema\s*%\}/);
  if (!m) {
    console.log('  no schema found');
  } else {
    let schema;
    try {
      schema = JSON.parse(m[1]);
    } catch (e) {
      console.log(`  schema will not parse: ${e.message}`);
      schema = null;
    }
    if (schema) {
      console.log(`  name: ${schema.name}`);
      const list = (arr) =>
        (arr || [])
          .map((s) => (s.type === 'header' ? `    — ${s.content}` : `    ${s.id} (${s.type})`))
          .join('\n');
      console.log('  settings:');
      console.log(list(schema.settings));
      for (const b of schema.blocks || []) {
        console.log(`  block "${b.type}" (${b.name}):`);
        console.log(list(b.settings));
      }
    }
  }

  const cls = new Set();
  for (const mm of src.matchAll(/class="([^"{]*)"/g))
    mm[1].split(/\s+/).forEach((c) => c && cls.add(c));
  console.log(`  classes: ${[...cls].join(', ')}`);
}
