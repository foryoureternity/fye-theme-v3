# Old-theme section schemas

Generated 2026-08-27 by `docs/tools/schema-dump.mjs`. Do not hand-edit.

Setting IDs and block type names are **frozen** — templates reference them.
Labels and options are omitted (v3 rewrites those); per-block typography,
spacing, carousel and button-style controls are dropped as noise. Run with
`--verbose` to see labels and select options.

## `fye-callout`

Section name: "FYE · Callout" · 6 settings (0 dropped as noise) · 1 block type(s) · 3KB of old markup

**Settings**

- `band` · select · default: white
- `style` · select · default: default
- `narrow` · checkbox · default: false
- `eyebrow` · text
- `heading` · text
- `body` · richtext

**Block `chip`** — "Chip"

- `name` · text · default: GIA
- `sub` · text

## `fye-cards`

Section name: "FYE · Cards" · 7 settings (1 dropped as noise) · 2 block type(s) · 8KB of old markup

**Settings**

- `band` · select · default: white
- `columns` · select · default: 4
- `show_head` · checkbox · default: true
- `eyebrow` · text
- `heading` · text · default: The Four Cs
- `intro` · textarea

**Block `card`** — "Card"

- `icon` · image_picker
- `label` · text
- `heading` · text
- `body` · richtext

**Block `cta`** — "Button (below the grid)"

- `label` · text
- `link` · url
- `style` · select · default: btn--outline
- `trigger_class` · text

## `fye-chapter-nav`

Section name: "FYE · Chapter navigation" · 7 settings (2 dropped as noise) · 0 block type(s) · 19KB of old markup

**Settings**

- `band` · select · default: ivory
- `show_prev_next` · checkbox · default: true
- `show_contents` · checkbox · default: false
- `contents_label` · text · default: On this page
- `emit_breadcrumbs` · checkbox · default: true

## `fye-checklist`

Section name: "FYE · Checklist" · 8 settings (0 dropped as noise) · 1 block type(s) · 4KB of old markup

**Settings**

- `band` · select · default: ivory
- `columns` · select · default: 2
- `narrow` · checkbox · default: false
- `show_head` · checkbox · default: true
- `eyebrow` · text
- `heading` · text · default: Before You Decide
- `intro` · textarea
- `note` · text

**Block `item`** — "Item"

- `label` · text
- `note` · text

## `fye-chips`

Section name: "FYE · Chips" · 8 settings (0 dropped as noise) · 1 block type(s) · 5KB of old markup

**Settings**

- `band` · select · default: white
- `align` · select · default: left
- `narrow` · checkbox · default: false
- `show_head` · checkbox · default: true
- `eyebrow` · text
- `heading` · text
- `intro` · textarea
- `note` · text

**Block `chip`** — "Chip"

- `name` · text
- `sub` · text
- `colour` · color
- `colour_2` · color
- `link` · url

## `fye-faq`

Section name: "FYE · FAQ" · 9 settings (1 dropped as noise) · 1 block type(s) · 5KB of old markup

**Settings**

- `band` · select · default: white
- `narrow` · checkbox · default: true
- `show_head` · checkbox · default: true
- `eyebrow` · text · default: Common Questions
- `heading` · text · default: Frequently Asked Questions
- `intro` · textarea
- `open_first` · checkbox · default: false
- `emit_schema` · checkbox · default: true

**Block `qa`** — "Question"

- `q` · text
- `a` · richtext

## `fye-guide-download`

Section name: "FYE · Guide download" · 11 settings (2 dropped as noise) · 2 block type(s) · 13KB of old markup

**Settings**

- `band` · select · default: mist
- `cover` · image_picker
- `cover_alt` · text
- `cover_caption` · text · default: The Engagement Ring Guide
- `cover2` · image_picker
- `cover2_alt` · text
- `eyebrow` · text · default: Free Download
- `heading` · text · default: The Engagement Ring Guide
- `body` · richtext

**Block `button`** — "Button"

- `label` · text · default: Download Guide
- `link` · url
- `klaviyo_form` · text
- `style` · select · default: btn--primary

**Block `guide`** — "Guide (collection-aware)"

- `match` · text
- `hide` · checkbox · default: false
- `cover` · image_picker
- `cover_alt` · text
- `cover2` · image_picker
- `cover2_alt` · text
- `eyebrow` · text · default: Free Download
- `heading` · text
- `body` · richtext
- `button_label` · text · default: Download Guide
- `trigger` · select · default: open-engagement-ring-guide
- `link` · url
- `style` · select · default: btn--primary

## `fye-related`

Section name: "FYE · Related links" · 4 settings (0 dropped as noise) · 1 block type(s) · 4KB of old markup

**Settings**

- `band` · select · default: ivory
- `show_head` · checkbox · default: true
- `eyebrow` · text · default: Keep Exploring
- `heading` · text · default: Related Guides

**Block `card`** — "Card"

- `kicker` · text · default: Diamond Education
- `title` · text · default: Diamond Shapes
- `desc` · textarea
- `cta` · text · default: Read more
- `link` · url

## `fye-rich-text`

Section name: "FYE · Rich text" · 7 settings (1 dropped as noise) · 0 block type(s) · 4KB of old markup

**Settings**

- `band` · select · default: ivory
- `narrow` · checkbox · default: true
- `eyebrow` · text
- `heading` · text
- `variant` · select · default: default
- `body` · html

## `fye-steps`

Section name: "FYE · Steps" · 7 settings (1 dropped as noise) · 2 block type(s) · 8KB of old markup

**Settings**

- `band` · select · default: ivory
- `columns` · select · default: 4
- `show_head` · checkbox · default: true
- `eyebrow` · text
- `heading` · text
- `intro` · textarea

**Block `step`** — "Step"

- `number` · text
- `heading` · text
- `body` · richtext

**Block `cta`** — "Button (below the steps)"

- `label` · text
- `link` · url
- `style` · select · default: btn--outline
- `trigger_class` · text

## `fye-table`

Section name: "FYE · Table" · 12 settings (2 dropped as noise) · 1 block type(s) · 6KB of old markup

**Settings**

- `band` · select · default: white
- `show_head` · checkbox · default: true
- `eyebrow` · text
- `heading` · text
- `intro` · textarea
- `headers` · text
- `first_col_bold` · checkbox · default: true
- `narrow` · checkbox · default: false
- `col1_width` · range · default: 0
- `note` · text

**Block `row`** — "Row"

- `cells` · text

## `fye-terms`

Section name: "FYE · Terms & lists" · 9 settings (0 dropped as noise) · 1 block type(s) · 6KB of old markup

**Settings**

- `band` · select · default: white
- `columns` · select · default: 2
- `numbering` · select · default: numbers
- `narrow` · checkbox · default: false
- `show_head` · checkbox · default: true
- `eyebrow` · text
- `heading` · text
- `intro` · textarea
- `note` · text

**Block `term`** — "Item"

- `number` · text
- `heading` · text
- `body` · richtext
- `meta` · text

## `fye-xref`

Section name: "FYE · Guide pointer" · 10 settings (1 dropped as noise) · 0 block type(s) · 4KB of old markup

**Settings**

- `band` · select · default: ivory
- `narrow` · checkbox · default: true
- `eyebrow` · text · default: Covered in more depth
- `heading` · text
- `body` · richtext
- `link` · url
- `link_label` · text · default: Read the guide
- `cover` · image_picker
- `cover_alt` · text
