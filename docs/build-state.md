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


---

# Session — 01/09/2026 (late): the contact page

`/pages/contact-us` rendered a heading and nothing else in v3 — no template,
no section. It is also where the no-JavaScript fallback of seven enquiry
buttons lands, so it was the blocker behind several other jobs.

## What was built

| File | Notes |
|---|---|
| `sections/fye-contact.liquid` | 17.8KB, ported from live's `fye-contact` |
| `templates/page.contact.json` | Did not exist. Banner + contact + guarantee + trust strip |

Form left (name pair, email/phone pair, journey, message, consent), "Reach us
directly" panel right with phone, WhatsApp, email and the booking link, the
photograph above it, and Instagram / LinkedIn / Trustpilot as text links.

**Setting IDs kept from live** so nothing has to be re-entered: photo,
photo_alt, eyebrow, heading, heading_tag, intro, panel_heading, phone_*, wa_*,
email_*, appt_*, and the three social URLs.

## The decision that matters: the Forms app block is NOT ported

Live wraps a **Shopify Forms app block** (form id `1113897`) inside its
`fye-contact`, carrying the app's factory colours — `#202020` text, `#1878B9`
links, a black button. That is the "boring Shopify form" Ed objected to when
the popup job started.

Now that the popups use `{% form 'contact' %}`, a contact page submitting
through the Forms app would be a SECOND enquiry system: different styling
rules, different destination, different notification format. So this page uses
the same native form and **the same field names as every popup**, and every
enquiry from the site reads identically in the inbox whichever route it came
in by.

If the Forms app is ever wanted back, it is an app block — it can be added in
the theme editor without touching this section.

## Why this section carries `data-fye-popup-panel`

It is not a popup. It carries `data-fye-popup-panel="contact-page"` and
`data-fye-popup-label` because **the email-body composer in `fye-ui.js` is
scoped to those attributes**. Reusing it gives the contact page the same
readable enquiry email as the popups — source line, message, journey answer,
consent answer, page — instead of a worse one. The dialog-only paths in that
script (showModal, backdrop, Escape) are inert on a plain element.

This is documented at the top of the file too, because it reads like a
copy-paste mistake otherwise. If the composer is ever rescoped, this page has
to move with it.

## Also dropped

**Live's "request call back" second modal.** The form asks for a telephone
number and says we reply personally; a second modal to ask for the same thing
is furniture. Ed to say if a dedicated callback route is genuinely wanted.

**Social links are text, not logos** — brand rule is thin outline line-art
only, and a third-party brand mark is neither that nor ours to restyle.

## Layout note worth keeping

Below 900px **the side panel moves above the form** (`order: -1`) and the
photograph is hidden. Someone who wants to phone should not scroll past a whole
form to find the number, and on a phone the photograph is the least useful
thing on the page.

## Outstanding

1. **Not smoke-tested.** `fyeSmoke()` has still not been run on ANY page at
   ANY width. The contact page and the popups are the first fixed-width forms
   in the theme, so they are the right things to run it against first.
2. **The photograph is `Ring_21.jpg`**, chosen because it exists. A portrait
   crop of a consultation would suit the page better.
3. **Seven of the nine popups still share `Ring_211_5.png`.** Theme-editor job.
4. **`fye-media-text`'s "Start a bespoke enquiry" and the FAQ's "Enquire now"**
   can now either keep pointing at this page — which finally has a form — or be
   switched to the enquiry popup by putting `enquire` in their popup field.
   Both work; Ed's call, and no code either way.


---

## Correction — `fyeSmoke()` did not exist until 02/09/2026

Every session block from August onward closed by carrying **"`fyeSmoke()` has
not been run"** as an outstanding item. On 02/09/2026 Ed ran it and got
`ReferenceError: fyeSmoke is not defined`. A search of the whole repo found the
name in exactly two places — `docs/build-state.md` and a prompt file. **It had
never been written.** The docs had been faithfully tracking a tool that existed
only in prose, and each session copied the line forward without checking.

Worth remembering as a failure mode: an outstanding item that never changes
state across many sessions may not be a task at all.

It exists now.

## `fyeSmoke()` — what it is and how to run it

`assets/fye-debug.js`, loaded by a gate at the end of `assets/fye-ui.js` **only
when the URL carries `?fyedebug=1`** (remembered in sessionStorage for the rest
of the tab, cleared with `?fyedebug=0`). Visitors download nothing. It is not
in `theme.liquid` because Liquid cannot read query parameters, so gating there
would mean loading it for everyone or only in the theme editor.

    foryoureternity.com/pages/contact-us?preview_theme_id=197720146304&fyedebug=1

then in the console: `fyeSmoke()`, or `fyeSmoke('targets')` for one group.
`fyeSmoke.groups` lists them. **It only ever reads the page — no check mutates
anything.**

Nine groups, each chosen because this rebuild has actually shipped that fault:

| Group | Catches |
|---|---|
| `overflow` | sideways scroll, and the elements causing it |
| `targets` | anything under the 44px rule (inline prose links exempt) |
| `type` | rendered text under 12px |
| `popups` | a trigger whose key opens nothing, a popup with no trigger, and class-only hooks with no `data-fye-popup` beside them |
| `images` | missing `alt`, and images that 404'd |
| `forms` | controls with no label, malformed `contact[…]` names |
| `palette` | browser-default blue links (an undefined link colour) |
| `structure` | missing or duplicated h1, skipped heading levels, duplicate ids |
| `liquid` | raw `{{`, `{%`, `Liquid error`, or a rich-text field printed as `{"type":"root"…}` |

**Widths cannot be driven from a script** — a page cannot resize its own
window. Use devtools responsive mode and re-run at **1440 / 899 / 748 / 559**.
899 and 559 matter most: the theme reflows at 900 and 560, so those two are one
pixel inside the narrower layout.


---

# Session — 02/09/2026: About Us

Live's About page runs eleven sections. v3 already had eight of them, so this
was three sections and a template rather than a page build.

## What was built

| File | Notes |
|---|---|
| `sections/fye-founder.liquid` | Ported. 2 uses on this page — "Why we started" (photo left, quotation) and "Meet Edward" (photo right, sign-off) |
| `sections/fye-services.liquid` | Ported. The seven-service list with a split section head |
| `sections/fye-pillars.liquid` | Ported. Image-topped values grid on teal |
| `templates/page.about-us.json` | Did not exist |

**Every setting ID was kept**, so live's copy carried over with no re-entry:
founder keeps band/image_right/image/image_position/image_alt/caption/
placeholder/eyebrow/heading/intro/quote/attr_name/attr_role/outro/sig;
services keeps band/columns/eyebrow/heading/note + heading/body/link per block;
pillars keeps band/columns/eyebrow/heading + image/image_alt/heading/body.

Reused as-is: heading-template, fye-trust-strip, fye-steps, fye-testimonials,
guide-download-block, fye-gallery-promo, fye-consultation.

## Changed from live, deliberately

**The hero is the standard page banner, not a photo hero with buttons.** Live
uses `fye-hero` with an overlay, two CTAs (Book a consultation, See the
gallery) and per-block typography settings. v3's `fye-hero` is a different
design — logo, heading, two buttons, no overlay or height controls — and
`heading-template` has no button blocks. So the page opens with the standard
banner carrying live's h1 and lead paragraph, and both CTA destinations appear
further down anyway (gallery promo, consultation band). **Ed to say if he wants
a real photo hero with buttons; that means extending a hero section, not
faking it in the banner.**

