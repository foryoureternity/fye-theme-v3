# Handoff prompt — the loose stone product page (diamonds and gemstones)

Written 01/09/2026. Paste everything below the rule into a fresh chat. It is
written to be read cold.

---

## The job

Build `templates/product.diamond.json` and the section behind it for **For Your
Eternity** (foryoureternity.com, Shopify store `8psvse-ti`) — the product page
for a LOOSE STONE. UK English, £ GBP.

It is the **last product template** in the v3 rebuild and the largest by page
count: roughly **14,200 loose diamonds and 13,200 gemstones**, so about 27,000
pages hang off one file.

## Read these first, in this order

1. `docs/recreation-process.md` — the agreed working process. It exists because
   ignoring it cost a night.
2. `docs/conventions.md` — how code is written in this theme. Every session.
3. `docs/build-state.md` — what is built and what bit us. Read the 01/09/2026
   session in full; several of its gotchas apply directly here.

**How you read and write this repo:** it lives in Ed's Dropbox at
`/GIT-repositaries/fye-theme-v3/`. Write with `dropbox__create_file` (delete
first — it refuses an existing path), read with `dropbox__fetch`. **Ed** commits
and pushes; Shopify pulls from GitHub. You never run git. The old theme is
readable at `/GIT-repositaries/fye-shopify-theme/` — read it for structure,
never copy its code.

## Why this template is not just another branch of main-product

Every other product on this store is a RING. `main-product` branches on
`is_plain` and shares one buy box. A loose stone shares almost none of it:

| Rings have | A loose stone has |
|---|---|
| metal, carat, quality variants | **one SKU, one price** |
| ring size (70 variants, or a property) | nothing |
| engraving at £55 | nothing |
| oversize surcharge above size Q | nothing |
| centre / side stone choosers | nothing |

So the page is not a configurator. It is **certificate data, the 4Cs, and a
route into the mounts** — "set this stone in a ring". Build a new section rather
than adding a fourth branch to a 55KB file.

Live calls its section `fye-diamond-product` and its template also renders a
`product-recommendations` band with `show_cert_badges: true`. Read live's
version before designing: theme id `197353406848`, file
`sections/fye-diamond-product.liquid`.

## The data — verified 01/09/2026

Both **Loose Diamond** and **Loose Gemstone** use `templateSuffix: diamond`
(20/20 sampled each), so ONE template serves both. That is the first design
tension to resolve: a diamond is graded by the 4Cs, a sapphire is not.

Every stone carries `fye.*` metafields. All are `single_line_text_field` except
`carat` (`number_decimal`) and `video_url` (`url`):

| Key | Example | Applies to |
|---|---|---|
| `shape` | `Radiant`, `Asscher`, `Tapered Baguette` | all |
| `carat` | `1.02` | all |
| `colour` | `D`…`J` | white diamonds |
| `clarity` | `VVS2`, `SI1`, `I1` | diamonds |
| `cert_lab` | `GIA`, `IGI` | diamonds |
| `cert_number` | | diamonds |
| `origin` | `Natural`, `Lab-grown` | diamonds |
| `fluorescence` | | diamonds |
| `fancy_hue` | `Yellow` | fancy coloured diamonds |
| `fancy_intensity` | `Fancy Intense` | fancy coloured diamonds |
| `fancy_overtone` | `Brownish` | fancy coloured diamonds |
| `colour_shade` | | gemstones |
| `stone_family` | | gemstones |
| `gem_type` | | gemstones |
| `treatment` | | gemstones |
| `mine_origin` | | gemstones |
| `video_url` | | some |

**Handles encode the stone**, e.g.
`emerald-fancy-yellow-natural-diamond-0-23ct-vs2-8fd3e617`,
`asscher-yellow-natural-diamond-1-02ct-i1-60acd21f`. Do not parse them — the
metafields are authoritative. They are useful for spotting patterns only.

Collections worth knowing: `loose-diamonds` 14,244 · `gemstones` 13,196 ·
`natural-diamonds` 8,365 · `lab-diamonds` 5,879 · `fancy-diamonds` 11,358, plus
per-colour and per-shape splits (`fancy-yellow-natural-diamonds`,
`round-lab-grown-diamonds`, and so on — note the `natural` / `lab-grown`
asymmetry in those handles).

## What already exists that this page must agree with

