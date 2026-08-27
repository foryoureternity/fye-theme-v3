# index — build plan (full values)

Reduced from `index.json` by `docs/tools/template-plan.mjs`.
Settings left at defaults, blanks and per-block typography controls are
dropped. Values are complete — safe to port from.
Do not hand-edit; re-run instead.

## Section order

| # | id | type | state | blocks | in v3 |
|---|---|---|---|---|---|
| 1 | `1646028739ae283905` | `fye-hero` | live | heading ×2, logo, spacer ×2, subtext, button ×2 | yes |
| 2 | `fye_trust_strip_home` | `fye-trust-strip` | live | point ×4 | yes |
| 3 | `feature_columns2_A486RK` | `feature_columns2` | live | text_block ×2 | yes |
| 4 | `fye_two_ways_wdDULb` | `fye-two-ways` | live | point_a ×5, point_b ×5 | yes |
| 5 | `custom_collections_cq7kaN` | `custom-collections` | live | — | yes |
| 6 | `fye_testimonials_WTRaAj` | `fye-testimonials` | live | testimonial ×6 | yes |
| 7 | `featured_collection_PHLfPD` | `featured-collection` | live | — | yes |
| 8 | `fye_mediatext_designed_home` | `fye-media-text` | live | button | yes |
| 9 | `fye_gallery_promo_home` | `fye-gallery-promo` | live | set ×3 | yes |
| 10 | `collections_list_yhBj9B` | `collections-list` | disabled | collection_item ×10 | NO |
| 11 | `fye_mediatext_guarantee_home` | `fye-media-text` | live | — | yes |
| 12 | `guide_download_block_HFUQjC` | `guide-download-block` | live | guide ×6 | yes |
| 13 | `latest_news_em_7BeeqP` | `latest-news-EM` | live | — | yes |
| 14 | `about_us_Uz4M3z` | `about_us` | live | bl_button | yes |
| 15 | `fye_consultation_home` | `fye-consultation` | live | contact ×3 | yes |
| 16 | `custom_liquid_HcmjWC` | `custom-liquid` | live | — | NO |

16 sections, 15 live, 1 disabled.

## Live section types not yet in v3

- `custom-liquid`

## Settings that carry a decision

### `fye-hero` — id `1646028739ae283905`

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
  - **heading** `heading_html_qez6MB`
    - `html`: <h1 class="fye-hero-h1" style="font-family:'Tenor Sans',sans-serif;font-size:clamp(24px,4vw,38px);max-width:700px;line-height:1.3;font-weight:400;letter-spacing:0.02em;color:#f2f1e8;margin:0 0 15px;text-transform:none;">Beautifully made engagement rings, wedding rings and fine jewellery, ethically sourced, fairly priced.</h1>
  - **logo** `logo_image_home`
    - `logo_url`: https://cdn.shopify.com/s/files/1/0972/5391/7056/files/temp-logo-white-1.svg?v=1771834133
    - `alt`: For Your Eternity
    - `width`: 250
    - `width_mb`: 220
  - **spacer** `spacer_space_html_qFytWD`
    - `height`: 24
    - `height_mb`: 1
  - **subtext** `subtext_custom_text_4QwV74`
    - `text`: Ethical diamonds, personal guidance and bespoke craftsmanship from a London jeweller.
    - `tag`: p
    - `color`: #f2f1e8
    - `font_size`: 18
    - `line_height`: 29
    - `font_weight`: 300
    - `margin_bottom`: 15
    - `font_size_mb`: 15
    - `line_height_mb`: 22
    - `margin_bottom_mb`: 10
  - **spacer** `spacer_space_html_9Myq7q`
    - `height`: 8
    - `height_mb`: 2
  - **button** `button_custom_button_i7zWjM`
    - `text`: Shop Engagement Rings
    - `link`: shopify://pages/engagement-rings
    - `target`: _self
    - `bg_color`: #ffffff
    - `text_color`: #233d47
    - `border_color`: #ffffff
    - `bg_color_hover`: #879b87
    - `text_color_hover`: #ffffff
    - `font_size`: 13
    - `font_weight`: 500
    - `letter_spacing`: 2
    - `min_height`: 48
    - `padding_lr`: 34
    - `uppercase`: true
    - `font_size_mb`: 12
    - `min_height_mb`: 44
    - `padding_lr_mb`: 20
  - **button** `button_custom_button_QH4tA6`
    - `text`: Shop Wedding Rings
    - `link`: shopify://pages/wedding-rings
    - `target`: _self
    - `bg_color`: #ffffff
    - `text_color`: #233d47
    - `border_color`: #ffffff
    - `bg_color_hover`: #879b87
    - `text_color_hover`: #ffffff
    - `font_size`: 13
    - `font_weight`: 500
    - `letter_spacing`: 2
    - `min_height`: 48
    - `padding_lr`: 34
    - `uppercase`: true
    - `font_size_mb`: 12
    - `min_height_mb`: 44
    - `padding_lr_mb`: 20
  - **heading** `text_consultation_link`
    - `html`: <a href="https://calendar.app.google/UKFkGvMLzAYEviqy8" style="display:inline-block;margin-top:8px;font-family:'Outfit',sans-serif;font-size:15px;font-weight:400;color:rgba(242,241,232,.95);text-decoration:underline;text-underline-offset:4px;">Or book a free London or online consultation</a>