**Pillars dim their body copy with `opacity`, not a hard-coded ivory alpha.**
Live wrote `rgba(242,241,232,.88)`, which is correct on teal and wrong on the
other three band choices the schema offers. Opacity inherits from whatever the
band sets, so one rule works everywhere. Live's contrast note is preserved:
.82 measures 3.9:1 on sage-deep, .88 clears 4.5:1 for 15px text.

**`.fye-edu` wrapper dropped.** v3 has no education shell — the band IS the
section. Tokens replace the edu-core variables (`--muted` -> `--ink-soft`,
`--font-head` -> `--font-display`) and spacing moves onto the --s scale.

## Fixed on this page

| Where | Was | Now |
|---|---|---|
| `fye-founder` photo | printed "object-position:" and ";" as text | correct focal point |
| `.consult__contact a` × 3 | 21px tall | 44px |

The consultation contact links (phone, email, WhatsApp) were 13px inline-flex
with no vertical padding. **That band closes the homepage and several education
pages too, so one rule fixed all of them.** The section also had no
`data-screen-label`, which is why the smoke output could only identify them as
bare "a" — added.

## Gotchas earned

**Filters cannot be chained inside a filter argument.** Now a rule in
conventions §4. It printed CSS as prose around a photograph and raised nothing.

**The overflow check had to walk the WHOLE clipping chain, not the nearest
ancestor.** 12 phantom overflows on this page — testimonial SVGs and
gallery-promo cells — because the nearest clipper of a carousel slide is often
an `<svg>` (overflow hidden by default) inside a slide that is legitimately
parked off-screen, inside the element that actually clips. It now passes if
ANY ancestor contains the element. The tell, again, was that "DOCUMENT scrolls
sideways" stayed silent.

**A patch script that writes Liquid must not use backticks in its comments.**
w959 failed with `SyntaxError: Unexpected identifier` because a Liquid example
in a JS template literal was quoted with backticks, which closed the literal.
Worse, the shell line was `node script.mjs` then `rm script.mjs` on separate
lines, so the delete ran anyway and the file had to be rewritten. **Chain them:
`node x.mjs && rm x.mjs`.**

## Smoke test

8 of 9 groups clean at 559 and 1440, the ninth being the YMQ app images.

## Outstanding

1. **Live also has `page.about-us-v2.json`** — same size as about-us, in the
   sitemap, untouched here. Confirm it can be dropped.
2. The photo-hero question above.
3. Everything else unchanged: search/404/list-collections templates, the six
   guide-download pages, downloadable-guides, FAQs, the 13 collection suffix
   templates, and the ~60-page education library.


---

# Session — 02/09/2026: search and 404

Two templates v3 never had. The search box sits in the header on **every page
of the site**, and it led to an unstyled page; a mistyped URL got nothing at
all.

## What was built

| File | Notes |
|---|---|
| `sections/main-search.liquid` | 14.3KB. New — live runs T4S's version |
| `templates/search.json` | Banner + results |
| `sections/main-404.liquid` | New. Live's 404 carries a bare `main-404` with no settings, so there was nothing to port |
| `templates/404.json` | Section only, no banner — matches live's shape |

Setting IDs kept from live's search: `limit`, `col_dk`, `col_mb`. Dropped
~35 T4S settings (image_ratio, layout_des, enable_listing, use_pagination,
btn_*, space_*, the margin/padding sets) and the disabled `sidebar-collection`
section.

## Products and reading are separated

Shopify returns products, pages and articles in ONE relevance-ordered list.
Rendered as a single grid that puts a ring tile beside a care guide, so:
products fill the grid, pages and articles become a list beneath it. With ~60
education pages, a search for "sapphire" should surface the sapphire guide as
well as sapphire rings.

**The trade, stated in the file:** the split happens within each page of
results, so a query with many products can push articles onto page 2. The
alternative — two searches — loses the single relevance order.

Counting is done from the results actually on the page rather than from
`search.results_count`, which is the total across every type and every page:
using it above a grid of 24 states a number the page does not show.

## The 404 has a search field and six links, and no product grid

Someone on a 404 followed a dead link or mistyped an address, and this rebuild
has moved several of the old site's ~120 pages. The useful thing is finding
what they meant. A grid of rings would make the wrong thing the answer.

## THE PAGER IS NOW ITS THIRD COPY

`main-collection`, `main-blog` and now `main-search` each carry their own
`.*__pager` block — the same markup and the same rules three times. It was
left local rather than turning this job into a refactor of two working pages,
but **this is the point at which it should move into `fye-core.css` as one
`.pager` component.** Flagged in main-search's header comment as well as here.

## Smoke test

`/search` and a 404 URL: 8 of 9 groups clean at 559 and 1440, the ninth
being the YMQ app images. The 404 returns a real 404 status, not a 200.

## Outstanding

1. **Results were not functionally confirmed** — the smoke test measures
   layout, not whether a query returned products and guides. Needs one look at
   `/search?q=sapphire` to check the grid fills and the guides list appears.
2. **If a search app ever intercepts `/search`** and redirects to its own
   `/a/search` proxy, this page stops being reachable. `theme.liquid` already
   notes that `request.page_type` is blank on proxy pages, so the plumbing for
   that exists — worth knowing which one the header's search box points at.
3. The pager merge above.


---

## Search: the route decision, 02/09/2026

The header's search icon links to `{{ routes.search_url }}` — i.e. **/search,
the theme's own page**. Confirmed by grep, not assumed. Nothing in v3 routes to
the search app's `/a/search` proxy.

That was worth establishing, because a test of `/a/search` on the preview
theme produced a page full of

    Liquid error (line 353): Could not find asset snippets/product-img.liquid
    TRANSLATION MISSING: EN.SEARCH.RESULTS_WITH_TERM

and, once shimmed, a page of full-bleed unstyled images. The cause is not in
this repo: **cloud-search holds its own results template app-side, configured
against the old T4S theme.** It calls T4S's `product-img` snippet and emits
`t4s-row` / `t4s-col` classes, and v3 deleted all of that CSS deliberately.

### What was done, then undone

`snippets/product-img.liquid` and a set of `search.*` locale keys were added
to make the app's page render, and **both were deleted the same day.** Ed's
objection was the right one: the point of the rebuild is to shed T4S, not to
teach v3 to answer to it. The locale file is back to its original nine
`general` keys, four `products` keys and two `footer` keys.

Now a rule in conventions.md, at the top.

### Where search stands

- **/search** — the theme's own `main-search`, on brand, products grid plus a
  guides-and-articles list, smoke tested clean at 559 and 1440. This is what
  the header goes to and what customers get.
- **/a/search** — the app's proxy. Reachable only by typing it. Renders badly
  on v3 and **that is expected and accepted**, not a bug to fix.
- **cloud-search stays installed for COLLECTION FILTERS**, which it is very
  good at across 3,000+ rings, and whose markup v3 now styles deliberately
  (see the filter rules in `main-collection.liquid`).

The cost, stated honestly: Shopify's own search relevance is weaker on
misspellings and synonyms than the app's engine. If that proves a problem in
use, the fix is a search app that renders through OUR markup — not a shim that
makes v3 look like T4S.


---

# Session — 02/09/2026: the guides and the education library

The biggest single move of the rebuild: **49 page templates added**, most of
them ported mechanically rather than by hand.