**`templates/collection.cdc-json.liquid`** — the JSON feed the ring pages' stone
picker reads. It exposes exactly: `id variantId title price available sku url
image video shape carat colour clarity certLab certNumber origin`.

**`snippets/fye-buybox-centre.liquid`** — the picker modal. Its stone cards
already render a stone's identity: `stoneTitle()` in `fye-ui.js` composes
`shape + carat + colour + clarity`, and `stoneSub()` composes
`origin · certLab certified`.

> **These are the same stones.** A shopper meets a stone as a card in the picker
> and then as a page. The two must use the same words in the same order, or the
> stone appears to change identity. Reuse the vocabulary; do not invent a second
> one. If the page needs richer naming, change the picker to match.

There is no product card for stones yet — `snippets/product-card.liquid` is
built for rings ("Setting from £x" wording, square ring photography). Decide
whether a stone tile is a variant of it or its own snippet, and say why.

## ASK ED, DO NOT INFER

The standing rule on this project. It has cost real money twice: engraving was
written up as free when it is £55, and the oversize surcharge was applied to a
ring type it does not apply to. **Never infer a business rule — take it from Ed
or read it from the code.**

Ask before building:

1. **One page or two?** Diamonds and gemstones share a template suffix today.
   Does a sapphire get the same layout with different fields, or should the
   section branch hard on `gem_type` / product type?
2. **"Set this in a ring" — what does the button actually do?** Link to the
   semi-mount collection, filtered by this stone's shape? Start a cart with the
   stone in it? Open an enquiry? This is the page's whole commercial purpose and
   it cannot be guessed.
3. **Can a loose stone be bought on its own**, with a plain add to cart? Or is
   every stone an enquiry until it is paired with a setting?
4. **Certificate.** Is there a PDF or a lab URL to link to, or is
   `cert_number` display-only?
5. **What the 4Cs education should be.** Live has a guide library; does this
   page link into it, embed it, or neither?
6. **Fancy coloured diamonds.** `fancy_hue` + `fancy_intensity` +
   `fancy_overtone` compose a real grading phrase ("Fancy Intense Brownish
   Yellow"). Confirm the order and whether the D–J colour field should be
   suppressed on those stones — it is meaningless there, and the ring picker
   already drops it.
7. **Availability.** Rings are made to order, so `available: false` does NOT
   mean out of stock and the matching-band section deliberately ignores it. Is
   that also true of stones, or is a sold stone genuinely gone?

## Watch out for

- **A template naming a section type that does not exist breaks the theme
  editor.** Build the section first, push, THEN the template. When a template
  and its section change together, expect **two passes** — Shopify validates a
  JSON template against the schema it holds at that moment.
- **A GitHub-connected theme rejects invalid files silently.** No git error, no
  sync error; the file just stays at its previous version. Compare `size` on the
  theme against Dropbox. `themeFilesUpsert` through the Shopify MCP is the only
  thing that surfaces the actual message — use it to READ the error, then fix
  the source and push. Do not leave the API-written copy as the fix.
- **A stale compiled stylesheet looks exactly like a fix that did not work.**
  Shopify concatenates every `{% stylesheet %}` into one compiled file. For a
  CSS change, verify with a resolved custom property in the console, not a
  screenshot.
- **`0 == blank` is false in Liquid**, `nil == blank` is true. Any metafield
  that can be missing needs a zero guard too, or "0ct" renders as though real.
- **27,000 pages means `all_products` and heavy loops are dangerous.** The
  `all_products` cap is 20 unique handles per page.
- **Pre-flight, thirty seconds:** does v3 have the template JSON as well as the
  section? Does the page depend on an app embed live has enabled and v3 does
  not (`config/settings_data.json` — 519 bytes means none are on)?

## Definition of done

- A loose diamond page renders: media (image, and the 360/video where
  `video_url` exists), the stone's identity in the SAME words the picker uses,
  the 4Cs, certificate, price, and the agreed primary action.
- A gemstone page renders correctly with no empty 4Cs rows — a sapphire has no
  clarity grade and must not show a blank one.
- A fancy coloured diamond shows its hue/intensity phrase and no D–J colour.
- Nothing renders as an empty labelled row. Absent data means an absent row.
- Works with JavaScript disabled for everything except genuinely interactive
  parts.
- `fyeSmoke()` clean at 1440 / 899 / 748 / 559.
- `docs/build-state.md` updated with a session block: what was built, decisions
  taken, gotchas earned, what is outstanding.