### `fye-trust-strip` — id `fye_trust_strip_home`

- `band`: white
- blocks:
  - **point** `point_certified`
    - `icon`: certified
    - `label`: Independently Certified
    - `sub`: GIA & IGI certified diamonds
  - **point** `point_fair`
    - `icon`: fair
    - `label`: Fair & Transparent
    - `sub`: Direct pricing, no retail markups
  - **point** `point_guidance`
    - `icon`: guidance
    - `label`: Personal Guidance
    - `sub`: 1-on-1 consultations with London jewellers
  - **point** `point_riskfree`
    - `icon`: risk-free
    - `label`: Risk-Free Purchasing
    - `sub`: Free insured delivery & 1st-year resizing

### `feature_columns2` — id `feature_columns2_A486RK`

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
  - **text_block** `text_block_VY9JKk`
    - `enable_image`: true
    - `image`: shopify://shop_images/FYE-initial-logo-light_1.png
    - `open_link`: _blank
    - `button_style`: default
    - `btn_size`: large
    - `btn_cl`: dark
    - `button_effect`: fade
    - `col_dk`: 3
    - `col_tb`: 4
    - `col_mb`: 12
  - **text_block** `text_block_P8TPry`
    - `title`: why choose for your eternity?
    - `text`: <p>At For Your Eternity, we offer ethically crafted engagement and wedding rings that combine exceptional quality, timeless design, and fair pricing. With ethical diamonds, both natural and lab-grown, and sustainable metals, a transparent and educational approach, and bespoke or ready-to-wear options, we make finding the perfect ring an effortless and meaningful experience.<br/>As a London-based jeweller, we offer in-person consultations across London and online appointments wherever you are.</p>
    - `open_link`: _blank
    - `button_style`: default
    - `btn_size`: large
    - `btn_cl`: dark
    - `button_effect`: fade
    - `col_dk`: 8
    - `col_tb`: 8
    - `col_mb`: 12

### `fye-two-ways` — id `fye_two_ways_wdDULb`

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
  - **point_a** `point_a_YiYbDV`
    - `text`: Over 3,000 rings, configurable by metal, size and centre stone
  - **point_a** `point_a_kkeCXY`
    - `text`: Order online today, no appointment needed
  - **point_a** `point_a_KDzAiU`
    - `text`: Free insured delivery
    - `short`: Free insured delivery, resizing for the first year, lifetime warranty
  - **point_a** `point_a_GET8UM`
    - `text`: Complimentary resizing for the first year
    - `hide_mobile`: true
  - **point_a** `point_a_GVQnne`
    - `text`: Lifetime warranty
    - `hide_mobile`: true
  - **point_b** `point_b_NP4tQc`
    - `text`: Free, always
    - `short`: Free, always. 20 minutes to start, and as long as it takes after that
  - **point_b** `point_b_mLpUK6`
    - `text`: 20 minutes to start, and as long as it takes after that
    - `hide_mobile`: true
  - **point_b** `point_b_gChC9k`
    - `text`: In person in London, or by video, phone or WhatsApp
  - **point_b** `point_b_xNcR4h`
    - `text`: You speak to us, not a call centre
    - `short`: You speak to us, not a call centre. No obligation
  - **point_b** `point_b_8jYhhK`
    - `text`: No obligation, no pressure
    - `hide_mobile`: true

### `custom-collections` — id `custom_collections_cq7kaN`

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

### `fye-testimonials` — id `fye_testimonials_WTRaAj`

