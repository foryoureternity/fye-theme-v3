# BRIEF — rebuild the Ring Finder for v3

Written 03/09/2026, at the end of the session that took v3 live. Everything
needed to build this is either in here or named in here.

---

## 0. Read these first, in this order

1. **`docs/conventions.md`** — how to write anything in this theme. Not
   optional. Where it and a personal preference disagree, it wins.
2. **The last four session blocks of `docs/build-state.md`** — what is built,
   what is deliberately not, and the traps already paid for.
3. **`docs/ring-finder-paths.md` in the OLD repo**
   (`../fye-shopify-theme/docs/ring-finder-paths.md`) — the filter research
   this whole brief rests on. Section 4 below reproduces the parts you need,
   but read the original: it is the most valuable artefact of the first
   attempt.

---

## 1. THE PUBLISH PROCESS — read this before you touch anything

**v3 is LIVE.** Theme id `197720146304`, published 03/09/2026 and verified in
place. `fye-v2-responsive` is no longer serving customers.

**The repo is connected to the live theme. A push goes to production within
seconds.** There is no staging step and no preview theme any more. This is the
single most important difference from every previous session, all of which
worked against an unpublished theme.

### How to work safely, given that

**The page this feature lives on is `/pages/find-your-ring`, and it is
currently UNPUBLISHED.** That is the safety mechanism and it is deliberate:

- `sections/fye-ring-finder.liquid` and `templates/page.find-your-ring.json`
  can be pushed to the live theme freely, because **no published page renders
  them**. Nothing a customer can reach changes.
- Anything you add to `assets/fye-ui.js` or `assets/fye-core.css` **DOES** go
  live on every page immediately. Scope new CSS under the section's own class
  prefix and new JS inside its own guarded IIFE that returns early when the
  section is absent. Do not touch shared vocabulary in `fye-core.css` for this
  feature.
- To view the page while building: **publish `/pages/find-your-ring` but keep
  it out of every navigation menu**, and add its handle to the noindex block in
  `layout/theme.liquid` (the block already exists and already lists
  `zz-form-testing`). Unlisted plus noindex is how the form-testing pages
  worked. Remove the noindex entry when it goes live properly.
- **Never** link it from a menu until Ed says so.

### The commands

```
cd ~/Dropbox/GIT-repositaries/fye-theme-v3

./tools/fye status              what is uncommitted, recent commits
./tools/fye push "message"      stage, commit, pull --rebase, push
./tools/fye ship "message"      push, wait, then re-save templates
./tools/fye run <script.mjs>    run a tools/ script, report what changed
```

**Use `ship`, not `push`, when a new section and a template that references it
land together.** Shopify validates a JSON template against the section schema
it holds *at that moment*, so a template arriving alongside its section is
rejected — silently, staying at its previous version. `ship` pushes, waits, and
re-saves the templates so they stick.

### Hard rules

- **Never run git from a sandbox against this clone.** It leaves an
  `index.lock` the mount cannot delete. Give Ed the commands; he runs them.
- **Dropbox `create_file` will not overwrite.** Delete the file first, then
  create. You will hit this.
- **Edits to existing files go through a single-use patch script** in `tools/`,
  named `wNNN-<what>.mjs`, run once and deleted. Pattern: assert each anchor
  matches exactly once, apply all edits or none, verify after writing.
- **Guard a patch on the CHANGE, not the selector.** A script that guarded on
  `.fye .xref__cta {` reported "already present" and never applied its
  `min-height`, because the selector already existed as a one-line margin rule.
  Guard on `min-height: 44px;`, which is false until the work is actually done.
- **Check the store before building anything.** Eleven live page templates
  turned out to have no page behind them. Two "content decisions waiting on Ed"
  turned out to be pages that did not exist. One Admin API query is cheaper than
  any assumption.

---

## 2. Verification — what must pass before you call anything done

### The template validator

```
node tools/w977-validate-templates.mjs page.find-your-ring
```

**A new template must come back with 0 faults.** It reports pre-existing
select-value notes on older templates; ignore those, but not yours. It checks
that every section exists, every block type is declared, every `select` value is
in its options, and every `range` value sits on its step grid.

