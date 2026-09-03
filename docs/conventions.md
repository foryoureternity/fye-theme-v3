# FYE v3 — code conventions

## NEVER ADD A SHIM TO SATISFY AN APP THAT STILL SPEAKS T4S

The whole point of v3 is to be free of T4S. An app that renders Liquid into
the theme can still reference T4S furniture, because its template was
configured against the old theme — and when it does, the temptation is to add
the missing snippet to v3 so the app stops erroring.

**Don't.** That drags the old theme's shape back in through the side door, and
the shim then has to be maintained forever with nothing in v3 using it.

Happened on 02/09/2026: the cloud-search app's results page at `/a/search`
called `snippets/product-img.liquid` and emitted `t4s-*` classes. A shim
snippet and a set of `search.*` locale keys were added to make it render,
then both were **deleted the same day** once Ed pointed out the obvious. The
right answer was that nothing in v3 links to that page.

The order to try, when an app wants T4S:
1. Does anything in v3 actually route to it? Often not — check first.
2. Can the app be reconfigured to render our markup, in its own admin?
3. Can the feature be switched off and the app kept for what it is good at?
4. Only then, and with a reason written down, a shim.

**Read this before writing a single line in this theme.** It exists so that a
section written in six months' time is indistinguishable from one written on day
one. Where this document and a personal preference disagree, this document wins.

Companion files: `build-state.md` (what is built, what is next),
`architecture.md` (why the structure is as it is),
`section-usage.md` (what the old theme actually renders).

---

## 1. File anatomy

Every section file, in this order, with nothing else between:

```liquid
{%- comment -%}
  <name> — <one line on what it is>

  <How many templates use it, if it is a port.>
  <What changed from the old theme, and why. Measured values, if any.>
  <Anything a future editor would otherwise break.>
{%- endcomment -%}
{%- liquid
  assign s = section.settings
  ... all computation here, none in the markup ...
-%}

<section class="band band--ivory" data-screen-label="Human name">
  ...
</section>

{% stylesheet %}
...
{% endstylesheet %}

{% schema %}
...
{% endschema %}
```

Rules:

- **One `{%- liquid -%}` block at the top does all the thinking.** Markup
  contains lookups and loops, never arithmetic, string building or branching
  beyond a simple `if`.
- **`{% stylesheet %}` and `{% schema %}` at the bottom, in that order.** Never
  a `<style>` tag, never an external per-section CSS file, never
  `{{ 'thing.css' | asset_url | stylesheet_tag }}`. Shopify concatenates
  `{% stylesheet %}` blocks into one file — that is the whole point.
- **`{% javascript %}` blocks are not used.** All JS lives in
  `assets/fye-ui.js`. See §6.
- No `<script>` tag inside a section, ever.

## 2. Naming

**Section and snippet filenames are frozen.** They keep the old theme's names
exactly — `heading-template`, `main-page`, `header-bottom`, `about_us`,
underscores and inconsistencies and all — because the JSON templates reference
them by type name. A rename means re-entering content by hand on every page.
The same applies to **block type names** (`"1"`, `"2"`, `mega`, `base`, `links`)
and **setting IDs**.

New files, where nothing constrains us: lowercase, hyphenated,
`fye-` prefix for FYE-original sections (`fye-hero`, `fye-cards`).

**CSS classes** are BEM-lite on a short section prefix:

```
.hdr            .hdr__contact-link          .hdr__nav-link.is-active
.ftr            .ftr__head   .ftr__head--sm
.pbanner        .pbanner__title             .pbanner--image
```

- Prefix is an abbreviation of the section, 3–8 characters. One per section.
- `__element`, `--modifier`, `.is-state` for runtime state.
- Never a utility soup of single-purpose classes. Never a class that names an
  appearance (`.blue-box`, `.mt-40`) — name the role.
- Shared vocabulary lives in `fye-core.css` and is used unprefixed:
  `.band`, `.wrap`, `.btn`, `.card`, `.panel`, `.grid`, `.stack`, `.row`,
  `.eyebrow`, `.lead`, `.prose`, `.sect-head`, `.heading-flank`, `.icon`,
  `.crumbs`, `.visually-hidden`. **Check this list before inventing anything.**
- **Core earns an addition only when two or more sections share it.** One
  section's internals belong in its own `{% stylesheet %}` block, however
  tempting the generality. If a shared implementation is later deleted, its
  vocabulary comes out of core with it — core does not accumulate.

## 3. CSS

