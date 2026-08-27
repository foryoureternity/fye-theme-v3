# page.engagement-rings — build plan

Reduced from `page.engagement-rings.json` by `docs/tools/template-plan.mjs`.
Settings left at defaults, blanks and per-block typography controls are
dropped. Do not hand-edit; re-run instead.

## Section order

| # | type | state | blocks | in v3 |
|---|---|---|---|---|
| 1 | `fye-hero` | live | heading, logo, subtext, spacer ×2, button ×2 | yes |
| 2 | `about-columns-four` | live | text_block ×10 | NO |
| 3 | `collections-list` | live | collection_item ×10 | NO |
| 4 | `fye-media-text` | live | button | NO |
| 5 | `featured-collection` | live | — | NO |
| 6 | `fye-guide-download` | live | button | NO |
| 7 | `shipping` | live | shipping ×8 | NO |
| 8 | `fye-media-text` | live | button | NO |
| 9 | `accordion` | live | accor_item ×7 | NO |
| 10 | `fye-media-text` | live | — | NO |
| 11 | `fye-consultation` | live | contact ×3 | NO |
| 12 | `custom-liquid` | live | — | NO |

12 sections, 12 live, 0 disabled.

## Live section types not yet in v3

- `about-columns-four`
- `accordion`
- `collections-list`
- `custom-liquid`
- `featured-collection`
- `fye-consultation`
- `fye-guide-download`
- `fye-media-text`
- `shipping`

## Settings that carry a decision

### `fye-hero`

- `image`: shopify://shop_images/eng-new-2.webp
- `image_mb`: shopify://shop_images/eng-new-2.webp
- `image_position`: left 30%
- `overlay_color`: #000000
- `overlay_opacity`: 28
- `height_dk`: 580
- `height_tb`: 460
- `height_mb`: 390
- `content_align`: flex-start
- `content_valign`: center
- `text_align`: start
- `max_width`: 1400
- `content_max_width`: 760
- `side_padding`: 15
- `content_align_mb`: flex-start
- `content_valign_mb`: flex-start
- `text_align_mb`: start
- `side_padding_mb`: 16
- blocks:
  - **heading** — `html`: <h1 class="fye-hero-h1" style="font-family:'Tenor Sans',sans-serif;font-size:clamp(24px,4v…
  - **logo** — `logo_url`: https://cdn.shopify.com/s/files/1/0972/5391/7056/files/temp-logo-white-1.svg?v=1771834133 · `alt`: For Your Eternity · `width`: 250 · `width_mb`: 220
  - **subtext** — `text`: Discover your perfect engagement ring, crafted with love, ethical materials, and timeless … · `tag`: p · `color`: #f2f1e8 · `font_size`: 18 · `line_height`: 29 · `font_weight`: 300 · `margin_bottom`: 15 · `font_size_mb`: 15 · `line_height_mb`: 22 · `margin_bottom_mb`: 10
  - **spacer** — `height`: 24 · `height_mb`: 2
  - **button** — `text`: VIEW OUR Engagement Rings · `link`: shopify://collections/engagement-rings · `target`: _self · `bg_color`: #f2f1e8 · `text_color`: #233d47 · `bg_color_hover`: #233d47 · `text_color_hover`: #ffffff · `font_size`: 13 · `font_weight`: 500 · `letter_spacing`: 2 · `min_height`: 48 · `padding_lr`: 34 · `uppercase`: true · `font_size_mb`: 12 · `min_height_mb`: 44 · `padding_lr_mb`: 20
  - **button** — `text`: Engagement Ring Guide · `link`: shopify://pages/engagement-ring-guide · `target`: _self · `bg_color`: #f2f1e8 · `text_color`: #233d47 · `bg_color_hover`: #233d47 · `text_color_hover`: #ffffff · `font_size`: 13 · `font_weight`: 500 · `letter_spacing`: 2 · `min_height`: 48 · `padding_lr`: 34 · `uppercase`: true · `font_size_mb`: 12 · `min_height_mb`: 44 · `padding_lr_mb`: 20
  - **spacer** — `height`: 24 · `height_mb`: 1

### `about-columns-four`