**An off-step range value rejects the entire template, silently.** `overlay: 45`
on a step-2 range cost two sessions before anyone worked that out.

### The smoke test

```
foryoureternity.com/pages/find-your-ring?fyedebug=1
```

then in the console: `fyeSmoke.all()`

Nine groups: overflow, targets, type, popups, images, forms, palette,
structure, liquid. It only ever reads the page.

**Run 889 FIRST, then 500, then 1440.** The `targets` group only fires at coarse
pointer or 900px and under, so a run at 1440 reports nothing about the most
common fault in this theme. Four undersized-target bugs shipped this week and
every one was invisible at desktop width; one was on the homepage and was found
on launch day.

A multi-step questionnaire is mostly buttons, so `targets` is the group that
matters most here. **44px minimum**, and it applies to the tap target rather
than the glyph: a checkbox may be 18px if its label carries the 44px.

---

## 3. What to verify BEFORE writing code

This decides whether the job is a day or needs a data task first.

**Are the `filters.*` metafields enabled as filters in Search & Discovery, for
each of the three collections?** Shopify's native filtering only addresses
filters that are switched on there, per collection.

The metafield definitions exist and are correctly typed — confirmed
03/09/2026, product owner type, namespace `filters`:

| key | type |
|---|---|
| `ring_style` | single_line_text_field |
| `profile` | single_line_text_field |
| `band_width` | single_line_text_field |
| `weight` | single_line_text_field |
| `metal_colour` | single_line_text_field |
| `carat` | single_line_text_field |
| `eternity_style` | single_line_text_field |
| `stone_type` | **list**.single_line_text_field |
| `stone_shape` | **list**.single_line_text_field |
| `setting` | **list**.single_line_text_field |
| `shoulder_style` | **list**.single_line_text_field |
| `total_weight` | number_decimal |
| `centre_weight` | number_decimal |
| `band_width_mm` | number_decimal |

Note there are two band-width fields, one text and one decimal, and two weight
fields. Establish which the live filters actually use before building steps on
either.

`gemex` has **no** metafield definitions any more, which contradicts the
original doc's note about the Gents Rings. Re-check that if the Gents Rings come
into scope.

**Then confirm the exact URL syntax by reading it off the site, never by
guessing.** Open a collection, click a filter, read the URL. That was the
first attempt's own hard-won rule and it applies just as much to native
filtering as it did to the app's:

```
filter.p.m.<namespace>.<key>=<value>          metafield
filter.p.tag=<value>                          tag
filter.p.product_type=<value>                 product type
```

Numeric ranges have their own shape and it is not obvious. Click the range
control on a live collection and read the result.

---

## 4. THE SPECIFICATION

Three journeys. Each is a fixed sequence of steps. **Every step ends with "I'm
flexible", which applies no filter** — that single rule is what guarantees no
ring is orphaned, because a ring missing a value for one filter is still
reachable by choosing "I'm flexible" at that step. Do not drop it.

Values below were verified against the live filters on 14/08/2026. **Re-verify
before building**: the catalogue has had three weeks of edits since.

### Journey A — Engagement rings
Collection `engagement-rings`, about 1,534 products. Five steps.

1. **Ring style** — Solitaire · Halo · Hidden Halo · Double Halo · Trilogy ·
   Multistone · Toi et Moi
2. **Centre stone size** (range) — Under 0.30ct · 0.30–0.59 · 0.60–0.99 ·
   1.00–1.49 · 1.50–1.99 · 2.00ct and above
3. **Centre stone cut** — Round Brilliant · Oval Cut · Pear Cut · Emerald Cut ·
   Cushion Cut · Marquise Cut · Princess Cut · Radiant Cut · Asscher Cut ·
   Heart Cut · Crisscut Emerald · Emerald Cut or Radiant Cut
4. **Metal** — Platinum · 18ct Yellow/White/Rose Gold · 14ct Yellow/White/Rose
   Gold · 9ct Yellow/White/Rose Gold
5. **Shoulder style** — Plain · Diamond set · Pavé · Channel · Accent · Curved ·
   Split

