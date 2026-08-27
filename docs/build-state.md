# FYE v3 — build state

Last updated: 27/08/2026

## Read first

1. **`conventions.md`** — how to write code in this theme. File anatomy, CSS,
   Liquid, schema, JS, accessibility, comments, definition of done. Read it
   before writing anything, every session.
2. This file — how to read/write the repo, what is built, what is next.
3. **`section-usage.md`** — which of the old theme's 228 sections actually
   render, generated from all 134 templates. It is the build queue. A reference
   is not a use.

## HOW CLAUDE READS AND WRITES THIS REPO — read before anything else

**Do NOT use the GitHub tools. GitHub is not part of the loop.**

The repo lives inside Ed's Dropbox, and Dropbox is connected. So:

- **Write** with `dropbox__create_file`, path
  `/GIT-repositaries/fye-theme-v3/<folder>/<file>`.
  It refuses an existing path with ALREADY_EXISTS — call `dropbox__delete` on
  the path first, then create again.
- **Read** with `dropbox__fetch`, id = that same path.
- **List** with `dropbox__list_folder`.
- **Read the OLD theme** the same way, at
  `/GIT-repositaries/fye-shopify-theme/` — 228 sections, 134 templates. Read it
  for structure and setting IDs; never copy its code.

Files written this way appear on Ed's machine immediately. **Ed then commits and
pushes**, and Shopify pulls from GitHub automatically:

```
cd ~/Dropbox/GIT-repositaries/fye-theme-v3
git add -A && git commit -m "..." && git pull --rebase && git push
```

`git pull --rebase` before every push: **the repo is not only ours.** Shopify
commits back whenever Ed changes anything in the theme editor (that is how the
footer menus arrived), and a push without a pull is rejected. Commit first, then
pull — `git pull --rebase` refuses to run with unstaged changes.

Claude never runs git.

**Editing many files at once: write a Node script into `docs/tools/`, have Ed
run it, and read the output.** Three exist and the pattern has earned its keep.
A script of literal find/replace pairs that refuses to write unless each target
matches exactly once fixed eleven files in one pass, twice, with no misses.

| tool | what it does |
|---|---|
| `usage-map.mjs` | `section-usage.md` — every section, live / dormant / unreferenced |
| `template-plan.mjs` | `template-plans/<name>.md` — a template reduced to section order, block types, settings that carry a decision. `--full` for porting copy (nothing truncated) |
| `fix-*.mjs` | one-off repairs. Delete once run and synced |

When writing another: plain ESM Node, no dependencies, and **a C-style comment
terminator inside a banner comment ends the comment early** — that cost a round
trip on 27/08/2026.

**Reading trap:** `dropbox__fetch` runs text extraction, and on a file starting
with `<!doctype html>` it strips the tags — `layout/theme.liquid` came back as
prose with every `<link>`, `<head>` and `<body>` missing. Section and snippet
files are fine. If a fetched file looks suspiciously tag-free, that is the
extractor, not the file.

## THE SHOPIFY SYNC — read this before debugging a missing file

**A GitHub-connected theme rejects invalid files SILENTLY.** No error in git, no
error in the sync panel, the commit looks perfectly healthy — the file simply
stays at its previous version while everything around it updates. This cost
most of an afternoon on 27/08/2026.

**The diagnostic:** `themeFilesUpsert` through the Shopify MCP is the only thing
that surfaces the actual message. Reading theme files via the MCP is always
fine; writes are permitted on UNPUBLISHED themes only, which `fye-theme-v3/main`
is. Use it to *read the error*, then fix the source and push — do not leave the
API-written copy as the fix, or Shopify and git drift apart.

```
query { theme(id: "gid://shopify/OnlineStoreTheme/197720146304") {
  files(filenames: ["templates/index.json"], first: 5) {
    nodes { filename size updatedAt } } } }
```

Compare `size` against the file in Dropbox. Same size = synced. Different, or an
old `updatedAt`, = rejected.

**Do not write theme files through the Shopify API as a matter of course**, and
never edit in Shopify's admin code editor — a save there commits back from
Shopify's side and can clobber the repo.

### The three faults that hid behind that silence

1. **A filter inside an `image_tag` argument.**
   `alt: product.title | escape,` → *"Liquid syntax error: Expected
   end_of_string but found comma"*. Arguments take a variable or a literal,
   nothing else; compute fallbacks with `assign` first. `image_tag` already
   escapes its attribute values, so `| escape` was never needed.
   With `| escape` as the LAST argument it parses — and then escapes the whole
   `<img>` tag, so the markup renders as visible text. Equally wrong, harder to
   spot. Four files refused, five more rendering escaped tags.
