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