- `heading`: Testimonials
- `avg_rating`: 4.9/5
- `enable_autoplay`: true
- `autoplay_seconds`: 5.5
- `transition_ms`: 500
- blocks:
  - **testimonial** `testimonial_YWNeHc`
    - `quote`: <p>The entire process was informative, with helpful guidence, lots of ideas and resulting in delivery of the very moment I had hoped. For your eternity is the place to start your special moments without doubt. Incredible quality and the correct asnwer !</p>
    - `name`: Matthew C.
    - `context`: Engagement Ring
    - `rating`: 5
  - **testimonial** `testimonial_3QkATh`
    - `quote`: <p>Expert and friendly guidance through out the process. I ended up with a beautiful ring both me and my partner love. would recommend highly to anyone.</p>
    - `name`: James G.
    - `context`: Engagement Ring
    - `rating`: 5
  - **testimonial** `testimonial_Rhnrrc`
    - `quote`: <p>Trustworthy, reliable and attentive - exactly what we wanted and delivered in time for the big day - thank you Ed. Great service</p>
    - `name`: Azeem A.
    - `context`: Pair Of Wedding Rings
    - `rating`: 5
  - **testimonial** `testimonial_qLjif4`
    - `quote`: <p>From the first email to the final fitting, the team made designing my engagement ring feel effortless. The lab-grown diamond is breathtaking and the craftsmanship is beyond anything I expected.</p>
    - `name`: Eleanor R.
    - `context`: Engagement Ring
  - **testimonial** `testimonial_3tEreq`
    - `quote`: <p>We wanted matching wedding bands that felt personal, and For Your Eternity delivered exactly that. The attention to detail and the gentle, unhurried guidance made the whole process a joy.</p>
    - `name`: James & Priya
    - `context`: A Pair Of Wedding Rings
  - **testimonial** `testimonial_RVhzLU`
    - `quote`: <p>I was nervous buying a ring online, but the transparency around the stone and the lifetime guarantee put me completely at ease. It arrived beautifully packaged and even more stunning in person.</p>
    - `name`: Marcus T.
    - `context`: Solitaire Engagement Ring

### `featured-collection` — id `featured_collection_PHLfPD`

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

### `fye-media-text` — id `fye_mediatext_designed_home`

- `band`: sage
- `reverse`: true
- `full_bleed`: true
- `image`: shopify://shop_images/Ring_11.png
- `image_alt`: Bespoke ring design
- `placeholder`: Bespoke design
- `eyebrow`: Bespoke Design
- `heading`: Designed With You
- `body`: <p>Tell us what you have in mind. We'll source the perfect stone, refine the design, and craft your ring in London.</p><p><em>Every commission is guided personally by our founder — from first sketch to final polish.</em></p>
- blocks:
  - **button** `btn_enquiry`
    - `label`: Start a Bespoke Enquiry
    - `link`: #
    - `style`: btn--onteal
    - `trigger_class`: open-design-your-own

### `fye-gallery-promo` — id `fye_gallery_promo_home`

- `eyebrow`: From Our Workshop
- `heading`: <p>Pieces We've<br/>Already Made</p>
- `body`: <p>Engagement rings, wedding pairs and pendants we've made for our clients — some chosen from our collections, some designed from scratch, most somewhere in between. Use the gallery to see what's possible, then tell us where you'd like to start.</p>
- `cta_label`: View the Gallery
- `cta_link`: shopify://pages/jewellery-gallery
- `ground`: #FFFFFF
- `rotate_seconds`: 5
- `pad_top`: 72
- `pad_bottom`: 72
- blocks:
  - **set** `set_1`
    - `image_lead`: shopify://shop_images/teal-sapphire-engagement-ring-platinum-marquise-diamonds.jpg
    - `image_top`: shopify://shop_images/curved-wedding-ring-pair-18ct-yellow-gold-matt-finish.jpg
    - `image_bottom`: shopify://shop_images/emerald-cut-diamond-and-marquise-emerald-pendant-platinum.jpg
    - `link`: shopify://pages/jewellery-gallery
  - **set** `set_2`
    - `image_lead`: shopify://shop_images/oval-diamond-solitaire-18ct-yellow-gold-diamond-set-shoulders.jpg
    - `image_top`: shopify://shop_images/platinum-grain-set-and-white-gold-court-wedding-ring-pair.jpg
    - `image_bottom`: shopify://shop_images/emerald-and-tanzanite-wedding-rings-18ct-yellow-and-white-gold.jpg
    - `link`: shopify://pages/jewellery-gallery
  - **set** `set_3`
    - `image_lead`: shopify://shop_images/001-oval-solitaire-yellow-gold-2-17ct-photo-2-three-quarter.jpg
    - `image_top`: shopify://shop_images/curved-diamond-set-platinum-wedding-ring.jpg
    - `image_bottom`: shopify://shop_images/platinum-diamond-and-emerald-pendant-on-chain.jpg
    - `link`: shopify://pages/jewellery-gallery

