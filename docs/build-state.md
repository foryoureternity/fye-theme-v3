# FYE v3 — build state

Last updated: 01/09/2026

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

---

# Session — 31/08/2026: the collection page

`main-collection` is ported and rendering on v3. Everything below is on `main`.

## What was built

| File | Notes |
|---|---|
| `sections/main-collection.liquid` | 18.2KB, from live's 56.9KB. Rail + grid, toolbar, bespoke tile, promo card, pagination, empty state |
| `templates/collection.json` | Did not exist. One section |
| `assets/fye-ui.js` | +1 IIFE: the sort select |
| `docs/tools/layout-smoke-test.js` | `fyeSmoke()` — six checks |

Visual target was **design-system treatment with live's structure kept**, not a
pixel match. Ed corrected this mid-session after first asking for pixel match.

**34 settings dropped.** Nine tile designs, masonry, the list/grid switch, the
items-per-row switcher, load-more, infinite scroll, countdowns, vendors, colour
and size swatches, quick view, compare, and the three image-ratio controls.
Every surviving setting ID is unchanged, so no template edit was needed.

Block types `layout` / `filter` / `sortby` keep their names. `layout` renders
the result count, which is all it did on live — its switcher markup was already
commented out there.

## THE FILTERS ARE NOT THEME CODE — read before touching the rail

Live renders an empty `<div id="cloud_search_filters_sidebar">` and the
**xCloud app injects the entire filter rail into it at runtime**. The old
section's native Shopify facet button was hidden with inline CSS on every
non-editor request, and `type_filters` is `facets_tags`. There has been no
theme-rendered facet form on this page for some time.

So there was nothing to rebuild — v3 emits the same mount point and styles what
the app drops in. **If xCloud is ever removed, the filter UI has to be
designed, not recovered.**

## Two silent-data failures, and the pre-flight they earn

Neither was visible in the repo, and neither produced an error anywhere.

1. **No `templates/collection.json`.** Every collection URL 404'd. The first
   file check asked for it, Shopify returned nothing, and that was read as
   "the section isn't built yet" rather than "the template is missing too".
2. **No app embeds.** `config/settings_data.json` was 519 bytes with no
   `blocks` key; live's is 153KB. A newly created theme has **no app embeds
   enabled**, so xCloud's script never loaded and the mount div rendered empty,
   silently. Fixed by Ed in the theme editor — it cannot come from the repo,
   because enabling it rewrites `settings_data.json` from Shopify's side.

> **PRE-FLIGHT, before porting any template.** Two questions, thirty seconds:
> **(a)** does v3 have the template JSON, or only the section? **(b)** does the
> page depend on an app embed that live has enabled and v3 does not? Check
> `config/settings_data.json` size on both themes — 519 bytes means none are on.

## The rebase trap, now hit twice

A file written straight to the theme with `themeFilesUpsert` gets **committed
back by Shopify**, so the next push collides add/add on that exact file.