- `design_heading`: 1
- `heading_align`: t4s-text-center
- `icon_heading`: las la-gem
- `tophead_mb`: 30
- `text_align`: start
- `pos_text`: default
- `fs_title`: 22
- `fs_text`: 14
- `fs_title_mb`: 22
- `fs_text_mb`: 12
- `image_ratio`: ratioadapt
- `image_size`: contain
- `image_position`: 7
- `img_effect`: none
- `b_effect`: none
- `layout_des`: 1
- `space_h_item`: 30
- `space_v_item`: 30
- `space_h_item_mb`: 10
- `space_v_item_mb`: 10
- `col_dk`: 5
- `col_tb`: 2
- `col_mb`: 2
- `loop`: true
- `au_hover`: true
- `btn_vi`: hover
- `btn_owl`: default
- `btn_shape`: none
- `btn_cl`: dark
- `btn_size`: small
- `btn_hidden_mobile`: true
- `dot_owl`: default
- `dots_cl`: dark
- `dots_round`: true
- `dots_space`: 10
- `layout`: t4s-container-wrap
- **custom_css — 0 rule(s), needs a home in v3:**
- blocks:
  - **text_block** — `enable_image`: true · `image`: shopify://shop_images/11_2ffb2c6d-eff8-43b3-b8b0-a76aea4e77b4.png · `title`: Solitaire Ring with diamond shoulders · `button_label`: VIEW OUR RINGS · `button_link`: shopify://collections/solitaire · `open_link`: _blank · `button_style`: default · `btn_size`: extra-small · `btn_cl`: dark · `button_effect`: fade
  - **text_block** — `enable_image`: true · `image`: shopify://shop_images/12.png · `title`: Solitaire Ring with plain shoulders · `button_label`: VIEW OUR RINGS · `button_link`: shopify://collections/solitaire · `open_link`: _blank · `button_style`: default · `btn_size`: extra-small · `btn_cl`: dark · `button_effect`: fade
  - **text_block** — `enable_image`: true · `image`: shopify://shop_images/13.png · `title`: Halo Ring with diamond shoulders · `button_label`: VIEW OUR RINGS · `button_link`: shopify://collections/halo-1 · `open_link`: _blank · `button_style`: default · `btn_size`: extra-small · `btn_cl`: dark · `button_effect`: fade
  - **text_block** — `enable_image`: true · `image`: shopify://shop_images/14.png · `title`: Halo Ring with plain shoulders · `button_label`: VIEW OUR RINGS · `button_link`: shopify://collections/halo-1 · `open_link`: _blank · `button_style`: default · `btn_size`: extra-small · `btn_cl`: dark · `button_effect`: fade
  - **text_block** — `enable_image`: true · `image`: shopify://shop_images/15.png · `title`: Multistone Invisible Set · `button_label`: VIEW OUR RINGS · `button_link`: shopify://collections/multistone-invisible · `open_link`: _blank · `button_style`: default · `btn_size`: extra-small · `btn_cl`: dark · `button_effect`: fade
  - **text_block** — `enable_image`: true · `image`: shopify://shop_images/21.png · `title`: Trilogy Ring · `button_label`: VIEW OUR RINGS · `button_link`: shopify://collections/trilogy · `open_link`: _blank · `button_style`: default · `btn_size`: extra-small · `btn_cl`: dark · `button_effect`: fade
  - **text_block** — `enable_image`: true · `image`: shopify://shop_images/22.png · `title`: Hidden Halo · `button_label`: VIEW OUR RINGS · `button_link`: shopify://collections/hidden-halo · `open_link`: _blank · `button_style`: default · `btn_size`: extra-small · `btn_cl`: dark · `button_effect`: fade
  - **text_block** — `enable_image`: true · `image`: shopify://shop_images/23.png · `title`: Split Shoulders · `button_label`: VIEW OUR RINGS · `button_link`: shopify://collections/split-shoulders · `open_link`: _blank · `button_style`: default · `btn_size`: extra-small · `btn_cl`: dark · `button_effect`: fade
  - **text_block** — `enable_image`: true · `image`: shopify://shop_images/24.png · `title`: Oyster Deluxe · `button_label`: VIEW OUR RINGS · `button_link`: shopify://collections/oyster-deluxe · `open_link`: _blank · `button_style`: default · `btn_size`: extra-small · `btn_cl`: dark · `button_effect`: fade
  - **text_block** — `enable_image`: true · `image`: shopify://shop_images/25.png · `title`: Coloured Stones · `button_label`: VIEW OUR RINGS · `button_link`: shopify://collections/coloured-engagement-ring · `open_link`: _blank · `button_style`: default · `btn_size`: extra-small · `btn_cl`: dark · `button_effect`: fade