- **`assets/fye-core.css` is the only file that defines a colour, spacing value,
  type size, breakpoint or duration.** Sections consume `var(--*)`. A section
  that needs a value not in the token set either uses the nearest token or the
  token set gains it — never a stray literal.
- **The one exception is measured chrome.** Header and footer were matched
  pixel-for-pixel against the live site, so they carry literals with the
  measurement recorded in a comment. That licence extends to nothing else.
- **Selectors are `.fye .thing`.** Base rules in `fye-core.css` are wrapped in
  `:where()` so they carry zero specificity; a section overrides them by simply
  stating intent. Two classes is the ceiling. No `!important`, no `#id`, no
  `>`-chains three deep.
- **Never key a selector to `template--<digits>` or `.shopify-section-<id>`.**
  Both are regenerated when a theme is duplicated. This broke the old theme
  nine times. A section's own **schema `class`** is stable and is fair game.
- **No vertical padding in sections.** Rhythm comes from `--sect-y` via
  `.band`. A section wanting a tighter rhythm sets the *variable*
  (`.band--tight`), never a `padding` declaration.
- **Sibling spacing is `gap`, not margins.** `display: flex` / `grid` with
  `gap:` — never `margin-right` on every child, never `:last-child` resets.
- **Three breakpoints. That is the whole set:**
  `900` grid collapse · `749` tables · `560` full stack.
  Neighbouring sections must reflow at the same points. A fourth breakpoint
  means the layout is wrong, not that the set is too small.
- Squared corners: `--radius: 0`. Do not add a border-radius.
- Structure is carried by hairlines (`var(--hairline)`), not shadows.
- Motion: `var(--dur)` / `var(--ease)`, colour and opacity only. No bounce, no
  springs, no infinite loops. Respect `prefers-reduced-motion` — `fye-core.css`
  already does globally.
- Inline `style=""` in markup is allowed **only** for a value Liquid computes
  at render time and CSS cannot know: a background image URL, a percentage
  overlay, a grid column count. Never for a static colour or spacing value.
- **One set of markup per component, whatever the viewport.** If a component
  looks like two different things at two widths — a column and a drawer, say —
  that is a CSS job. Never render the same content twice and hide one copy.

### Colour and contrast

Two text levels per ground — full (`--ink` / `--on-dark`) and soft
(`--ink-soft` / `--on-dark-soft`). **There is deliberately no third level.** If
something must recede further, make it smaller or give it more space; never
lighter.

Before putting text on a new ground, compute the ratio by compositing in sRGB.
Do not quote a figure you have not calculated — an unverified number in a
comment misleads every later decision. Body text needs 4.5:1. The measured
figures for every existing pairing are in `fye-core.css`.

## 4. Liquid

- Whitespace control on every tag that isn't emitting content: `{%- -%}`.
- `assign s = section.settings` at the top; then `s.thing`. Same for
  `b = block.settings` inside a long loop.
- Use `default:` rather than an `if` for fallbacks: `s.heading | default: page.title`.
- `{{ block.shopify_attributes }}` on **every** block wrapper. Without it the
  theme editor cannot select or reorder that block.
- `data-screen-label="Human name"` on each section's root element.
- Images: always `image_url: width: N` with an explicit width, then
  `image_tag`. `loading: 'eager'` above the fold, `'lazy'` everywhere else.
  Never a bare `{{ image.src }}`.
- Money: `| money`. Never hand-formatted. Never a hardcoded `£`.
- Text a shopper can read comes from a setting or a locale key, never a literal
  in the markup — except where the string is structural (`Home` in a
  breadcrumb).
- `{% render %}` only. Never `{% include %}` (deprecated, leaks scope).
- Snippets take explicit named parameters. A snippet that reaches for
  `section.settings` from inside is a bug.

## 5. Schema

- Settings in the order a human configures them: content first, then layout,
  then background, then advanced. `{ "type": "header" }` to group.
- **Labels are sentence case, UK English.** "Background image", not
  "Background Image" or "+ Background image".
- `info` only where the control is genuinely ambiguous. Not on every field.
- **Expose the minimum that a human needs.** The old theme's failure mode was
  a section exposing font family, size, line-height, weight, tracking, italic,
  uppercase, shadow and margin — desktop and mobile separately — on every block.
  Forty-seven pages each setting those independently is what "inconsistent"
  means. Typography and rhythm come from the design system, not the customiser.
- **Dropping a setting is safe; renaming one is not.** Shopify ignores settings
  left in a JSON template that the schema no longer declares, so a control that
  should never have existed can simply go — say so in the file comment. Setting
  IDs that remain keep their old names, exactly.