2. **`unit` longer than three characters** in a range setting. `"prod"` and
   `"star"` both fail schema validation. Two files refused.
3. **A JSON template is validated against the section schema Shopify holds at
   that moment.** `index.json` set hero settings that only existed in the new
   `fye-hero.liquid`; until that section landed, the template was rejected
   every pass — and an unchanged file is not retried. Once the section synced,
   `printf '\n' >> templates/index.json` and a push was enough.
   **So: when a template and its section change together, expect two passes.**

## What this is

A ground-up rebuild of the For Your Eternity Shopify theme as a standalone
theme, replacing the T4S/Kalles-based live theme. Same URLs, same
functionality, same section type names and setting IDs — so the existing JSON
templates keep working — but written fresh, consistent and small.

**Lean is a requirement, not a preference.** Nothing gets built because it
exists in the old theme. See §10 of `conventions.md`.

## Where things are

| | |
|---|---|
| New theme, working tree | `~/Dropbox/GIT-repositaries/fye-theme-v3` |
| New theme, remote | `github.com/foryoureternity/fye-theme-v3` |
| Old theme, readable | `~/Dropbox/GIT-repositaries/fye-shopify-theme` |
| Shopify theme (v3) | `fye-theme-v3/main`, id `197720146304`, UNPUBLISHED |
| Shopify theme (live) | `fye-v2-responsive`, id `197353406848` |
| Preview | `https://foryoureternity.com/?preview_theme_id=197720146304` |

Clear the sticky preview cookie afterwards with `?preview_theme_id=` (empty) —
a stale one once made the live site look completely unstyled.

## The seven non-negotiables

Full detail in `conventions.md`. In brief:

1. `assets/fye-core.css` is the ONLY file defining a colour, spacing value,
   type size or breakpoint.
2. No section sets its own vertical padding. Rhythm comes from `--sect-y`.
3. Base rules are `:where()` (zero specificity); sections override by stating
   intent. No `!important`.
4. Three breakpoints only: 900 / 749 / 560.
5. Never key a selector to `template--<digits>` — regenerated on every theme
   duplication. A section's own schema `class` IS stable and is fair game.
6. Squared corners throughout (`--radius: 0`).
7. UK English, no emoji, thin outline icons only via `snippets/icon.liquid`.

**An eighth, learned on the first preview:** every section is wrapped by
Shopify in its own `<div class="shopify-section">`, so a sibling selector
(`.band--white + .band--white`) NEVER matches across two sections. Anything
relating one section to the next must reach through the wrapper with `:has()`.
The band-collapse rule silently did nothing until this was found, and every
same-colour neighbour showed 160px of dead space.

## Built

### Foundations
| File | Notes |
|---|---|
| `assets/fye-core.css` | Tokens, bands, type roles, buttons, forms, grids, product card |
| `assets/fye-ui.js` | Named drawers, rotator, back-to-top, disclosure. Vanilla, delegated |
| `snippets/icon.liquid` | ~30 inline SVGs, replaces 3.3MB of Line Awesome |
| `snippets/product-card.liquid` | One tile: 4 sections render it |
| `snippets/schema-org.liquid` | JewelryStore structured data |
| `layout/theme.liquid` | Self-hosted Tenor Sans + Outfit variable |

### Chrome — signed off by Ed as matching the live site
| File | Notes |
|---|---|
| `sections/announcement-bar.liquid` | **Measured** |
| `sections/header-bottom.liquid` | **Measured, pixel-matched** |
| `sections/footer.liquid` | **Measured, pixel-matched.** Menus assigned |
| `sections/header-group.json` `footer-group.json` | Nav as section blocks |

