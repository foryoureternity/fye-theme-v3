# Handoff prompt — build the trilogy side-diamond rate card from Nivoda

Written 31/08/2026 for a Claude Code session. Paste everything below the line
into that session. It is written to be read cold, with no memory of tonight.

---

## Who you are and what you are doing

You are working on **For Your Eternity** (foryoureternity.com, Shopify store
`8psvse-ti`), a UK ethical fine-jewellery retailer. Prices are £ GBP, spelling
is UK English.

**Objective:** build a defensible RATE CARD for trilogy side diamonds, sourced
from Nivoda cost data, and output it as a Shopify-importable CSV that replaces
the prices currently sitting on four hidden add-on products.

You are NOT changing any theme code. This is a pricing-data job.

## Why it needs doing

On a trilogy ring the customer picks a matched PAIR of side diamonds as a
separate cart line. The four choices are variants of four hidden products:

```
trilogy-side-diamonds-devvs    "Trilogy Side Diamonds - D/E VVS"
trilogy-side-diamonds-fgvs     "Trilogy Side Diamonds - F/G VS"
trilogy-side-diamonds-gsi      "Trilogy Side Diamonds - G Si"
trilogy-side-diamonds-lab      "Trilogy Side Diamonds - Lab-grown D VVS"
```

The product page reads the price LIVE off the matching variant. So repricing
side stones is a data edit to four products and never touches a ring — the
mechanism is good. **The numbers are not.** Audited 31/08/2026 and the current
table is internally inconsistent. Real examples, all D/E VVS:

| Defect | Evidence |
|---|---|
| Bigger pair cheaper than smaller | Round 0.15ct £293.50 vs 0.12ct £305.00 |
| | Oval 0.30ct £1,146 vs 0.50ct £1,034 vs 0.65ct £980 |
| | Cushion 0.50ct £1,348 vs 0.80ct £1,334 |
| | Radiant 0.50ct £1,238 vs 0.60ct £934 |
| | Princess 0.50ct £1,118 vs 0.60ct £1,090 |
| Grade ladder inverted | Oval 0.20ct: D/E VVS £314 but F/G VS £445.50 |
| | Radiant 0.60ct: D/E VVS £934 but F/G VS £1,118 |
| Cliff then plateau | Round: 0.20ct £309.50 → 0.22ct £806 (+160% for 0.02ct), then £806 flat to 0.35ct |
| No consistent grade spread | D/E VVS → F/G VS ranges 0.67 to 1.42 across codes |

Only D/E VVS and F/G VS were audited. **Audit G Si and Lab-grown yourself
before rebuilding** — assume they have the same class of problem.

## The data model — SKU grammar

```
FYE-SIDES-<GRADE>-<CUT>-<PAIRCT>

GRADE   DEVVS | FGVS | GSI | LABDVVS
CUT     RB round brilliant · PR princess · OV oval · PE pear
        EM emerald · CU cushion · RA radiant
PAIRCT  pair carat total, x100, zero-padded to 3
        050 = 0.50ct TOTAL for the pair
```

The ring finds its chip by matching the SKU **tail** against its own
`fye.side_stones` metafield:

```json
{"cut": "Princess", "pair_ct": 0.6, "code": "PR-060"}
```

**PAIRCT IS THE PAIR TOTAL, NOT THE STONE.** A `PR-060` pair is two princess
diamonds of ~0.30ct each. Nivoda prices per stone, so a pair price is roughly
two single-stone costs plus a matching premium — see the questions below before
assuming anything about that premium.

## Where the truth lives

1. **Which codes are REQUIRED** — derive from the rings, not from the existing
   add-on products. Query every product with the `Trilogy Ring` tag and collect
   the distinct `fye.side_stones.code` values. A code that exists on a ring but
   not on all four add-on products means that ring silently loses a chip; a code
   on the add-ons that no ring uses is dead weight. Report both sets.
2. **Costs** — Nivoda. Establish how the account is queried (API, feed export
   or dashboard download) and say which you used. Do not guess at their schema;
   read it.
