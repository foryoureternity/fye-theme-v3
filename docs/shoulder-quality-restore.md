# Restoring shoulder Diamond Quality on the 8 diamond-shouldered trilogies

Written 31/08/2026. Ed's decision: restore the variant option rather than build
a third add-on panel. **No theme work is needed** — `fye-buybox-eternity` finds
the quality option by name and renders the row the moment it exists, and
`main-product`'s price maths already treats it as the variant axis, independent
of the centre stone and the side pair.

So this is a PRODUCT DATA job, and everything below is the data it needs.

## Why the option is missing

It used to grade the SIDE stones. When side stones moved onto their own cart
line (Ed, 20/08/2026 — live's W333), the option was removed from the trilogy
products. On the diamond-SHOULDERED trilogies that quietly took the shoulder
grading with it, because the same option was doing both jobs.

Measured 31/08/2026:

| | Options on the product |
|---|---|
| Trilogy semi-mounts (12 of 12 sampled) | Metal only |
| Engagement semi-mounts (6 of 6 sampled) | Metal + Diamond Quality |

Live has the same gap — confirmed by reading live's own rendered page for
`trl6462-smt`. This is not a v3 regression.

## The 8 rings, and what they cost today

251 trilogy rings; 8 carry a diamond-shouldered tag. Current prices are ONE per
metal, five variants each.

| Handle | Platinum | 18k | 14k | 9k | Palladium |
|---|---|---|---|---|---|
| `trl20538-smt` | 1,299.50 | 1,667.50 | 1,230.50 | 793.50 | 816.50 |
| `trl21841-smt` | 2,553.00 | 2,886.50 | 2,461.00 | 2,047.00 | 1,978.00 |
| `trl24453-smt` | 2,196.50 | 2,484.00 | 2,127.50 | 1,782.50 | 1,736.50 |
| `trl26696-smt` | 1,288.00 | 1,679.00 | 1,219.00 | 759.00 | 770.50 |
| `trl34620-smt` | 1,104.00 | 1,380.00 | 1,046.50 | 701.50 | 655.50 |
| `trl4942-smt` | 1,598.50 | 2,093.00 | 1,495.00 | 897.00 | 943.00 |
| `trl55311-smt` | 2,472.50 | 3,197.00 | 2,346.00 | 1,495.00 | 1,391.50 |
| `trl6462-smt` | 1,932.00 | 2,449.50 | 1,805.50 | 1,150.00 | 1,207.50 |

Grades chosen by Ed: **D/E VVS, F/G VS, G Si, H Si, Lab-grown D VVS** — five.
So 5 metals x 5 grades = **25 variants per ring, 200 in total** (20 new per
ring; the 5 existing keep their variant IDs and gain a grade).

Note: engagement semi-mounts carry FOUR grades (no Lab-grown). These 8 would
offer one more than the rest of the catalogue. Deliberate, per Ed 31/08/2026 —
the description on these rings already promises all five.

## The reference ladder, measured

From `eng33980-smt`, an accent-shouldered semi-mount whose quality option does
the same job. Read 31/08/2026.

| Metal | D/E VVS | F/G VS | G Si | H Si |
|---|---|---|---|---|
| 18k Gold | 2,093.00 | 1,886.00 | 1,736.50 | 1,506.50 |
| Platinum | 1,851.50 | 1,656.00 | 1,518.00 | 1,311.00 |
| 14k Gold | 1,633.00 | 1,472.00 | 1,345.50 | 1,161.50 |
| 9k Gold | 1,196.00 | 1,058.00 | 954.50 | 805.00 |
| Palladium | 1,127.00 | 989.00 | 885.50 | 747.50 |

As a fraction of D/E VVS:

| Metal | F/G VS | G Si | H Si |
|---|---|---|---|
| Platinum | 0.894 | 0.820 | 0.708 |
| 18k Gold | 0.901 | 0.830 | 0.720 |
| 14k Gold | 0.901 | 0.824 | 0.711 |
| 9k Gold | 0.885 | 0.798 | 0.673 |
| Palladium | 0.878 | 0.786 | 0.663 |

**It is near-proportional but not proportional.** The spread across metals says
the price is metal cost plus a marked-up stone cost, not one multiplier — so a
single percentage applied to all eight rings would be wrong, and wrong in a
direction that varies by metal. Hence the decisions below rather than a formula
invented here.

**Lab-grown reference.** No lab grade exists on the engagement semi-mounts. The
closest measured figure is the trilogy SIDE-stone add-on products, where
Lab-grown D VVS is 520.00 against D/E VVS 1,090.00 — a factor of **0.477**.
That is side stones, not shoulders; it is a reference, not a rule.

## WHAT IS NEEDED FROM ED

Five things. The first is the one that decides whether this raises or lowers
revenue, so it cannot be guessed.

1. **Which grade does today's price represent?**
   `trl6462-smt` Platinum is £1,932.00 right now. If D/E VVS is entered at
   £1,932.00 and the lower grades sit beneath it, most customers pay LESS than
   today. If today's price is treated as the CHEAPEST grade, everyone choosing
   better pays MORE. Same question, all 8 rings.

2. **The 25 prices per ring** — either as figures, or as a rule to apply:
   - a per-grade factor per metal (the measured table above, approved as-is), or
   - your own cost model (metal weight + shoulder carat + markup), which is the
     right answer if the numbers above were themselves generated.

3. **The Lab-grown D VVS price.** Nothing in the shoulder data establishes it.
   0.477 of D/E VVS is the side-stone figure; confirm or replace.

4. **SKU convention for the new variants.** Today: `TRL6462-SMT-PT`. With a
   grade axis it presumably becomes `TRL6462-SMT-PT-DEVVS` or similar. This
   matters beyond tidiness — the side-stone chips match add-on variants by SKU
   TAIL, and the workshop reads SKUs off orders. Give me the pattern.

5. **Inventory policy.** The existing variants are untracked / continue-selling,
   which is why everything shows available. New variants must match, or 20 of
   every 25 will render unavailable.

## How it gets applied, once those are answered

The Shopify connection can do it — `productOptionsCreate` to add the option,
then `productVariantsBulkCreate` for the 20 new combinations per ring, priced
from the agreed table. 8 products, one pass, and it can be verified by
re-reading the variant grid afterwards.

**It is a write to 8 live products, so it does not happen without Ed saying go.**
Nothing in this document has been applied.

Order of work, so nothing is half-done:
1. Ed answers the five questions above.
2. Prices entered into a table in this file, so the intended state is written
   down before anything is changed.
3. Mutations run per product, verified against that table.
4. Re-read `trl6462-smt` on v3: the quality row appears with no theme change.
5. Fix the description copy on any ring whose promised grades still differ.
