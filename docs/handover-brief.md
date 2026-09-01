# Handover brief — next session

Written 01/09/2026 at the end of the cart + wishlist session. Read this first,
then `conventions.md`, then `recreation-process.md`, then the 01/09 blocks in
`build-state.md`.

**Next job: the gallery section and the blog.**

---

## How work actually happens here

Three separate channels. Using the wrong one is the main way this goes wrong.

### 1. Theme code → Dropbox, then Ed runs a script

Claude **cannot** run git, and **cannot** reach github.com. Claude writes files
into the local clone in Dropbox:

```
/GIT-repositaries/fye-theme-v3
```

Ed then runs commands in Terminal. He is not a developer — give him exact
commands to paste, one block at a time, and say what each does.

**Do not use GitHub Desktop for v3.** That is the OLD repo
(`fye-shopify-theme`, branch `fye-v2-responsive`). v3 is a separate repo on
`main` and goes through the terminal.

The commit line, every time:

```
cd ~/Dropbox/GIT-repositaries/fye-theme-v3
git add -A && git commit -m "..." && git pull --rebase && git push
```

Commit before pull is deliberate — `git pull --rebase` refuses to run with
unstaged changes. Shopify picks the push up within about a minute.

### 2. Editing existing files → an idempotent patch script

Claude can create files in Dropbox but **cannot edit them in place**, and the
big ones (`assets/fye-ui.js` ~70KB, `sections/main-product.liquid` ~59KB,
`sections/header-bottom.liquid` ~53KB) are past what any reader in the session
can fetch — **everything truncates around 50KB**.

So: write a small Node script into `tools/`, have Ed run it, then delete it.

```
node tools/w9NN-what-it-does.mjs
```

Rules that came from real breakages:

- **Anchored string replacement, never regeneration.** Assert the anchor
  matches exactly once and `process.exit(1)` if not. A silent zero-match or
  double-match in a 2,000-line file is very hard to spot later.
- **Idempotent.** Every script must be safe to run twice.
- **Guard on the THING, not on words about it.** A patch once skipped itself
  because the file's own comment mentioned the filename it was checking for;
  the `<script>` tag was never inserted and the page silently never ran.
- **Append to the big JS/CSS files** rather than editing near the top, so
  nothing above the insertion point is touched.
- **Scripts are single-use.** Delete once run and pushed. Recoverable from
  Dropbox's Deleted files if ever needed.

Scripts are also how Claude READS what it cannot fetch: print the region of a
file you need, have Ed paste it back.

### 3. Store data and verification → the Shopify MCP

Products, collections, pages, metafields, menus, redirects: `graphql_query` /
`graphql_mutation` directly. Nothing to do with git.

Also the way to check a push actually landed — query the theme's files and
compare `checksumMd5`, or just look at `updatedAt`.

Theme IDs:

| | |
|---|---|
| `fye-theme-v3/main` (what we are building) | `197720146304` — **UNPUBLISHED** |
| `fye-shopify-theme/fye-v2-responsive` | `197353406848` — **MAIN / live** |

Preview: `https://foryoureternity.com/<path>?preview_theme_id=197720146304`.
Clear the sticky cookie afterwards with `?preview_theme_id=` (empty value).
For incognito, hit the site root with the parameter first, then navigate.

**Because v3 is unpublished:** the admin's theme-template dropdowns only list
the PUBLISHED theme's templates. A new v3 template will not appear there. Set
it via the API instead (that is how the wishlist page was created —
`pageCreate` with `templateSuffix`).

---

## Before starting any page — the pre-flight

This has bitten twice now (collection page, cart page):

**Check that BOTH the template and its section exist in v3 before promising
anything.** Live's `templates/x.json` naming a section proves nothing about
v3 — v3 had neither `templates/cart.json` nor `sections/main-cart.liquid`, so
every /cart URL 404'd.

Also: a template is validated against the section schema as it exists at that
moment. If the template lands before the section, it is rejected silently. If
a new page 404s after the first push, add a blank line to the template JSON and
push again.

---

## Two CSS traps, both hit today

1. **`hidden` loses to `display`.** An element toggled with the `hidden`
   attribute but styled `display: flex` is never hidden. Cost us an empty state
   showing under a full grid, and a filled count badge at zero. Fix pattern:
   `.fye <scope> [hidden] { display: none !important; }`.
2. **Section `{% stylesheet %}` blocks can load after `assets/fye-core.css`,**
   so a later rule in fye-core.css does not always win. Raise specificity
   rather than assuming source order.

---

## Where things stand

Done and pushed: product pages (8 templates), collection pages, mega-menu,
cart, wishlist.

Open, carried forward:

- **No configured total on a wishlist card.** Companion lines are saved as
  variant ids, and Shopify cannot price a variant id without its product
  handle. The card shows the setting's live price and lists the configuration.
  Fix: save each companion's handle in `addOnLines()` in `fye-ui.js`.
- **Centre-fee variant `58461224927616` is live's and still unverified on this
  store.** If wrong, the cart's fee reconciler quietly does nothing.
- **No "save for later" on the cart** — the obvious next join between cart and
  wishlist.
- **The Wishlist page is published**, so it exists on the current live v2 site
  as an empty page under v2's default layout. Nothing links to it. Unpublish if
  that matters before v3 ships.

---

## Working with Ed

Explain what you are about to change before changing it, and tell him plainly
what to click or paste. He would rather be asked one clear question than handed
a change he did not expect. Keep steps small and finish one before starting the
next.