### Journey B — Plain wedding rings
Collection `plain-wedding-rings`, about 2,700 products. Four steps. **The only
journey where every answer narrows the results.**

1. **Profile** — Traditional Court · Slight Court · D Shape · Flat · Flat Court ·
   Edged Court · Edged Flat Court · Engagement Match · Concave
2. **Band width** — 1.5mm · 2mm · 2.5mm · 3mm · 4mm · 5mm · 6mm · 7mm · 8mm ·
   9mm · 10mm  (exact values, not ranges)
3. **Ring weight** — Light · Medium · Signature · Heavy
4. **Metal** — as Journey A

### Journey C — Diamond and eternity wedding rings
Collection `diamond-wedding-rings`, about 1,681 products. Five steps.

1. **Setting** — Channel · Grain · Pavé · Claw · Rubover · Bar · French Cut ·
   Invisible · Oyster · Tension
2. **Stone type** — Diamond · Sapphire · Ruby · Emerald · Black Diamond
3. **Stone shape** — Round Brilliant · Oval · Princess · Baguette · Marquise ·
   Emerald Cut · Asscher · Heart
4. **Diamond coverage** — Full Eternity · Half Eternity · Gem set (via stone
   type, not diamond) · Mixed (no coverage filter applied)
5. **Metal** — as Journey A

### Metal is asked everywhere but only filters on Journey B

Ed's decision, 14/08/2026. Only `plain-wedding-rings` has a metal filter. On
Journeys A and C the answer is collected and **carried to the product page**
rather than used as a filter. Keep that behaviour: the answer is useful context
for an enquiry even when it cannot narrow a collection.

### Known catalogue gaps, both Ed's calls, both deliberately out of scope

- **45 Gents Rings** are in no customer-facing collection at all, so they are
  invisible to site browsing as well as to the finder. A catalogue task, not a
  finder one.
- **`D Shape`** appears in the tag list and has a 330-product collection, but was
  not in the live Profile filter's values. Either the filter is missing a value
  or those rings carry a different profile. Worth one check before Journey B
  ships, because 330 rings may have no profile answer that reaches them.

Coverage at the last audit: **5,915 of 5,960 rings reachable, 99.2%.** Re-audit
at product level, not filter-value level.

---

## 5. WHAT TO BUILD, AND WHAT NOT TO

### The architectural decision

**The first attempt targeted `/a/search/…`, the XCloud app-proxy.** Do not.

v3 deliberately does not support that page: a T4S shim was added to make it
render and then deleted the same day, and `docs/conventions.md` now opens with a
rule about never adding a shim to satisfy an app that still speaks T4S. A
badly-rendering `/a/search` is expected and accepted.

**Build native Shopify filter URLs and land the customer on
`/collections/…`**, which is v3's own `main-collection`: styled, smoke-tested,
ours, with a filter rail we already theme.

That change removes, in one go:

- the **77KB bridge** (`fye-ring-finder-bridge.js` + `.css`), which existed
  almost entirely to annotate and restyle a results page we do not own
- the stripped-query-param trap (XCloud discarded `fye_source=ring_finder`,
  which forced a `sessionStorage` fallback)
- the blank `template.name` trap on proxy pages

### Do not port

- `assets/fye-ring-finder-bridge.js` (47KB)
- `assets/fye-ring-finder-bridge.css` (30KB)
- `snippets/fye-ring-finder-bridge.liquid`
- Any part of the click-the-filter-controls mechanism. Build the URL directly.
  Clicking is what produced the original's timing races, hidden duplicate
  filter drawers and unclickable sliders.

The old `sections/fye-ring-finder.liquid` (68KB), `assets/fye-ring-finder.js`
(36KB) and `.css` (25KB) are worth **reading for the questionnaire UI logic**,
then rewriting. Port the specification, not the code. The whole point of v3 was
shedding 535KB of someone else's framework; do not replace it with 206KB of
ours.

### Deliverables

| File | Notes |
|---|---|
| `sections/fye-ring-finder.liquid` | One section. Steps as blocks if the option lists should be editable, otherwise in Liquid with the lists in the schema |
| `templates/page.find-your-ring.json` | `heading-template` banner, the finder, and a `fye-consultation` close |
| `assets/fye-ui.js` | The behaviour, appended as one guarded IIFE. **Conventions §6: one JS file, no per-section scripts, no `{% javascript %}`, no inline `<script>`** |