### `collections-list` — id `collections_list_yhBj9B` *(disabled)*

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
  - **collection_item** `collection_item_AQ9LwH`
    - `image`: shopify://shop_images/icon101.svg
    - `icon`: las la-gem
    - `collection_title`: Round brilliant
    - `collection_link`: shopify://collections/round-cut
  - **collection_item** `collection_item_TxmUJ8`
    - `image`: shopify://shop_images/icon102.svg
    - `icon`: las la-gem
    - `collection_title`: Oval
    - `collection_link`: shopify://collections/oval-cut
  - **collection_item** `collection_item_MAwQW6`
    - `image`: shopify://shop_images/icon103.svg
    - `icon`: las la-gem
    - `collection_title`: Cushion
    - `collection_link`: shopify://collections/cushion-cut-engagement-rings
  - **collection_item** `collection_item_t98xEK`
    - `image`: shopify://shop_images/icon104.svg
    - `icon`: las la-gem
    - `collection_title`: Pear
    - `collection_link`: shopify://collections/pear-cut-engagement-rings
  - **collection_item** `collection_item_YDepne`
    - `image`: shopify://shop_images/icon105.svg
    - `icon`: las la-gem
    - `collection_title`: Emerald
    - `collection_link`: shopify://collections/emerald-cut-engagement-rings
  - **collection_item** `collection_item_NLmTLV`
    - `image`: shopify://shop_images/icon106.svg
    - `icon`: las la-gem
    - `collection_title`: Radiant
    - `collection_link`: shopify://collections/radiant-cut-engagement-rings
  - **collection_item** `collection_item_rXYKbd`
    - `image`: shopify://shop_images/icon107.svg
    - `icon`: las la-gem
    - `collection_title`: Princess
    - `collection_link`: shopify://collections/princess-cut
  - **collection_item** `collection_item_CMJEbF`
    - `image`: shopify://shop_images/icon108.svg
    - `icon`: las la-gem
    - `collection_title`: Marquise
    - `collection_link`: shopify://collections/marquise-cut
  - **collection_item** `collection_item_mKxJ8K`
    - `image`: shopify://shop_images/icon109.svg
    - `icon`: las la-gem
    - `collection_title`: Asscher
    - `collection_link`: shopify://collections/asscher-cut-engagement-rings
  - **collection_item** `collection_item_WqitYD`
    - `image`: shopify://shop_images/icon110.svg
    - `icon`: las la-gem
    - `collection_title`: Heart
    - `collection_link`: shopify://collections/heart-shaped-cut

### `fye-media-text` — id `fye_mediatext_guarantee_home`

- `band`: mist
- `full_bleed`: true
- `image`: shopify://shop_images/Ring_211_5.png
- `image_alt`: Hand wearing a For Your Eternity ring
- `placeholder`: Hand with ring
- `heading`: The For Your Eternity Guarantee
- `body`: <ul><li>GIA & IGI Certified Diamonds</li><li>Ethical, conflict free gemstones & precious metals</li><li>10% discount on your wedding ring for returning customers</li><li>Free insured delivery</li><li>Complimentary resizing for one year</li><li>Complimentary cleaning for life</li><li>Lifetime warranty against manufacturing defects</li></ul>

### `guide-download-block` — id `guide_download_block_HFUQjC`

