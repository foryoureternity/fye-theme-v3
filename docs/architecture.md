# FYE v3 — architecture

Standalone Shopify theme. No T4S/Kalles inheritance. Rebuilt August 2026.

## Decisions (signed off 26/08/2026)

| Decision | Choice |
|---|---|
| Visual target | Design-system styling, existing page layout and structure preserved |
| Headings | Tenor Sans, UPPERCASE, tracked — every heading, sitewide |
| Body | Outfit 300/400 |
| `--sect-y` | **80px** (64 under 900px, 52 under 560px) |
| Band rhythm | Per-page, chosen to suit content. Max 2 background colours per page. |
| CSS delivery | Normal cached asset files (the old theme's /assets/ CDN staleness was theme-specific) |
| Guide popups | Consolidate 11 near-identical sections into one + a `form_id` setting |
| Wishlist | **Keep** — currently working, via `templates/search.wishlist.liquid` |
| Compare / back-in-stock | Not carried over unless found referenced |
| Dropped templates | `page.edu-test-page`, `page.zz-form-testing`, `page.faq-2`, `search.mn` |
| Section type names + setting IDs | **Frozen** — byte-identical to the old theme so existing JSON templates keep working |

## The seven rules

1. **One core stylesheet.** `assets/fye-core.css` is the only file that defines a
   colour, spacing value, type size or breakpoint.
2. **No section sets its own vertical padding.** Structure is always
   `.fye > .band.band--{white|ivory|mist|teal|sage} > .wrap`. Padding comes from
   `--sect-y`. A tighter rhythm sets the variable, never a `padding` declaration.
3. **Section CSS lives in the section**, in its `{% stylesheet %}` block, always on
   a chained root class (`.fye.fye-cards`, never `.fye-cards`). No per-section
   files in `assets/`.
4. **No overrides snippet.** It existed to out-cascade T4S. There is no T4S.
5. **One icon snippet**, ~20 inline SVGs, 1.3px outline stroke.
   `{% render 'icon', name: 'search' %}`
6. **Vanilla JS, loaded where needed.** No jQuery, no bootstrap, no 535KB core.
7. **Never key a selector to `template--<digits>`.** Shopify regenerates it on every
   theme duplication. This broke the old theme nine times.

## Contrast

Two text levels per ground — full and soft. **No third "faint" level.** If
something must recede further, make it smaller or give it more space, never
lighter. Two faint tokens were removed on 26/08/2026 after measuring 2.49:1 on
mist and 2.25:1 on sage.

Never state a contrast ratio you have not calculated. An unverified figure in a
token block misleads every later decision.

### Deviation from the brand book — sage band ground

The brand book specifies **Sage Green Deep `#6E836E`** as the ground for solid
accent bands, "so ivory/white type keeps AA contrast". Measured, it does not:

| Text on `#6E836E` | Ratio | AA (4.5:1) |
|---|---|---|
| Full ivory `#F2F1E8` | 3.61:1 | fail |
| `--on-dark-soft` (86%) | 3.11:1 | fail |
| `--sage-grey` `#C8CDC7` | 2.53:1 | fail |

That ground cannot carry text at any opacity. So:

- **`--sage-band: #5A6B5A`** is the accent band ground. Full ivory = **5.0:1**.
- **`#6E836E` is kept unchanged** as `--sage-deep`, the pressed/active state,
  where it is only ever a background behind a large button label.
- **Sage bands have one text level**, full ivory. `--ink-soft` resolves to
  `--on-dark` there; the 86% soft level measures 4.2:1 and must not come back.
- **Link hover differs by band.** On teal, `--sage-grey` measures 7.1:1 — safe,
  and keeps the brand's sage shift. On sage it measures 3.5:1, which would make
  the *interactive* state the least readable thing on the band, so sage bands
  keep full ivory and signal hover with an underline.

Reverse this if the brand book is updated — it is one token.

### Measured reference

| | full | soft (72% / 86%) |
|---|---|---|
| on white | 8.9:1 | 6.0:1 |
| on ivory | 8.2:1 | 5.5:1 |
| on mist | 6.7:1 | 4.5:1 (at the limit) |
| on teal | 10.1:1 | 8.0:1 |
| on sage-band | 5.0:1 | 4.2:1 — not used |

## Carried forward from the old theme

These are fixes already paid for once. See the old repo's `CLAUDE.md`.

- **`request.page_type` is blank at `/a/search`** (xCloud app-proxy filter pages).
  One helper resolves page type; every consumer uses it. No repeated fallbacks.
- **App blocks need section groups.** Shopify Forms blocks cannot live in a
  statically rendered section — hence the guide popups group. Keep that shape.
- **The 25-section ceiling.** Long guide pages are already at Shopify's limit;
  sections must stay generous enough not to force new ones.
- **Background-tab measurement trap.** `getComputedStyle` returns stale values in a
  hidden tab. Force a render (screenshot/zoom) before believing any measurement.
- **`?preview_theme_id=` sets a sticky cookie.** Clear with an empty value.
- **Mauve → sage mapping.** `#9987AB` → `#879b87`, `#9987ab` → `#6e836e`,
  `rgb(153,135,171)` → `rgb(135,155,135)`.
- **Do not revive `fye-parked-superseded.css`** — it hides the Book Consultation
  button on `/pages/wedding-rings` and `/pages/eternity-rings`.

## Known dead in the old theme

- `collection.engagment.json` (typo) and `collection.wedding.json` are assigned to
  no collection — both ring collections render the default collection template.
  ~150KB of template that renders nowhere.
- 94 sections referenced by no template, layout or snippet (measured against 70
  templates; being re-verified against the full ~140).
- 5 of 6 headers: `settings.header_design` is `"bottom"`, so only `header-bottom`
  ever renders. `mega-menu` renders only under `request.design_mode`.
- `mini_cart`: `settings.cart_type` is `"disable"`.

## Open items

- **Fonts.** Tenor Sans + Outfit need Google Fonts or self-hosted woff2 uploaded
  through Shopify admin (binary files can't be written into the repo from here).
- **`settings_schema.json`.** Sections being kept read `settings.*` values defined
  by T4S. Every one needs a home in the new schema or a hard-coded replacement.
  Most likely source of blank-looking pages on first preview.
- **`custom-liquid` × 27.** Hand-pasted HTML blocks with their own inline padding.
  Each needs reading and folding into a real section. Biggest single job.
- **Popup styling.** All 11 guide popups use Forms defaults (`#202020`, links
  `#1878B9`). Should take FYE teal/ivory.
