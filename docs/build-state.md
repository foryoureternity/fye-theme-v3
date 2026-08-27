# FYE v3 — build state

Last updated: 27/08/2026

## Read first

1. **`conventions.md`** — how to write code in this theme. File anatomy, CSS,
   Liquid, schema, JS, accessibility, comments, definition of done. Read it
   before writing anything, every session.
2. **`architecture.md`** — why the structure is as it is.
3. This file — what is built, what is next.

## What this is

A ground-up rebuild of the For Your Eternity Shopify theme as a standalone
theme, replacing the T4S/Kalles-based live theme. Same URLs, same
functionality, same section type names and setting IDs — so the existing JSON
templates keep working — but written fresh, consistent and small.

## How to work on it

- **Repo:** `~/Dropbox/GIT-repositaries/fye-theme-v3` → `github.com/foryoureternity/fye-theme-v3`
- **Claude writes into the Dropbox folder directly.** Ed commits and pushes;
  Shopify pulls from GitHub automatically.
- **Shopify theme:** `fye-theme-v3/main`, id `197720146304`, UNPUBLISHED.
  Preview: `https://foryoureternity.com/?preview_theme_id=197720146304`
  Clear the sticky cookie afterwards with `?preview_theme_id=` (empty) — a
  stale one once made the live site look completely unstyled.
- **Do not** write to the theme via the Shopify API — it is GitHub-connected
  and direct writes conflict with the sync.
- **The old theme is readable** at `~/Dropbox/GIT-repositaries/fye-shopify-theme`.
  Read it for structure and setting IDs; do not copy its code.

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

### Measured values — do not "tidy" these into tokens

Header and footer were matched pixel-for-pixel against a 2x screenshot of the
live site at a 1470px viewport. The numbers are recorded in comments at the top
of each file. Two that get "corrected" by mistake:

- **Footer ground is `#879C87` with TEAL type.** Not ivory. Teal on this ground
  is 4.8:1 (AA); ivory would be 2.6:1. This is chrome with its own ground, NOT
  a `.band--sage` content band, so the ivory-on-sage rule in `fye-core.css`
  does not apply here.
- **The rule under the header sits ABOVE the nav**, 1px `#C8CDC7`, between the
  white row and the ivory nav band. There is no rule below the nav, and no
  rose-gold anywhere.

## Outstanding

1. **Re-run the section usage map against all ~140 templates.** The current map
   was built from 70 uploaded templates and found 89 live sections, 94
   referenced by nothing. The missing templates are the guide library
   (`ring-care-*`, sapphire/ruby/emerald/opal/morganite/aquamarine/tanzanite)
   and the `sections/*.json` groups. Read them from
   `~/Dropbox/GIT-repositaries/fye-shopify-theme/templates/`. **Nothing gets
   deleted until this is re-run.**
2. **`sidebar-page` + `sidebar-collection` as one section** — 33 uses between
   them, and it unblocks the guide library.
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
   `form_id` setting. See `popup-registry.md` in the design project.

## Decisions already taken (don't reopen without reason)

- Templates: keep all existing JSON, reuse section type names and setting IDs.
- Visual target: design-system styling, current layout and structure retained.
- Fonts: self-hosted, Outfit as a single variable woff2.
- Wishlist stays (it works). Compare / back-in-stock / quick view not confirmed.
- Dropped scratch templates: `page.edu-test-page`, `page.zz-form-testing`,
  `page.faq-2`, `search.mn`.
- `heading-template` lost ALL its typography and spacing controls — that was
  the inconsistency. Its free colour picker became a four-way palette choice;
  pages that set a custom hex fall back to ivory.
- 18 themes exist in the store, 15 of them backups. Worth a clear-out once v3
  is live, but not without Ed saying so.
