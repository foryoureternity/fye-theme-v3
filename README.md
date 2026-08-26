# FYE v3

Standalone Shopify theme for For Your Eternity. Rebuilt from scratch, August 2026.
No T4S/Kalles inheritance.

See `docs/architecture.md` for the design system, the seven rules, and the
contrast measurements. **Read it before touching CSS.**

Repo: `foryoureternity/fye-theme-v3`, branch `main`.

---

## Fonts — one-time cleanup

The design system shipped `outfit-300/400/500/600.woff2` as **four byte-identical
copies of the same file** (verified 26/08/2026, hash `491118c9`). Declaring them
as four fixed weights gave every weight the same rendering, flattening body copy
at 300 against labels at 500.

`layout/theme.liquid` now declares Outfit once as a variable font spanning
100–900. Only two font files belong in `assets/`:

```bash
cd ~/Dropbox/GIT-repositaries/fye-theme-v3/assets
mv outfit-300.woff2 outfit-variable.woff2
rm outfit-400.woff2 outfit-500.woff2 outfit-600.woff2
```

If weights still render identically after that, the file is a static single
weight rather than variable — download proper woff2 files from
[fonts.google.com/specimen/Outfit](https://fonts.google.com/specimen/Outfit) and
declare 300/400/500/600 separately in `theme.liquid`.

---

## Creating the Shopify theme

Shopify only lets a theme be connected to GitHub **at the moment the theme is
created**. A theme uploaded as a zip can never be linked to a repo afterwards —
which is why this repo exists before the theme does.

Shopify admin → **Online Store → Themes → Add theme → Connect from GitHub**
→ `foryoureternity/fye-theme-v3`, branch `main`.

Shopify creates the theme **unpublished** and keeps it synced in both
directions from then on. Do not publish until sign-off.

---

## Working on it after that

The GitHub connection is two-way: pushes to `main` deploy to the theme, and
edits made in the Shopify theme editor commit back to `main`. Two consequences:

- **Pull before you push.** Customiser changes (section settings, template JSON)
  arrive as commits from Shopify.
- **Never hand-edit `config/settings_data.json`** while the connection is live.
  It is Shopify's file now.

Dropbox note: this working tree lives inside Dropbox, so let sync finish (green
tick) before any git operation. A half-synced `.git` is how repos get corrupted.

## Structure

```
assets/fye-core.css       the only file defining colour, spacing, type, breakpoints
layout/theme.liquid       lean; no jQuery, no bootstrap, no RTL, no currency kit
snippets/icon.liquid      ~26 inline SVGs, replaces 3.3MB of icon webfont
snippets/fye-page-type    resolves page type incl. /a/search proxy pages
sections/fye-hero.liquid  the pattern every content section follows — read it first
docs/architecture.md      decisions, rules, contrast table, carried-forward fixes
```

## Status

**Built:** core CSS, layout, page-type helper, icon set, announcement bar, header
(with a real mega menu — the old one was customiser-only), footer, hero,
homepage template.

**Not built yet:** `main-page`, `main-product`, `main-collection`, search, cart,
customer account templates, and the ~85 content sections being ported from the
old theme. Expect the homepage to render and little else until those land.
