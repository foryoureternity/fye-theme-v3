# index — build plan

Reduced from `index.json` by `docs/tools/template-plan.mjs`.
Settings left at defaults, blanks and per-block typography controls are
dropped. Do not hand-edit; re-run instead.

## Section order

| # | type | state | blocks | in v3 |
|---|---|---|---|---|
| 1 | `fye-hero` | live | heading ×2, logo, spacer ×2, subtext, button ×2 | yes |
| 2 | `fye-trust-strip` | live | point ×4 | NO |
| 3 | `feature_columns2` | live | text_block ×2 | NO |
| 4 | `fye-two-ways` | live | point_a ×5, point_b ×5 | NO |
| 5 | `custom-collections` | live | — | NO |
| 6 | `fye-testimonials` | live | testimonial ×6 | NO |
| 7 | `featured-collection` | live | — | NO |
| 8 | `fye-media-text` | live | button | NO |
| 9 | `fye-gallery-promo` | live | set ×3 | NO |
| 10 | `collections-list` | disabled | collection_item ×10 | NO |
| 11 | `fye-media-text` | live | — | NO |
| 12 | `guide-download-block` | live | guide ×6 | NO |
| 13 | `latest-news-EM` | live | — | NO |
| 14 | `about_us` | live | bl_button | NO |
| 15 | `fye-consultation` | live | contact ×3 | NO |
| 16 | `custom-liquid` | live | — | NO |

16 sections, 15 live, 1 disabled.

## Live section types not yet in v3

- `about_us`
- `custom-collections`
- `custom-liquid`
- `feature_columns2`
- `featured-collection`
- `fye-consultation`
- `fye-gallery-promo`
- `fye-media-text`
- `fye-testimonials`
- `fye-trust-strip`
- `fye-two-ways`
- `guide-download-block`
- `latest-news-EM`

## Settings that carry a decision

### `fye-hero`

- `image`: shopify://shop_images/home_hero_39bd9050-faac-46b0-91e8-720cbd66a74a.webp
- `image_position`: center center
- `overlay_color`: #000000
- `height_dk`: 580
- `height_tb`: 460
- `height_mb`: 390
- `content_align`: flex-start
- `content_valign`: center
- `text_align`: start
- `max_width`: 1368
- `content_max_width`: 880
- `side_padding`: 24
- `content_align_mb`: flex-start
- `content_valign_mb`: flex-start
- `text_align_mb`: start
- `side_padding_mb`: 16
- blocks:
  - **heading** — `html`: <h1 class="fye-hero-h1" style="font-family:'Tenor Sans',sans-serif;font-size:clamp(24px,4v…
  - **logo** — `logo_url`: https://cdn.shopify.com/s/files/1/0972/5391/7056/files/temp-logo-white-1.svg?v=1771834133 · `alt`: For Your Eternity · `width`: 250 · `width_mb`: 220
  - **spacer** — `height`: 24 · `height_mb`: 1
  - **subtext** — `text`: Ethical diamonds, personal guidance and bespoke craftsmanship from a London jeweller. · `tag`: p · `color`: #f2f1e8 · `font_size`: 18 · `line_height`: 29 · `font_weight`: 300 · `margin_bottom`: 15 · `font_size_mb`: 15 · `line_height_mb`: 22 · `margin_bottom_mb`: 10
  - **spacer** — `height`: 8 · `height_mb`: 2
  - **button** — `text`: Shop Engagement Rings · `link`: shopify://pages/engagement-rings · `target`: _self · `bg_color`: #ffffff · `text_color`: #233d47 · `border_color`: #ffffff · `bg_color_hover`: #879b87 · `text_color_hover`: #ffffff · `font_size`: 13 · `font_weight`: 500 · `letter_spacing`: 2 · `min_height`: 48 · `padding_lr`: 34 · `uppercase`: true · `font_size_mb`: 12 · `min_height_mb`: 44 · `padding_lr_mb`: 20
  - **button** — `text`: Shop Wedding Rings · `link`: shopify://pages/wedding-rings · `target`: _self · `bg_color`: #ffffff · `text_color`: #233d47 · `border_color`: #ffffff · `bg_color_hover`: #879b87 · `text_color_hover`: #ffffff · `font_size`: 13 · `font_weight`: 500 · `letter_spacing`: 2 · `min_height`: 48 · `padding_lr`: 34 · `uppercase`: true · `font_size_mb`: 12 · `min_height_mb`: 44 · `padding_lr_mb`: 20
  - **heading** — `html`: <a href="https://calendar.app.google/UKFkGvMLzAYEviqy8" style="display:inline-block;margin…