### `collections-list`

- `design_heading`: 2
- `heading_align`: t4s-text-center
- `top_heading`: shop by diamond cut
- `icon_heading`: las la-gem
- `tophead_mb`: 10
- `head_btn_label`: View All
- `head_btn_style`: default
- `head_btn_size`: medium
- `head_btn_cl`: dark
- `head_btn_effect`: default
- `collection_des`: 5
- `title_cl`: #233d47
- `title_cl_hover`: #233d47
- `subtitle_cl`: #878787
- `count_cl`: #222222
- `border_cl`: #e5e5e5
- `collection_subtitle`: Products
- `open_link`: _self
- `source`: image
- `space_bottom`: 20
- `space_bottom_tb`: 20
- `space_bottom_mb`: 10
- `icon_width`: 50
- `img_effect`: none
- `b_effect`: none
- `image_ratio`: ratio1_1
- `image_size`: contain
- `image_position`: 8
- `layout_des`: 1
- `col_dk`: 9
- `col_tb`: 2
- `col_mb`: 3
- `space_h_item`: 30
- `space_v_item`: 30
- `space_h_item_mb`: 10
- `space_v_item_mb`: 10
- `loop`: true
- `au_hover`: true
- `btn_pos`: default
- `btn_vi`: hover
- `btn_owl`: default
- `btn_shape`: none
- `btn_cl`: dark
- `btn_size`: small
- `dot_owl`: default
- `dots_cl`: dark
- `dots_round`: true
- `dots_space`: 10
- `layout`: t4s-container-fluid
- **custom_css — 0 rule(s), needs a home in v3:**
- blocks:
  - **collection_item** — `image`: shopify://shop_images/icon101.svg · `icon`: las la-gem · `collection_title`: Round brilliant · `collection_link`: shopify://collections/round-cut
  - **collection_item** — `image`: shopify://shop_images/icon102.svg · `icon`: las la-gem · `collection_title`: Oval · `collection_link`: shopify://collections/oval-cut
  - **collection_item** — `image`: shopify://shop_images/icon103.svg · `icon`: las la-gem · `collection_title`: Cushion · `collection_link`: shopify://collections/cushion-cut-engagement-rings
  - **collection_item** — `image`: shopify://shop_images/icon104.svg · `icon`: las la-gem · `collection_title`: Pear · `collection_link`: shopify://collections/pear-cut-engagement-rings
  - **collection_item** — `image`: shopify://shop_images/icon105.svg · `icon`: las la-gem · `collection_title`: Emerald · `collection_link`: shopify://collections/emerald-cut-engagement-rings
  - **collection_item** — `image`: shopify://shop_images/icon106.svg · `icon`: las la-gem · `collection_title`: Radiant · `collection_link`: shopify://collections/radiant-cut-engagement-rings
  - **collection_item** — `image`: shopify://shop_images/icon107.svg · `icon`: las la-gem · `collection_title`: Princess · `collection_link`: shopify://collections/princess-cut
  - **collection_item** — `image`: shopify://shop_images/icon108.svg · `icon`: las la-gem · `collection_title`: Marquise · `collection_link`: shopify://collections/marquise-cut
  - **collection_item** — `image`: shopify://shop_images/icon109.svg · `icon`: las la-gem · `collection_title`: Asscher · `collection_link`: shopify://collections/asscher-cut-engagement-rings
  - **collection_item** — `image`: shopify://shop_images/icon110.svg · `icon`: las la-gem · `collection_title`: Heart · `collection_link`: shopify://collections/heart-shaped-cut

### `fye-media-text`

- `band`: sage
- `reverse`: true
- `full_bleed`: true
- `image`: shopify://shop_images/Ring_11.png
- `image_alt`: Design your own engagement ring
- `placeholder`: Bespoke design
- `heading`: Design Your Own Engagement Ring
- `body`: <p>Create a unique, bespoke ring that perfectly reflects your love story—crafted with ethi…
- blocks:
  - **button** — `label`: Book Consultation · `link`: https://calendar.app.google/UKFkGvMLzAYEviqy8 · `style`: btn--onteal

