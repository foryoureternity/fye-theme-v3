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

**Do NOT use the GitHub tools. Do not ask Ed to connect GitHub. GitHub is not
part of the loop.**

The repo lives inside Ed's Dropbox, and Dropbox is connected. So:

- **Write** with `dropbox__create_file`, path
  `/GIT-repositaries/fye-theme-v3/<folder>/<file>`.
  It refuses an existing path with ALREADY_EXISTS — call `dropbox__delete` on
  the path first, then create again.
- **Read** with `dropbox__fetch`, id = that same path.
- **List** with `dropbox__list_folder`.
- **Read the OLD theme** the same way, at
  `/GIT-repositaries/fye-shopify-theme/` — all 228 sections, 134 templates,
  its `CLAUDE.md` and `docs/` are all there. Read it for structure and setting
  IDs; never copy its code.

Files written this way appear on Ed's machine immediately. **Ed then commits and
pushes**, and Shopify pulls from GitHub automatically:

```
cd ~/Dropbox/GIT-repositaries/fye-theme-v3
git add -A && git commit -m "..." && git push
```

Claude never runs git and never needs GitHub auth. If a GitHub tool happens to
be available it is unnecessary here — Dropbox has everything.

**Also do not write to the theme via the Shopify API.** The theme is
GitHub-connected and API writes conflict with the sync. Shopify's MCP is for
*reading* — store data, theme file contents, settings — and for inspecting the
live theme (id `197353406848`).

**Anything that needs to read many files at once is a script, not a fetch
loop.** 134 templates cannot be fetched one at a time inside a session, and the
four biggest page templates are 180KB between them. Write a Node script into
`docs/tools/`, have Ed run it, commit the output, then read the output. Two
tools exist:

| tool | what it gives you |
|---|---|
| `usage-map.mjs` | `section-usage.md` — every section, live / dormant / unreferenced |
| `template-plan.mjs` | `template-plans/<name>.md` — one template reduced to section order, block types, settings that carry a decision, and flagged `custom_css` |

When writing another: plain ESM Node, no dependencies, and **a C-style comment
terminator inside a banner comment ends the comment early** — that cost a round
trip on 27/08/2026.

**One trap when reading:** `dropbox__fetch` runs text extraction, and on a file
that starts with `<!doctype html>` it strips the tags — `layout/theme.liquid`
came back as prose with every `<link>`, `<head>` and `<body>` missing. Section
and snippet files are fine. If a fetched file looks suspiciously tag-free,
that is the extractor, not the file. Ask Ed to paste it if you must be sure.

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
   duplication, and it broke the old theme nine times. A section's own schema
   `class` IS stable and is fair game.
6. Squared corners throughout (`--radius: 0`).
7. UK English, no emoji, thin outline icons only via `snippets/icon.liquid`.

## Built and signed off

| File | Notes |
|---|---|
| `assets/fye-core.css` | Tokens, bands, type roles, buttons, forms, grids |
| `assets/fye-ui.js` | Named drawers, back-to-top, disclosure. Vanilla, delegated |
| `snippets/icon.liquid` | ~30 inline SVGs, replaces 3.3MB of Line Awesome |
| `layout/theme.liquid` | Self-hosted Tenor Sans + Outfit variable |
| `sections/announcement-bar.liquid` | **Measured** |
| `sections/header-bottom.liquid` | **Measured, pixel-matched to live** |
| `sections/footer.liquid` | **Measured, pixel-matched to live** |
| `sections/header-group.json` `footer-group.json` | Nav as section blocks |
| `sections/heading-template.liquid` | 32 live templates, 10 more disabled |
| `sections/main-page.liquid` | 10 live templates, 6 more disabled |
| `sections/fye-hero.liquid` | 68 uses — the most-used section, already done |
| `templates/page.json` `templates/index.json` | The content-page pattern |
| `docs/tools/usage-map.mjs` `template-plan.mjs` | Read-the-old-theme tooling |

Header and footer are **signed off by Ed** as matching the live site.

## The usage map — run 27/08/2026, all 134 templates

`docs/section-usage.md`. Re-run whenever templates change; it is cheap.

| | count |
|---|---|
| live (≥1 enabled reference) | 107 |
| dormant (referenced, every reference disabled) | 10 |
| rendered only by another file | 1 |
| unreferenced | 109 |

