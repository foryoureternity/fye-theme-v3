# FYE v3

Standalone Shopify theme for For Your Eternity. Rebuilt from scratch, August 2026.
No T4S/Kalles inheritance.

See `docs/architecture.md` for the design system, the seven rules, and the
contrast measurements. **Read it before touching CSS.**

---

## First-time setup

Shopify only lets a theme be connected to GitHub **at the moment the theme is
created**. A theme uploaded as a zip can never be linked to a repo afterwards.
So the repo has to exist first.

### 1. Create the repo on GitHub

Go to github.com as **foryoureternity** and create a new **empty** repository
called `fye-theme-v3`. No README, no .gitignore, no licence — it must be empty
or the first push will be rejected.

### 2. Push this folder to it

```bash
cd ~/Dropbox/GIT-repositaries/fye-theme-v3

# let Dropbox finish syncing first — check for the green tick
git init -b main
git add .
git commit -m "FYE v3 foundations: core CSS, layout, header, footer, hero"
git remote add origin https://github.com/foryoureternity/fye-theme-v3.git
git push -u origin main
```

### 3. Create the theme from the repo

Shopify admin → **Online Store → Themes → Add theme → Connect from GitHub**
→ pick `foryoureternity/fye-theme-v3`, branch `main`.

Shopify creates the theme **unpublished** and keeps it synced in both
directions from then on. Do not publish until sign-off.

### 4. Upload the fonts

Fonts are self-hosted, not Google Fonts — no third-party request before first
paint, and no visitor IPs sent to Google. The five woff2 files can't be
committed from the design tooling, so add them once by hand:

Theme → **Edit code → Assets → Add a new asset**, upload:

- `tenor-sans-400.woff2`
- `outfit-300.woff2`
- `outfit-400.woff2`
- `outfit-500.woff2`
- `outfit-600.woff2`

`layout/theme.liquid` already declares the `@font-face` rules and preloads the
two used above the fold. Until the files exist the site falls back to Georgia
and the system sans.

---

## Working on it after that

The GitHub connection is two-way: pushes to `main` deploy to the theme, and
edits made in the Shopify theme editor commit back to `main`. Two consequences:

- **Pull before you push.** Customiser changes (section settings, template JSON)
  arrive as commits from Shopify.
- **Never edit `config/settings_data.json` by hand** while the connection is
  live. It is Shopify's file now.

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

Built: core CSS, layout, page-type helper, icons, announcement bar, header
(with a real mega menu), footer, hero, homepage template.

Not built yet: `main-page`, `main-product`, `main-collection`, search, cart,
customer account templates, and the ~85 content sections being ported from the
old theme.
