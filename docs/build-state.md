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
   duplication, and it broke the old theme nine times.
6. Squared corners throughout (`--radius: 0`).
7. UK English, no emoji, thin outline icons only via `snippets/icon.liquid`.

## Built and signed off

| File | Notes |
|---|---|
| `assets/fye-core.css` | Tokens, bands, type roles, buttons, forms, grids |
| `assets/fye-ui.js` | Drawer, back-to-top, disclosure. Vanilla, delegated |
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

1. **`sidebar-page` + `sidebar-collection` as one section** — 33 uses between
   them, and it unblocks the guide library. **This is the next job.**
2. **Re-run the section usage map against all ~140 templates.** The current map
   was built from 70 templates and found 89 live sections, 94 referenced by
   nothing. The missing ones are the guide library (`ring-care-*`,
   sapphire/ruby/emerald/opal/morganite/aquamarine/tanzanite) and the
   `sections/*.json` groups. **Nothing gets deleted until this is re-run.**
   The old templates contain JSON comments — strip `/* */` and `//` before
   parsing, or every parse fails.
3. **`main-collection`, `main-product`.** `main-product` is 162KB in the old
   theme and shares a buy box with `main-qv`; that becomes one product-form
   snippet rendered two ways.
4. **The 27 `custom-liquid` blocks.** Biggest single job in the project and the
   real source of inconsistency — 27 blocks of hand-pasted HTML carrying their
   own inline padding, invisible to any design system. Each needs reading and
   folding into a real section.
5. **Footer link columns and the five mega panels have no menus assigned.**
   Markup and hover behaviour are in place; they need Shopify menu handles.
6. **Guide popups:** consolidate 11 near-identical sections into one with a
   `form_id` setting.

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
- Old-theme facts worth keeping: `settings.header_design` is `"bottom"`, so only
  `header-bottom` ever rendered and the other five headers are dead;
  `cart_type` is `"disable"`, so `mini_cart` never rendered; the live nav is
  built from section BLOCKS, not a linklist — a linklist version falls back to
  Shopify's default "Home / Catalog".
- 18 themes exist in the store, 15 of them backups. Worth a clear-out once v3
  is live, but not without Ed saying so.
