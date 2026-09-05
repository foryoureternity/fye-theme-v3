# Image brief — Ring Matchmaker option tiles

For ChatGPT (or any image generator). Written 04/09/2026 for foryoureternity.com.
**35 images.** Paste the "Master prompt" section, then one row's prompt at a time.

---

## 1. What these images are for

The Ring Matchmaker asks a shopper a series of questions — ring style,
shoulders, band profile, diamond setting — and each answer is a **tile** they
click. Today most tiles are words alone. These images go on the tiles.

A tile is a **square**, shown at roughly 200–260px wide on a desktop screen and
about 150px on a phone. It sits in a grid of 3–4 identical tiles on a white
ground, and the shopper is comparing the tiles **to each other**. That is the
whole design problem: the images only work if the only visible difference
between them is the thing being chosen.

## 2. The one rule that matters most: mute the irrelevant part

Ed's instruction, and the reason these are generated rather than photographed:

> On a diamond-shoulder engagement ring, I want the central stone slightly
> blurred out or darkened.

So every image shows a **complete, believable ring**, with everything except
the feature in question pushed back:

- **the feature being chosen** — sharp, well lit, in focus;
- **everything else** — softened and dimmed, still clearly readable as part of
  the same ring.

How far to push it: reduce the muted area's brightness and contrast by about
**35%**, and apply a gentle blur of roughly **2–3px at 1200px** — enough that
the eye goes straight to the feature, not so much that the ring looks broken or
out of focus. Keep the same colour temperature: the muted part must read as
*the same ring in the same light*, not a different metal.

**Do not** use a vignette, a spotlight, a glow, an arrow, a circle, a callout,
a magnifier, or any highlight colour. The de-emphasis is the only signalling
device, and it must be identical across all 35 images.

## 3. Master prompt — the constant part

Put this at the top of every request, unchanged:

> A single fine jewellery ring, photographed straight-on at a slight
> three-quarter angle, centred in a square frame on a pure white background.
> Studio product lighting: soft, warm, even, one main light from the upper
> left, no hard shadows, no reflections of the studio, no props, no hands, no
> ring box, no text, no watermark. Platinum-white metal with a polished finish.
> Diamonds are colourless, brilliant, realistically faceted — never
> exaggerated, never sparkling with star flares. The ring occupies about 80% of
> the frame width and is fully inside the frame. Photorealistic, editorial,
> restrained. Square 1:1, 1200×1200px.

Then add the row's own sentence, then this closing line:

> Everything except [THE FEATURE] is softened: about 35% less brightness and
> contrast and a gentle 2–3px blur, in the same light and the same metal, so
> attention falls on [THE FEATURE]. No vignette, no spotlight, no highlight
> colour, no arrows or labels.

### Consistency is the deliverable

All 35 images must look like **one afternoon in one studio with one ring**.
Same angle, same crop, same light direction, same metal, same white. If two
tiles in a row look like different photographers, the grid reads as broken —
that is a worse outcome than words alone.

