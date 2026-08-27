# FYE v3 — build state

Last updated: 27/08/2026

## Read first

1. **`conventions.md`** — how to write code in this theme. File anatomy, CSS,
   Liquid, schema, JS, accessibility, comments, definition of done. Read it
   before writing anything, every session.
2. This file — how to read/write the repo, what is built, what is next.

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
  `/GIT-repositaries/fye-shopify-theme/` — all 226 sections, ~140 templates,
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
| `assets/fye-core.css` | Tokens, bands, type roles, buttons, forms, grids, sidebar |
| `assets/fye-ui.js` | Named drawers, back-to-top, disclosure. Vanilla, delegated |
| `snippets/icon.liquid` | ~30 inline SVGs, replaces 3.3MB of Line Awesome |
| `layout/theme.liquid` | Self-hosted Tenor Sans + Outfit variable |
| `sections/announcement-bar.liquid` | **Measured** |
| `sections/header-bottom.liquid` | **Measured, pixel-matched to live** |
| `sections/footer.liquid` | **Measured, pixel-matched to live** |
| `sections/header-group.json` `footer-group.json` | Nav as section blocks |
| `sections/heading-template.liquid` | 47 templates use it |
| `sections/main-page.liquid` | 17 templates use it |
| `templates/page.json` | Proves the content-page pattern |

Header and footer are **signed off by Ed** as matching the live site.

## Built, not yet reviewed on a preview

| File | Notes |
|---|---|
| `snippets/sidebar-widgets.liquid` | The one sidebar implementation — every widget both sidebars show |
| `sections/sidebar-page.liquid` | Thin shell + page block set |
| `sections/sidebar-collection.liquid` | Thin shell + collection block set |

**Not yet seen rendering.** Needs a preview pass before it counts as done:
a guide page with the sidebar enabled, a collection page, and both at 900px
and 560px. Nothing about it is measured against the live site — the live
sidebars were switched off, so there was nothing to match; this is the design
system applied fresh.

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

1. **Re-run the section usage map against all ~140 templates.** The current map
   was built from 70 templates and found 89 live sections, 94 referenced by
   nothing. The missing ones are the guide library (`ring-care-*`,
   sapphire/ruby/emerald/opal/morganite/aquamarine/tanzanite) and the
   `sections/*.json` groups. **Nothing gets deleted until this is re-run.**
   The old templates contain JSON comments — strip `/* */` and `//` before
   parsing, or every parse fails.
   **This is now the next job**, and it got more interesting: see the sidebar
   note below. The map should record `"disabled": true` per section reference,
   not just presence — a dormant reference is not a live one.
2. **`main-collection`, `main-product`.** `main-product` is 162KB in the old
   theme and shares a buy box with `main-qv`; that becomes one product-form
   snippet rendered two ways. `main-collection` also owns two things the old
   sidebar reached across into: the facet form (it renders into the sidebar's
   `[data-fye-facets]` slot) and the 5/6-column layout buttons the old sidebar
   hid from its own `<style>`.
3. **The 27 `custom-liquid` blocks.** Biggest single job in the project and the
   real source of inconsistency — 27 blocks of hand-pasted HTML carrying their
   own inline padding, invisible to any design system. Each needs reading and
   folding into a real section.
4. **Footer link columns and the five mega panels have no menus assigned.**
   Markup and hover behaviour are in place; they need Shopify menu handles.
5. **Guide popups:** consolidate 11 near-identical sections into one with a
   `form_id` setting.
6. **Sidebar follow-ups.** Menus: the `category` / `blog_cate` blocks need a
   link list assigned (same missing-menu problem as the footer). And decide
   whether the guide library actually wants a sidebar at all — see below.

## The sidebar, and what reading the templates turned up

Job 1 is built: **one implementation, two section files**, because both type
names are referenced and type names are frozen. `snippets/sidebar-widgets.liquid`
holds every widget; the two sections are ~40 lines of shell each.

Three things worth knowing:

- **Every sidebar reference sampled is `"disabled": true`** — `page.diamonds`,
  `page.gemstones`, `collection.gemstones`. The section had to be rebuilt
  regardless (a template referencing a missing type breaks in the editor), but
  the "33 uses" figure is references, not live sidebars. The usage-map re-run
  should count enabled ones. If the real number is zero or near it, the honest
  question is whether the guide library wants this sidebar or a different
  navigation pattern — worth asking Ed before styling it further.
- **Two sections cannot be one grid, so their parent is.** The sidebar and the
  content are separate sections, so `main` becomes the grid: sidebar in column
  one, everything after it in column two, anything before it full width. Keyed
  to the schema class `.fye-sec--sidebar`. **The sidebar must sit above the
  content section in the template order** — `page.diamonds` puts it last, which
  renders it as a narrow column below the content. That is the template's
  ordering, and those templates have it disabled anyway.
- **One set of markup, two layouts.** Column above 900px, drawer at 900px and
  below, by CSS only. The old theme rendered the widgets twice and cut the
  markup apart in JS on a `[t4splitlz]` marker string.

Dropped from the port, with reasons in the snippet's opening comment:
`instagram` (60-day token + a third-party fetch at render), `cus_socials` (the
footer owns socials), the image countdown, and every per-block colour / radius /
spacing / items-per-row picker. `html` survives, narrowly, because the live
collection sidebar uses it to place the xCloud search mount point.

Also changed while here, both small and both documented in the files:

- **`fye-ui.js` drawers are now named.** `data-fye-drawer="x"` pairs with
  `data-fye-drawer-open="x"`, matched exactly. The old code did
  `querySelector('[data-fye-drawer]')` and would have fought the header for
  control the moment a second drawer existed. The valueless pair still works,
  so the header is untouched.
- **`.sbar` lives in `fye-core.css`**, not in a `{% stylesheet %}` block,
  because a snippet cannot carry one and two sections share it. Added to the
  shared-vocabulary list in `conventions.md` §2 with the reasoning.

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
- Sidebars: one implementation behind two frozen type names; column on desktop
  and drawer on mobile, with no setting to choose between them (`enable_drawer`
  existed and every template set it false).
- Dropping a schema setting is safe — Shopify ignores settings left in a JSON
  template that the schema no longer declares. Renaming one is not.
- Old-theme facts worth keeping: `settings.header_design` is `"bottom"`, so only
  `header-bottom` ever rendered and the other five headers are dead;
  `cart_type` is `"disable"`, so `mini_cart` never rendered; the live nav is
  built from section BLOCKS, not a linklist — a linklist version falls back to
  Shopify's default "Home / Catalog".
- 18 themes exist in the store, 15 of them backups. Worth a clear-out once v3
  is live, but not without Ed saying so.