Styling goes in the section's `{% stylesheet %}` block on tokens from
`fye-core.css`. No literal colours, sizes or spacings. No vertical padding —
rhythm comes from `--sect-y` via `.band`. Three breakpoints only: 900, 749, 560.

Hooks are `data-fye-*` attributes, never classes. A ported class hook is a dead
hook: the homepage's "Start a bespoke enquiry" button rendered perfectly and did
nothing for a week because v3 listens for data attributes and the setting
carried a class.

### Assets you already have, which matter for this feature

Content › Files holds three icon sets. **The 68px ring-style set maps almost
exactly onto Journey A's first step**, which is the hardest step to express in
words:

```
solitaire · halo · hidden-halo · three-stone · pave · side-stone
vintage · cathedral · bezel · nature
```

Filenames are hashed, e.g. `solitaire-4VMZDYZQ.svg`. Also available: 36px
diamond-shape SVGs covering more than twenty cuts including `BAGUETTE`, and the
older `icon101`–`icon110` set the mega menu uses.

**An SVG cannot go through `image_url` or `image_tag`, and `image_picker` will
not offer one.** Take the filename as a `text` setting and resolve it with
`file_url`. `sections/fye-shape-tiles.liquid` is the working precedent, built
03/09/2026 — read it before doing this differently.

---

## 6. Copy rules, non-negotiable

- **British English.** Jewellery, colour, customise, programme.
- **No em dashes.** Commas, semicolons, or "and".
- **No starting prices**, and no "from £x".
- **Resizing is complimentary for the first year.** Never "for life", never
  "lifetime resizing".
- **"Lifetime warranty" is permitted only against manufacturing defects**, and
  must not be attached to resizing. Ed confirmed this wording 03/09/2026.
- **No surprise-purchase framing for wedding rings.** Engagement rings may be a
  surprise; wedding rings are chosen together.
- **"We can arrange a face-to-face meeting"**, never showroom or store.
- One `<h1>` per page, from the banner. Headings descend without skipping.
- No emoji. Iconography is thin outline line-art only.

---

## 7. Questions worth putting to Ed before building

1. **Does Journey A need a Stone type step?** It is the only deliberate route to
   the 273 coloured-stone engagement rings. It would make Journey A six steps.
   Raised on 14/08/2026 and never answered.
2. **What happens at the end?** The first attempt sent the customer to a
   filtered results page. Options worth putting to him: results page, results
   page plus a "talk to us about these" enquiry that carries the answers, or a
   shortlist we assemble by hand. The answers are genuinely useful sales
   context, and the enquiry popup (`data-fye-popup="enquire"`) already composes
   a readable email.
3. **Should the metal answer travel to the product page**, and if so how — query
   param, `sessionStorage`, or dropped? It cannot filter on two of three
   journeys.
4. **Are the option lists editable in the theme editor, or fixed in Liquid?**
   Editable means blocks and a lot of schema; fixed means a code change every
   time the catalogue gains a profile. Given how much drifted between the
   original doc and the live filters in three weeks, editable may be worth the
   weight.

---

## 8. Definition of done

1. `node tools/w977-validate-templates.mjs page.find-your-ring` → **0 faults**
2. `fyeSmoke.all()` clean at **889, then 500, then 1440**
3. Every journey walked end to end, including **"I'm flexible" at every step**,
   which must return the unfiltered collection
4. At least one worked example proven to return the count you expect. The
   original doc has two:
   - Concave + 4mm + 18ct Rose Gold → 3 results
   - Engagement Match + 3mm + Heavy Weight + 9ct Rose Gold → 1 result
5. No new literal colours, sizes or spacings outside `fye-core.css`
6. `shopify_attributes` on every block, `data-screen-label` on the section root
7. The section renders with empty settings and with no blocks: no Liquid
   errors, no collapsed layout
8. A session block appended to `docs/build-state.md` saying what was built, what
   was deliberately not, and anything a future editor would otherwise break
