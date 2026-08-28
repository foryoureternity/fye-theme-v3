/* ============================================================================
   fix-logos.mjs — 28/08/2026
   ----------------------------------------------------------------------------
     cd ~/Dropbox/GIT-repositaries/fye-theme-v3
     node docs/tools/fix-logos.mjs

   Delete once run and synced.

   NOTHING NEEDS COPYING. The logos are not theme assets — they are in Files,
   so v3 can point at the identical images the live site uses:

     header wordmark  TER_Logo_Teal_f8aa5b79-…svg   471x264
     mobile mark      fye-brand-mark.webp           571x320
     footer monogram  FYE-initial-logo.svg          100x100

   WHY THE HEADER SHOWED "FOR YOUR ETERNITY" AS TEXT
   It rendered `settings.logo | image_url: width: 800 | image_tag`. The
   image_url filter only processes RASTERS — hand it an SVG and it returns
   nothing, so the {%- else -%} text fallback rendered instead. This is the
   same trap noted when the hero was rebuilt: live's own hero takes its logo as
   a plain text URL for exactly this reason.

   So both logos become plain text settings holding a URL, output directly in
   an <img src> with no filter. Editable in the theme editor, and an SVG works.
   The old image_url path is kept as a middle fallback for a raster, and the
   text fallback stays as the last resort.

   Width/height attributes are on both images — real intrinsic dimensions, so
   the header does not shift as they load. The header is the first thing on
   every page; a reflow there is the most visible one on the site.

   The footer monogram is patched by regex rather than exact match, because I
   do not have that file's current text to hand and a wrong exact match would
   silently do nothing. If the regex misses, the script prints every logo line
   in the footer so the next pass is exact.
   ========================================================================== */

import { readFile, writeFile } from 'node:fs/promises';

const LOGO_D = 'https://cdn.shopify.com/s/files/1/0972/5391/7056/files/TER_Logo_Teal_f8aa5b79-0138-4319-8fba-25f42c08e217.svg?v=1774511367';
const LOGO_M = 'https://cdn.shopify.com/s/files/1/0972/5391/7056/files/fye-brand-mark.webp?v=1785320235';
const MONO   = 'https://cdn.shopify.com/s/files/1/0972/5391/7056/files/FYE-initial-logo.svg?v=1771578232';

/* ==========================================================================
   1. header
   ========================================================================== */

const HDR = 'sections/header-bottom.liquid';
let hdr = await readFile(HDR, 'utf8');

const hdrEdits = [
  {
    label: 'logo markup: direct URLs, no image_url filter',
    find: `      <a class="hdr__logo" href="{{ routes.root_url }}">
        {%- if settings.logo != blank -%}
          {{ settings.logo | image_url: width: 800 | image_tag: alt: shop.name, loading: 'eager' }}
        {%- else -%}
          <span class="hdr__logo-text">{{ shop.name }}</span>
        {%- endif -%}
      </a>`,
    replace: `      {%- liquid
        assign logo_d = section.settings.logo_url
        assign logo_m = section.settings.logo_mb_url | default: logo_d
      -%}
      <a class="hdr__logo" href="{{ routes.root_url }}">
        {%- comment -%}
          Output directly, NO image_url filter: that filter only handles
          rasters, and handing it the SVG wordmark returned nothing, which is
          why this fell through to the text fallback. width/height are the real
          intrinsic sizes so the header does not reflow as they load.
        {%- endcomment -%}
        {%- if logo_d != blank -%}
          <img class="hdr__logo-img hdr__logo-img--d" src="{{ logo_d }}" alt="{{ shop.name | escape }}" width="471" height="264" fetchpriority="high">
          <img class="hdr__logo-img hdr__logo-img--m" src="{{ logo_m }}" alt="{{ shop.name | escape }}" width="571" height="320" fetchpriority="high">
        {%- elsif settings.logo != blank -%}
          {{ settings.logo | image_url: width: 800 | image_tag: alt: shop.name, loading: 'eager' }}
        {%- else -%}
          <span class="hdr__logo-text">{{ shop.name }}</span>
        {%- endif -%}
      </a>`
  },
  {
    label: 'logo settings in the schema',
    find: `  "settings": [
    { "type": "text", "id": "phone", "label": "Phone", "default": "0208 178 6687" },`,
    replace: `  "settings": [
    { "type": "header", "content": "Logo" },
    {
      "type": "text", "id": "logo_url", "label": "Logo URL (desktop)",
      "info": "A Files URL. Plain URL, not an image picker \\u2014 SVG logos cannot be rendered through an image picker.",
      "default": "${LOGO_D}"
    },
    {
      "type": "text", "id": "logo_mb_url", "label": "Logo URL (mobile)",
      "info": "Optional. Falls back to the desktop logo.",
      "default": "${LOGO_M}"
    },
    { "type": "header", "content": "Contact" },
    { "type": "text", "id": "phone", "label": "Phone", "default": "0208 178 6687" },`
  },
  {
    label: 'breakpoint swap appended at the end of the stylesheet',
    find: `{% endstylesheet %}`,
    replace: `
/* Which logo shows. Appended at the END: a media query adds a condition, not
   specificity, so an override placed above the base rules only half-applies. */
.fye .hdr__logo-img { display: block; height: 96px; width: auto; }
.fye .hdr__logo-img--m { display: none; }

@media (max-width: 900px) {
  /* The mobile mark is 571x320 — a wide lockup. Capped by height to fit the
     62px row; raise this if it reads small on a real phone. */
  .fye .hdr__logo-img--d { display: none; }
  .fye .hdr__logo-img--m { display: block; height: 40px; width: auto; }
}
{% endstylesheet %}`
  }
];

