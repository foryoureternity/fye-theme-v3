# Engagement rings — how the stone choosers work

Investigated 31/08/2026 against live, before building the v3 branch. Written
down because the logic is spread across a 57KB section, a 77KB script and four
metafields, and rediscovering it costs an hour.

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

**Live therefore has product template suffixes.** `product.complete.json` at
least. v3 has only `product.json` today, so those need creating or every
complete ring gets the wrong controls.

## Centre diamond chooser (semi-mounts, SKU `-SMT`)

The metafields do two jobs: they gate the panel AND build the suitability
sentence — *"This ring is suitable for a Round Cut Centre Diamond"* — with the
indefinite article chosen from the first letter of the shape (`an Emerald`).
`section.settings.suitability_note` is only a fallback.

Three modes:

1. **Complete set (required)** — opens the diamond picker modal. The chosen
   stone is added as its own cart line, carrying `For ring` and `Ring SKU`.
2. **Supplied by you** — adds the *Centre-diamond setting fee* product
   (variant `58461224927616`, £80) plus a waiver the customer must tick.
   Properties: `Centre Diamond: Customer's own diamond`, `Setting service`,
   `Waiver`.
3. **Semi-mount only** — `Centre Diamond: Semi-mount only`. Nothing added.

**Where the stones come from.** `fetchDiamonds()` requests the feed per shape
and per origin — `fetchShapeOrigin(shape, 'natural')` and `(shape, 'lab')` —
in one `Promise.all`, so the Natural / Lab-grown toggle inside the modal needs
no further requests (W029). Results are filtered client-side by `caratOk()`
against `carat_min`/`carat_max`. The legacy unfiltered fallback is
`/collections/loose-diamonds?view=cdc-json`, used only when the ring has no
shape.

So the feed is **an alternate collection template rendering JSON**, not an app
proxy. v3 will need its own `collection.cdc-json` view or an equivalent.

## Side diamond chooser (trilogy)

Gate: `enable_side_diamonds` AND tag `Trilogy Ring` AND `fye.side_stones.code`.
Rings without the metafield — the 8 tension trilogies and unmatched models —
behave like any other ring.

The chips are **variants of hidden "Trilogy Side Diamonds — &lt;quality&gt;"
products**, matched by SKU tail `-<code>` against the ring's `side_stones.code`.
Prices are read live off those products, so repricing side stones means editing
four products and never touches a ring.

It also sets `pb_hide_qual`: **the ring locks to its cheapest natural grade**
(the mount price) and the Diamond Quality row is hidden entirely, because the
sides now carry the grade. That is a behaviour change to the rest of the buy
box, not just an extra panel — miss it and the ring is priced twice.

"Supplied by You" adds the **Side Diamond Setting Fee** product
(`58739448938880`) — deliberately NOT the centre fee, because the cart
reconciler counts the centre fee by variant id and would strip a shared line.

If an add-on product is missing or a code has no variant, that chip simply does
not render and add-to-cart still works.

## Coloured stone rings

Tagged `coloured stone ring` / `Coloured Stones` with `filters.stone_type` set
to the gem (Aquamarine, Emerald…). Variants are the usual Metal × Diamond
Quality grid — the quality refers to the accent diamonds, not the centre gem.
No `fye.*`, so no chooser: the ring is complete as sold.

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

## What this means for the v3 build

Ordered by dependency:

1. **Template suffixes first.** `product.complete.json` at minimum, or complete
   rings get side-diamond controls they must not have.
2. **The diamond feed.** A `collection.cdc-json` alternate template on v3,
   returning shape/carat/colour/clarity/origin/certLab/variantId. Nothing else
   works without it.
3. **The buy box branch.** Centre panel, side panel, or neither — read from
   `fye.*`, exactly as live does.
4. **Multi-line add to cart.** v3 already posts two lines for engraving; this
   extends the same `/cart/add.js` call to four or five.
5. **The cart page** has to group and reconcile those lines, which is a
   separate piece of work from the product page.

## Open questions for Ed

- Are there other product template suffixes besides `product.complete.json`?
- Should the diamond picker be a modal as on live, or inline in the buy box?
  Live's modal is heavy; the carat window usually leaves few candidates.
- The `-SMT` suffix looks like a reliable semi-mount marker. Is it, or is
  `fye.centre_shape` the only trustworthy signal?