### `fye-trust-strip`

- `band`: white
- blocks:
  - **point** — `icon`: certified · `label`: Independently Certified · `sub`: GIA & IGI certified diamonds
  - **point** — `icon`: fair · `label`: Fair & Transparent · `sub`: Direct pricing, no retail markups
  - **point** — `icon`: guidance · `label`: Personal Guidance · `sub`: 1-on-1 consultations with London jewellers
  - **point** — `icon`: risk-free · `label`: Risk-Free Purchasing · `sub`: Free insured delivery & 1st-year resizing

### `feature_columns2`

- `design_heading`: 1
- `heading_align`: t4s-text-center
- `icon_heading`: las la-gem
- `tophead_mb`: 30
- `text_align`: center
- `pos_text`: default
- `fs_title`: 35
- `fs_text`: 25
- `fs_title_mb`: 26
- `fs_text_mb`: 18
- `image_ratio`: ratio1_1
- `image_size`: contain
- `image_position`: 8
- `img_effect`: none
- `b_effect`: none
- `space_h_item`: 30
- `space_v_item`: 30
- `space_h_item_mb`: 10
- `space_v_item_mb`: 10
- `layout`: t4s-container-wrap
- **custom_css — 0 rule(s), needs a home in v3:**
- blocks:
  - **text_block** — `enable_image`: true · `image`: shopify://shop_images/FYE-initial-logo-light_1.png · `open_link`: _blank · `button_style`: default · `btn_size`: large · `btn_cl`: dark · `button_effect`: fade · `col_dk`: 3 · `col_tb`: 4 · `col_mb`: 12
  - **text_block** — `title`: why choose for your eternity? · `text`: <p>At For Your Eternity, we offer ethically crafted engagement and wedding rings that comb… · `open_link`: _blank · `button_style`: default · `btn_size`: large · `btn_cl`: dark · `button_effect`: fade · `col_dk`: 8 · `col_tb`: 8 · `col_mb`: 12

### `fye-two-ways`

- `ground`: ivory
- `eyebrow`: Two ways to buy
- `heading`: Buy direct, or talk it through with us first
- `subline`: Order online whenever you are ready, or speak to us first and take as long as you need.
- `card_a_title`: Buy direct
- `card_a_lede`: Everything on the site is ready to order today.
- `card_a_cta_label`: Shop rings
- `card_b_title`: Talk it through first
- `card_b_lede`: A free conversation with us before you decide anything.
- `card_b_cta_label`: Book a free consultation
- `card_b_popup`: true
- blocks:
  - **point_a** — `text`: Over 3,000 rings, configurable by metal, size and centre stone
  - **point_a** — `text`: Order online today, no appointment needed
  - **point_a** — `text`: Free insured delivery · `short`: Free insured delivery, resizing for the first year, lifetime warranty
  - **point_a** — `text`: Complimentary resizing for the first year · `hide_mobile`: true
  - **point_a** — `text`: Lifetime warranty · `hide_mobile`: true
  - **point_b** — `text`: Free, always · `short`: Free, always. 20 minutes to start, and as long as it takes after that
  - **point_b** — `text`: 20 minutes to start, and as long as it takes after that · `hide_mobile`: true
  - **point_b** — `text`: In person in London, or by video, phone or WhatsApp
  - **point_b** — `text`: You speak to us, not a call centre · `short`: You speak to us, not a call centre. No obligation
  - **point_b** — `text`: No obligation, no pressure · `hide_mobile`: true

### `custom-collections`

