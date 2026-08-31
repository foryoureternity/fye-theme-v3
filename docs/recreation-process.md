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
3. **A patch script** — only for a change across many files at once, and only
   if I then confirm the file's `updatedAt` actually moved.

**Always verify.** `size` and `updatedAt` from the theme's file query tell me
whether my write landed. Checking that once at the start would have caught the
whole dead evening. If Ed says "nothing changed", check the timestamp *before*
writing anything new.

Note: theme file *deletion* is blocked by policy — Ed has to remove files by
hand in the editor. Don't create scratch files on the theme.

## R4 — Small self-contained files, not edits to the big one

`header-bottom.liquid` is 58KB. Every string-match patch against it was
fragile and most were never applied.

Instead: **one snippet per component, and its CSS lives inside it.** A
`<style>` block rendered inside the panel lands *after* the section's own
rules in document order, so it wins at equal specificity with no
`!important` — and I can rewrite a 4KB file whole instead of surgically
patching a 58KB one.

This is why `mm-guide-card.liquid` and `mm-diamonds.liquid` now carry their
own layout CSS. Follow that pattern for everything new.

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
4. **Write a self-contained snippet** — markup + its own `<style>` — straight
   to the v3 theme with `themeFilesUpsert`.
5. **Verify** the file's size and `updatedAt` moved.
6. **Ask Ed to hard-reload and look.** One round trip, not six.
7. **Sync the repo:** write the same content to Dropbox as `name.new.liquid`,
   hand over `mv … && git add -A && git commit && git pull --rebase && git push`.

Dropbox's writer cannot overwrite an existing file — hence the `.new.liquid`
step. Don't fight it.

---

## Standing gotchas

- `git push` after a direct theme write will usually reject; `git pull
  --rebase` first. On a conflict in a file I wrote to the theme, keep ours.
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
  override is firing. Fixable directly on the theme.
- The four unrun scripts in `docs/tools/` should be deleted:
  `fix-diamonds-geometry`, `fix-guide-rail`, `fix-guide-card`,
  `fix-megamenu-all`. `fix-megamenu-all` would now do harm — it sets the rail
  width a second time and injects blurbs the snippet already handles.
- `docs/tools/dump-megamenus.js` is worth keeping — fallback for computed
  geometry live's HTML won't give.