**Mid-rebase, `--ours` is UPSTREAM (Shopify's copy) and `--theirs` is the commit
being replayed (ours).** It reads backwards. To keep our work:

```
git checkout --theirs sections/<file>.liquid
git add sections/<file>.liquid
GIT_EDITOR=true git rebase --continue
```

`GIT_EDITOR=true` matters: the commit-message editor opened and hung, and
closing the terminal window left the rebase mid-flight.

**Conclusion worth acting on:** new section files should go to Dropbox only and
reach the theme via the push. `themeFilesUpsert` earns its place for READING
the error out of a rejected file, not as the delivery route. Direct writes cost
a manual merge both times they were used.

## Liquid gotcha

**A `select` setting is a STRING. Liquid raises rather than coercing.**
`{% if forloop.index <= s.col_dk %}` renders
*"comparison of Integer with String failed"* on every iteration. Coerce once at
the top: `assign cols_n = cols | plus: 0`. Shipped and caught on first preview.

## Decisions taken this session

- **The mobile filter rail is a `<details>`, not a drawer.** One set of markup
  at every width — a show/hide pair would give xCloud two mount points with the
  same id. Desktop hides the summary and forces the body open; mobile is a real
  disclosure. Live uses a drawer here; revisit if Ed wants the match.
- **Sort navigates, it does not submit.** A `<form method="get">` serialises
  only its own fields, which would silently drop every xCloud filter in the
  query string. `data-fye-sort` rewrites the current URL and drops `page`.
  Without JS the select renders and shows the current sort but does nothing.
- **The bespoke tile is a grid cell**, square like the cards, page one only,
  and only when the collection has ≥4 products.

## Outstanding

1. **Five more sections render on `templates/collection.json` on live** and
   none exist in v3: `fye-diamond-browser`, `fye-collection-intro`,
   `fye-bespoke-cta`, `fye-guide-download`, plus a `custom-liquid` that injects
   the metal and profile filter icons on `plain-wedding-rings`. Until they land
   the page is the grid and nothing else. This is a bigger job than
   `main-product`.
2. **`fyeSmoke()` has not been run** at 1440 / 899 / 748 / 559 yet.
3. **Per-collection template variants.** Not yet checked whether live has
   `templates/collection.<suffix>.json` files — if it does, those collections
   still 404 on v3.
4. **`main-product`** — the other half of what Ed asked for this session, not
   started. 162KB in the old theme, shares its buy box with `main-qv`.
5. Carried over, untouched: the wedding panel's 17 stone links all resolving to
   `/collections/coloured-stone-rings`; deleting the spent `fix-*.mjs` and
   `mega-css-consolidate.mjs`; `{% render 'schema-org' %}` into `theme.liquid`;
   the two logo PNGs; `snippets/mm-probe.liquid` still on the theme.

---

# Session — 31/08/2026 (2): the product page

`main-product` is built for PLAIN WEDDING RINGS and rendering on v3. Other
ring types branch off `is_plain` and are not written yet.

| File | Notes |
|---|---|
| `sections/main-product.liquid` | 29.1KB. Gallery with 360, metal colour/carat, size, engraving, price |
| `templates/product.json` | Did not exist. One section |
| `assets/fye-ui.js` | +1 IIFE: gallery panels, Sirv on demand, engraving toggle, two-line cart add |

## THE DATA MODEL — read before touching the buy box

A plain wedding ring is **one product per metal + profile + width + weight**.
Variants are **ring sizes only** — 70 of them, A to Z+9.5, each priced a little
above the last because a bigger ring uses more metal.

```
options              Ring Size (the only one)
custom.ring_metal    "14ct Yellow Gold"
custom.ring_profile  "Concave"
custom.ring_weight   "Heavy Weight"
custom.spin_360      Sirv .spin URL
filters.band_width   "2mm"
```

Two consequences shape the whole page:

1. **Size is a variant**, so the page shows a RANGE at the top and a SELECTED
   price by the button. Two questions, two numbers. Live does the same.
2. **Metal is navigation.** Choosing platinum means loading another product.

**Handles are perfectly systematic**, verified against live:

```
{metal}-{profile}-wedding-ring-{width}-{weight}
14ct-yellow-gold-concave-wedding-ring-2mm-heavy
platinum-concave-wedding-ring-25mm-medium
```

so the metal switcher CONSTRUCTS each target and looks it up with
`all_products`. No app, no metafield list of references, no JS.

- `all_products` is capped at **20 unique handles per page**. Four colours plus
  three carats is seven. A profile or width switcher done the same way would
  blow through it — those need a different mechanism.
- A handle that does not exist renders that option disabled, not as a dead
  link. Safe failure by design.
- **The width slug is irregular**: 2.5mm appears in handles as `25mm`, so it
  comes from `filters.band_width | remove: '.'`. The `handle` filter gives
  `2-5mm` and 404s.

## Business rules — Ed's, not inferred

- **Engraving is £55, interior, on every ring type.** An earlier pass wrote
  "free of charge" as an assumption and that was wrong. Never infer pricing,
  policy or product availability — take it from Ed or from the code.
- **The oversize surcharge does NOT apply to plain rings**, because the metal
  cost is already in the variant ladder; applying both charges twice. It DOES
  apply to every other ring type, where size is a line-item property with no
  price of its own — those branches set `_size_surcharge`, which the Oversize
  Ring Surcharge cart-transform function reads to add 10%.
- **No palladium in plain rings at present.** Removed from the colour list.
  Engagement rings on live do offer it, so that list becomes per-branch.

## How live does the things we copied

Live runs **two** product pages, which is why this section merges two sources:

| | |
|---|---|
| `sections/product-block.liquid` (57KB) | configurable diamond rings — engagement, eternity, gem-set. The metal/carat/engraving pattern comes from here |
| `sections/main-product.liquid` (162KB, T4S) | plain rings |

**Engraving fee.** A hidden fee PRODUCT, added as a separate cart line
(`engraving_variant_id`, live's is `58467296018816`). `engraving_price_pennies`
is only the on-page preview. Shopify cannot post two line items from one
product form, so when engraving is on the submit is intercepted and both lines
go through `/cart/add.js`. Without engraving the form posts normally and no JS
is involved.

**Sirv 360.** `snippets/spin-360.liquid` on live: a `.Sirv` div with
`data-src` and `data-options`, plus a one-time injection of
`scripts.sirv.com/sirvjs/v3/sirv.js`. Live loads it on every product page and
then fights Flickity to re-measure a canvas that was hidden at init. v3 has no
carousel and loads the script **on demand** when the 360 panel is first opened.

## Gotchas earned this session

- **`[hidden]` loses to any `display` rule.** `.pdp__engravebody { display:
  flex }` kept the engraving fields visible with "No" selected. The attribute
  only works if nothing else sets display; pair every `display` on a
  `hidden`-toggled element with a `[hidden] { display: none }`.
- **Disabled fields are not submitted.** That is what keeps an empty
  `Engraving` property off the order when the answer is No — the toggle
  disables the inputs rather than only hiding them.
- **A stale compiled stylesheet looks exactly like a fix that did not work.**
  Shopify concatenates every `{% stylesheet %}` into one `compiled_assets/
  styles.css`. File size and `updatedAt` on the theme prove the file ARRIVED;
  they say nothing about what the browser is running. For a CSS change the
  check is a resolved custom property in the console, not a screenshot. This
  nearly caused a fourth rewrite of a 21KB file that was already correct.
- **Targeted `sed` beats rewriting a 29KB file** for a one-value change, when
  the anchor is unique and the change is verified with a `grep` either side.
  Used four times today without incident.

## Outstanding on the product page

1. **Every other product type.** Engagement, eternity, diamond and gem-set,
   loose diamonds, loose gemstones. Each needs its own buy-box branch; the
   surcharge applies to all of them.
2. **Wishlist** — agreed as its own session. Live uses the T4S app wishlist
   (`t4s_wis_cp`, `interactable.min.js`, `templates/search.wishlist.liquid`)
   with `fye-wishlist-share` on top. v3 has none of it.
3. **Not yet built, from Ed's list of what differs by type:** certification /
   provenance panel, ring sizer, pairing suggestions, related products, guide
   download, long-form description tabs.
4. **`engraving_variant_id` is unverified on this store.** The default is
   live's. The control hides itself when the setting is blank, but it cannot
   tell whether a non-blank id actually exists — a wrong id fails at add-to-cart.
5. **Metal switching does not preserve the chosen size.** Changing metal loads
   a sibling product at its default size. Live has the same behaviour; worth
   fixing with a `?variant=` handoff once sizes are confirmed identical across
   siblings.
---

# Session — 01/09/2026: engagement rings, related products, the carat stepper

The engagement-ring product page is complete. Seven product templates exist and
route correctly. Everything below is on `main`.

## What was built

| File | Notes |
|---|---|
| `templates/product.{engagement,complete,gemset,gents,diamond-ring,plain}.json` | Five new + plain. All render `main-product` → `fye-related-products` → `fye-matching-band` |
| `templates/collection.cdc-json.liquid` | 3.7KB. The diamond feed. Collection-agnostic |
| `snippets/fye-buybox-centre.liquid` | 18.8KB. Centre-stone chooser + picker modal |
| `snippets/fye-buybox-sides.liquid` | 10.7KB. Trilogy side stones |
| `snippets/fye-carat-stepper.liquid` | 11.2KB. Next model up/down in the design family |
| `snippets/fye-carat-label.liquid` | 1.4KB. One carat-formatting rule, used three times a page |
| `sections/fye-related-products.liquid` | 10.6KB. Similar rings, with a collection fallback |
| `sections/fye-matching-band.liquid` | 14.2KB. The band cut for this ring |
| `assets/fye-ui.js` | ~64KB. Choosers, picker, multi-line cart, requirement gate |
| `snippets/icon.liquid` | +`arrow-up`, `arrow-down` |
| `sections/main-product.liquid` | ~55KB. Breadcrumb, stepper, chooser CSS, sticky gallery |

## THE THREE STONE CHOICES ARE INDEPENDENT — Ed, 31/08/2026

The single most important thing on this page, and live's code implies the
opposite. On a trilogy with diamond-set shoulders a customer picks:

| Choice | How it is priced |
|---|---|
| **Diamond Quality** — the SHOULDER diamonds | a variant axis, with Metal |
| **Centre diamond** | its own cart line, its own price |
| **Side diamond pair** | its own cart line, its own price |

Nothing is charged twice. Live hides the quality row on any trilogy carrying a
`side_stones` metafield (its W333) and locks the ring to its cheapest grade —
**deliberately not ported**, because on a set-shoulder ring that removes a real
choice. Live's other rule, hiding the row on PLAIN-shouldered rings where the
grade buys nothing, is fair and is still outstanding.

**This surfaced as a bug that was not one.** `trl6462-smt` showed no shoulder
quality selector; live showed none either, at the same £1,932. The products had
one variant axis. 8 diamond-shouldered trilogies were missing the option
entirely — a data gap from when side stones moved to their own cart line. Fixed
by import (200 variants, D/E VVS anchored at today's price so nothing rose).

## Decisions taken

- **Nothing is selected by default** in either chooser. Live preselects the
  dearest route, which lets a shopper reach the basket without deciding. The
  cost is a hard requirement in `fye-ui.js`: add to cart is blocked until every
  rendered panel has a mode, a stone where needed, and a ticked waiver where
  needed. `requirement()` is the single place that decides, and its message IS
  the button label — nobody meets a dead control with no explanation.
- **The add button is the way in.** Before a stone is chosen it reads "Choose
  your centre diamond option", and pressing it sets the mode and opens the
  picker.
- **Square mode tiles, circular radio marks.** The circle is a documented
  departure from `--radius: 0`: it is the only shape that reads as "pick one"
  without a label. Selected = ivory ground + `--line-strong` edge, never a teal
  fill — these tiles carry two levels of type and a fill drops the second below
  AA.
- **Carat stepper wording is the supplier's** — "Next size model up/down",
  under the heading "Alternative size models", below the wishlist button. Note
  this overrides W916's own rule against the word "size"; what keeps it clear
  of FINGER size is that every control carries a carat.
- **Side-stone property keys accepted by Ed, 01/09/2026** — `Side Diamonds` and
  `Setting service`. They were flagged UNVERIFIED against live (live's are past
  the readable limit in `product-block.js`); Ed has signed them off. The file
  comment still says unverified — correct that when next in there.
- **Related products fall back to collection siblings** with different wording
  ("More from this collection"), because "Similar Rings" is a promise a
  fallback cannot keep. After W918, 1,623 products have curated relations and
  1,549 do not; the fallback carries the rest, which is intended.
- **The matching band is its own section, not a second related row.** 1,184 of
  1,214 have exactly one band, and a four-across grid holding one card is three
  empty columns. It shows both rings side by side, which a grid tile cannot.
- **Direction is a setting, never `product.type`.** The band relationship is
  mirrored, so a band's page shows its ring; `product.gemset.json` and
  `product.plain.json` carry the reversed wording. Type-sniffing has caused
  this class of bug here before.

## Gotchas earned — these cost real time

**`0 == blank` is FALSE in Liquid, but `nil == blank` is true.** An unwritten
`fye.family_carat` rendered "0ct" on every stepper control, and because all
three matched, the tie rule then labelled both "Another option". Any metafield
that can be missing needs a zero guard as well as a blank one.

**Browsers validate before firing `submit`.** Opening the picker from the form's
submit event never ran: with no ring size chosen the event was never fired, and
the shopper got a native bubble about a field they had not reached. Anything
that must happen INSTEAD of submitting has to be handled on `click`.

**Fancy colour collections are mixed-shape.** `fancy-yellow-natural-diamonds`
holds Asscher, Emerald, Heart, Trapezoid — unlike `round-natural-diamonds`,
which is shape-pure. A picker pointed at one must filter by shape itself.

**Search & Discovery metafields need bracket syntax.** The namespace contains
hyphens, so `product.metafields.shopify--discovery--product_recommendation`
returns nil SILENTLY — it looks exactly like data that never imported. Two
sections read it; both document the trap. Do not "tidy" either to dots.

**`fye-ui.js` is now past the size a session can read back whole.** Rewriting it
from memory risks reverting hand-applied fixes. The pattern that works:

> **A Node script in `tools/` with literal find/replace pairs that asserts each
> anchor matches exactly once, refuses otherwise, checks the file grew, and is
> idempotent.** Four ran clean this session (`w920`–`w923`). It is now the
> default way to change a large file, not a fallback.

## Outstanding

1. **`product.diamond.json` — loose diamonds and gemstones.** The last product
   template, and the biggest by page count: ~14,200 diamonds and ~13,200
   gemstones. Needs a new section; live's is `fye-diamond-product`. See
   `docs/prompts/loose-stone-pdp-prompt.md`.
2. **W918 import.** `fye.family_carat` was not populated when last checked —
   the stepper renders directions without weights until it lands.
3. **Side setting fee price** is unset, so that card prints no "+£x". The fee
   VARIANT exists, so the option is offered; only the preview figure is missing.
4. **`engraving_variant_id` still unverified on this store.** Default is live's.
   A wrong id fails at add-to-cart, and nothing on the page can detect it.
5. **The cart page** must group and reconcile up to five lines per ring. Live's
   `fye-ui.js` has a fee reconciler that counts the centre fee by variant id —
   read it before building v3's cart.
6. **Hide the quality row on plain-shouldered rings** (live's W803): two tests
   must agree — price flat across natural grades within a metal, AND tagged
   `solitaire` + `plain shoulders`. The price test alone wrongly caught four
   diamond-set rings.
7. **Open on the cheapest NATURAL grade** (live's W831), only when the shopper
   has not deep-linked a variant. Not ported.
8. **45 rings have no `fye.side_stones`** and so render no side panel;
   `trl29775-fy-mt` is null while all six siblings carry `OV-065`, which reads
   as an omission.
---

# Session — 01/09/2026 (afternoon): loose stones, W803, W831

Product and collection pages are **complete**. All eight product templates
exist and route correctly. The cart page is the next piece of work.

## What was built

| File | Notes |
|---|---|
| `sections/fye-stone-product.liquid` | 26.3KB. Loose diamonds AND gemstones — ~27,000 pages |
| `templates/product.diamond.json` | Stone page + related row |
| `snippets/fye-buybox-eternity.liquid` | Rewritten: W803 hide rule, reads selection from `current` |
| `sections/main-product.liquid` | W831 opening grade, sticky gallery |
| `assets/fye-ui.js` | Picker opens from the add button; shape filter for fancy feeds |
| `tools/w920`–`w925` | Six patch scripts, all run clean |

## The loose stone page

One section serves **both** product types — verified that Loose Diamond and
Loose Gemstone both carry `templateSuffix: diamond`. Named
`fye-stone-product`, not live's `fye-diamond-product`, because half the pages
it renders are sapphires, rubies and emeralds.

It is not a branch of `main-product` and should never become one: a stone has
one variant, one price, no metal, no ring size, no engraving, no surcharge and
no choosers. Ed, 01/09/2026: **no engraving, no ring size**. The form posts a
fixed variant id and needs no JavaScript at all.

**`fye.stone_family` is the discriminator** — `Gemstone`, `Fancy Colour
Diamond`, or absent for a white diamond. Real data, not a `product.type` sniff.
Gemstones use the same `clarity` field with a different vocabulary ("Eye
Clean", "Slightly Included"), so one table serves both; every row is
render-if-present, so a sapphire has no fluorescence line rather than an empty
one.

### THE TABLE IS AN ALLOW-LIST. NEVER LOOP THE NAMESPACE.

The most important line in that file. `fye` holds commercial data beside the
display fields — measured 01/09/2026:

    fye.trade_cost       999.54     what we paid
    fye.price_multiple   1.62       our margin
    fye.nivoda_id        8186B36A3  supplier reference

`{% for f in product.metafields.fye %}` would publish cost price and markup on
~27,000 public pages. Every row is named explicitly. If someone "simplifies"
this into a loop, that is the bug.

**The certificate serial is not shown** (Ed): the lab is the reassurance, the
serial is a reference the customer cannot use before buying, and on 27,000
pages it is a machine-readable index of the whole inventory. Where `cert_url`
exists the lab name becomes the link — "GIA — verify". `cert_lab: "OTHER"`
prints as "Independent".

Table sits **above** the buttons: a stone is bought on its specification, so
the facts are read before the commitment. On a ring the options are the
decision and the button follows them; here the table plays that part.

## W803 — hiding the quality row

On a plain-shouldered solitaire there are no shoulder diamonds, so every
natural grade costs the same and the selector asks a question with one answer.
**Two tests must agree**: price flat across natural grades within each metal,
AND tagged `solitaire` + `plain shoulders`. The price test alone wrongly caught
four genuinely diamond-set rings on live.

Tags are matched **whole and case-insensitively, never as substrings** — that
is what keeps "Halo with Plain Shoulders" out, and substring matching is the
specific mistake the guard exists to prevent.

**Hidden does not mean absent.** `fye-ui.js` builds a variant title by joining
every `[data-fye-option]` in DOM order; dropping the select would leave it
matching one value against a two-part title and every price would silently stop
updating. A hidden input takes its place, in the same position.

Behind `hide_flat_quality`, defaulting on.

## W831 — open on the cheapest natural grade

Shopify's first variant is `D/E VVS`, the dearest, so every ring headlined at
its top price; on live that read as a ~27% overnight rise on the complete
trilogies. Two guards: `p.selected_variant` preserves `?variant=` deep links
and back-from-cart, and `is_plain` keeps plain wedding rings out — their
variants are ring SIZES, so "cheapest" would open every one on size A.

`fye-buybox-eternity` now reads its selected state from `current` rather than
Shopify's option defaults, or the highlighted tile and the displayed price
would describe different rings.

## Gotchas earned

**A guard that greps a whole file for a human phrase trips over prose.** The
w924 patch refused on its own final check: it searched for "Certificate number"
and found it in a CSS comment, not the markup, which had patched correctly.
Assert on the markup you removed, not on words that also appear in comments.

**A stale compiled stylesheet is indistinguishable from a broken rule.** The
button gap "not working" was the bundle. `getComputedStyle(...).rowGap`
returning `normal` versus a px value is the thirty-second test; a screenshot
proves nothing.

**Fancy colour collections are mixed-shape** — `fancy-yellow-natural-diamonds`
holds Asscher, Emerald, Heart, Trapezoid. Any picker pointed at one must filter
by shape itself. `-FY-` in a SKU is the only colour code in use today; adding
another is one line in `COLOUR_CODES`, and codes are never invented.

**Patch scripts are now the default for large files**, not a fallback. Literal
find/replace pairs, each anchor asserted to match exactly once, refuses
otherwise, checks the file grew, idempotent. Six ran clean this session.

## Outstanding

1. **The cart page** — the next piece. Must group and reconcile up to five
   lines per ring. Live's `fye-ui.js` has a fee reconciler that counts the
   centre fee by variant id; read it first.
2. **"Set this stone in a ring"** has no destination, so the button does not
   render. One setting when Ed decides.
3. **Stone inventory** — every stone sampled reports quantity 0 / policy DENY.
   If inventory is TRACKED, "Add to bag" is disabled on all ~27,000 stone
   pages. The ring picker filters on availability and shows stones, so tracking
   is probably off; confirm before launch.
4. **`engraving_variant_id`** is live's default and unverified on this store. A
   wrong id fails at add-to-cart and nothing on the page can detect it.
5. **W918 `fye.family_carat`** was unpopulated when last checked — the carat
   stepper renders directions without weights until it lands.
   `trl29775-fy-mt` has no `fye.side_stones` while all six siblings carry
   `OV-065`.
6. **Side-stone property keys** (`Side Diamonds`, `Setting service`) are
   accepted by Ed but the snippet comment still says UNVERIFIED. Correct it
   next time that file is open.


## 01/09/2026 — cart and wishlist

Both built this session, both new files rather than ports — v3 had neither.

### Cart

`templates/cart.json` and `sections/main-cart.liquid` did not exist, so every
/cart URL 404'd. Same pre-flight failure as the collection page: live's
cart.json named a section v3 had never had. **Check both template AND section
exist before starting any page.**

Live's 49.9KB T4S section exposed six settings, one of which was on. Dropped:
shipping calculator, order notes, live rates, gift wrap, default-country
picker. Block types kept live's names (price / btn / tax / agree / btnck) so
the template stays portable; `guarantee` is new.

**Grouped ring sets.** A configured ring is up to five cart lines. They group
under one header with a combined total. The link is `Ring SKU`, a property
`addOnLines()` in fye-ui.js already wrote on every companion line:

    var tag = { 'For ring': ring.title, 'Ring SKU': ring.sku || '' };

So grouping needed no JS change at all. `Ring SKU` and `For ring` are hidden
inside a group (machine data, and a repeat of the header). A second identical
setting does NOT steal the first's stones — each SKU is claimed once. Live has
that bug.

**Removing part of a set removes all of it**, after a confirm naming the count.
A setting reaching checkout with no stone is unfulfillable.

**Centre-fee reconciler.** Fee variant `58461224927616` (live's, still
unverified on this store). Corrects quietly and in place via the Section
Rendering API — no reload, Ed 01/09. One fee line PER RING rather than live's
single counted line, so it sits inside the right group. Re-adds a fee whose
ring is still present: live never did, so deleting the fee line bought free
setting.

### Wishlist

Live had no real wishlist: `templates/search.wishlist.liquid` ran a SEARCH for
product ids T4S kept in `t4s_wis_cp`. Nothing was ever stored against a
customer. No migration — Ed chose to start clean.

Ed's calls, 01/09: saves the WHOLE CONFIGURATION; device only, no account;
sharing by link; hearts everywhere; page carries grid, share bar, move to
basket, enquiry, notes.

- Store: `window.FYE.wishlist` in fye-ui.js, key `fye_wishlist_v1`.
- Identity is handle + hash of variant, properties and companion lines — so the
  same setting with two different centre stones saves as two entries.
- The product-page heart calls `window.FYE.buyBox(form)`, which wraps
  `chosenVariant` / `ringProps` / `addOnLines`. Never re-read the buy box:
  two things computing a configuration will disagree.
- Prices are NEVER saved. Fetched per handle when the page renders.
- Page: `sections/main-wishlist.liquid` + `templates/page.wishlist.json` +
  `assets/fye-wishlist.js`. The Shopify page was created by API (handle
  `wishlist`, suffix `wishlist`) because the template dropdown only lists the
  PUBLISHED theme's templates and v3 is unpublished.
- Sharing: whole list base64url-encoded into `?w=`. Opening a shared link shows
  it read-only and MERGES on save — a recipient's own list is never replaced.
- Header icon was pointing at `/a/wishlist`, the dead T4S app proxy.

### Open

- **No configured total on a wishlist card.** Companions are saved as variant
  ids, and Shopify cannot price a variant id without its product handle. Card
  shows the setting's live price and lists the configuration. Fix is to save
  each companion's handle in `addOnLines()`.
- Cart page has no "save for later" yet.
- Centre-fee variant id still unverified on this store.

### Three mistakes worth not repeating

1. **A guard that matched prose.** A patch skipped itself because the file's own
   comment mentioned `fye-wishlist.js`; the `<script>` tag was never inserted
   and the page silently never ran. Guard on the THING, not on words about it.
2. **`hidden` loses to `display`.** Panels toggled with the `hidden` attribute
   but styled `display: flex` are never hidden. Needed
   `.fye .fye-wish [hidden] { display: none !important; }`.
3. **A control outside its form.** The gallery heart sits outside the buy-box
   form, so `closest('form')` found nothing and the button looked perfect and
   did nothing. It resolves the page's one buy box instead.


### Configured links and sharing

Added after the first wishlist pass, same day.

**Nothing on a product page read the URL — not even `?variant=`.** Worth
knowing before assuming any link restores anything. A shared ring opened as a
bare product page however it had been configured.

**`?fyec=`** now carries a whole buy box: options, centre mode + the stone's
own JSON, sides mode + chip, engraving on/off + its fields, waivers. Written by
the wishlist onto every product link, read by the CONFIGURED LINKS block at the
end of fye-ui.js.

The reading and re-applying live INSIDE the productPage IIFE as
`window.FYE.readConfig` / `window.FYE.applyConfig`, next to `buyBox`, because
that is where `setMode` and `paintStone` are. applyConfig dispatches real
CLICKS for the engraving segment and the side chips rather than reproducing
their side effects — reproducing them is how two code paths drift apart.

Note the thing that made this necessary: the chosen diamond is a JSON blob on
`[data-fye-centre]`'s `data-stone`. Saving variant ids alone was never going to
be enough to SHOW a configured ring, only to buy one.

**Add to basket from a wishlist card** posts the saved companion lines
directly, so it reproduces the exact cart without visiting the product page.
Available on shared lists too — a recipient buying their partner's choice is
the point of sharing.

### Sharing is a snapshot, and says so

A share link encodes the list, so it cannot update when the sender's wishlist
changes. Ed, 01/09: accept that and be honest about it rather than build
server-side storage.

- A permanent mist-blue notice sits under the share buttons carrying the
  caveat; it goes teal with a LINK COPIED heading once copied. Not a toast —
  the caveat matters most BEFORE the link is sent.
- `&d=` carries the day the link was made; a shared view says "shared on 1
  September … it is a snapshot". Separate parameter, so older links still open.
- Clipboard fallback added: `navigator.clipboard` does not exist outside a
  secure context and was failing silently.

**If couples turn out to go back and forth over days**, that is the evidence
for real sync — which needs somewhere server-side to store lists (a small
hosted endpoint, or customer accounts). Both were considered and deferred;
neither is possible from the storefront alone, because Shopify lets no
shopper's browser write to metaobjects or customer metafields.


## Session close — 01/09/2026

Cart and wishlist both complete and pushed. **Next job: the gallery section and
the blog.**

`docs/handover-brief.md` is the starting point for the next session — it holds
the three working channels (Dropbox + terminal for theme code, patch scripts
for anything over ~50KB, the Shopify MCP for store data), the theme ids, the
pre-flight that has now caught two pages, and the open items.

### Late fix

The header wishlist badge drew a filled square at zero: `.hdr__count` sets a
display, which out-ranks the browser's `[hidden]`. Second time that trap has
bitten in one day — the first was the wishlist empty state. Both are listed in
the handover brief.

The basket badge never showed it because Liquid omits the element entirely at
zero. The wishlist count cannot: the server has no idea what is on the device,
so the element must exist and be hidden.


---

# Session — 01/09/2026 (evening): the gallery and the blog

Three templates that did not exist in v3: the Gallery page, the blog listing
and the article page. Every /blogs/news URL 404'd before this, the same
template-missing failure as the collection and cart pages.

## What was built

| File | Notes |
|---|---|
| `sections/past-pieces-gallery.liquid` | 18.2KB, from live's 28.8KB. Ported from an FYE-original, not from T4S |
| `templates/page.past-pieces.json` | Did not exist. Banner + gallery |
| `sections/main-blog.liquid` | 6.8KB, from live's 43.7KB T4S section. Grid + pager |
| `templates/blog.json` | Did not exist |
| `sections/main-article.liquid` | 7.1KB, from live's 53.3KB. Body + latest-news row |
| `templates/article.json` | Did not exist |
| `snippets/article-card.liquid` | One article tile, shared by both new sections |
| `assets/fye-ui.js` | +1 IIFE: gallery masonry, carousels, filters, load more |
| `assets/fye-core.css` | +`.acard` / `.agrid` — two consumers, so it earns core |

## The gallery is metaobject-driven, and that is the thing to know

One `past_piece` METAOBJECT per commission — 11 entries at 01/09/2026, fields
name / category / number / caption / spec / date / media / featured / label.
Nothing about a piece is edited in the theme editor. Categories in use:
Engagement, Wedding, Pendants.

Order is automatic: featured first, then newest by date completed. The sort
key carries the entry's POSITION and the entry is then found by walking the
list again. That is deliberate and must not be "optimised":

- `.values` is a collection drop supporting iteration only. `values[i]`
  returns nil, which renders a card with every field empty and raises nothing.
- `metaobjects.TYPE[handle]` is capped at 20 lookups per page.

**W514 carried forward:** a Liquid loop over `.values` reads at most 50
entries. Past 50 the OLDEST pieces vanish silently. Years away at a few
pieces a month, but the fix is a paginate tag, which also moves the filter
counts server-side.

**Kept from live, unchanged:** card anatomy (monogram, name, category, square
media carousel, caption, spec), the masonry mechanic, and the two suppressions
Ed asked for on 25/08 — the piece NUMBER and the DATE are not rendered, and
both fields must stay because the date orders the grid.

**Dropped:** `load_fonts` (theme.liquid loads both faces), `padding_top` and
`padding_top_mobile` (rhythm is --sect-y), `enquire_label` and
`default_enquire_url` (the footer that used them went on 25/08). Gained
`bg_color`, a palette choice, replacing a hard-coded ivory ground.

## Decisions taken

- **Masonry is progressive enhancement now.** The CSS default is an even
  three-column grid; `fye-ui.js` adds `.is-masonry`, which switches to 1px row
  tracks and spans each card by its measured height. Live tested for the
  fallback by reading `getComputedStyle(grid).gridAutoRows`; adding a class is
  the same result without the read, and no-JS gets a clean grid rather than a
  broken one.
- **Filter bar is buttons, not `<a href="#">`.** They do not navigate. Also
  44px tall, which live's 12px text links were not.
- **Dates are ON in the blog listing**, against live, which set `show_dt`
  false. A news item with no date reads as undated rather than timeless. It is
  still a checkbox.
- **The article page uses `heading-template`**, where live disables
  `heading-article` and prints the title inside `main-article`. The shared
  banner already titles an article and already builds the Home > News > title
  breadcrumb, so articles now match every other page and gain crumbs they
  never had.
- **Latest-news row is 4 posts in one row**, not live's 8 over two. Setting
  kept (`limit_related`), so it is a number change.
- **Only live's two ENABLED article block types exist**: `image` and
  `related`. Content, tags, socials, navigation and comments were disabled on
  every article, so they were not built. Re-adding one is a design decision,
  not markup.
- **`main-page` left off the Gallery template.** The page's body is empty on
  the store, and `main-page` renders its band regardless — that is 160px of
  nothing. Live includes it, with custom_css targeting content that is not
  there.

## Gotchas earned

**A custom property cannot cap itself.** `--cols: min(var(--cols), 4)` in a
rule on the same element whose inline style sets `--cols` is a self-reference:
the property goes guaranteed-invalid and the grid silently collapses to one
column. The cap is done in Liquid instead. Caught before it shipped.

**`part.title == paginate.current_page` is always false.** part.title is a
String and current_page an Integer, and `==` across types in Liquid is false
rather than an error — so no page would ever be marked current, silently.
Coerce with `| append: ''` first. (This is the same family as the
`comparison of Integer with String failed` trap from the collection page, but
quieter: `<` and `>` raise, `==` just lies.)

**`0 == blank` is false but `nil == blank` is true**, again: `media.size |
default: 0` matters because a nil size fails BOTH the `> 1` and the `== 0`
test, and the card then renders with no carousel and no placeholder.

**A range value off the step grid kills the whole template, silently.**
`overlay` on `heading-template` is `"step": 2`; `"overlay": 45` made Shopify
refuse `blog.json` and `page.past-pieces.json` outright while every section
around them synced. It looked exactly like the known "template and section
change together, expect two passes" behaviour, so the first fix attempt was a
blank-line nudge, which of course changed nothing. `article.json` was the
tell: the only one of the three with no `overlay` line, and the only one that
landed. Now a rule in conventions.md §5.

## Outstanding

1. **Reviewed on first preview and signed off by Ed, 01/09/2026** — the
   gallery and the blog both. `fyeSmoke()` has still NOT been run at
   1440 / 899 / 748 / 559, and no mobile width has been looked at.
2. **Two test pieces are live in the gallery data** — `zz-test-entry-delete-me`
   and `test-piece`. They will render on the page. Store data, Ed's call.
3. **`platinum-sea-turtle-pendant` has no media**, so it renders the "no
   photographs yet" placeholder card.
4. **`blog.portfolio.json` / `article.portfolio.json`** are T4S demo
   templates on live and were not ported. Confirm they can be dropped.
5. **Pagination markup now exists twice** — `main-collection` has its own
   pager, `main-blog` has `.mblog__pager`. If a third listing appears, they
   should merge into fye-core.css rather than a third copy appearing.
6. **The blog tail is long**: guides, guarantee, trust strip under every
   article, which is live's structure. Worth a look on a short post.


---

# Session — 01/09/2026 (evening): the popups

**KLAVIYO IS GONE** (Ed, 01/09/2026). Every popup on the site is now theme
code, on Shopify's own contact form, and the twelve
`fye-guide-popups-group.json` sections it replaces can go. Build-state job 7
is done.

## What was built

| File | Notes |
|---|---|
| `sections/fye-popups.liquid` | 18.2KB. One section, one block per popup, in the footer group so it is on every page |
| `sections/footer-group.json` | +9 popups: six guides, enquiry, consultation, bespoke |
| `assets/fye-ui.js` | +1 IIFE: open by key, close, backdrop, email-body composer, reopen on success |
| 7 sections and snippets | enquiry buttons now carry `data-fye-popup="enquire"` beside their href |

Design is the Klaviyo popup Ed signed off — photograph left at a third, form
right, stacking to photo-on-top under 749px — with its champagne button
replaced by the brand's teal, and the field set kept exactly.

## THE GUIDE DELIVERY MECHANISM

Klaviyo used to email the PDF. Nothing does now, so **the popup hands the file
over itself**: the success panel carries `file_url`, opening in a new tab. All
six PDFs were already in Files and are wired directly to their CDN URLs.

Two consequences, both accepted:
- **Re-uploading a guide mints a new CDN URL and kills the old link.** The fix
  is repointing that popup's field in the theme editor. No code.
- **Nothing is gated.** Anyone with the URL can open a PDF without giving
  details. That was equally true under Klaviyo and of any Shopify-hosted file.

Marketing consent is recorded as a LINE IN THE MESSAGE, not a subscription —
there is no list to subscribe anyone to now. If a mailing tool arrives, that
line is where the answer already is.

## Gotchas earned — three, and two were mine

**`return_to` costs you `form.posted_successfully?`.** Setting it made Shopify
redirect to our URL, which carries none of Shopify's own `contact_posted`
marker — and that marker is what drives `posted_successfully?`. So the popup
reopened on a BLANK FORM instead of the download, and the same override dropped
`preview_theme_id`, landing preview tests on the live theme. Do not set
`return_to` on a form whose success state renders in place. Which popup was
submitted is remembered in sessionStorage instead.

**Custom `contact[Some name]` fields do not show usefully in the notification
email.** Seven popups, one submission, and no way to tell which had sent it.
The message BODY always shows, so the body is composed on submit — popup name,
typed message, journey answer, consent answer, and the page it was sent from.
Liquid writes a fallback body naming the popup, for JavaScript-off.

**A ported class hook is a dead hook.** See conventions §6.

## The trigger audit — do this after adding any popup

`data-fye-popup` is emitted from five places and the keys have to agree with
the footer group. An audit script found four faults in one pass:

1. **The care guide could never be downloaded.** `guide-download-block` prefers
   `file_url` over the popup, and three templates pointed it at
   `/pages/ring-and-jewellery-care-guide-download` — a page with NO TEMPLATE in
   v3. The one guide whose PDF was wired was the one you could not get.
2. **Seven enquiry buttons led to `/pages/contact-us`**, which has no contact
   section in v3. All now open the enquiry popup.
3. **`fye-guide-download`'s default trigger** was `open-engagement-ring-guide`,
   which nothing defines. Not live anywhere (a `link` wins on all three ring
   pages) but it would have broken the next page to use it.
4. **`fye-media-text`'s `trigger_class`** emitted a class only. Now emits
   `data-fye-popup` too, which makes every button on the 13 templates using
   that section popup-capable from the theme editor alone.

**Dropbox does not index the content of .liquid files**, so a session cannot
grep the theme. A read-only Node script in `tools/` that prints matches with
line numbers is how that gets read — that is what found all four.

## A correction worth keeping: Shopify stores JSON templates canonicalised

`templates/index.json` reads 14,040 bytes on the theme against 19,437 in the
repo, and every other template matches within the em-dash margin. It is NOT
stale and was NOT rejected — reading the body back showed all 13 sections, the
right order, and an edit made minutes earlier. Shopify stores its own
normalised copy with settings the schemas no longer declare stripped out, which
is why the templates carried over from live differ in size and the ones
authored fresh in v3 do not.

**So: a size mismatch on a JSON template is not by itself evidence of a
rejection.** Check `updatedAt`, and read the body before concluding anything.
The first explanation offered here — that the homepage had been edited in the
theme editor — was wrong, and Ed was right to question it.

## Outstanding

1. **The v3 contact page still has no form.** `/pages/contact-us` renders a
   heading and nothing else. Live wraps a Shopify Forms app block in an
   FYE-original `fye-contact` section; v3 has neither. The popup's own markup
   is most of a page section — this is the obvious next job.
2. **All popups share one photograph** (`Ring_211_5.png`) as a stand-in, except
   consultation and bespoke. Per-popup photography is a theme-editor job.
3. **The twelve `fye-guide-popups-group.json` sections on live are now
   superseded** and can be dropped when that group is next touched.
4. **Popup keys are still the old Klaviyo form IDs** (`V9eDYg`, `XMzNMS`…)
   because that is what `guide-download-block`'s `klaviyo_form_id` setting
   still emits. Renaming means changing both sides in one pass across
   index/blog/article; worth doing, not urgent, and the setting ID itself must
   not be renamed.
5. **`fyeSmoke()` still has not been run**, on any page, at any width.