**The old 89-live / 94-dead figures were wrong** — built from 70 templates, and
they did not distinguish enabled from disabled.

### Two caveats. Do not delete anything on the strength of this map alone.

- **"Unreferenced" over-counts.** The old theme renders some sections through a
  *variable* — `{% section settings.header_design %}` — and the script only
  matches quoted literals. That is why `header-bottom`, `announcement-bar`,
  `mega-menu`, `mini_cart` and `facets` appear unreferenced when they are
  reachable. Treat that list as an investigation queue.
- **`fye-guide-popups-group` is not missing.** The script's missing-file check
  compared against `.liquid` names only, and it is a `.json` section group.
  False positive; fix the check if the script is touched again.

### The guide library is the bulk of the site

The FYE-original sections carry it, and only `fye-hero` is built:

| section | uses | | section | uses |
|---|---|---|---|---|
| `fye-terms` | 104 | | `fye-faq` | 49 |
| `fye-chapter-nav` | 102 | | `fye-checklist` | 44 |
| `fye-rich-text` | 95 | | `fye-xref` | 33 |
| `fye-callout` | 78 | | `fye-cards` | 23 |
| `fye-hero` | 68 **done** | | `fye-chips` | 17 |
| `fye-guide-download` | 62 | | `fye-media-text` | 13 |
| `fye-related` | 58 | | `fye-steps` | 12 |
| `fye-table` | 56 | | | |

~15 files, ~780 references. By comparison `main-collection` is live on 6
templates and `main-product` on 5. **`custom-liquid`: 18 enabled references,
11 disabled** — still the biggest unpicking job.

## The sidebar: built, found dormant, deleted the same day

Worth keeping as a record, because the reasoning applies to the next dormant
section someone is tempted to port.

The old theme has ten sidebar sections and **every one of them has zero enabled
references** — `sidebar-collection` 15 refs / 0 enabled, `sidebar-page` 12 / 0,
`sidebar-product` 5 / 0, and one each for article / blog / portfolio /
article-portfolio. No sidebar renders anywhere on the live site. The "33 uses"
in the old notes was counting references.

It was built on 27/08/2026 (one snippet + two thin sections + a `.sbar` block
in core), then **deleted the same day at Ed's instruction**: it is irrelevant to
the site as it stands, and v3 stays lean. Removed:
`sections/sidebar-page.liquid`, `sections/sidebar-collection.liquid`,
`snippets/sidebar-widgets.liquid`, the `.sbar` block and `--sbar-w` token in
`fye-core.css`, and the `.sbar` entry in `conventions.md` §2.

**If a sidebar is ever wanted again:** it is in git history at the commit
"Sidebar: one implementation behind both frozen type names; named drawers". But
the better answer for guide pages is `fye-chapter-nav` (102 uses), which is the
navigation those pages actually use.

**The one consequence to remember.** A JSON template naming a section type that
does not exist **breaks that template in the theme editor**. 27 old templates
still name `sidebar-page` / `sidebar-collection`. So **when porting any template
into v3, strip its `sidebar-*` entries** — from `sections` and from `order`.
`template-plan.mjs` flags every type a template needs that v3 does not have, so
this cannot be missed silently. Same applies to the other dormant sections:
`blog_slider`, `featured-collection-new`, `personal-guidance-CTA`.

Two things from that work stayed, because they are independently right:

- **`fye-ui.js` drawers are named.** `data-fye-drawer="x"` pairs with
  `data-fye-drawer-open="x"`, matched exactly. The old code did
  `querySelector('[data-fye-drawer]')`, which would have broken the moment a
  second drawer existed. The valueless pair still works, so the header's mobile
  nav is untouched.
- **Core only earns vocabulary that two or more sections share** —
  `conventions.md` §2. That rule came from getting it wrong: `.sbar` went into
  core for a component that turned out to render nowhere.

### Measured values — do not "tidy" these into tokens

Header and footer were matched pixel-for-pixel against a 2x screenshot of the
live site at a 1470px viewport. The numbers are in comments at the top of each
file. Two that get "corrected" by mistake:

- **Footer ground is `#879C87` with TEAL type.** Not ivory. Teal on this ground
  is 4.8:1 (AA); ivory would be 2.6:1. This is chrome with its own ground, NOT
  a `.band--sage` content band, so the ivory-on-sage rule in `fye-core.css`
  does not apply here.
- **The rule under the header sits ABOVE the nav**, 1px `#C8CDC7`, between the
  white row and the ivory nav band. There is no rule below the nav, and no
  rose-gold anywhere.

**Method, for the next person matching a section:** copy the screenshot into the
project, then sample it with `run_script` — `readImage`, draw to a canvas,
`getImageData` down a single column to find exact row boundaries and colours.
Do not eyeball a JPEG crop; a crop of the sage footer read as dark grey and sent
me off building the wrong thing until I sampled pixels.

## Outstanding

**Ed's priority, 27/08/2026: the home page, then the engagement rings, wedding
rings and eternity rings pages.** Not the collection pages. Visual target:
**design-system treatment with the current structure kept**, as
`heading-template` got — not a pixel match, not a redesign.

1. **`index` + `page.engagement-rings` + `page.wedding-rings` +
   `page.eternity-rings`.** Run `template-plan.mjs` (defaults to exactly these
   four) and build from the plans in `docs/template-plans/`. Between them they
   need, at a guess from the usage map: `fye-hero` (done), `fye-media-text`,
   `fye-rich-text`, `fye-callout`, `featured-collection`, `collections-list`,
   `accordion`, `about_us`, `about-columns-four`, `feature_columns2`,
   `fye-consultation`, `fye-trust-strip`, `fye-testimonials`,
   `fye-gallery-promo`, `fye-two-ways`, `guide-download-block`,
   `latest-news-EM`, `shipping`, `custom-collections`. The plans give the real
   list; do not trust that guess.
2. **The rest of the guide library** — the table above, in order of reach.
3. **`main-collection`, `main-product`.** `main-product` is 162KB in the old
   theme and shares a buy box with `main-qv`; that becomes one product-form
   snippet rendered two ways.
4. **The 29 `custom-liquid` references.** Hand-pasted HTML with its own inline
   padding, invisible to any design system. `template-plan.mjs` flags every
   `custom_css` block it finds, which is the same problem in a different place.
5. **Customer account templates.** Seven sections, one template each, none
   built. Cheap, and their absence is total.
6. **Guide popups:** 12 sections, all via `fye-guide-popups-group.json`, all on
   Shopify Forms defaults (`#202020`, links `#1878B9`). Consolidate to one
   section + a `form_id` setting, in FYE teal/ivory.
7. **Footer link columns and the five mega panels have no menus assigned.**
   Markup and hover behaviour are in place; they need Shopify menu handles.
8. **The 109-name unreferenced list.** Resolve the dynamic-reference caveat
   first, then Ed decides. **Nothing gets deleted without him saying so.**

## Decisions already taken (don't reopen without reason)

- Templates: keep all existing JSON, reuse section type names and setting IDs.
- Visual target: design-system styling, current layout and structure retained.
- Fonts: self-hosted, Outfit as a single variable woff2. Headings Tenor Sans,
  body Outfit. Section padding 80px.
- Wishlist stays (it works). Compare / back-in-stock / quick view not confirmed.
- Dropped scratch templates: `page.edu-test-page`, `page.zz-form-testing`,
  `page.faq-2`, `search.mn`.
- `heading-template` lost ALL its typography and spacing controls — that was
  the inconsistency. Its free colour picker became a four-way palette choice;
  pages that set a custom hex fall back to ivory.
- **Sidebars are out.** Ten dormant sections, nothing rendered, nothing ported.
  Strip `sidebar-*` entries from every template as it comes across.
- Dropping a schema setting is safe — Shopify ignores settings left in a JSON
  template that the schema no longer declares. Renaming one is not.
- A reference is not a use. Count enabled references, always.
- Old-theme facts worth keeping: `settings.header_design` is `"bottom"`, so only
  `header-bottom` ever rendered and the other five headers are dead;
  `cart_type` is `"disable"`, so `mini_cart` never rendered; the live nav is
  built from section BLOCKS, not a linklist — a linklist version falls back to
  Shopify's default "Home / Catalog".
- 18 themes exist in the store, 15 of them backups. Worth a clear-out once v3
  is live, but not without Ed saying so.