for (const { label, find, replace } of hdrEdits) {
  const n = hdr.split(find).length - 1;
  if (n !== 1) {
    console.log(`SKIP  ${HDR} — ${label} (${n} matches)`);
    continue;
  }
  hdr = hdr.replace(find, replace);
  console.log(`  ok  ${label}`);
}
await writeFile(HDR, hdr, 'utf8');
console.log(`FIXED ${HDR}`);

/* ==========================================================================
   2. footer monogram
   ========================================================================== */

const FTR = 'sections/footer.liquid';
let ftr = await readFile(FTR, 'utf8');
let ftrDone = false;

/* Any {{ ... image_url ... image_tag ... }} output in the footer that carries a
   logo/monogram/mark setting. Replaced with a direct <img>. */
const monoRe = /\{\{-?\s*(section\.settings\.[a-z_]*(?:logo|mono|mark)[a-z_]*|settings\.logo)\s*\|[^}]*\}\}/gi;
const monoHits = ftr.match(monoRe);

if (monoHits) {
  ftr = ftr.replace(
    monoRe,
    `<img class="ftr__mono-img" src="{{ section.settings.mono_url | default: '${MONO}' }}" alt="{{ shop.name | escape }}" width="100" height="100" loading="lazy">`
  );
  console.log(`  ok  footer monogram: ${monoHits.length} filtered output(s) replaced with a direct <img>`);
  ftrDone = true;
}

/* The setting, so it is editable rather than hard-coded. */
if (ftrDone && !ftr.includes('"id": "mono_url"')) {
  const anchor = '  "settings": [';
  if (ftr.includes(anchor)) {
    ftr = ftr.replace(
      anchor,
      `  "settings": [
    { "type": "header", "content": "Monogram" },
    {
      "type": "text", "id": "mono_url", "label": "Monogram URL",
      "info": "A Files URL. Plain URL, not an image picker \\u2014 an SVG cannot render through a picker.",
      "default": "${MONO}"
    },`
    );
    console.log('  ok  footer: mono_url setting added');
  }
}

/* Size it, appended last. */
if (ftrDone && !ftr.includes('.ftr__mono-img')) {
  ftr = ftr.replace(
    '{% endstylesheet %}',
    `
/* Monogram. Appended last, per the media-query ordering rule. */
.fye .ftr__mono-img { display: block; width: 140px; height: auto; }
@media (max-width: 768px) {
  .fye .ftr__mono-img { width: 96px; margin-inline: auto; }
}
{% endstylesheet %}`
  );
  console.log('  ok  footer: monogram sized (140px desktop, 96px mobile)');
}

if (ftrDone) {
  await writeFile(FTR, ftr, 'utf8');
  console.log(`FIXED ${FTR}`);
} else {
  console.log(`\nSKIP  ${FTR} — no filtered logo output matched. Lines mentioning a logo:`);
  ftr.split('\n').forEach((l, i) => {
    if (/logo|mono|mark|image_url/i.test(l)) console.log(`  ${i + 1}  ${l.trim()}`);
  });
}

/* ==========================================================================
   3. report: what schema-org currently asks for
   ========================================================================== */

try {
  const so = await readFile('snippets/schema-org.liquid', 'utf8');
  console.log('\n---- schema-org.liquid, lines referencing an image ----');
  so.split('\n').forEach((l, i) => {
    if (/asset_url|logo|image/i.test(l)) console.log(`  ${i + 1}  ${l.trim()}`);
  });
} catch {
  console.log('\n(no snippets/schema-org.liquid found)');
}