### Homepage — built 27/08, on the theme, first preview reviewed
| File | Uses | Notes |
|---|---|---|
| `sections/fye-hero.liquid` | 68 | Logo, alignment, sentence-case heading, text link — all were raw HTML in settings |
| `sections/fye-trust-strip.liquid` | 3 | Icon names mapped to icon.liquid |
| `sections/feature_columns2.liquid` | 7 | 12-column block grid. 22 settings dropped |
| `sections/fye-two-ways.liquid` | 1 | `short`/`hide_mobile` mobile consolidation |
| `sections/custom-collections.liquid` | 1 | Three category panels on a teal scrim |
| `sections/fye-testimonials.liquid` | 3 | Scroll-snap rotator |
| `sections/featured-collection.liquid` | 7 | **34 of 40 settings dropped** |
| `sections/fye-media-text.liquid` | 13 | The workhorse. Full-bleed variant |
| `sections/fye-gallery-promo.liquid` | 3 | Rotating three-image sets |
| `sections/guide-download-block.liquid` | 5 | Klaviyo form IDs → `data-fye-popup` |
| `sections/latest-news-EM.liquid` | 1 | Frozen filename. `#f4f4f4` → ivory |
| `sections/about_us.liquid` | 7 | Built, but **left out of the homepage** — empty there |
| `sections/heading-template.liquid` | 32 | |
| `sections/main-page.liquid` | 10 | |
| `templates/index.json` | | 13 sections, real copy, images and links |

**Still to check on the homepage preview:** "Our most popular rings" wraps onto
two lines (the flanked heading's measure); the hero photograph's crop puts type
across the fingers.

### Measured values — do not "tidy" these into tokens

Header and footer were matched pixel-for-pixel against a 2x screenshot of the
live site at 1470px. Two that get "corrected" by mistake:

- **Footer ground is `#879C87` with TEAL type.** Not ivory. Teal on this ground
  is 4.8:1 (AA); ivory would be 2.6:1. Chrome with its own ground, NOT a
  `.band--sage` content band.
- **The rule under the header sits ABOVE the nav**, 1px `#C8CDC7`. No rule
  below the nav, no rose-gold anywhere.

**Method:** copy the screenshot into the project, sample it with `run_script` —
`readImage`, canvas, `getImageData` down one column for exact row boundaries and
colours. Do not eyeball a JPEG crop.

## The usage map — 134 templates, 27/08/2026

`docs/section-usage.md`. Re-run whenever templates change; it is cheap.

| | count |
|---|---|
| live (≥1 enabled reference) | 107 |
| dormant (every reference disabled) | 10 |
| unreferenced | 109 |

**The old 89-live / 94-dead figures were wrong** — 70 templates, and no
enabled/disabled distinction.

Two caveats. **"Unreferenced" over-counts:** the old theme renders some sections
through a variable (`{% section settings.header_design %}`) and the script only
matches quoted literals, which is why `header-bottom`, `announcement-bar`,
`mega-menu` and `facets` appear unreferenced. **`fye-guide-popups-group` is not
missing** — the script's check compares against `.liquid` names and it is a
`.json` section group.

### The guide library is the bulk of the site

| section | uses | | section | uses |
|---|---|---|---|---|
| `fye-terms` | 104 | | `fye-faq` | 49 |
| `fye-chapter-nav` | 102 | | `fye-checklist` | 44 |
| `fye-rich-text` | 95 | | `fye-xref` | 33 |
| `fye-callout` | 78 | | `fye-cards` | 23 |
| `fye-guide-download` | 62 | | `fye-chips` | 17 |
| `fye-related` | 58 | | `fye-steps` | 12 |
| `fye-table` | 56 | | | |

~14 files, ~700 references, none built.

## Outstanding

**Ed's priority, 27/08/2026: the home page, then engagement rings, wedding
rings and eternity rings.** Not the collection pages. Visual target:
**design-system treatment with the current structure kept**, as
`heading-template` got — not a pixel match, not a redesign.

1. **The three ring pages.** Run `template-plan.mjs page.engagement-rings
   page.wedding-rings page.eternity-rings --full` and build from the plans.
   They reuse most of the homepage set; expect `accordion`,
   `about-columns-four` and `collections-list` to be new.
2. **Two small homepage jobs.** `{% render 'schema-org' %}` needs adding to
   `layout/theme.liquid` before `</head>` (Claude cannot edit that file — see
   the reading trap above). And `fye-logo-square.png` / `fye-logo-wide.png`
   need uploading as theme assets for the structured data; the snippet falls
   back to the brand logo until they exist.
3. **The rest of the guide library** — the table above, in order of reach.
4. **`main-collection`, `main-product`.** `main-product` is 162KB in the old
   theme and shares a buy box with `main-qv`; that becomes one product-form
   snippet rendered two ways. `main-collection` also owns the facet form.
5. **The 29 `custom-liquid` references.** `template-plan.mjs` flags every
   `custom_css` block too — the same problem in a different place.
6. **Customer account templates.** Seven sections, one template each, none
   built. Cheap, and their absence is total.
7. **Guide popups:** 12 sections via `fye-guide-popups-group.json`, all on
   Forms defaults (`#202020`, links `#1878B9`). Consolidate to one section + a
   `form_id` setting, in FYE teal/ivory. They read `data-fye-popup`, which
   `guide-download-block` and `fye-two-ways` already emit.
8. **The five mega panels have no menus assigned.** Footer columns are done.
9. **The 109-name unreferenced list.** Resolve the dynamic-reference caveat
   first. **Nothing gets deleted without Ed saying so.**

## Decisions already taken (don't reopen without reason)

- Templates: keep all existing JSON, reuse section type names and setting IDs.
- Visual target: design-system styling, current layout and structure retained.
- Fonts: self-hosted, Outfit as a single variable woff2. Headings Tenor Sans,
  body Outfit. Section padding 80px.
- **Testimonials rotate.** Ed asked for it back after a first pass removed the
  carousel. Built as a scroll-snap track so it works without JS; the timer
  pauses on hover and focus, stops when a visitor uses the arrows, and never
  autoplays under `prefers-reduced-motion`. The brand's "no infinite loops"
  rule is about decorative motion, not content.
- **Sidebars are out.** Ten dormant sections, nothing rendered, nothing ported.
  Strip `sidebar-*` entries from every template as it comes across, or the
  theme editor errors on that template.
- `heading-template` lost ALL its typography and spacing controls. Its free
  colour picker became a four-way palette choice.
- Free colour pickers become palette choices everywhere. Three found so far
  held off-brand values (`#f4f4f4`, `#FFFFFF`, `#222`).
- Dropping a schema setting is safe — Shopify ignores settings left in a JSON
  template that the schema no longer declares. Renaming one is not.
- A reference is not a use. Count enabled references, always.
- Dropped scratch templates: `page.edu-test-page`, `page.zz-form-testing`,
  `page.faq-2`, `search.mn`.
- Old-theme facts worth keeping: `settings.header_design` is `"bottom"`, so only
  `header-bottom` ever rendered; `cart_type` is `"disable"`, so `mini_cart`
  never rendered; the live nav is built from section BLOCKS, not a linklist.
- 18 themes exist in the store, 15 of them backups. Worth a clear-out once v3
  is live, but not without Ed saying so.


---

# Session — 27/08/2026 evening: homepage finished against live

The homepage is now section-for-section against the live site on desktop and
mobile. Everything below is on `main` and synced.

## What changed

**Sections rebuilt from live's own source** (see the rule below — this is the
important part of tonight)