- Offer a **palette choice**, never a free colour picker. `select` with
  ivory / white / mist / teal, not `{ "type": "color" }`.
- No custom-CSS textarea. No custom-HTML box.
- Every section that can be added freely gets a `presets` entry.
- Ranges: sensible `step`, always a `unit`.
- **Filters cannot be chained inside a filter ARGUMENT.** This looks reasonable
  and is not:

      {{ img | image_tag: style: s.focal | default: 'center' | append: ';' }}

  Liquid takes `style: s.focal` as the argument, then applies `default` and
  `append` to the OUTPUT OF `image_tag` — so the literal text wraps the whole
  `<img>`. On 02/09/2026 that printed "object-position:" above Edward's
  photograph on the About page and ";" below it. No error, just CSS rendered as
  prose. Build the value with `capture` or `assign` first, then pass one
  variable.
- **An SVG cannot go through `image_url` or `image_tag`, and `image_picker`
  will not offer one.** So a section that needs to render an SVG from Content
  › Files takes the filename as a `text` setting and resolves it with
  `file_url`. This is why `fye-shape-tiles` exists rather than the diamond
  shapes being composed from `fye-cards`, whose icon slot is an image picker
  and physically cannot render icon101.svg. Prefer `file_url` over a hardcoded
  `foryoureternity.com/cdn/...` URL: same file, resolved by Shopify, survives
  a domain change and a store copy. `snippets/mm-shapes.liquid` still has the
  hardcoded form and should move when next touched.
- **A patch script's guard must name the CHANGE, not the selector.** On
  03/09/2026 a script guarded on `.fye .xref__cta {` before adding a
  `min-height` to it. That selector already existed as a one-line margin
  rule, so the script reported "already present" and the fix never landed,
  while the tree stayed clean and the push reported nothing to commit. Guard on
  the property or value being introduced (`min-height: 44px;`), which is false
  until the work is actually done. The selector guard is still right for
  preventing a duplicate rule block; it is wrong as proof of completion.
- **A range value in a JSON template MUST sit on the step grid.** A `range`
  with `"step": 2` accepts 44 and rejects 45, and the rejection takes the
  WHOLE TEMPLATE with it — silently, with the file simply staying at its
  previous version. `templates/blog.json` and `templates/page.past-pieces.json`
  were both refused twice on 01/09/2026 for a single `"overlay": 45`, which
  read exactly like the two-pass template/section ordering problem and is not
  it. When a template is refused and its sections are present, check every
  range value against its schema's step before assuming anything about
  ordering. Same class of fault as a `unit` longer than three characters.

## 6. JavaScript

- **One file: `assets/fye-ui.js`.** No per-section scripts, no inline
  `<script>`, no `{% javascript %}` blocks.
- Vanilla. No jQuery, no framework, no build step. The old theme's 535KB T4S
  core is what we are removing.
- **Everything is delegated from `document`**, so markup added later — a
  section re-render in the theme editor, an AJAX load — works without
  re-binding. Add behaviour as a small named function inside the existing
  click/keydown listeners.
- Hooks are `data-fye-*` attributes, never classes, never IDs:
  `data-fye-drawer`, `data-fye-drawer-open`, `data-fye-top`, `data-fye-toggle`.
  CSS classes are for styling; data attributes are for behaviour.
  **This is not a style preference.** The old theme opened popups from CLASSES
  (`open-design-your-own`), and `fye-media-text` faithfully ported the setting
  that carried them. Nothing in v3 listens for a class, so the homepage's
  "Start a bespoke enquiry" button rendered perfectly and did nothing at all
  for a week. A ported class hook is a dead hook until something emits the
  data attribute beside it.
- **Popups are one section, `fye-popups`, in `footer-group.json`** — so a
  single copy exists on every page. Anything with `data-fye-popup="<key>"`
  opens the block whose `key` matches; the trigger and the key must be changed
  in the same pass or the button silently opens nothing. Add a popup by adding
  a block in the theme editor, never by adding a section.
- **A popup is a `<dialog>`, and that is a deliberate exception to the drawer
  pattern above.** `showModal()` brings a focus trap, an inert background and
  Escape; hand-rolling those over a form is about forty lines of JS that would
  need testing. Drawers are unchanged, and this is not a precedent for them.
- **A trigger keeps its `href`.** The popup JS calls `preventDefault()` only
  when a matching popup actually exists, so an enquiry button remains an
  ordinary link when JavaScript fails and when a key drifts.