## What was built

| File | Notes |
|---|---|
| `sections/guide-download.liquid` | Ported. The "your guide is ready" page — 6 uses on the `guide-download` suffix |
| `templates/page.guide-download.json` | One template, six pages |
| `templates/page.downloadable-guides.json` | The hub the header CTA points at |
| `sections/fye-founder / fye-services / fye-pillars` | Ported for About Us (see the earlier block) |
| 6 guide reading pages | engagement / plain wedding / diamond wedding / eternity / diamond & gemstone / ring care |
| 41 education pages | the nine ring-care pages, gemstone and diamond education, styles, budget, settings, sourcing, bespoke process… |
| `tools/fye` | One command per session instead of four |
| `assets/fye-debug.js` | +`fyeSmoke.all()` — flat report, copied to the clipboard |

## The guide download page: one template, six pages

Nothing page-specific can live in section settings when six pages share a
template, so everything that differs comes from each page's own `guide`
metafields, which already existed in the store:

    guide.pdf_url  ·  guide.cover_image  ·  guide.button_label
    guide.analytics_name  ·  guide.delay_ms

A guide with no `pdf_url` says "coming very soon" rather than showing a dead
button — the pages exist before some of the PDFs do.

Live's inline `<script>` moved into `fye-ui.js`, driven by data attributes.
The auto-download behaviour is live's and unchanged, **including its two
guards**: a bfcache restore and a hidden tab both fire timers, and without
those checks someone pressing Back gets a second unexpected download.

## The porter — how 47 templates arrived without being retyped

`tools/w971-port-education-pages.mjs` reads every `page.*.json` live has that
v3 does not, works out the section types each uses, checks them against
`v3/sections`, and writes the ones v3 can support. Two things it transforms:

**`fye-hero` is a DIFFERENT SECTION IN v3 UNDER THE SAME NAME.** Live's takes
`heading` / `subtext` / `button` blocks, each carrying its own font size,
colour, weight and tracking. v3's takes flat settings, because the design
system owns the type scale now. Copied verbatim, **every hero would render
empty** — the settings it reads absent, the blocks it does not know ignored.
So each hero becomes a `heading-template` banner carrying the h1, the
subtext, the image and the overlay.

**Standalone `fye-breadcrumb` bands are dropped** — `heading-template` has a
crumb block, which is how every other v3 page does it.

It also rounds the overlay to an even number, because that range is
`"step": 2` and an odd value makes Shopify reject the whole template silently.

Everything else passes through untouched, so live's copy, block order and
settings carry over exactly. **It refuses to write anything unless every page
in the batch transforms cleanly**, and never overwrites a template v3 already
has.

## Excluded deliberately

- `page.zz-form-testing.json` — internal, marked do-not-link
- `page.about-us-v2.json` — a duplicate of the About page already built

## Still blocked, and by what

25 live pages need sections v3 does not have. In order of leverage:

| Section | Unblocks |
|---|---|
| `sidebar-page` | **8** — faqs, faq-2, diamonds, gemstones, lab-diamonds, loose-diamond-gems, create, edu-test-page |
| `fye-facts` | **7** — every gemstone guide: sapphire, ruby, emerald, tanzanite, aquamarine, opal, morganite |
| `fye-bespoke-cta` | 2 |
| `fye-signpost` | 1 — jewellery-guides (the six-route chooser) |
| `fye-scale`, `fye-colour-scale` | 1 — diamond-4cs |
| `fye-shape-tiles` | 1 — diamond-shapes |
| `fye-ring-sizer` | 1 — find-your-ring-size |
| `fye-ring-finder` | 1 — find-your-ring |
| `fye-affiliate-signup`, `fye-affiliate-terms` | 1 each |
| `main-pagebrands`, `contact-form`, `categories_section`, `main-store-locator`, `timeline` | 1 each |

**The `sidebar-page` question is open with Ed:** v3 has dropped sidebars
everywhere else (blog and collection both had one on live), so if those eight
pages can be single-column the porter can drop `sidebar-page` the way it drops
the breadcrumb band, and all eight port with no new code.

Two pages error rather than blocking — `page.coloured-stone-guide.json` and
`page.find-the-perfect-engagement-ring.json` both have a hero with no heading
text, so they need looking at by hand.

## Tooling, so sessions stop being typing

`./tools/fye push "msg"` · `ship "msg"` (push, wait 60s, re-save templates) ·
`status` · `run <script.mjs>`. `ship` exists because a template and its
section cannot land in one pass — Shopify validates against the schema it
holds at that moment.

`fyeSmoke.all()` prints one flat block and copies it to the clipboard.
`console.groupCollapsed` hides detail lines when the log is copied, which had
made every previous smoke round a manual expand-and-select exercise.

**An auto-commit watcher was considered and NOT built.** Three patch scripts
needed a second attempt on 02/09/2026, and each failure was caught precisely
because nothing had been committed yet.

## Smoke test

`ring-settings`, `ring-care-cleaning`, `ethical-sourcing` and
`create-your-own-ring` — the four different section mixes — all 8 of 9 groups
clean at 559px. The ninth is the YMQ app images, on every page of the site.

## Outstanding

1. Ed's `sidebar-page` decision — worth 8 pages immediately.
2. `fye-facts`, then the seven gemstone guides.
3. The two errored pages above.
4. 13 collection suffix templates still missing; confirm collections fall back
   cleanly to `collection.json`.
5. The YMQ app injecting two broken images site-wide. App ticket.


---

# Session, 03/09/2026 (overnight): speed and SEO audit, release 1

