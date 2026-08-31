# Engagement rings — how the stone choosers work

Investigated 31/08/2026 against live, before building the v3 branch. Written
down because the logic is spread across a 57KB section, a 77KB script and four
metafields, and rediscovering it costs an hour.

**Revised 31/08/2026 evening.** Three things in the first draft were wrong or
incomplete; they are corrected in place and flagged **[CORRECTED]**. Ed's
answers to the open questions are now at the bottom as decisions.

## The four cases, and what decides them

It is **not** the product type, the collection or the template that decides
which chooser a ring gets. It is whether the product carries `fye` metafields.

| Case | Gate | Example |
|---|---|---|
| **Centre diamond chooser** | `fye.centre_shape` + `fye.carat_min` + `fye.carat_max` | `eng33980-smt` — Round, 0.8–1.3ct |
| **Side diamond chooser** | tag `Trilogy Ring` + `fye.side_stones.code` | `trl23668-aqd` — `{"cut":"Pear","pair_ct":0.2,"code":"PE-020"}` |
| **Coloured stone, complete** | tagged `Complete Engagement Ring`, `filters.stone_type` is a gem, no `fye.*` | `trl28784-emd` |
| **No chooser** | no `fye.*` at all | any complete ring |

Two section settings sit on top as per-template overrides:

- `enable_centre_diamond` — unticked on eternity, gem-set and plain templates.
- `enable_side_diamonds` — unticked on **`product.complete.json`**, because a
  complete trilogy already has its sides set and paid for.

**The suffix is the real switch, and it overrides the metafield.** Worth stating
plainly because it looks like a contradiction in the data: `trl23668-aqd` DOES
carry `fye.side_stones` and DOES sit on `product.complete.json`, so its side
panel is off. The metafield is not the authority; the template is. A ring that
should offer sides must be moved off the `complete` suffix, not given a
metafield.

## [CORRECTED] The template suffixes — all twelve, and which are real

The first draft said "live therefore has product template suffixes,
`product.complete.json` at least". It has **twelve**. Measured 31/08/2026 by
sampling `templateSuffix` per product type:

| Product type | Suffix | Sampled |
|---|---|---|
| Engagement Ring | `engagement` | 30/30 |
| Trilogy Ring | `complete` (5 of 30 on `engagement`) | 30/30 |
| Full Eternity Ring | `gemset` | 20/20 |
| Half Eternity Ring | `gemset` | 20/20 |
| Gents Ring | `gents` | 20/20 |
| Plain Wedding Ring | `plain` | 20/20 |
| Loose Diamond | `diamond` | 20/20 |
| Loose Gemstone | `diamond` | 20/20 |
| Side Diamonds, Fee, Service Fee | none | 8/8 |

What each one does on live:

| Template | Section | Settings |
|---|---|---|
| `product.engagement.json` | `product-block` | `enable_centre_diamond: true` |
| `product.complete.json` | `product-block` | both choosers false, `contact_button_label: "Contact Us About This Ring"` |
| `product.gemset.json` | `product-block` | centre false, `contact_button_label: "Customise This Ring"` |
| `product.gents.json` | `product-block` | centre false, `contact_button_label: "Customise This Ring"` |
| `product.diamond-ring.json` | `product-block` | none — all defaults |
| `product.diamond.json` | `fye-diamond-product` | `show_cert_badges: true`, plus a `product-recommendations` band |
| `product.plain.json` | T4S `main-product` | 15.6KB of T4S settings |
| `a-configs`, `ring-products`, `options-customizer`, `complementary-products` | T4S | fat leftovers, on no sampled product |

**Why this matters more than it looks.** A theme missing the suffix a product
names does not 404 — Shopify falls back to `product.json` **silently**. So on v3
today every ring renders the plain-wedding-ring branch, which is exactly why the
plain rings looked finished and nothing else could be tested.

**The 5 trilogies on `engagement` rather than `complete`** are presumably the
semi-mount trilogies, where the customer does choose a centre stone. Unverified
— flagged for Ed as a data question, not theme code.

## Centre diamond chooser (semi-mounts, SKU `-SMT`)

The metafields do two jobs: they gate the panel AND build the suitability
sentence — *"This ring is suitable for a Round Cut Centre Diamond"* — with the
indefinite article chosen from the first letter of the shape (`an Emerald`).
`section.settings.suitability_note` is only a fallback, and
`custom.centre_suitability` overrides it per product.