- **Drawers are named**: `data-fye-drawer="x"` pairs with
  `data-fye-drawer-open="x"`, matched exactly, so a second drawer on a page
  cannot fight the first for control. The valueless pair still works and
  belongs to the header.
- State is a class on the element (`.is-open`), toggled by JS and styled by CSS.
  JS never writes `style.*` except where the value is genuinely computed.
- Keep `aria-expanded`, `aria-controls` and focus in sync when toggling.
  `Escape` closes anything that opens.
- No dependency on jQuery-style DOM readiness — the file is deferred.
- If a feature needs more than ~40 lines, it gets its own named function with a
  comment saying what it is for. If it needs a library, ask first.

## 7. Accessibility

- One `<h1>` per page, from the page banner. Headings descend without skipping.
- Interactive targets: 44px minimum on mobile. Desktop icon buttons may be
  41×44 (measured chrome) but never smaller.
- Every icon-only control has an `aria-label`. Decorative SVG gets
  `aria-hidden="true"`.
- Visible focus everywhere — `--focus-ring` is set globally; do not remove
  outlines.
- Form fields have a real `<label>`; `.visually-hidden` when the design has no
  room for it. Placeholders are not labels.
- Semantic elements: `<nav>`, `<header>`, `<footer>`, `<button>` for actions,
  `<a>` for navigation. Never a `<div>` with a click handler.

## 8. Performance

- Two typefaces, self-hosted, woff2, `font-display: swap`. Outfit is a single
  variable file. **No third font, no Google Fonts request.**
- No icon font. All icons are inline SVG via `snippets/icon.liquid`.
- No CSS framework, no reset library, no polyfill.
- Section CSS goes in `{% stylesheet %}` so Shopify serves one concatenated
  file. A section must not add a network request.
- Images: explicit `width`, lazy below the fold, and a `srcset` wherever the
  rendered size varies materially.
- Nothing render-blocking below `<head>`.

## 9. Comments

Comment **why**, never what. `/* 32px, measured */` earns its place;
`/* set the colour */` does not.

Every section's opening comment answers: what is this, how many templates use
it, what changed from the old theme and why, and what would a future editor
break if they did not know. Where a value was measured rather than chosen, say
so and say against what — otherwise someone will "tidy" it into a token and
silently break the match.

Where this theme deliberately departs from the brand book or the design system,
say so in the file, with the reasoning and the measurement. There are two such
departures so far: the sage band ground in `fye-core.css`, and the teal-on-sage
footer.

Where a feature of the old theme is deliberately **not** ported, say so where
the port lives, with the reason — otherwise the next session either re-adds it
or wonders what was missed.

### 9. A `.wrap` inside a flex or grid parent needs `width: 100%`

A flex item shrink-to-fits. Put a `.wrap` inside `display: flex` and it stops
being a full-width container: it collapses to its content, and its own
`margin-inline: auto` centres that collapsed box. The symptom is content
mysteriously indented by a few hundred pixels with no padding rule responsible
— which is how the homepage hero shipped with its copy a third of the way
across the screen.

Same family as the `.shopify-section` rule above: **a parent's display type
changes how its children size themselves.** When a section wraps its inner
container in flex or grid for vertical centring, the inner container needs
`width: 100%` stated explicitly.

## 10. Before you build a section at all

The old theme has 228 section files and renders 107 of them. **Check
`section-usage.md` first**, and read the counts the way they are meant:

- a **reference is not a use** — count enabled references. Ten sections in the
  old theme are referenced only by `"disabled": true` entries and render
  nowhere;
- **build in order of reach.** A section on 100 pages earns care; a section on
  one page earns whatever gets it correct;
- **do not port a section because it exists.** Something that renders nowhere
  should not be rebuilt on the chance it comes back. The sidebar was built on
  27/08/2026, found to be dormant everywhere, and deleted the same day.

## 11. Definition of done, per section

1. Type name and setting IDs match the old theme, or the change is deliberate
   and recorded.
2. No literal colours, sizes or spacings outside `fye-core.css` — unless
   measured, and then commented as such.
3. No vertical padding declaration; rhythm via `--sect-y`.
4. Reflows correctly at 900 / 749 / 560 alongside its neighbours.
5. Keyboard reachable, focus visible, labels present.
6. `shopify_attributes` on every block; `data-screen-label` on the root.
7. Schema exposes only what a human needs, in a sensible order, sentence case.
8. Opening comment explains the port and any measurement.
9. Renders with empty settings and with no blocks — no Liquid errors, no
   collapsed layout.