Worked from `FYEv3themeaudit20260902.md` (Ed's project folder). Theme was
UNPUBLISHED at the time, live had been reverted to `fye-v2-responsive`, so
nothing here touched the public site. Ed's brief: optimise what v3 has, no
styling or layout change, do not rebuild anything from v2.

## What was done, by audit ID

| ID | Where | What |
|---|---|---|
| S1 | `main-product`, `fye-stone-product` | The gallery `loading:` filter chain was the §5 argument trap: it printed `loading="true"`/`"false"`, so every panel loaded eagerly. Now `eager` + `fetchpriority="high"` on the first, `lazy` on the rest. The `alt:` chain had the same bug (alt was empty whenever the media had none); fixed the same way. |
| S1 (found) | `guide-download` | Same trap on the cover `alt:`, it printed a stray "front cover" as visible text under the cover on all six thank-you pages. Fixed. |
| S2 | `heading-template` | Banner is a real `<img>` (`pbanner__img`, absolute, object-fit cover) with `widths`, `sizes="100vw"`, eager, `fetchpriority="high"`. Scrim and copy unchanged. |
| S4 | `fye-hero`, `main-article` | `fetchpriority="high"` on the hero and article images. |
| S4 | `header-bottom` | Logo is one `<picture>` (`<source media="(max-width: 900px)">` for the mobile mark) instead of two `<img>`s hidden by CSS; both priority hints dropped. CSS rewritten for the single `.hdr__logo-img`. |
| P1 | `fye-hero` | When a wordmark follows the heading, its words go inside the `<h1>` as `.visually-hidden` and the image becomes `alt="" aria-hidden`. H1 now reads "Engagement rings by For Your Eternity". |
| P2 | `header-bottom`, `footer` | Mega-menu zone titles / column labels and the footer strapline / sign-up label are `<p>` with the same classes; each rule restates the heading base (face, colour, line-height, text-wrap) so rendering is identical. |
| S3 (part) | `fye-popups` | Popup titles are `<p role="heading" aria-level="2">`; `.pop__title` restates the h2 base. The `<template>`-clone refactor was NOT done, untestable without a browser, and the footer's newsletter form loads reCAPTCHA on every page regardless. |
| D1 | `snippets/schema-product` | Product JSON-LD: AggregateOffer for rings, Offer for single-price stones, GBP, availability, free GB shipping. No return policy asserted (see file). Skipped for Fee / Service Fee / Side Diamonds types. Rendered from `theme.liquid`. |
| D2 | `snippets/social-meta` | og:/twitter: tags from `page_title`, `page_description`, `page_image`; product price and article dates. Rendered before `content_for_header`. |
| D3 | `snippets/schema-breadcrumbs` | BreadcrumbList beside every visible trail: `main-product`, `fye-stone-product`, `fye-collection-intro`, and `heading-template` for article/blog only (chapter pages already emit theirs from `fye-chapter-nav`). |
| D4 | `snippets/schema-article` | Article JSON-LD with author, dates, image, publisher by @id. No visible author line (design decision). |
| D5 | `assets/`, `schema-org` | `fye-logo-square.png` (1200²) and `fye-logo-wide.png` (2000×1000) copied in from the old theme; the snippet prefers them, falls back to Settings › Brand. The old `has_assets` test was always true. |
| P4 C1 C2 I1 | `theme.liquid` | `noindex, follow` for: search, cart, /a/search, guide-download and wishlist templates, empty collections, `cloud-search-all-products`, zz-form-testing pages, and (Ed approved) Loose Diamond / Loose Gemstone products. Page-type capture moved above `<head>` to feed it. |
| A3 | `feature_columns2`, `fye-gallery-promo`, `about_us` | Alt falls back to the block or section heading when Files has none. |
| A2 (part) | `article-card`, `latest-news-EM` | "Read more" links carry `aria-label="Read more: <title>"`. |
| M2 | `main-collection` | Desktop-only `min-height: 560px` on `#cloud_search_filters_sidebar:empty`, reserves rail height ONLY until xCloud injects, so the final layout is untouched. A trace is still needed to confirm the shifting element. |
| M3 | `config/settings_data.json` | YMQ Product Options app embed `disabled: true`. Nothing in the theme references it; it was already listed as injecting broken images site-wide. Shopify Forms and xCloud embeds untouched. |
| Blank pages | `sections/apps.liquid` | New: the standard `@app` host, so `page.order-a-free-ring-sizer.json`'s Forms block renders again. |

## Not done, and why

- **S3 template-clone**, **S6 minify**, **M4 menu-on-open**, need a browser
  to test or a build step; not overnight work.
- **A1 contrast**, **A2 underlines/button names**, **D4 author line**,
  **N3 drawer links**, visible changes; Ed said none.
- **Blank pages beyond the ring sizer**, Ed said do not port from v2.
- **hero wordmark width/height**, the SVG's intrinsic size could not be read
  (no network from the session). Needs the file's viewBox.
- Admin items (N1, B3, P3, PR1–PR4, C3, P5, redirects, unpublishing), store
  data, not theme code. Listed in the handover note in the project folder.

## Verification

Tag-balance and schema-JSON check passed on all 23 touched files;
`tools/w977-validate-templates.mjs` reports only pre-existing select-value
notes plus a false positive on the `@app` block (the validator does not know
the wildcard). Not browser-tested: the session's browser tools were down.
First thing after push: open the preview with `?fyedebug=1` and run
`fyeSmoke.all()` on a product, a collection, a guide chapter and an article.


---

# Session, 03/09/2026: the six pages with no template

Worked from `PROMPT-v3-missing-pages-03092026.md`. Four of the six built,
smoke tested and pushed. The two affiliate pages are blocked on their briefs,
which are not in the repo or the project uploads.

## What was built

| File | Notes |
|---|---|
| `templates/page.diamond-4cs.json` | Chapter. Four Cs ranked by what you actually notice |
| `templates/page.diamond-shapes.json` | Chapter. Eleven cuts, ratios, hand guidance, the bow tie |
| `templates/page.find-your-ring-size.json` | Chapter. Full A to Z+6 conversion chart |
| `templates/page.loose-diamond-gems.json` | Hub. Loose stone routes plus the two education entry points |
| `sections/fye-shape-tiles.liquid` | NEW, and the only new section. Reasoning below |
| `sections/fye-xref.liquid` | CTA raised to the 44px minimum. Affects all 33 pages using it |

All three chapters follow `page.lab-grown-diamonds.json` exactly: banner,
chapter-nav top with `emit_breadcrumbs: true`, rich-text intro, content
sections, xref, faq, chapter-nav bottom with breadcrumbs off, guide download,
related. All three handles were already in `fye-chapter-nav`'s `seq_` arrays,
so previous and next across the engagement, plain-wedding, dg-wedding,
eternity and dg-master guides now resolve instead of landing on nothing.

## The one new section, and why

`fye-shape-tiles`. The shape icons are **SVG** files in Content › Files
(icon101.svg to icon110.svg), the same ones the mega menu renders. An SVG
cannot pass through `image_url`, and `image_picker` will not list one, so
`fye-cards` cannot render them and nothing else in the set has an image slot
at all. Its icon setting is therefore a `text` field holding a filename,
resolved with `file_url`. Now a rule in conventions §5.

Each tile carries **two** destinations, rings and loose stones, because
someone arriving at "oval" wants one or the other. Live linked only to rings.

## Eleven cuts, not twelve

Files holds icon101 to icon110, ten shapes, plus baguette as an eleventh with
no icon and only `/collections/eternity-baguette` to point at. The page's
title tag promises twelve. **Open with Ed:** either the title tag becomes
eleven, or a twelfth shape needs an icon and a collection. Trilliant is the
obvious candidate and has neither, so it was not invented.

## Verified against the store before linking, not assumed

Every collection handle on these pages was checked live. The brief's
`/collections/fancy-diamonds` and `/collections/coloured-stone-rings` both
exist (11,358 and 445 products). The engagement shape handles are irregular
and had to be read from `mm-shapes.liquid` rather than constructed:
`round-brilliant-engagement-rings` but `oval-cut-engagement-rings`.

## The hub uses fye-related, not fye-cards

The brief suggested `fye-cards`. Its `card` block has icon, label, heading and
body and **no link setting at all**, so a hub built from it is a grid of
unclickable boxes. `fye-related`'s card block has `link` and `cta`, which is
what a hub needs. `fye-two-ways` carries the finished-ring against
bring-us-a-stone decision, with the second card opening the enquiry popup.

## Gotchas earned

**A guard that names the selector is not proof the fix landed.** Now a rule in
conventions §5. Cost one wasted push cycle.

**`<p">` is invisible to every validator.** Typed twice, in two different FAQ
answers. The JSON is valid, every setting is legal, Shopify accepts it, and
the browser recovers by inventing an attribute and swallowing part of the
sentence. Nothing in the toolchain checks the HTML inside a setting VALUE.
`w981` fixed both and is worth rebuilding if it happens again.

**`targets` had never run on a chapter page.** It only fires at coarse pointer
or 900px and under, and every previous chapter smoke run was at 1440. Ed's 899
run found a 24px CTA sitting on 33 pages. **Smoke test at 899, not just 1440**,
or the check that matters most does not run at all.

## Outstanding

1. **The affiliate pages are blocked.** `BRIEF-affiliate-page-images.md` and
   `BRIEF-affiliate-terms-revision.md` are referenced by the prompt but are not
   in the repo, Dropbox or the project uploads.
2. **The ring size chart needs checking against Hockley Mint's own chart**
   before publish. Standard published UK conversions, A to Z+6 with diameter,
   circumference, US and EU, but it is the one number set on these pages where
   being wrong is expensive. The table note already says every size is
   confirmed against a physical sizer.
3. **The twelfth cut**, above.
4. `mm-shapes.liquid` should move to `file_url`.
5. The pager is still duplicated three times (`main-collection`, `main-blog`,
   `main-search`) and should become one `.pager` component in `fye-core.css`.


---

## The affiliate pages, 03/09/2026

The last two of the six. Both built, smoke tested clean at 889 and 1440, and
**neither brief was ever needed**: `BRIEF-affiliate-page-images.md` and
`BRIEF-affiliate-terms-revision.md` are not in the repo, Dropbox or the
project uploads, but the page is live on the old theme, so live's own template
was the better source anyway. Every word of copy carries over verbatim.

| File | Notes |
|---|---|
| `templates/page.affiliate-programme.json` | Recomposed from live's template |
| `templates/page.affiliate-terms.json` | Banner plus the terms section |
| `sections/fye-affiliate-terms.liquid` | Copied from live BYTE FOR BYTE, then converted |

## Four of live's sections do not exist in v3

| Live | v3 | Why it works |
|---|---|---|
| `fye-hero` | `heading-template` | v3's fye-hero takes flat settings, live's takes typography-per-block. Copied over, it would render empty |
| `fye-breadcrumb` | dropped | `heading-template` block "3" is the crumb trail |
| `fye-bespoke-cta` (2 uses) | `fye-xref` | eyebrow, heading, body, one link. Same shape |
| `fye-affiliate-signup` | `fye-terms` | four numbered steps with headings and bodies; `meta` carries "Step 1" |

## The terms document was copied, not retyped

56KB, thirty numbered clauses, a plain-English summary, three four-column
tables and a Commercial Schedule. It cross-references **clauses 5, 6, 8, 25.1
and 26**, and those resolve only because the headings run 1 to 30 in document
order with each clause's paragraphs as an `<ol>`.

So it was copied verbatim by script, and the conversion script **refuses to
write unless the legal text comes out byte-identical**. Verified: 31 `<h2>`
(30 clauses plus the summary), 31 clause lists, 7 sub-lists, 3 tables, all
cross-references present.

Only the wrapper and the stylesheet changed:

- 5 hardcoded hex to tokens. `#5b6b72` was a **third ink level**, which
  conventions §3 says does not exist, and became `--ink-soft`.
- 12 px font-sizes to type-scale tokens.
- **9 `!important` removed.** They were there to beat the old theme's heading
  rules; v3's base rules are `:where()` and carry no specificity, so
  `.fye .fye-legal h2` wins by existing.
- `@media (max-width: 600px)` to **749**, the theme's table breakpoint.
- `.fye-legal-wrap` with its own padding became `band band--white`, so rhythm
  comes from `--sect-y`.

**Two hardcoded `foryoureternity.com` references were LEFT ALONE**: clause 2.2
names the Website and the Commercial Schedule gives the programme contact.
That is legal content, not markup.

Two judgements recorded in the file: the 900px measure stays a pixel value
rather than a `ch` measure, because three tables have four columns and a prose
measure would make them scroll on desktop; and clause headings stay sentence
case against the brand's uppercase display default, because "22. SUSPENSION
AND TERMINATION" in caps reads as shouting in a contract.

**Any future revision should be regenerated from the source document and
re-copied, never hand-edited in the section.**

## Deliberate departures from live, on the programme page

1. **The `#affiliate-signup` anchor is gone.** Live's hero button, join CTA and
   apply button all pointed at it, and the section it targeted
   (`fye-affiliate-signup`) does not exist in v3. "Apply to join" now opens the
   enquiry popup via `trigger_class: "enquire"`, with `/pages/contact-us` as
   the no-JavaScript fallback. Matches Ed's instruction that sign-up is an
   enquiry, and no Shopify Form is involved.
2. **"Explore our jewellery guides" points at `/pages/downloadable-guides`**,
   not `/pages/jewellery-guides`, which still has no template in v3 and would
   render as an empty page. Revert when `fye-signpost` is built.
3. **`/pages/contact` became `/pages/contact-us`** in two places. The former
   does not exist.
4. **"a lifetime manufacturing-defect warranty" softened** to "a warranty
   against manufacturing defects", and the resizing line reads "complimentary
   resizing for the first year". The copy rules forbid lifetime warranty
   wording. **Open with Ed:** if the lifetime claim is deliberate and
   defensible on the legal side, it goes back.

## Job status: all six pages built

`diamond-4cs`, `diamond-shapes`, `find-your-ring-size`, `loose-diamond-gems`,
`affiliate-programme`, `affiliate-terms`. Every one validated with 0 faults and
smoke tested clean at 889 and 1440. One new section in the whole job,
`fye-shape-tiles`, plus the ported `fye-affiliate-terms`.

## Still open for Ed

1. **The ring size chart against Hockley Mint's own**, before publish.
2. **The twelfth cut** on the shapes page: the title tag promises twelve, the
   store supports eleven.
3. **The lifetime warranty wording**, above.
4. The YMQ app still emits two Early Hints stylesheet preloads on every page
   even with its embed disabled. Needs killing in the app admin, not the theme.


---

## The ring size chart, provenance

**Where the numbers came from, because someone will ask.**

`templates/page.find-your-ring-size.json`, section `chart`. 32 rows, five
columns: UK, inside diameter mm, circumference mm, Europe, US.

**A to Z are transcribed from a published conversion table Ed supplied on
03/09/2026** and are not to be adjusted without a new source. They replaced the
standard set the page shipped with that morning, and the difference mattered:
**every inside diameter in the original was 0.1 to 0.15mm too high**, and Q and
Z differed on circumference as well. Ed asking for the check is what caught it.

**Z+1 to Z+6 are DERIVED, not published.** The supplied table stops at Z. They
are extrapolated from the source's own increments: circumference +1.3mm per
letter, diameter as circumference / pi to one decimal, Europe +1 1/4, US +1/2.
The patch script verified each derived diameter against circumference / pi
before writing, and refuses on a drift over 0.1mm.

**The table note says which rows are which**, and asks anyone in the Z+1 to
Z+6 range to have the size confirmed against a physical sizer. A customer at
Z+4 has the least access to another chart to check us against, so presenting
derived figures as equally authoritative would be the wrong way round.

## Three figures in the supplied table still look wrong

Reproduced exactly as supplied rather than silently corrected. Ed's call:

| Row | Supplied | Widely published | Note |
|---|---|---|---|
| Q | 57.2mm circumference | 57.6mm | |
| Z | 21.5mm diameter | about 21.8mm | identical to Y in the source, and 68.5 / pi is 21.8 |
| Z | 68.5mm circumference | 69.1mm | |

**Z is the base the six derived rows count up from.** Correcting Z moves all
six with it, so settle that row before anything else in this table.

## Also on 03/09

**"Lifetime warranty against manufacturing defects" restored** on
`page.affiliate-programme.json`. It had been softened to drop "lifetime"
under the copy rule forbidding lifetime warranty wording; Ed confirmed the
lifetime claim is deliberate and attaches to manufacturing defects, not to
resizing. **Resizing is still complimentary for the first year only**, and that
distinction is the point of the rule, so keep the two claims apart in copy.

**The China column was dropped** from the chart. It was in the source, but it
is mostly dashes below H and it made this the widest table in the theme.


---

## The guides hub, and four more orphans, 03/09/2026

`/pages/jewellery-guides` is built and clean at 889 and 1440. It was the last
page on the site with a real page behind it and no template.

| File | Notes |
|---|---|
| `templates/page.jewellery-guides.json` | Banner, signpost, consultation |
| `sections/fye-signpost.liquid` | Ported from live, including its six inline icons |

## Ed's rule, applied: build it if the page exists

Checked all five candidates against the store before writing anything. Only
`jewellery-guides` has a page. **`create`, `brands`, `store-locator` and
`timeline` have no page with that handle at all**, so they are now in the
porter's exclude list with the reason.

That retires four entries from the blocked-sections list the porter has been
reporting since 02/09: **`main-pagebrands`, `contact-form`,
`main-store-locator` and `timeline` were only ever needed by those four dead
templates.** Nothing to build. The bespoke page is `create-your-own-ring`,
which v3 already has.

Running total of orphan templates found this way: `faqs`, `faq-2`,
`gemstones`, `diamonds`, `lab-diamonds`, `create`, `brands`,
`store-locator`, `timeline`, `edu-test-page`. **Ten.** Checking the store
before building a section is now the cheapest step in the whole porter
workflow.

## fye-signpost was ported rather than approximated

First attempt composed the page from `fye-terms` at three columns, which
worked and validated clean. It was replaced, because the section is not a grid
of definitions: it is a routing list where **the reader's own words are the
large line** and the guide's formal title is deliberately secondary, since
nobody scans "The Diamond and Gemstone Wedding Ring Guide" quickly.

**The six icons are inline SVG and must stay that way.** Live's reasoning,
carried into the file: the illustration-scale ring artwork used on the
ring-styles pages collapses into the same grey ring at 46px, and there was
nothing for a plain band, an eternity band or care. These six are drawn at icon
weight and separated by SILHOUETTE rather than detail. `half_set` and
`eternity` are the hard pair, both being "a band with stones", and they are
distinguished by texture: three chunky faceted stones across the top against
ten small even beads all the way round. **Do not tidy either into the other.**

Changed in the port: the heading is an `h2` because `heading-template` owns
the page's only `h1`; the `fye-edu-section` schema class is gone; the ivory
ground and vertical rhythm come from `band` so the section carries no padding
of its own; tokens throughout; and the 400px breakpoint moved to the theme's
560.

The affiliate page's guides pointer is back on `/pages/jewellery-guides`,
having been parked on `/pages/downloadable-guides` while this page did not
exist.

## A useful find in Content › Files

There is a **second, much larger set of diamond-shape SVGs** at 36px with
hashed filenames, alongside the `icon101` to `icon110` set the mega menu uses:

    ROUND · OVAL · CUSHION · PEAR · EMERALD · RADIANT · PRINCESS · MARQUISE
    ASSCHER · HEART · BAGUETTE · TAPERED_BAGUETTE · BRIOLETTE · BULLET
    TAPERED_BULLET · CALF · EUROPEAN_CUT · FLANDERS · HALF_MOON · HEXAGONAL
    KITE · LOZENGE · OCTAGONAL · OLD_MINER · PENTAGONAL · ROSE · SHIELD
    SQUARE · SQUARE_EMERALD · SQUARE_RADIANT · STAR · TRAPEZOID · OTHER

Two consequences for `page.diamond-shapes.json`:

1. **Baguette can have an icon** (`BAGUETTE-5APAWROW.svg`). It is currently the
   one tile without one.
2. **The twelfth cut is available** whenever Ed wants it. The page's title tag
   promises twelve and the page shows eleven; there are now more than twenty
   further shapes with artwork, though most have no collection to link to.

Also there is a set of ring-style SVGs at 68px: solitaire, pave, halo,
hidden-halo, side-stone, three-stone, vintage, cathedral, bezel, nature. Worth
knowing about before anyone draws anything new.


---

# v3 IS LIVE, 03/09/2026

Published by Ed on 03/09/2026 and **verified in place**, not reverted. The
02/09 attempt was up for a few minutes and rolled back to
`fye-v2-responsive`; this one stayed.

## What was checked on the live theme

| Check | Result |
|---|---|
| Checkout: add to bag, cart, begin checkout | pass, correct item, price and shipping |
| Header search on a real term | pass, lands on `/search`, tiles plus guides list |
| Enquiry popup from a product page | pass, arrives and is identifiable |
| Guide download form | pass, arrives and is identifiable |
| Homepage `fyeSmoke.all()` at 1440 / 889 / 500 | 9 of 9 clean at all three |

The three form and money checks were done first and deliberately, because a
smoke test cannot see any of them, and because the search app's proxy and the
app embeds both behave differently on a published theme than on a preview. Both
turned out fine, but they were the unknowns.

## One fault found and fixed while live

`fyeSmoke` on the live homepage flagged three undersized touch targets:
`.hero__link` at 294x24, `.news__more` at 118x31, and `.news__title` at about
22px. Fixed with flex and `min-height: 44px` in `fye-hero` and
`latest-news-EM`, then re-verified clean at all three widths.

**`.news__title` is worth remembering.** It failed at 889 and 500 but mostly
passed at 1440, because a headline long enough to wrap to two lines already
clears 44px. The fault therefore depended on which headlines happened to fit on
one line at a given width, which is precisely the kind of bug a spot check at a
single width never sees.

## The pattern behind four of this week's faults

`coll__clear` and `coll__promolink`, the cloud-search filter rows,
`xref__cta` on 33 chapter pages, and now three on the homepage. **Every one
was an undersized touch target, and every one was invisible until something was
measured at a touch width.** `targets` only runs at coarse pointer or 900px and
under, so a run at 1440 reports nothing.

**Run `fyeSmoke.all()` at 889 before 1440, always.** The homepage is the most
visited page on the site and had never been measured at a touch width until the
day it went live.

## Outstanding, none of it blocking

1. **Admin, Ed:** unpublish `find-your-ring`, `about-us-v2`,
   `find-the-perfect-engagement-ring` and the two `zz-form-testing` pages;
   redirect `diamonds` and `lab-diamonds` to their collections; repoint the
   mega-jewellery `find-the-perfect-engagement-ring` item at
   `/pages/engagement-ring-guide`.
2. **The Z row of the ring size chart.** Its diameter matches Y's and its
   circumference is 0.6mm off the published figure. Six derived rows count up
   from it.
3. **YMQ Product Options** can now be uninstalled as far as the theme is
   concerned: v3 references none of it, and the embed is already disabled. It
   still emits two stylesheet preloads per page. Check its option sets are
   genuinely unused first.
4. **The twelfth cut and baguette's icon** on `page.diamond-shapes.json`.
   Content › Files has a second shape set with over twenty more cuts including
   `BAGUETTE`.
5. **The pager markup exists three times** (`main-collection`, `main-blog`,
   `main-search`) and should become one `.pager` component in `fye-core.css`.
6. **`mm-shapes.liquid`** should move from its hardcoded
   `foryoureternity.com/cdn/...` URLs to `file_url`.
7. **The overnight audit's deferred list:** S3 template-clone refactor, S6
   minification, M4 menu-on-open, and the A1 contrast items Ed declined as
   visible changes.
8. **A visual check nobody has done:** whether the `half_set` and `eternity`
   icons on `/pages/jewellery-guides` read as distinct at 46px. Live's own
   comment says that pair was the hard one.


---

## Admin jobs, all done 03/09/2026

Done through the Admin API rather than by hand, except the menu item.

## Unpublished, reversible, content intact

`diamonds` · `lab-diamonds` · `find-your-ring` · `zz-form-testing` ·
`zz-form-testing-internal-do-not-link` · `about-us-v2`

`find-the-perfect-engagement-ring` was already unpublished.

**Unpublish rather than delete**, deliberately: every one of these still has its
content, so any of them can come back with one toggle. Two of them
(`diamonds`, `lab-diamonds`) had empty bodies anyway, and `about-us-v2` is a
duplicate of a page that is live.

## Redirects created

    /pages/diamonds      ->  /collections/natural-diamonds
    /pages/lab-diamonds  ->  /collections/lab-diamonds

**ORDER MATTERED, and this is the bit worth remembering.** A Shopify URL
redirect only fires when nothing else answers that URL. Both pages existed and
were published, so a redirect created first would have sat there doing nothing
while the page kept winning. **Unpublish first, then redirect.** Four
operations, not two.

## Ed did the menu item by hand

The mega-jewellery `Find the Perfect Engagement Ring` item now points at
`/pages/engagement-ring-guide`.

**Left to Ed on purpose**, not from caution about the API: `menuUpdate`
replaces the entire item tree in a single call, so an error takes out a whole
mega menu rather than one link. Thirty seconds in Navigation carries no such
risk. If a menu ever does need doing programmatically, read the full tree
first, change one item, write the whole thing back, and verify before trusting
it.

## Theme-side consequence

Nothing. No template referenced any of these pages, which is why they were
identified as retirable in the first place. The two redirect targets are
collections that v3 already links to from the diamonds and gemstones hub.


---

# Session — 03/09/2026 (2): the ring finder

`/pages/find-your-ring` is built and UNPUBLISHED. Nothing a customer can reach
has changed. Publish it unlisted (noindex entry added by w981) to review.

## What was built

| File | Notes |
|---|---|
| `sections/fye-ring-finder.liquid` | 17KB. Journey blocks + step blocks; options as a `Label | value | icon` textarea |
| `templates/page.find-your-ring.json` | Banner, finder (3 journeys, 15 steps), `fye-consultation` close |
| `assets/fye-ui.js` | +1 IIFE, ~140 lines, returns early off the page |
| `tools/w981-ring-finder.mjs` | This patch. Delete once run |

## Decisions (Ed, 03/09/2026)

- **End of journey:** filtered collection page AND a "Talk to us about these"
  button. The answers travel on the enquiry link as `fye_finder=` and on the
  button as `data-fye-finder-answers`. **The enquiry popup does not read either
  yet** — one line in the popup JS to prefill its message from the trigger's
  attribute, when Ed wants it.
- **Journey A has a Stone type step**, six steps in all. Only deliberate route
  to the coloured-stone engagement rings.
- **Metal on journeys A and C is carried**, not filtered: `fye_metal=` on the
  results URL. Nothing reads it yet.
- **Option lists are editable** in the theme editor, as textarea lines, not one
  block per option: ~70 options would exceed Shopify's 50-block cap.

## What the store data changed

- **Plain-ring metal is TWO metafields**, `filters.carat` (`18ct`) and
  `filters.metal_colour` (`Rose Gold`), and **Platinum has no carat**. So a
  metal option is `carat=18ct&metal_colour=Rose Gold`, and the finder's value
  syntax grew a multi-param form to hold it.
- **Engagement shapes are stored as `Marquise`, not `Marquise Cut`.** The
  shape steps use `filters.stone_shape` values from the live metafields.
  `Crisscut Emerald` and `Emerald Cut or Radiant Cut` (xCloud values) were
  dropped: no metafield value matches them.
- **Coverage offers Full and Half only.** "Gem set" and "Mixed" were xCloud
  constructs; native filters cannot say "not diamond", and "Mixed" is just
  I'm flexible.
- **Ring weight values carry the word Weight** (`Heavy Weight`). Labels drop
  it, values keep it.

## UNVERIFIED — check before this goes in a menu

1. **Are the `filters.*` metafields switched on as filters in Search &
   Discovery, per collection?** Clicking the live rail routes to
   `/a/search?filter_metal_filter=...`, which is xCloud and proves nothing
   about native filtering. If a journey returns the whole collection, this is
   why. Native syntax used: `filter.p.m.filters.<key>=<value>`, ranges as
   `<key>.gte=` / `<key>.lte=`.
2. **Centre stone size filters on `filters.centre_weight`** (number_decimal).
   The two sampled engagement rings had no value for it, so the range step may
   over-narrow until the field is populated.
3. **`D Shape`** is offered as a profile. 330 rings; confirm they carry it.
4. The worked examples still to prove on /collections/:
   Concave + 4mm + 18ct Rose Gold → 3; Engagement Match + 3mm + Heavy + 9ct
   Rose Gold → 1.

## Definition of done, status

- [ ] `node tools/w977-validate-templates.mjs page.find-your-ring` → 0 faults
- [ ] `fyeSmoke.all()` at 889, 500, 1440
- [ ] every journey walked, I'm flexible at every step returns the collection
- [ ] one worked example proven
- [x] no literals outside fye-core.css; no vertical padding; three breakpoints
- [x] `shopify_attributes` on every block; `data-screen-label` on the root
- [x] renders with empty settings and with no blocks (journeys panel shows a
      prompt; no steps means a journey link goes straight to its collection)


---

## Revision — 03/09/2026 (3): results in place

Ed, on seeing the page: two headings a screen apart read as a mistake, and the
journey should not end on a button.

- **Duplicate heading removed.** The banner names the page; the finder now
  opens on its first question. The heading settings remain in the section for
  other pages, with a paragraph in the schema saying when to leave them empty.
- **Results are inline.** Answering the last question fetches
  `/collections/<handle>?<filters>&view=fye-finder` and renders the first 12
  matching rings in place, with the filtered count and a link to the full
  collection. New file: `templates/collection.fye-finder.liquid`, a
  `layout none` fragment — no header, footer or app embeds, a couple of KB
  per request. It is not a customer-facing page; do not link to it.
- **Custom-options enquiry** sits beside the results: "Can't see what you're
  looking for?" with name, email, telephone and message on Shopify's
  `contact` form. The finder's answers ride along in a hidden
  `contact[Ring finder]` field, so the enquiry email says which journey and
  which choices. Replaces the earlier `fye_finder=` link and the popup
  handoff, which nothing read.
- **Journey A: stone type now precedes cut** — the cut list is a diamond
  vocabulary, so a shopper who wants a sapphire should say so first.
- The summary is now one quiet line of choices under the heading rather than a
  definition list: at that point it is context, not the subject.

Filters verified live (Ed): all 12 `filters.*` metafields on in Search &
Discovery, and Concave + 4mm + 18ct Rose Gold returns exactly 3.

**Still open:** the collection page's visible sidebar is xCloud's, so it will
not show the finder's filters as ticked, and clicking a sidebar box routes to
`/a/search` and drops them. Native facets are now all enabled, so the theme
could render `collection.filters` itself and the app could go. Separate
session.

**Unverified:** `filters.centre_weight` may not be populated — walk
engagement with a centre stone size and check the count is not 0.


---

## Revision — 04/09/2026: metal swatches, and Palladium

Ed: "can you use the same swatches used in the product pages? the 5th metal is
paladium."

**No new image files.** The theme already draws metal swatches as inline SVG in
`snippets/fye-filter-icons.liquid`, over the measured per-carat colours in
fye-core.css. That construction is now a snippet, `fye-metal-swatch.liquid`,
and the finder renders it directly — so the four `metal-*.svg` uploads asked
for yesterday are **not needed and should not be uploaded**. One definition of
what a metal looks like, shared by the rail and the finder.

- An option's icon field accepts `swatch: Rose Gold` as well as a filename.
  Carat prefix optional: unprefixed colours use the 14ct family colour, which
  is right now that colour and carat are separate questions.
- The gradients live in the snippet's `defs: true` mode, emitted once per
  page. `fye-filter-icons` still emits its own copy for the collection rail —
  same two ids, and no page renders both. If a page ever needs both, one of
  them has to give up its ids.
- **Palladium** added: `--metal-palladium: #BFC3C1`, a shade cooler and darker
  than platinum. Also added to the filter rail (`Pd`) so the two sides agree.
- All three metal steps are now five columns of swatch tiles.

**Unverified, and it matters:** whether any product carries
`filters.metal_colour = "Palladium"`. On plain wedding rings that answer
filters, so if nothing carries the value the step returns no rings — the
finder will say "No exact match in stock" and offer the enquiry form, which is
the correct failure but a poor first impression. Check the value exists in
Search & Discovery before this page goes in a menu; on engagement and diamond
the answer is only carried, so it is harmless there.


---

## Revision — 04/09/2026 (2): two options, equal prominence

Ed: the results screen should give equal prominence to two options —
"here are the rings that match" and "or, let's design your perfect ring for
you".

- **Two columns, 1fr each**, divided by whitespace and a hairline above each
  heading. Neither column is a card: the enquiry's white box and border are
  gone, because a bordered panel on one side makes the other read as the
  default. Both headings use the same `.rfd__q` treatment at the same size.
- **The section wrap grows to `--maxw`** (1320px) and the question panels are
  pinned to `--maxw-narrow` and centred, so only the results screen is wide.
  One wrapper, two measures, no negative margins.
- The rings grid is two-up inside its column; the enquiry fields stack to one.
- **Your answers move above both columns** — they describe the whole screen,
  not either option — and "Start again" moves below both.
- Stacks at 900px, where every other two-column layout in this theme
  collapses. Stacked, the rings grid goes three-up.

Copy now reads as a pair of choices rather than a result and a fallback:
"Here are the rings that match" / "Or, let's design your perfect ring for you",
with "Tell us what you had in mind and we'll come back to you with custom
options."


---

## Fix — 04/09/2026: the enquiry reply

Ed asked whether the form sends the answers already given. It does: fye-ui.js
fills a hidden `contact[Ring finder]` field before the results screen shows,
with the journey, the fork route and every question/answer pair — including any
"I'm flexible". It arrives as one line in the contact notification email.

Checking it exposed a defect. Shopify posts the contact form back to the page
and reloads with `?contact_posted=true`; the finder therefore restarted at the
first question, and `form.posted_successfully?` rendered its thank-you inside
the results panel, which is hidden until a journey is walked. **The customer
saw the form disappear and nothing else.**

Now, when the form has posted, the section renders a confirmation panel in
place of the whole stage — heading, message, and a link back to the finder —
and fye-ui.js returns early. Restarting the questions underneath a thank-you
would only invite the same enquiry twice.

Finding out that a post happened needs an empty `{% form 'contact' %}` block
above the stage, because `posted_successfully?` is only readable inside a form
and the real form is inside the hidden panel. It emits no markup.

New settings: **Thank you heading** and **Restart link**.

**Still worth knowing:** if the customer's browser blocks JavaScript the
hidden field is never filled, so the enquiry arrives without the answers. The
form still posts and the message still reaches you — only the summary line is
missing. Not worth solving unless it shows up in real enquiries.


---

## Rename — 04/09/2026: Ring Matchmaker

The page is **Ring Matchmaker** at **/pages/ring-matchmaker**. Chosen because
one name has to serve the nav and five in-page entry sections: in a menu of
category nouns a helper name differentiates, and on the engagement rings page
"Which Ring?" would ask something the visitor has already answered. Ring
Concierge was ruled out as an existing New York bridal jewellery company.

The heading everywhere is the promise, not the name: **Find or Design Your
Perfect Ring**, which names both columns of the results screen. The name sits
in the eyebrow.

### Done on Shopify (before this patch)

- Page title → Ring Matchmaker, handle → `ring-matchmaker`.
- `/pages/find-your-ring` → `/pages/ring-matchmaker` URL redirect created,
  so anything already linking to the old path still lands.
- Template suffix left as `find-your-ring` on purpose, so the live page kept
  working until the new template file shipped.

### Done in the theme (this patch)

- `templates/page.ring-matchmaker.json` — copy of the old template.
- `sections/fye-finder-entry.liquid` defaults to the new URL.
- Both handles noindexed, since the old one still resolves via the redirect.

### AFTER SHIPPING — two steps, in this order

1. **Switch the page's theme template** to `ring-matchmaker` (Online Store ›
   Pages › Ring Matchmaker › Theme template). Until this is done the page
   renders from the OLD template file, so edits to the new one have no effect.
