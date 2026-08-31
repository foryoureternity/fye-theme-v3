# Recreating a live section in v3 — the fast path

Written 31/08/2026, after the mega-menu build took a night that should have
taken an hour. Everything below is a rule earned by getting it wrong first.

---

## The one-line version

**Read live's rendered HTML and the old theme's Liquid myself, write the new
snippet straight to the v3 theme, verify it landed by checking the file's
size, then hand Ed one `mv` + commit.** No console dumps, no screenshots, no
`.mjs` patch scripts.

---

## What went wrong last time, so it doesn't repeat

| Cost | Cause | Rule it produced |
|---|---|---|
| ~4 passes | Eyeballed screenshots to guess spacing | R1 |
| ~3 passes | Asked Ed to paste console dumps | R1 |
| **~3 hours** | Wrote `.mjs` patch scripts that were never run | R3 |
| 1 wrong fix | "Corrected" 25 cuts → 35 from a *v3* screenshot | R2 |
| 2 dead links | Guessed collection handles | R2 |
| several | Patched a 58KB section file by string match | R4 |

The three-hour one is the important one. Five scripts were written; the
section file's timestamp never moved. Every "nothing's changed" was true, and
I kept writing more scripts instead of checking whether the last one ran.

---

## R1 — Measure from source, never from pixels

I can fetch live's rendered HTML directly. It carries the real markup, the
real copy, the real hrefs and the real class names. **Use it.**

- Fetch the live page, find the section, read its structure and its words.
- For computed geometry that HTML alone won't give (grid tracks, gaps), the
  console dump at `docs/tools/dump-megamenus.js` still exists — but it is the
  fallback, not the opening move, and it costs Ed a round trip.
- Never ask "what does it look like" when I can read what it *is*.

## R2 — Live is the authority; a v3 screenshot is not

Every string, handle and count comes from live's HTML. If v3 and live differ,
live wins by definition — that's the brief.

Burned on this twice: changed a correct "25 cuts" to "35" because a v3
screenshot said 35, and invented `fancy-salt-and-pepper-diamonds` when live
says `salt-and-pepper-diamonds`.

**Never type a collection handle I haven't seen in live's HTML.**

## R3 — Write to the theme directly; verify it landed

The Shopify connection can read *and* write theme files. That is the delivery
mechanism. A patch script is a request that Ed become the runtime — it fails
silently and neither of us finds out for an hour.

Order of preference:

1. **`themeFilesUpsert`** — write the whole file to the v3 theme. Instant, no
   terminal, and it either succeeds or returns an error I can see.
2. **Whole-file write to Dropbox** as `name.new.liquid` + a one-line `mv` —
   for repo-only files, or to bring the repo back in sync after (1).
3. **A patch script** — only in the narrow case below.

**The one legitimate script case.** A file too large to read whole (the
readers truncate around 50KB) cannot be safely rewritten, because the part I
cannot see may hold the `{% schema %}`. A script edits a span in place without
needing the rest. When writing one it must refuse unless it can prove the
tail survived — e.g. assert `{% schema %}` still follows the close marker.
Anything smaller: write the whole file, don't script it.

**Always verify — this is the step that would have saved the dead evening.**

```
query { theme(id: "gid://shopify/OnlineStoreTheme/197720146304") {
  files(filenames: ["sections/x.liquid"], first: 1) {
    nodes { filename size updatedAt } } } }
```

Cross-check that against Dropbox's `last_modified` and `size` for the same
file. Both matching = the edit ran, the commit pushed, and Shopify has it.
Divergent = it tells me *which* link broke. Do this before writing anything
new, and always when Ed says "nothing's changed". Size cannot tell me it
renders correctly — that still needs one hard-reload from Ed — but it settles
"did it arrive", which is the question that wasted the time.

Note: theme file *deletion* is blocked by policy — Ed has to remove files by
hand in the editor. Don't create scratch files on the theme.

## R4 — One declaration per selector, in the section's own stylesheet