3. **Everything else** — Ed. See the next section.

## ASK ED, DO NOT INFER

This is the standing rule on this project and it has already cost real money
twice. Engraving was written up as "free of charge" on an assumption when it is
£55, and the oversize surcharge was applied to a ring type it does not apply
to. **Never infer a business rule. Take it from Ed or read it from the code.**

Specifically, you need from Ed before you can price anything:

1. **The markup rule.** Nivoda cost → retail. One multiplier, a banded one, or
   cost plus a fixed setting charge? Does it differ by grade or by cut?
2. **The matched-pair premium.** Two stones cut and graded to match cost more
   than two arbitrary stones. Is that a percentage on top, a flat amount, or
   already inside the markup?
3. **The grade → 4Cs mapping.** The names imply it, but implication is not
   instruction. Confirm: `D/E VVS` = colour D–E, clarity VVS1–VVS2;
   `F/G VS` = F–G, VS1–VS2; `G Si` = G, SI1–SI2;
   `Lab-grown D VVS` = lab-grown, D, VVS1–VVS2.
4. **Rounding.** Every price in this catalogue ends `.00` or `.50`. Confirm that
   is the rule and whether it rounds up, down or nearest.
5. **Floor and ceiling.** Is there a minimum pair price regardless of carat, and
   should very large pairs (RA-200 is currently £7,240) be priced on the card at
   all or moved to enquiry?
6. **What happens to codes with no Nivoda supply.** Price from the nearest
   carat, or drop the chip so the ring shows only the grades we can actually
   deliver?

## Acceptance tests — the rebuilt card must pass all of these

Write these as assertions and run them against your own output before handing it
over. This is the point of the exercise: the current table fails four of them.

1. **Monotonic in carat.** Within one cut and one grade, price never falls as
   pair carat rises.
2. **Grade ordering.** For every `CUT-PAIRCT`, price is
   `D/E VVS ≥ F/G VS ≥ G Si` and `Lab-grown D VVS` is below all three.
3. **No unexplained plateaus.** Two different carats may share a price only
   where Ed's rule says they should (e.g. a banded rate card). If bands are
   intended, say so and show the bands.
4. **No cliffs.** No step greater than a factor Ed agrees, so 0.20ct → 0.22ct
   cannot jump 160%.
5. **Complete coverage.** Every code used by any trilogy ring exists on all
   four add-on products.
6. **Rounding.** Every price ends `.00` or `.50`.

## Deliverables

1. `docs/side-diamond-rate-card.md` — the rules, in words: the markup, the pair
   premium, the 4Cs mapping, the bands, the rounding, and Ed's answers to the
   six questions above, each attributed and dated. Anyone should be able to
   regenerate the card from this document alone.
2. `side-diamond-prices.csv` — Shopify variant import. Same shape as the
   shoulder-quality CSV already produced for this store:
   ```
   Handle,Option1 Name,Option1 Value,Variant SKU,Variant Price,
   Variant Inventory Tracker,Variant Inventory Policy,
   Variant Requires Shipping,Variant Taxable
   ```
   Inventory untracked, policy `continue` — matching the existing variants, or
   the new rows will render unavailable.
3. **A change report.** Old price vs new price for every variant, with the
   biggest movers first, and a total. Ed needs to see what this does to margin
   and to the shelf price before it goes anywhere near the store.
4. **A note on what you could not resolve.** Codes with no Nivoda match, cuts
   where the data was thin, anything you had to leave as-is.

## Rules of engagement

- **Write the intended state down before changing anything.** The rate card
  document and the CSV come first; the store is edited afterwards, from them.
- **Do not write to the store without Ed's explicit go.** These are live
  products on a live storefront. Reading is free; writing is not.
- **Verify after writing.** Re-read the variant grid and diff it against the
  CSV. A success response proves the request was accepted; it does not prove the
  data is right.
- **If a number cannot be justified from Nivoda cost plus an agreed rule, do
  not put it on the card.** Flag it and move on. A gap Ed can see is worth more
  than a plausible figure nobody can reproduce.