Three modes:

1. **Complete set (required)** — opens the diamond picker modal. The chosen
   stone is added as its own cart line, carrying `For ring` and `Ring SKU`.
2. **Supplied by you** — adds the *Centre-diamond setting fee* product
   (variant `58461224927616`, £80) plus a waiver the customer must tick.
   Properties: `Centre Diamond: Customer's own diamond`, `Setting service`,
   `Waiver`.
3. **Semi-mount only** — `Centre Diamond: Semi-mount only`. Nothing added.

### [CORRECTED] Where the stones come from

The first draft said the feed is `/collections/loose-diamonds?view=cdc-json`.
**That is the legacy fallback only**, used when a ring has no shape metafield.

Live queries the **shape sub-collections**, one request per origin, because
Shopify silently stops applying storefront filters once a collection passes
5,000 products and Loose Diamonds now holds 15,000+ (W029):

```
/collections/round-natural-diamonds?view=cdc-json&page=1
/collections/round-lab-grown-diamonds?view=cdc-json&page=1
```

Note the asymmetry in the handles — **`natural` but `lab-grown`**. The slug rule
is `shape.toLowerCase().replace(/\s+/g, '-')`, which also covers the seven
orphan shapes (Hexagonal, Baguette, Old Miner, Square Radiant, Half Moon,
Triangular, Trapezoid).

Both origins are fetched in one `Promise.all` on open, so the Natural /
Lab-grown toggle inside the modal needs no further requests. Pages are walked to
a cap of 10.

**Carat filtering is not a range.** This store's metafield filters have no range
operator (`.gte`/`.lte` are price-only) and silently ignore trailing zeros —
`carat=0.30` returns nothing, `carat=0.3` works. Repeated params DO OR
correctly, so a carat window is sent as **one `filter.p.m.fye.carat` param per
0.01ct step**, each trimmed of trailing zeros, capped at 150 steps. A wider
window (or a ring with no range — about 258 of them) skips the carat filter
entirely and relies on the page-walk cap.

**Never send an `Accept: application/json` header.** Shopify content-negotiates
`/collections/...` URLs and returns the collection OBJECT json, ignoring
`?view=`.

Results are then filtered client-side by `caratOk()` against
`carat_min`/`carat_max`.

## Side diamond chooser (trilogy)

Gate: `enable_side_diamonds` AND tag `Trilogy Ring` AND `fye.side_stones.code`.
Rings without the metafield — the 8 tension trilogies and unmatched models —
behave like any other ring.

The chips are **variants of hidden "Trilogy Side Diamonds — &lt;quality&gt;"
products**, matched by SKU tail `-&lt;code&gt;` against the ring's `side_stones.code`.
The four handles are hardcoded in the Liquid:
`trilogy-side-diamonds-devvs` / `-fgvs` / `-gsi` / `-lab`. Prices are read live
off those products, so repricing side stones means editing four products and
never touches a ring. `F/G VS` is preselected.

It also sets `pb_hide_qual`: **the ring locks to its cheapest natural grade**
(the mount price) and the Diamond Quality row is hidden entirely, because the
sides now carry the grade. That is a behaviour change to the rest of the buy
box, not just an extra panel — miss it and the ring is priced twice.

"Supplied by You" adds the **Side Diamond Setting Fee** product
(`58739448938880`) — deliberately NOT the centre fee, because the cart
reconciler counts the centre fee by variant id and would strip a shared line.

If an add-on product is missing or a code has no variant, that chip simply does
not render and add-to-cart still works.

## [CORRECTED] Two rules of live's buy box the first draft missed

Both change prices, so they are not cosmetic.

**The Diamond Quality row hides itself when it does nothing (W803).** "Diamond
quality" grades the SHOULDER diamonds, not the centre stone. On a plain-shoulder
solitaire there are no set diamonds, so every natural grade costs the same and
the selector is meaningless. Two tests must AGREE before it hides: (1) the price
never moves across natural grades within a single metal — the ground truth,
which on its own wrongly caught four genuinely diamond-set rings; and (2) the
ring is tagged `solitaire` + `plain shoulders`, deliberately not matching "Halo
with Plain Shoulders". A single-value option hides on its own merit. Swept
19/08/2026: 171 of 175 plain-shoulder rings hide, 60 of 60 diamond-set keep it.