- `left_image`: shopify://shop_images/nectar871.png
- `left_heading`: ENGAGEMENT RINGS
- `left_btn`: VIEW OUR RINGS
- `left_link`: shopify://collections/engagement-rings
- `top_image`: shopify://shop_images/womens-wedding-ring.webp
- `top_heading`: WEDDING RINGS
- `top_btn`: VIEW OUR RINGS
- `top_link`: shopify://collections/wedding-rings
- `bottom_image`: shopify://shop_images/Ring_211_5.png
- `bottom_heading`: ETERNITY RINGS
- `bottom_btn`: VIEW OUR RINGS
- `bottom_link`: shopify://collections/eternity-rings
- **custom_css — 0 rule(s), needs a home in v3:**

### `fye-testimonials`

- `heading`: Testimonials
- `avg_rating`: 4.9/5
- `enable_autoplay`: true
- `autoplay_seconds`: 5.5
- `transition_ms`: 500
- blocks:
  - **testimonial** — `quote`: <p>The entire process was informative, with helpful guidence, lots of ideas and resulting … · `name`: Matthew C. · `context`: Engagement Ring · `rating`: 5
  - **testimonial** — `quote`: <p>Expert and friendly guidance through out the process. I ended up with a beautiful ring … · `name`: James G. · `context`: Engagement Ring · `rating`: 5
  - **testimonial** — `quote`: <p>Trustworthy, reliable and attentive - exactly what we wanted and delivered in time for … · `name`: Azeem A. · `context`: Pair Of Wedding Rings · `rating`: 5
  - **testimonial** — `quote`: <p>From the first email to the final fitting, the team made designing my engagement ring f… · `name`: Eleanor R. · `context`: Engagement Ring
  - **testimonial** — `quote`: <p>We wanted matching wedding bands that felt personal, and For Your Eternity delivered ex… · `name`: James & Priya · `context`: A Pair Of Wedding Rings
  - **testimonial** — `quote`: <p>I was nervous buying a ring online, but the transparency around the stone and the lifet… · `name`: Marcus T. · `context`: Solitaire Engagement Ring

### `featured-collection`

- `design_heading`: 2
- `heading_align`: t4s-text-center
- `top_heading`: our most popular rings
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
- `limit`: 4
- `col_dk`: 4
- `col_tb`: 2
- `col_mb`: 2
- `space_h_item`: 30
- `space_v_item`: 30
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
- `layout`: t4s-se-container
- **custom_css — 0 rule(s), needs a home in v3:**

### `fye-media-text`

- `band`: sage
- `reverse`: true
- `full_bleed`: true
- `image`: shopify://shop_images/Ring_11.png
- `image_alt`: Bespoke ring design
- `placeholder`: Bespoke design
- `eyebrow`: Bespoke Design
- `heading`: Designed With You
- `body`: <p>Tell us what you have in mind. We'll source the perfect stone, refine the design, and c…
- blocks:
  - **button** — `label`: Start a Bespoke Enquiry · `link`: # · `style`: btn--onteal · `trigger_class`: open-design-your-own

### `fye-gallery-promo`

- `eyebrow`: From Our Workshop
- `heading`: <p>Pieces We've<br/>Already Made</p>
- `body`: <p>Engagement rings, wedding pairs and pendants we've made for our clients — some chosen f…
- `cta_label`: View the Gallery
- `cta_link`: shopify://pages/jewellery-gallery
- `ground`: #FFFFFF
- `rotate_seconds`: 5
- `pad_top`: 72
- `pad_bottom`: 72
- blocks:
  - **set** — `image_lead`: shopify://shop_images/teal-sapphire-engagement-ring-platinum-marquise-diamonds.jpg · `image_top`: shopify://shop_images/curved-wedding-ring-pair-18ct-yellow-gold-matt-finish.jpg · `image_bottom`: shopify://shop_images/emerald-cut-diamond-and-marquise-emerald-pendant-platinum.jpg · `link`: shopify://pages/jewellery-gallery
  - **set** — `image_lead`: shopify://shop_images/oval-diamond-solitaire-18ct-yellow-gold-diamond-set-shoulders.jpg · `image_top`: shopify://shop_images/platinum-grain-set-and-white-gold-court-wedding-ring-pair.jpg · `image_bottom`: shopify://shop_images/emerald-and-tanzanite-wedding-rings-18ct-yellow-and-white-gold.jpg · `link`: shopify://pages/jewellery-gallery
  - **set** — `image_lead`: shopify://shop_images/001-oval-solitaire-yellow-gold-2-17ct-photo-2-three-quarter.jpg · `image_top`: shopify://shop_images/curved-diamond-set-platinum-wedding-ring.jpg · `image_bottom`: shopify://shop_images/platinum-diamond-and-emerald-pendant-on-chain.jpg · `link`: shopify://pages/jewellery-gallery