Two separate rules, both learned the hard way.

**Where it lives.** `fye-core.css` states its own architecture: section CSS
belongs in that section's `{% stylesheet %}` block, and core earns vocabulary
only when TWO OR MORE sections share it. The mega menu is one section, so its
CSS belongs in `header-bottom.liquid` — not in core, and not in the snippets.

An inline `<style>` inside a snippet is a *delivery* workaround, not
architecture. `mm-guide-card` renders up to five times a page, so its style
block shipped five times, uncached, and needed defensive selector chains
(`.fye .mm__card .mm__card-title`) to out-specify the section. Consolidated
31/08: ~7.9KB saved and the chains dropped back to single classes.

**Never append an override.** The mega CSS reached 400 lines as five stacked
generations — `.mm__zone-title` declared four times, `.mm__shapes` four,
`.mm__label` three. Reading it told you nothing about what applied; you had to
run the cascade in your head, and that is what made every fix slow.

> **Find the existing declaration and change it. If you are appending a rule
> that re-states a selector already in the file, you are making the next fix
> slower.**

## R5 — Read the old theme's Liquid before rebuilding

The live site is the T4S theme with custom Liquid dropped in. Its section
source is readable through the same theme-file query. Read it. It answers
what the markup *is* far faster than inferring from rendered output, and it
shows which settings the section already exposes.

`mm-guide-card` already had a `blurb` param, which I'd have known in ten
seconds by reading it — instead I designed a blurb-injection scheme around a
field that already existed.

## R6 — Don't assume five things exist because one does

The dump found exactly one custom panel on live: Diamonds & Gemstones. The
Engagement, Wedding and Eternity panels are stock T4S dropdowns there. Four of
the five "recreate live exactly" targets had no live counterpart at all.

**Before promising parity, confirm the thing being copied exists.** Where it
doesn't, say so and ask what the target is instead — that's design work, not
recreation, and it needs Ed's intent rather than live's DOM.

---

## The loop, in order

1. **Fetch live's page.** Read the section's real markup, copy, hrefs.
2. **Read the old theme's Liquid** for that section — settings, params, and
   any snippet that already does the job.
3. **Confirm the target exists on live.** If not, stop and ask.
4. **Write a self-contained snippet** — markup only, CSS into the section's
   stylesheet — straight to the v3 theme with `themeFilesUpsert`.
5. **Verify** size + `updatedAt` on the theme, cross-checked against Dropbox.
6. **Ask Ed to hard-reload and look.** One round trip, not six.
7. **Sync the repo:** write the same content to Dropbox as `name.new.liquid`,
   hand over `mv … && git add -A && git commit && git pull --rebase && git push`.

Dropbox's writer cannot overwrite an existing file — hence the `.new.liquid`
step. Don't fight it.

---

## Standing gotchas

- `git push` after a direct theme write will usually reject; `git pull
  --rebase` first. On a conflict in a file I wrote to the theme, keep ours.
- The git → Shopify sync works: a push updates the theme within seconds.
- A `.wrap` inside a flex/grid parent needs explicit `width: 100%`.
- Media queries must come last in the cascade chain.
- Absolute positioning with no positioned ancestor measures against the
  viewport.
- When a layout misbehaves, check element count and nesting **before** reading
  CSS — a missing `</a>` looks exactly like a CSS bug and one console line
  finds it.
- Swatch dots align to the label's *first* line (`flex-start` + a negative
  nudge), or two-line labels drop out of the row.

---

## Still outstanding on the mega menus

- `snippets/mm-probe.liquid` — scratch file on the theme, delete by hand.
- Wedding panel: all 17 stone links resolve to
  `/collections/coloured-stone-rings` — the `mm-stones` wedding-branch
  override is firing.
- `docs/tools/dump-megamenus.js` is worth keeping — fallback for computed
  geometry live's HTML won't give. The `fix-*.mjs` and
  `mega-css-consolidate.mjs` scripts are spent; delete them.