2. **Delete `templates/page.find-your-ring.json`** and drop
   `'find-your-ring'` from the noindex list in `layout/theme.liquid`. Not
   before step 1: deleting it while the page points at it drops the page onto
   the default template.

The two template files are identical the moment this patch runs. If the page
is edited in the theme editor before step 1, the edits land in the OLD file —
so do step 1 first, or those edits are lost when it is deleted.


---

## Addition — 04/09/2026: the empty result

Ed: if a shopper reaches the end and no rings match, say something different —
"We'll design your ring for you".

The two-column screen assumes two live options. With no rings, the left column
is an empty grid under a heading promising matches, and the right column opens
with "Or," referring to nothing. So the zero case **collapses to one column**:
the bespoke offer at the reading measure, with its own heading and opening
line, and the form the shopper now needs as the only thing on screen.

- New settings, both editable: **When nothing matches → Heading / Introduction**.
  Default heading is Ed's line. The default intro reframes rather than
  apologises: "yours is a ring we make rather than one we hold".
- Both strings sit in the HTML and fye-ui.js toggles `hidden`, so the copy
  stays editable in the theme editor rather than living in JavaScript.
- Focus follows: the heading that had focus is hidden in this state, so focus
  moves to the one on screen.
- A **failed fetch is not an empty result** — the two columns stay and the
  error message stands in for the count. Saying "we'll design it for you"
  because the network hiccuped would be a lie.
- The state resets before each fetch, so a second journey cannot inherit the
  last one's empty state while it loads.

This is also the safety net for the two unverified filters: if
`filters.centre_weight` is unpopulated, or `metal_colour = "Palladium"`
matches nothing, the shopper now lands somewhere that reads as intentional.
Worth testing on purpose: engagement › any style › 2.00ct and above.