- `heading`: Free Expert Guides
- `subtext`: <p>Six expert guides — read online or take the free PDF, whatever stage you're at.</p>
- `button_label`: View Guide
- `view_all_url`: shopify://pages/downloadable-guides
- `background`: teal
- blocks:
  - **guide** `guide_nqMpEg`
    - `show`: true
    - `cover`: shopify://shop_images/Engagement_Ring_Cover.png
    - `title`: The Engagement Ring Guide
    - `klaviyo_form_id`: V9eDYg
    - `blurb`: Budget, the Four Cs, diamond shapes, settings, sizing and bespoke design.
  - **guide** `guide_EcHX78`
    - `show`: true
    - `cover`: shopify://shop_images/Plain_Wedding_Cover.png
    - `title`: The Plain Wedding Ring Guide
    - `klaviyo_form_id`: XMzNMS
    - `blurb`: Profiles, metals, finishes, shaped-to-fit bands and matched pairs.
  - **guide** `guide_E4wjqh`
    - `show`: true
    - `cover`: shopify://shop_images/Diamond_Ring_Guide.png
    - `title`: The Diamond Wedding Ring Guide
    - `klaviyo_form_id`: Rch5bG
    - `blurb`: Eternity rings, setting styles, shaped-to-fit bands and everyday wear.
  - **guide** `guide_kfKxhB`
    - `show`: true
    - `cover`: shopify://shop_images/Eternity_Ring_Guide_Cover_v3.png
    - `title`: The Eternity Ring Guide
    - `klaviyo_form_id`: TNb26i
    - `blurb`: Full and half eternity styles, stone settings, spacing and how to wear them.
  - **guide** `guide_6YGjbT`
    - `show`: true
    - `cover`: shopify://shop_images/diamond-and-gemstone-guide-cover.png
    - `title`: The Diamond & Gemstone Guide
    - `klaviyo_form_id`: UbTxH7
    - `blurb`: Diamonds, coloured gemstones, lab-grown stones and choosing the right stone for your ring.
  - **guide** `guide_CareGd`
    - `show`: true
    - `cover`: shopify://shop_images/ring-care-guide-cover.png
    - `title`: The Ring & Jewellery Care Guide
    - `klaviyo_form_id`: RINGCARE
    - `file_url`: /pages/ring-and-jewellery-care-guide-download
    - `blurb`: Cleaning, safe storage, claw and setting checks, replating and when to have a ring serviced.

### `latest-news-EM` — id `latest_news_em_7BeeqP`

- `heading`: LATEST NEWS
- `bg_color`: #f4f4f4
- `blog`: news

### `about_us` — id `about_us_Uz4M3z`

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
  - **bl_button** `bl_button_Ncd7xJ`
    - `button_label`: VIEW MORE
    - `button_link`: shopify://blogs/news
    - `open_link`: _blank
    - `button_style`: outline
    - `btn_size`: large
    - `btn_cl`: dark
    - `button_effect`: default
    - `mgb`: 15
    - `mgb_mb`: 10

### `fye-consultation` — id `fye_consultation_home`

- `band`: teal
- `eyebrow`: Personal Guidance
- `heading`: Still Unsure Where to Start?
- `lead`: Book a free consultation — in person, by phone or video.
- `btn_label`: Book a Free Consultation
- `btn_link`: https://calendar.app.google/UKFkGvMLzAYEviqy8
- blocks:
  - **contact** `contact_phone`
    - `type`: phone
    - `label`: 0208 178 6687
  - **contact** `contact_email`
    - `type`: email
    - `label`: hello@foryoureternity.com
  - **contact** `contact_whatsapp`
    - `type`: whatsapp
    - `label`: WhatsApp

### `custom-liquid` — id `custom_liquid_HcmjWC`

- `custom_liquid`: <script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "JewelryStore",
  "@id": "https://foryoureternity.com/#business",
  "name": "For Your Eternity",
  "description": "Ethical engagement, wedding and eternity rings from a London jeweller. GIA/IGI-certified natural and lab-grown diamonds, transparent pricing, in-person and online consultations.",
  "url": "https://foryoureternity.com",
  "logo": "{{ 'fye-logo-square.png' | asset_url | split: '//' | last | prepend: 'https://' }}",
  "image": "{{ 'fye-logo-wide.png' | asset_url | split: '//' | last | prepend: 'https://' }}",
  "email": "hello@foryoureternity.com",
  "telephone": "+442081786687",
  "priceRange": "££",
  "currenciesAccepted": "GBP",
  "areaServed": [
    { "@type": "City", "name": "London" },
    { "@type": "Country", "name": "United Kingdom" }
  ],
  "sameAs": [
    "https://www.instagram.com/foryoureternityjewellery/"
  ],
  "potentialAction": {
    "@type": "ReserveAction",
    "target": "https://calendar.app.google/UKFkGvMLzAYEviqy8",
    "name": "Book a free consultation"
  }
}
</script>
- `layout`: t4s-container-wrap