Practical way to get there: generate **one image first** (`Solitaire`), approve
it, then use it as a **style and angle reference** for every subsequent request
("same ring, same angle, same lighting as the reference; change only the
shoulders"). Do not start a fresh conversation halfway through a set.

---

## 4. The images

Filenames matter: they go straight into the theme, one per option line. All
lowercase, hyphens, `.png`.

### Set A — Engagement ring style (7)
Sharp: **the head and centre stone**. Muted: the band and shoulders.

| File | The ring to show |
|---|---|
| `rf-eng-style-solitaire.png` | One round brilliant diamond, four-claw setting, plain band |
| `rf-eng-style-halo.png` | Round centre stone encircled by one row of small diamonds |
| `rf-eng-style-hidden-halo.png` | Round centre stone with a halo of small diamonds set *beneath* it, visible only from the side |
| `rf-eng-style-double-halo.png` | Round centre stone encircled by two concentric rows of small diamonds |
| `rf-eng-style-trilogy.png` | Three diamonds in a row, the centre one largest |
| `rf-eng-style-multistone.png` | Five graduated diamonds in a row along the top of the band |
| `rf-eng-style-toi-et-moi.png` | Two stones of equal size side by side, angled towards each other |

### Set B — Engagement shoulders (3)
Sharp: **the shoulders — the band either side of the centre stone**.
Muted: **the centre stone and head** (this is Ed's example).

| File | The ring to show |
|---|---|
| `rf-eng-shoulder-plain.png` | Round solitaire on a completely plain, polished band |
| `rf-eng-shoulder-diamond-set.png` | Round solitaire with small diamonds running along both shoulders |
| `rf-eng-shoulder-split.png` | Round solitaire whose band divides into two strands as it approaches the stone |

### Set C — Wedding band profile (9)
Sharp: **the whole band, and especially its cross-section**. Nothing to mute —
the band is the entire subject.

**These need a different composition.** A profile is a cross-section, and a
three-quarter product shot cannot show it. Each image is the ring shown at an
angle where the **cut end of the band faces the viewer** — as if a short
section has been cut and turned towards camera — so the shape of the profile is
unmistakable. Keep the studio treatment identical to the rest.

| File | Profile shape |
|---|---|
| `rf-plain-profile-traditional-court.png` | Rounded outside, rounded inside, fairly deep |
| `rf-plain-profile-slight-court.png` | Gently rounded outside and inside, shallower |
| `rf-plain-profile-d-shape.png` | Rounded outside, flat inside — a capital D on its side |
| `rf-plain-profile-flat.png` | Flat outside, flat inside, square edges |
| `rf-plain-profile-flat-court.png` | Flat outside, rounded inside |
| `rf-plain-profile-edged-court.png` | Rounded outside and inside with a crisp chamfered edge either side |
| `rf-plain-profile-edged-flat-court.png` | Flat outside, rounded inside, crisp chamfered edges |
| `rf-plain-profile-concave.png` | Outside surface curving inwards, a shallow channel along the band |
| `rf-plain-profile-engagement-match.png` | A band with a shaped notch cut into it so an engagement ring sits flush |

> **Flag before you spend money on this set.** Nine profiles differ by
> millimetres of cross-section, and a generator will approximate them. If two
> of these come back indistinguishable, the theme's existing drawn
> cross-sections are the better answer — they are exact, and exactness is the
> entire point of the question. Generate `d-shape`, `flat` and
> `traditional-court` first and compare the three before commissioning the rest.

### Set D — Diamond band setting (10)
Sharp: **a section of the band showing how the diamonds are held**.
Muted: the rest of the ring curving away.

| File | The setting to show |
|---|---|
| `rf-diamond-setting-channel.png` | Diamonds sunk between two continuous metal walls |
| `rf-diamond-setting-grain.png` | Diamonds held by tiny raised beads of metal |
| `rf-diamond-setting-pave.png` | A dense field of small diamonds, metal barely visible |
| `rf-diamond-setting-claw.png` | Each diamond held by individual claws, light passing between |
| `rf-diamond-setting-rubover.png` | Each diamond fully surrounded by a rim of metal |
| `rf-diamond-setting-bar.png` | Diamonds separated by short vertical bars of metal |
| `rf-diamond-setting-french-cut.png` | Square-cut diamonds set edge to edge with V-shaped metal cut-outs beneath |
| `rf-diamond-setting-invisible.png` | Square diamonds set flush with no metal visible between them |
| `rf-diamond-setting-oyster.png` | Diamonds set into scalloped recesses along the band |
| `rf-diamond-setting-tension.png` | A diamond held by the pressure of the band alone, metal gripping two edges |

### Set E — Eternity coverage (2)
**No muting** — the coverage *is* the whole ring, so the whole ring is sharp.
Shown flat-on, face to camera, so the extent of the diamonds is readable.

| File | The ring to show |
|---|---|
| `rf-eternity-full.png` | Diamonds continuing the entire way around the band |
| `rf-eternity-half.png` | Diamonds across the front half only, plain polished metal behind |

### Set F — The opening fork (4)
Two journeys each open by asking whether to start from the setting or the
stone. These are the clearest possible use of the muting language: each image
mutes exactly what the shopper is *not* starting with.

| File | The ring to show |
|---|---|
| `rf-fork-eng-setting.png` | Complete engagement ring, **band and shoulders sharp**, centre stone muted |
| `rf-fork-eng-stone.png` | Complete engagement ring, **centre stone sharp**, band and shoulders muted |
| `rf-fork-diamond-setting.png` | Diamond-set band, **metal and setting sharp**, diamonds muted |
| `rf-fork-diamond-stone.png` | Diamond-set band, **diamonds sharp**, metal muted |

---

## 5. What is deliberately NOT in this brief

- **Gem cuts** (round, oval, pear, emerald, marquise…) — as agreed. Every
  jeweller shows cuts as outline diagrams, because a photograph of a pear ring
  shows its setting as much as its shape. The theme's existing diagrams stay.
- **Metals** (yellow, rose, white gold, platinum, palladium) — the theme draws
  the same swatches the product pages use. Five photographs of different rings
  would compare rings, not metals.
- **Stone types** (sapphire, ruby, emerald, opal…) — colour swatches, same
  reasoning. The theme already holds all sixteen.
- **Band width, weight, carat, centre-stone size** — a photograph cannot show
  2mm against 2.5mm, or Light against Heavy. Words are honest here.

## 6. Technical requirements

- **1200×1200px, square, PNG.**
- **Pure white background** (`#FFFFFF`) — the tiles sit on white and the ring
  must appear to float. No ivory, no grey, no gradient, no shadow on the ground.
- No text, logos, watermarks, borders or frames in the image.
- The ring fully inside the frame with even margin — not cropped at the edges.
- Same ring size and framing in every image, so the tiles do not appear to
  zoom in and out as the shopper scans the row.

## 7. Accepting the images

Lay each set out as a **row of squares on a white page at tile size** — about
220px each — and check:

1. Can you tell the options apart **at that size**, without reading the labels?
   If not, the image has failed regardless of how good it looks large.
2. Does your eye land on the feature being chosen, in every image, without
   being told?
3. Do the images in a row look like the **same ring**, the same metal, the same
   light?
4. Does anything look like a ring we do not sell? These sit next to real
   product photography, so a generated ring that reads as a real product is a
   trust problem, not just an aesthetic one. Keep them plainly illustrative:
   simple, clean, unbranded.

Reject and regenerate on any of the four. It is cheaper than shipping a grid
that reads as broken.

## 8. Handing them back

Upload the PNGs to **Shopify › Content › Files**, then send the filenames. Each
one goes on its option line in the theme editor:

    Solitaire | Solitaire | rf-eng-style-solitaire.png

One caveat to settle first: the tiles currently showing photographs pull a real
ring from stock, and they fill the whole square. The icon field renders smaller.
Before these go live the section needs a small change so a named file can fill
the same square a stock photograph does — otherwise generated images will
appear at half the size of the ones they replace. Ask for that when the first
approved set is ready; it is a few lines, not a rebuild.