### `featured-collection`

- `design_heading`: 2
- `heading_align`: t4s-text-center
- `top_heading`: our most popular engagement rings
- `icon_heading`: las la-gem
- `tophead_mb`: 30
- `head_btn_label`: View All
- `head_btn_style`: default
- `head_btn_size`: medium
- `head_btn_cl`: dark
- `head_btn_effect`: default
- `collection`: featured-engagement-rings
- `product_des`: 1
- `image_ratio`: ratio1_1
- `image_size`: cover
- `image_position`: 8
- `content_align`: default
- `limit`: 8
- `col_dk`: 4
- `col_tb`: 2
- `col_mb`: 2
- `space_h_item`: 30
- `space_v_item`: 40
- `space_h_item_mb`: 10
- `space_v_item_mb`: 10
- `layout_des`: 1
- `au_hover`: true
- `btns_pos`: default
- `btn_vi`: hover
- `btn_owl`: default
- `btn_shape`: none
- `btn_cl`: dark
- `btn_size`: small
- `btn_hidden_mobile`: true
- `dot_owl`: default
- `dots_cl`: dark
- `dots_round`: true
- `dots_space`: 10
- `use_pagination`: none
- `enable_bar_lm`: true
- `button_style`: default
- `btns_size`: large
- `btns_cl`: dark
- `button_effect`: default
- `btn_pos`: t4s-text-center
- `layout`: t4s-container-wrap
- **custom_css — 0 rule(s), needs a home in v3:**

### `fye-guide-download`

- `band`: teal
- `cover`: shopify://shop_images/Engagement_Ring_Cover.png
- `cover_alt`: The Engagement Ring Guide
- `cover_caption`: The Engagement Ring Guide
- `heading`: The Engagement Ring Guide
- `body`: <p>Budget, the Four Cs, diamond shapes, settings and sizing — read online or take the free…
- blocks:
  - **button** — `label`: View The Guide · `link`: shopify://pages/engagement-ring-guide · `style`: btn--onteal

### `shipping`

- `design_heading`: 2
- `heading_align`: t4s-text-center
- `top_heading`: why choose for your eternity?
- `icon_heading`: las la-gem
- `tophead_mb`: 30
- `content_align`: text-center
- `design_padding`: 1
- `source`: themes_icon
- `icon_des`: default
- `icon_size`: medium
- `col_dk`: 4
- `col_tb`: 4
- `col_mb`: 2
- `cl_bd`: #dddddd
- `cl_ic`: #9e9e9e
- `cl_hd`: #233d47
- `cl_cot`: #233d47
- `bg_item`: #ffffff
- `hd_fs`: 16
- `hd_fw`: 500
- `txt_fs`: 12
- `space_h_item`: 30
- `space_v_item`: 30
- `space_h_item_mb`: 10
- `space_v_item_mb`: 10
- `dots_cl`: dark
- `layout`: t4s-container-wrap
- **custom_css — 0 rule(s), needs a home in v3:**
- blocks:
  - **shipping** — `icon_themes`: none · `icon`: las la-shipping-fast · `text`: <p>ethically sourced diamonds and materials</p> · `html`: <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewbox="0 0 272 242" s…
  - **shipping** — `icon_themes`: none · `icon`: las la-shipping-fast · `text`: <p>competitive pricing</p> · `html`: <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewbox="0 0 218 258" s…
  - **shipping** — `icon_themes`: none · `icon`: las la-shipping-fast · `text`: <p>matching wedding rings</p> · `html`: <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewbox="0 0 305 261" s…
  - **shipping** — `icon_themes`: none · `icon`: las la-shipping-fast · `text`: <p>educational approach to finding you the right ring</p> · `html`: <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewbox="0 0 207 275" s…
  - **shipping** — `icon_themes`: none · `icon`: las la-shipping-fast · `text`: <p>fully customisable designs</p> · `html`: <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewbox="0 0 238 235" s…
  - **shipping** — `icon_themes`: none · `icon`: las la-shipping-fast · `text`: <p>Free, insured shipping</p> · `html`: <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewbox="0 0 349 185" s…
  - **shipping** — `icon_themes`: none · `icon`: las la-shipping-fast · `text`: <p>Free Resizing</p> · `html`: <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewbox="0 0 251 243" s…
  - **shipping** — `icon_themes`: none · `icon`: las la-shipping-fast · `text`: <p>Lifetime Warranty agaist manufacturing defects</p> · `html`: <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewbox="0 0 222 264" s…