- `latest-news-EM` — rebuilt entirely. Grid `1fr 1fr`, gap 25px,
  `align-items: stretch`; the RIGHT column's three cards set the height
  (`flex: 1` each, gap 20px) and the lead photograph fills it with
  `height: 100%`/`object-fit: cover` and NO aspect ratio. The caption is
  `position: absolute; bottom: 0; left: 0; max-width: 280px` inside the image.
  Thumbnails a fixed 239px (190px between 1025–1400). Titles 16px/1.4/400.
  Excerpts 18 words, no ellipsis. Do not reintroduce aspect ratios or negative
  margins here.
- `fye-consultation` — centred stack: eyebrow, flanked heading, lead, button,
  contact row. Stack gap 22px, flank gap 26px, heading
  `clamp(22px, 1.4rem + 0.7vw, 26px)` (deliberately a step DOWN from the h2
  scale — a closing strip must not compete with the sections above it), lead
  capped 620px, contacts 13px with 12/28px gaps, ivory focus ring. Gained
  live's optional second button (`btn2_label`/`btn2_link`/`btn2_new_tab`).

**Homepage fixes**

- Hero: `.hero__in` needed `width: 100%` (see rule 9) and now carries 48px of
  left padding on the left-aligned variant, dropping to the gutter under 560px.
- Flanked heading: `flex: 1 1 0` on the hairlines plus `align-self: stretch` on
  the heading, so the rules run to the container instead of a fixed 72px.
- Header nav: 13px / 0.08em with a tighter gap, so eleven items fit one row.
- `feature_columns2` ("why choose"): monogram cap 180px → 320px, body copy to
  the lead scale, new `pad` setting (standard | tight) with the homepage on
  tight, centred. The `tight` value is a documented exception to the --sect-y
  rule: live gives this band 10px because its content is a mark and a paragraph.
- Gallery promo: live's nine photographs, in live's three sets.
- Guarantee: "20% discount on your wedding ring" corrected to 10%. 20% is the
  eternity page's offer — a content error, not a layout one.
