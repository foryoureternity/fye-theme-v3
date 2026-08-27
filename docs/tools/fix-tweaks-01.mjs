/* ============================================================================
   fix-tweaks-01.mjs — four small changes, 27/08/2026
   ----------------------------------------------------------------------------
     cd ~/Dropbox/GIT-repositaries/fye-theme-v3
     node docs/tools/fix-tweaks-01.mjs

   Delete once run and synced.

   1. guide-download-block: the "All guides" button goes, with its CSS and its
      `view_all_url` setting. The value still sitting in index.json is simply
      ignored — an unread setting is harmless, whereas leaving the setting in
      the schema invites someone to fill it in and wonder why nothing appears.
      `.row--center` stays: it is one line and other sections use that class.

   2. guide-download-block: each guide's title, blurb and button centre under
      its cover. Six covers in a row read as a shelf, and left-aligned labels
      under centred artwork look like a mistake at that size.

   3. fye-testimonials: filled stars. The icon snippet draws a stroked star, so
      the fill is forced here rather than by adding a second icon — and it is
      forced on the descendants too, not just the <svg>, because a `fill="none"`
      presentation attribute on the inner path is not overridden by a rule
      aimed at the root.

   4. fye-testimonials: the "4.9/5 average" line goes — markup, CSS and the
      `avg_rating` setting. Live has it switched off, and a self-reported
      average next to six real quotes adds nothing the quotes do not.
   ========================================================================== */

import { readFile, writeFile } from 'node:fs/promises';

const jobs = [
  {
    file: 'sections/guide-download-block.liquid',
    edits: [
      {
        label: 'remove the All guides button',
        find: `    {%- if s.view_all_url != blank -%}
      <div class="row row--center guides__all">
        <a class="btn" href="{{ s.view_all_url }}">All guides</a>
      </div>
    {%- endif -%}
`,
        replace: ``
      },
      {
        label: 'remove .guides__all CSS',
        find: `.fye .row--center { justify-content: center; }
.fye .guides__all { margin-top: var(--s10); }`,
        replace: `.fye .row--center { justify-content: center; }`
      },
      {
        label: 'remove view_all_url setting',
        find: `    { "type": "url", "id": "view_all_url", "label": "All-guides link" },
`,
        replace: ``
      },
      {
        label: 'centre each guide\'s words under its cover',
        find: `.fye .guides__words {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--s3);
}`,
        replace: `/* Centred under the cover: six covers in a row read as a shelf, and a
   left-aligned label under centred artwork looks like a mistake at this size. */
.fye .guides__words {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--s3);
}`
      },
      {
        label: 'drop view_all_url from the doc comment',
        find: `  Setting IDs kept: \`heading\`, \`subtext\`, \`button_label\`, \`view_all_url\`,
  \`background\`;`,
        replace: `  Setting IDs kept: \`heading\`, \`subtext\`, \`button_label\`, \`background\`;`
      }
    ]
  },
  {
    file: 'sections/fye-testimonials.liquid',
    edits: [
      {
        label: 'remove the average-rating line',
        find: `        {%- if s.avg_rating != blank -%}
          <p class="tmon__avg">
            {%- render 'icon', name: 'star', class: 'icon--sm' -%}
            <span>{{ s.avg_rating }} average</span>
          </p>
        {%- endif -%}
`,
        replace: ``
      },
      {
        label: 'remove .tmon__avg CSS',
        find: `.fye .tmon__avg {
  display: inline-flex;
  align-items: center;
  gap: var(--s2);
  margin: 0;
  font-size: var(--fs-small);
  color: var(--ink-soft);
}`,
        replace: ``
      },
      {
        label: 'remove avg_rating setting',
        find: `    { "type": "text", "id": "avg_rating", "label": "Average rating", "default": "4.9/5", "info": "Rendered as \\"4.9/5 average\\". Leave empty to hide." },
`,
        replace: ``
      },
      {
        label: 'fill the stars',
        find: `.fye .tmon__stars { display: flex; gap: 2px; margin: 0; color: var(--sage); }`,
        replace: `/* Filled, not outlined. The icon snippet draws a stroked star, so the fill is
   forced here — and on the descendants, because a fill="none" presentation
   attribute on the inner path is not overridden by a rule aimed at the <svg>. */
.fye .tmon__stars { display: flex; gap: 2px; margin: 0; color: var(--sage); }
.fye .tmon__stars :where(svg, svg *) { fill: currentColor; stroke: none; }`
      },
      {
        label: 'drop avg_rating from the doc comment',
        find: `  Setting IDs kept, all of them: \`heading\`, \`avg_rating\`, \`enable_autoplay\`,`,
        replace: `  Setting IDs kept: \`heading\`, \`enable_autoplay\`,`
      }
    ]
  }
];

for (const { file, edits } of jobs) {
  let src = await readFile(file, 'utf8');
  let ok = 0;
  for (const { label, find, replace } of edits) {
    const n = src.split(find).length - 1;
    if (n !== 1) {
      console.log(`SKIP  ${file} — ${label} (${n} matches)`);
      continue;
    }
    src = src.replace(find, replace);
    console.log(`  ok  ${label}`);
    ok++;
  }
  await writeFile(file, src, 'utf8');
  console.log(`FIXED ${file} — ${ok} of ${edits.length}`);
}