**The page opens on the cheapest NATURAL grade, not Shopify's first (W831).**
Option value 1 is `D/E VVS`, so leading with it headlines every ring at its
dearest grade — on the complete trilogies that read as a ~27% jump overnight.
Natural only: opening on a lab-grown price would misrepresent rings sold mainly
as natural. Only when the shopper has not picked a variant themselves
(`product.selected_variant` is nil unless `?variant=` is in the URL) — otherwise
deep links and the back-from-cart journey break.

**The oversize surcharge is taken on the RING LINE ONLY.** 10% above size Q. The
centre diamond, side diamonds and engraving travel as their own unflagged cart
lines and are not surcharged, so the page must add the uplift to `base` before
add-ons or the page and the cart disagree. Sizes are `A`–`Z`, each with a half,
then `Z+1`–`Z+6` with halves; threshold default `Q`.

## Cart lines, in full

The ring is always line one. Then, conditionally:

| Line | When |
|---|---|
| Engraving fee `58467296018816` | engraving = yes |
| Centre stone (the chosen diamond's own variant) | centre = required |
| Centre setting fee `58461224927616` | centre = supplied |
| Side diamond pair (add-on variant) | trilogy, sides = required |
| Side setting fee `58739448938880` | trilogy, sides = supplied |

Every add-on carries `For ring` and `Ring SKU` so the cart can group them.
There is a **cart fee reconciler** in live's `fye-ui.js` that counts the centre
fee by variant id — worth reading before v3's cart is built.

## DECISIONS — Ed, 31/08/2026

Answers to what were the open questions. These are settled; do not re-derive.

1. **The chooser gate is all three metafields.** `fye.centre_shape` AND
   `fye.carat_min` AND `fye.carat_max`, or no panel. Not the `-SMT` SKU tail —
   though as evidence, 30 of 30 sampled `-smt` products carry all three and sit
   on `engagement`, so the two agree in practice today.
2. **The picker stays a modal**, as live: a full-screen overlay with filters,
   opened from "Choose your diamond".
3. **Both "Supplied by you" flows are in scope now** — centre and sides, each
   with its own setting-fee product and waiver tick.
4. **The Natural / Lab-grown toggle opens on Natural.**
5. **Suffixes v3 will carry:** `engagement`, `complete`, `gemset`, `gents`,
   `diamond-ring`, `plain`. Not the four T4S leftovers. `product.diamond.json`
   is deferred — it needs a `fye-diamond-product` section that does not exist,
   and a template naming a missing section type breaks the theme editor.

## What this means for the v3 build

Ordered by dependency. Items 1 and 2 were done 31/08/2026 evening.

1. ~~**Template suffixes.**~~ **DONE** — five created, all pointing at
   `main-product`, carrying only settings that already exist in its schema so
   nothing could be silently rejected. The chooser flags go in with item 3.
2. ~~**The diamond feed.**~~ **DONE** — `templates/collection.cdc-json.liquid`,
   3,658 bytes, collection-agnostic so both the shape sub-collections and the
   legacy loose-diamonds URL work.
3. **The buy box branch.** Centre panel, side panel, or neither. Needs
   `enable_centre_diamond` / `enable_side_diamonds` added to `main-product`'s
   schema, then the flags added to `product.complete.json`,
   `product.gemset.json`, `product.gents.json` and `product.plain.json`.
   Expect two pushes when the section and templates change together.
4. **The picker JS — AND A CONVENTION QUESTION.** `conventions.md` §6 says all
   JS lives in `assets/fye-ui.js`, no per-section scripts. The picker is the
   largest single behaviour in the theme (live's is most of a 77KB file) and it
   is needed on PDPs only. Putting it in `fye-ui.js` ships it on every page;
   giving it its own asset breaks §6. **Ed to rule.** Related: `fye-ui.js` is
   too large to fetch whole, so adding to it needs either a full rewrite or a
   Node script that appends at a proven anchor.
5. **Multi-line add to cart.** v3 already posts two lines for engraving; this
   extends the same `/cart/add.js` call to four or five.
6. **The cart page** has to group and reconcile those lines — separate work.