- Guides: all-guides button removed, per-guide words centred under the cover.
- Testimonials: stars filled (`fill: currentColor` on the svg AND its
  descendants — a `fill="none"` on the inner path ignores a rule aimed at the
  root), "4.9/5 average" removed with its setting.

**Mobile, measured against live**

- Guides: tappable list rows below 768px — 68px rows, 50px cover, 14px display
  title, 16px arrow drawn with a CSS mask, hairline between. 3-up to 1100px,
  6-up above.
- Trust strip: 2 × 2 below 768px. `repeat(auto-fit, minmax(200px, 1fr))` cannot
  fit two 200px tracks in a phone's ~330px content width, so it collapsed to
  one column. Rule lives IN the section (see rule 11).
- Hero buttons: stack full width below 560px. They were caught by core's
  `.row .btn { width: auto }` exception.
- Why-choose monogram: hidden below 768px, as live.
- Latest news: every desktop height mechanic explicitly stood down below 900px
  — the caption's position, both image heights, the list height and the row
  flex. Standing down only the caption's position left it over the next
  article's photograph.
- Footer: link columns and "talk to us" are now native `<details>` accordions.
  Rendered `open`; script closes them below 769px and reopens above, and stops
  syncing once a summary has been tapped. No JS ⇒ all open, which is the
  pre-accordion behaviour. 56px tap rows, + becoming −.

**Site-wide bug fixed**

`.visually-hidden` was a 1px box with NO clipping, and the skip link inside it
was absolutely positioned with `left: auto` — so it sat at its static position
around x=2314 and made every page 2315px wide, with ~845px of empty scroll to
the right. Now clipped (overflow + clip + clip-path) and pinned to 0,0, and the
skip link becomes visible on focus, which it never did.

## Rules learned tonight — these cost real time

**R1. When the brief is "match live", READ LIVE'S SECTION FIRST.**
Four passes went into eyeballing the news band's proportions off screenshots
before one API read gave every number exactly. Worse, I inferred which of two
screenshots was live and rewrote the consultation band away from the correct
layout. Read the file. `themeFiles` on the live theme id, filenames array.

**R2 (conventions rule 9). A `.wrap` inside a flex or grid parent needs
`width: 100%`.**
A flex item shrink-to-fits. The hero's copy sat 305px from the left with no
padding rule responsible. Hit twice in one hour.

**R3. Media-query overrides go LAST in a stylesheet.**
A media query adds a condition, not specificity. The guides mobile block sat
above the base `.guides__item` rules, so `flex-direction` and `width` were
overridden while `min-height` and `border-bottom` — properties the base never
sets — applied. A partial apply is the signature of this bug.

**R4. `fye-core.css` cannot override a section.**
Section `{% stylesheet %}` blocks are served AFTER core. Core can supply what a
section does not set; anything competing with a section's own declaration must
live in that section. Cost one wasted trust-strip fix.

**R5. One console line beats three screenshots.**
`{vw: 399, dir: 'column', minH: '68px', border: '1px', coverW: '351px'}`
diagnosed R3 instantly. For layout faults, query computed styles before
theorising — and for horizontal overflow, list every element whose right edge
exceeds `clientWidth`.

## Outstanding

1. **Header logo on mobile** renders the text fallback ("FOR YOUR ETERNITY" on
   three lines) where live shows the script wordmark. Needs the dark logo's
   Files URL set on the header section — data, not CSS.
2. **`{% render 'schema-org' %}`** still not added to `theme.liquid`.
3. **Two logo PNGs** (`fye-logo-square.png`, `fye-logo-wide.png`) still needed
   as theme assets for the structured data.
4. **27 old templates still name `sidebar-page` / `sidebar-collection`.** A
   template naming a missing section type breaks the theme editor, so those
   entries come out of `sections` and `order` as each template is ported.
   `template-plan.mjs` flags any type a template needs that v3 lacks.
5. **Live's mobile-only "View All 6 Guides" bar** was deliberately not re-added
   when the all-guides button was removed. Say if it should come back on mobile.
6. **A layout smoke-test script** would have caught the 845px overflow in
   seconds: horizontal overflow, elements past the viewport, unclipped
   screen-reader text, tap targets under 44px. Worth writing before the next
   template.

## Next

The three ring pages are built and reviewed; the guide library (13 sections,
~700 references) is done. Next is the remaining templates, in usage order —
`node docs/tools/template-plan.mjs --full` for the current ranking.