### `fye-media-text`

- `band`: sage
- `reverse`: true
- `full_bleed`: true
- `image`: shopify://shop_images/fffg1_1.png
- `image_alt`: Ring presented for a personalised consultation
- `placeholder`: Consultation photo
- `eyebrow`: Your Forever Begins Here
- `heading`: Book A Personalised Consultation
- `body`: <ul><li>Ensure you choose the right ring</li><li>Discover different ring styles</li><li>Pi…
- blocks:
  - **button** — `label`: Book Consultation · `link`: https://calendar.app.google/UKFkGvMLzAYEviqy8 · `style`: btn--onteal

### `accordion`

- `design_heading`: 2
- `heading_align`: t4s-text-center
- `top_heading`: frequently asked questions
- `icon_heading`: las la-gem
- `left_heading`: Have More Questions To Ask?
- `left_text`: <p>We’re here to help! If you have any questions about our rings, designs, or ethical sour…
- `left_btn`: ENQUIRE NOW
- `left_url`: /
- `tophead_mb`: 30
- `accor_des`: 1
- `title_cl`: #1f2124
- `bg_title_cl`: #ffffff
- `title_active_cl`: #1f2124
- `bg_title_active_cl`: #ffffff
- `content_cl`: #1f2124
- `bg_content_cl`: #ffffff
- `content_align`: t4s-text-start
- `layout`: t4s-container-fluid
- `custom_width`: 1000
- blocks:
  - **accor_item** — `icon`: none · `title`: What makes your wedding and engagement rings ethical? · `content`: <p>At For Your Eternity, we are committed to ethical sourcing and responsible practices. O…
  - **accor_item** — `icon`: none · `title`: Do you offer custom ring designs? · `content`: <p>Yes! We offer a <strong>fully bespoke ring design service</strong>, allowing you to cre…
  - **accor_item** — `icon`: none · `title`: How long does it take to receive a custom wedding or engagement ring? · `content`: <p>Custom rings typically take 4–6 weeks from the date of design approval to completion. H…
  - **accor_item** — `icon`: none · `title`: What is your return policy? · `content`: <p>We want you to love your ring, and we stand by the quality of our craftsmanship. Howeve…
  - **accor_item** — `icon`: none · `title`: Are your diamonds certified? · `content`: <p>Yes, all our natural and lab-grown diamonds come with independent certification from le…
  - **accor_item** — `icon`: none · `title`: Do you offer matching wedding bands? · `content`: <p>Absolutely! We can create perfectly matching wedding bands to complement your engagemen…
  - **accor_item** — `icon`: none · `title`: Do you offer financing or payment plans? · `content`: <p>Yes, we offer flexible financing and payment plans to help make your dream ring more af…

### `fye-media-text`

- `band`: mist
- `full_bleed`: true
- `image`: shopify://shop_images/Ring_211_5.png
- `image_alt`: Hand wearing a For Your Eternity ring
- `placeholder`: Hand with ring
- `heading`: The For Your Eternity Guarantee
- `body`: <ul><li>GIA & IGI Certified Diamonds</li><li>Ethical, conflict free gemstones & precious m…

### `fye-consultation`

- `band`: teal
- `eyebrow`: Personal Guidance
- `heading`: Still Unsure Where to Start?
- `lead`: Book a free consultation — in person, by phone or video.
- `btn_label`: Book a Free Consultation
- `btn_link`: https://calendar.app.google/UKFkGvMLzAYEviqy8
- blocks:
  - **contact** — `type`: phone · `label`: 0208 178 6687
  - **contact** — `type`: email · `label`: hello@foryoureternity.com
  - **contact** — `type`: whatsapp · `label`: WhatsApp

### `custom-liquid`

- `custom_liquid`: <script type="application/ld+json"> {"@context":"https://schema.org","@type":"FAQPage","ma…
- `layout`: t4s-container-wrap