### `collections-list` *(disabled)*

- `design_heading`: 2
- `heading_align`: t4s-text-center
- `top_heading`: shop by diamond cut
- `heading_mb`: Shop By Shape
- `mobile_view_all_link`: shopify://pages/diamond-shapes
- `icon_heading`: las la-gem
- `tophead_mb`: 42
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

- `band`: mist
- `full_bleed`: true
- `image`: shopify://shop_images/Ring_211_5.png
- `image_alt`: Hand wearing a For Your Eternity ring
- `placeholder`: Hand with ring
- `heading`: The For Your Eternity Guarantee
- `body`: <ul><li>GIA & IGI Certified Diamonds</li><li>Ethical, conflict free gemstones & precious m…

### `guide-download-block`

- `heading`: Free Expert Guides
- `subtext`: <p>Six expert guides — read online or take the free PDF, whatever stage you're at.</p>
- `button_label`: View Guide
- `view_all_url`: shopify://pages/downloadable-guides
- `background`: teal
- blocks:
  - **guide** — `show`: true · `cover`: shopify://shop_images/Engagement_Ring_Cover.png · `title`: The Engagement Ring Guide · `klaviyo_form_id`: V9eDYg · `blurb`: Budget, the Four Cs, diamond shapes, settings, sizing and bespoke design.
  - **guide** — `show`: true · `cover`: shopify://shop_images/Plain_Wedding_Cover.png · `title`: The Plain Wedding Ring Guide · `klaviyo_form_id`: XMzNMS · `blurb`: Profiles, metals, finishes, shaped-to-fit bands and matched pairs.
  - **guide** — `show`: true · `cover`: shopify://shop_images/Diamond_Ring_Guide.png · `title`: The Diamond Wedding Ring Guide · `klaviyo_form_id`: Rch5bG · `blurb`: Eternity rings, setting styles, shaped-to-fit bands and everyday wear.
  - **guide** — `show`: true · `cover`: shopify://shop_images/Eternity_Ring_Guide_Cover_v3.png · `title`: The Eternity Ring Guide · `klaviyo_form_id`: TNb26i · `blurb`: Full and half eternity styles, stone settings, spacing and how to wear them.
  - **guide** — `show`: true · `cover`: shopify://shop_images/diamond-and-gemstone-guide-cover.png · `title`: The Diamond & Gemstone Guide · `klaviyo_form_id`: UbTxH7 · `blurb`: Diamonds, coloured gemstones, lab-grown stones and choosing the right stone for your ring.
  - **guide** — `show`: true · `cover`: shopify://shop_images/ring-care-guide-cover.png · `title`: The Ring & Jewellery Care Guide · `klaviyo_form_id`: RINGCARE · `file_url`: /pages/ring-and-jewellery-care-guide-download · `blurb`: Cleaning, safe storage, claw and setting checks, replating and when to have a ring service…

### `latest-news-EM`

- `heading`: LATEST NEWS
- `bg_color`: #f4f4f4
- `blog`: news

### `about_us`

- `design_heading`: 1
- `heading_align`: t4s-text-center
- `icon_heading`: las la-gem
- `tophead_mb`: 30
- `txt_align`: center
- `image_ratio`: ratio16_9
- `image_size`: cover
- `image_position`: 8
- `layout`: t4s-container-wrap
- **custom_css — 0 rule(s), needs a home in v3:**
- blocks:
  - **bl_button** — `button_label`: VIEW MORE · `button_link`: shopify://blogs/news · `open_link`: _blank · `button_style`: outline · `btn_size`: large · `btn_cl`: dark · `button_effect`: default · `mgb`: 15 · `mgb_mb`: 10

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

- `custom_liquid`: <script type="application/ld+json"> { "@context": "https://schema.org", "@type": "JewelryS…
- `layout`: t4s-container-wrap
