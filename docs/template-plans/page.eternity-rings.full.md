# page.eternity-rings — build plan (full values)

Reduced from `page.eternity-rings.json` by `docs/tools/template-plan.mjs`.
Settings left at defaults, blanks and per-block typography controls are
dropped. Values are complete — safe to port from.
Do not hand-edit; re-run instead.

## Section order

| # | id | type | state | blocks | in v3 |
|---|---|---|---|---|---|
| 1 | `slideshow_aKggAT` | `fye-hero` | live | heading, logo, subtext, spacer ×2, button ×2 | yes |
| 2 | `fye_mediatext_custom_eter` | `fye-media-text` | live | button | yes |
| 3 | `featured_collection_NFfNPH` | `featured-collection` | live | — | yes |
| 4 | `fye_guidedl_eter` | `fye-guide-download` | live | button | NO |
| 5 | `shipping_why_eter` | `shipping` | live | shipping ×8 | NO |
| 6 | `fye_mediatext_consult_eter` | `fye-media-text` | live | button | yes |
| 7 | `accordion_faq_eter` | `accordion` | live | accor_item ×7 | NO |
| 8 | `fye_mediatext_guarantee_eter` | `fye-media-text` | live | — | yes |
| 9 | `fye_consultation_eter` | `fye-consultation` | live | contact ×3 | yes |

9 sections, 9 live, 0 disabled.

## Live section types not yet in v3

- `accordion`
- `fye-guide-download`
- `shipping`

## Settings that carry a decision

### `fye-hero` — id `slideshow_aKggAT`

- `image`: shopify://shop_images/eternity-new.png
- `image_mb`: shopify://shop_images/wedding-1.webp
- `image_position`: center center
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
  - **heading** `heading_html_Egbhzq`
    - `html`: <h1 class="fye-hero-h1" style="font-family:'Tenor Sans',sans-serif;font-size:clamp(24px,4vw,38px);max-width:560px;line-height:1.3;font-weight:400;letter-spacing:0.02em;color:#f2f1e8;margin:0 0 15px;text-transform:none;">Eternity Rings by</h1>
  - **logo** `logo_image_JtHEDW`
    - `logo_url`: https://cdn.shopify.com/s/files/1/0972/5391/7056/files/temp-logo-white-1.svg?v=1771834133
    - `alt`: For Your Eternity
    - `width`: 250
    - `width_mb`: 220
  - **subtext** `subtext_custom_text_Nb3mBi`
    - `text`: Celebrate a love with no beginning and no end — ethically crafted eternity rings, set with diamonds and gemstones to mark a lifetime together.
    - `tag`: p
    - `color`: #f2f1e8
    - `font_size`: 18
    - `line_height`: 29
    - `font_weight`: 300
    - `margin_bottom`: 15
    - `font_size_mb`: 15
    - `line_height_mb`: 22
    - `margin_bottom_mb`: 10
  - **spacer** `spacer_space_html_gqjFhG`
    - `height`: 24
    - `height_mb`: 2
  - **button** `button_custom_button_jJxeTx`
    - `text`: VIEW OUR ETERNITY Rings
    - `link`: shopify://collections/eternity-rings
    - `target`: _self
    - `bg_color`: #f2f1e8
    - `text_color`: #233d47
    - `bg_color_hover`: #233d47
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
  - **button** `button_custom_button_guideEte`
    - `text`: Eternity Ring Guide
    - `link`: shopify://pages/eternity-ring-guide
    - `target`: _self
    - `bg_color`: #f2f1e8
    - `text_color`: #233d47
    - `bg_color_hover`: #233d47
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
  - **spacer** `spacer_gap_logo_ete`
    - `height`: 24
    - `height_mb`: 1

### `fye-media-text` — id `fye_mediatext_custom_eter`

- `band`: sage
- `reverse`: true
- `full_bleed`: true
- `image`: shopify://shop_images/Custom_Eternity_Ring.png
- `image_alt`: Custom eternity ring craftsmanship
- `placeholder`: Custom ring craftsmanship
- `heading`: Custom Eternity Rings, Made to Fit
- `body`: <p>An eternity ring marks a milestone — an anniversary, a vow renewed, a life shared. We can craft one to sit perfectly alongside your existing engagement and wedding bands, matched to their exact contours. Book a free consultation to design yours.</p>
- blocks:
  - **button** `btn_book`
    - `label`: Book Consultation
    - `link`: https://calendar.app.google/UKFkGvMLzAYEviqy8
    - `style`: btn--onteal

### `featured-collection` — id `featured_collection_NFfNPH`

- `design_heading`: 2
- `heading_align`: t4s-text-center
- `top_heading`: our most popular eternity rings
- `icon_heading`: las la-gem
- `tophead_mb`: 30
- `head_btn_label`: View All
- `head_btn_style`: default
- `head_btn_size`: medium
- `head_btn_cl`: dark
- `head_btn_effect`: default
- `collection`: eternity-rings
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

### `fye-guide-download` — id `fye_guidedl_eter`

- `band`: teal
- `cover`: shopify://shop_images/Eternity_Ring_Guide_Cover_v3.png
- `cover_alt`: The Eternity Ring Guide
- `cover_caption`: The Eternity Ring Guide
- `heading`: The Eternity Ring Guide
- `body`: <p>Full and half eternity styles, stone settings, spacing and how to wear them — read online or take the free PDF.</p>
- blocks:
  - **button** `btn_download`
    - `label`: View The Guide
    - `link`: shopify://pages/eternity-ring-guide
    - `style`: btn--onteal

### `shipping` — id `shipping_why_eter`

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
- `layout`: t4s-se-container
- **custom_css — 0 rule(s), needs a home in v3:**
- blocks:
  - **shipping** `shipping_CDXd6U`
    - `icon_themes`: none
    - `icon`: las la-shipping-fast
    - `text`: <p>ethically sourced diamonds and materials</p>
    - `html`: <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewbox="0 0 272 242" style="fill-rule:evenodd;clip-rule:evenodd;stroke-miterlimit:10;" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:serif="http://www.serif.com/" xml:space="preserve">    <g transform="matrix(2.66667,0,0,2.66667,52.1859,76.3264)">        <path d="M0,-24.851L4.058,-0.12C4.065,-0.078 4.12,-0.067 4.143,-0.103L19.545,-24.661C19.597,-24.743 19.719,-24.736 19.76,-24.648L31.347,0L-15.801,0" style="fill:none;fill-rule:nonzero;stroke:rgb(35,61,71);stroke-width:0.75px;"></path>    </g>    <g transform="matrix(-1.13096,-2.41496,-2.41496,1.13096,154.308,88.1104)">        <path d="M-45.783,29.114L18.514,29.114" style="fill:none;fill-rule:nonzero;stroke:rgb(35,61,71);stroke-width:0.75px;"></path>    </g>    <g transform="matrix(2.66667,0,0,2.66667,135.77,231.602)">        <path d="M0,-83.082L31.347,-83.082L47.148,-58.361L0,0L-47.145,-58.359L-31.344,-83.079L0.003,-83.079" style="fill:none;fill-rule:nonzero;stroke:rgb(35,61,71);stroke-width:0.75px;"></path>    </g>    <g transform="matrix(2.66667,0,0,2.66667,219.362,76.3192)">        <path d="M0,-24.851L-4.058,-0.12C-4.065,-0.078 -4.12,-0.067 -4.143,-0.103L-19.545,-24.661C-19.597,-24.743 -19.719,-24.736 -19.76,-24.648L-31.347,0L15.801,0" style="fill:none;fill-rule:nonzero;stroke:rgb(35,61,71);stroke-width:0.75px;"></path>    </g>    <g transform="matrix(1.13091,-2.41498,-2.41498,-1.13091,227.023,219.814)">        <path d="M-18.515,29.116L45.784,29.116" style="fill:none;fill-rule:nonzero;stroke:rgb(35,61,71);stroke-width:0.75px;"></path>    </g>    <g transform="matrix(0,2.66667,2.66667,0,213.411,153.961)">        <path d="M-29.116,-29.116L29.116,-29.116" style="fill:none;fill-rule:nonzero;stroke:rgb(35,61,71);stroke-width:0.75px;"></path>    </g></svg>
  - **shipping** `shipping_VVCxnM`
    - `icon_themes`: none
    - `icon`: las la-shipping-fast
    - `text`: <p>competitive pricing</p>
    - `html`: <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewbox="0 0 218 258" style="fill-rule:evenodd;clip-rule:evenodd;stroke-miterlimit:10;" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:serif="http://www.serif.com/" xml:space="preserve">    <g transform="matrix(-2.66667,0,0,2.66667,10.0499,247.56)">        <path d="M-22.56,-77.72L-15.404,-77.72L0,-62.317L0,0L-22.56,0" style="fill:none;fill-rule:nonzero;stroke:rgb(35,61,71);stroke-width:0.75px;"></path>    </g>    <g transform="matrix(2.66667,0,0,2.66667,70.2099,247.56)">        <path d="M0,-77.72L7.156,-77.72L22.56,-62.317L22.56,0L0,0" style="fill:none;fill-rule:nonzero;stroke:rgb(35,61,71);stroke-width:0.75px;"></path>    </g>    <g transform="matrix(2.50934,-0.902386,-0.902386,-2.50934,132.817,235.967)">        <path d="M-0.319,1.827L10.48,1.827" style="fill:none;fill-rule:nonzero;stroke:rgb(35,61,71);stroke-width:0.75px;"></path>    </g>    <g transform="matrix(2.50941,-0.902196,-0.902196,-2.50941,73.8144,73.1803)">        <path d="M11.813,5.009L16.912,5.009L30.412,-8.488L30.418,-63.101L10.647,-63.103" style="fill:none;fill-rule:nonzero;stroke:rgb(35,61,71);stroke-width:0.75px;"></path>    </g>    <g transform="matrix(0,-2.66667,-2.66667,0,70.2099,67.0952)">        <ellipse cx="-4.72" cy="0" rx="4.72" ry="4.72" style="fill:none;stroke:rgb(35,61,71);stroke-width:0.75px;"></ellipse>    </g>    <g transform="matrix(2.3545,1.25198,1.25198,-2.3545,49.7807,52.7455)">        <path d="M6.873,-4.423C4.347,-3.083 2.181,-0.999 0.737,1.716C-3.112,8.953 -0.364,17.94 6.873,21.788C14.111,25.637 23.098,22.889 26.946,15.652C27.295,14.996 27.589,14.327 27.831,13.648" style="fill:none;fill-rule:nonzero;stroke:rgb(35,61,71);stroke-width:0.75px;"></path>    </g>    <g transform="matrix(2.66667,0,0,2.66667,32.3592,109.763)">        <path d="M0,0L28.505,0" style="fill:none;fill-rule:nonzero;stroke:rgb(35,61,71);stroke-width:0.75px;"></path>    </g>    <g transform="matrix(2.66667,0,0,2.66667,67.2707,178.94)">        <path d="M0,4.76L6.264,4.76L6.264,1.156L0,1.156L0,-2.239C0,-3.009 0.14,-3.661 0.42,-4.199C0.7,-4.734 1.102,-5.149 1.628,-5.441C2.152,-5.732 2.753,-5.878 3.429,-5.878C4.339,-5.878 5.062,-5.691 5.599,-5.318C6.136,-4.945 6.649,-4.396 7.139,-3.673L10.183,-6.718C9.506,-7.698 8.609,-8.52 7.489,-9.185C6.369,-9.85 4.981,-10.183 3.324,-10.183C1.785,-10.183 0.402,-9.85 -0.822,-9.185C-2.047,-8.52 -3.009,-7.581 -3.71,-6.368C-4.409,-5.155 -4.759,-3.72 -4.759,-2.064L-4.759,1.156L-7.979,1.156L-7.979,4.76L-4.759,4.76L-4.759,10.709L-7.979,10.709L-7.979,14.943L9.589,14.943L9.589,10.709L0,10.709L0,4.76Z" style="fill:none;fill-rule:nonzero;stroke:rgb(35,61,71);stroke-width:0.75px;"></path>    </g>    <g transform="matrix(2.66667,0,0,2.66667,32.3592,129.798)">        <path d="M0,0L28.505,0" style="fill:none;fill-rule:nonzero;stroke:rgb(35,61,71);stroke-width:0.75px;"></path>    </g></svg>
  - **shipping** `shipping_KaUaYF`
    - `icon_themes`: none
    - `icon`: las la-shipping-fast
    - `text`: <p>matching wedding rings</p>
    - `html`: <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewbox="0 0 305 261" style="fill-rule:evenodd;clip-rule:evenodd;stroke-miterlimit:10;" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:serif="http://www.serif.com/" xml:space="preserve">    <g transform="matrix(2.66667,0,0,2.66667,117.069,11.2179)">        <path d="M0,68.349C-1.797,68.637 -3.641,68.787 -5.52,68.787C-24.636,68.787 -40.132,53.29 -40.132,34.174C-40.132,15.058 -24.636,-0.438 -5.52,-0.438C13.596,-0.438 29.093,15.058 29.093,34.174C29.093,48.705 20.138,61.145 7.446,66.276" style="fill:none;fill-rule:nonzero;stroke:rgb(35,61,71);stroke-width:0.75px;"></path>    </g>    <g transform="matrix(2.66667,0,0,2.66667,111.403,31.0355)">        <path d="M0,53.486C-1.112,53.626 -2.245,53.698 -3.395,53.698C-18.282,53.698 -30.35,41.63 -30.35,26.743C-30.35,11.856 -18.282,-0.212 -3.395,-0.212C11.492,-0.212 23.56,11.856 23.56,26.743C23.56,37.777 16.929,47.263 7.435,51.434" style="fill:none;fill-rule:nonzero;stroke:rgb(35,61,71);stroke-width:0.75px;"></path>    </g>    <g transform="matrix(2.66667,0,0,2.66667,187.712,249.45)">        <path d="M0,-68.349C1.797,-68.637 3.641,-68.787 5.519,-68.787C24.635,-68.787 40.131,-53.29 40.131,-34.174C40.131,-15.058 24.635,0.438 5.519,0.438C-13.597,0.438 -29.094,-15.058 -29.094,-34.174C-29.094,-48.511 -19.942,-61.178 -7.519,-66.432" style="fill:none;fill-rule:nonzero;stroke:rgb(35,61,71);stroke-width:0.75px;"></path>    </g>    <g transform="matrix(2.66667,0,0,2.66667,193.372,229.634)">        <path d="M0,-53.486C1.112,-53.626 2.246,-53.698 3.396,-53.698C18.283,-53.698 30.351,-41.63 30.351,-26.743C30.351,-11.856 18.283,0.212 3.396,0.212C-11.49,0.212 -23.559,-11.856 -23.559,-26.743C-23.559,-37.778 -16.927,-47.265 -7.432,-51.435" style="fill:none;fill-rule:nonzero;stroke:rgb(35,61,71);stroke-width:0.75px;"></path>    </g></svg>
  - **shipping** `shipping_UJihwF`
    - `icon_themes`: none
    - `icon`: las la-shipping-fast
    - `text`: <p>educational approach to finding you the right ring</p>
    - `html`: <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewbox="0 0 207 275" style="fill-rule:evenodd;clip-rule:evenodd;stroke-miterlimit:10;" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:serif="http://www.serif.com/" xml:space="preserve">    <g transform="matrix(2.66667,0,0,2.66667,64.7227,40.1704)">        <path d="M0,-11.294L1.844,-0.054C1.848,-0.035 1.873,-0.03 1.883,-0.046L8.883,-11.208C8.907,-11.245 8.962,-11.242 8.981,-11.201L14.247,0L-7.181,0" style="fill:none;fill-rule:nonzero;stroke:rgb(35,61,71);stroke-width:0.75px;"></path>    </g>    <g transform="matrix(-1.13097,-2.41496,-2.41496,1.13097,97.9336,43.8227)">        <path d="M-14.184,9.02L5.736,9.02" style="fill:none;fill-rule:nonzero;stroke:rgb(35,61,71);stroke-width:0.75px;"></path>    </g>    <g transform="matrix(2.66667,0,0,2.66667,90.7512,10.0531)">        <path d="M0,32.207L-16.942,11.235L-9.761,0L4.486,0" style="fill:none;fill-rule:nonzero;stroke:rgb(35,61,71);stroke-width:0.75px;"></path>    </g>    <g transform="matrix(2.66667,0,0,2.66667,102.711,95.9379)">        <path d="M0,-32.208L14.247,-32.208L21.428,-20.973L4.485,0" style="fill:none;fill-rule:nonzero;stroke:rgb(35,61,71);stroke-width:0.75px;"></path>    </g>    <g transform="matrix(2.66667,0,0,2.66667,140.702,40.1672)">        <path d="M0,-11.294L-1.844,-0.054C-1.848,-0.035 -1.873,-0.03 -1.883,-0.046L-8.883,-11.207C-8.906,-11.245 -8.962,-11.242 -8.981,-11.201L-14.247,0L7.181,0" style="fill:none;fill-rule:nonzero;stroke:rgb(35,61,71);stroke-width:0.75px;"></path>    </g>    <g transform="matrix(1.13091,-2.41499,-2.41499,-1.13091,142.53,92.5797)">        <path d="M-6.763,10.634L16.723,10.634" style="fill:none;fill-rule:nonzero;stroke:rgb(35,61,71);stroke-width:0.75px;"></path>    </g>    <g transform="matrix(0,2.66667,2.66667,0,123.532,60.9896)">        <path d="M-7.808,-7.808L7.808,-7.808" style="fill:none;fill-rule:nonzero;stroke:rgb(35,61,71);stroke-width:0.75px;"></path>    </g>    <g transform="matrix(2.66667,0,0,2.66667,103.157,99.6072)">        <path d="M0,53.907C-14.886,53.907 -26.953,41.839 -26.953,26.954C-26.953,12.068 -14.886,0 0,0C14.886,0 26.953,12.068 26.953,26.954C26.953,41.839 14.886,53.907 0,53.907M0,-7.961C-19.283,-7.961 -34.915,7.671 -34.915,26.954C-34.915,46.236 -19.283,61.868 0,61.868C19.283,61.868 34.914,46.236 34.914,26.954C34.914,7.671 19.283,-7.961 0,-7.961" style="fill:white;fill-rule:nonzero;"></path>    </g>    <g transform="matrix(2.66667,0,0,2.66667,103.157,99.6072)">        <path d="M0,53.907C-14.886,53.907 -26.953,41.839 -26.953,26.954C-26.953,12.068 -14.886,0 0,0C14.886,0 26.953,12.068 26.953,26.954C26.953,41.839 14.886,53.907 0,53.907ZM0,-7.961C-19.283,-7.961 -34.915,7.671 -34.915,26.954C-34.915,46.236 -19.283,61.868 0,61.868C19.283,61.868 34.914,46.236 34.914,26.954C34.914,7.671 19.283,-7.961 0,-7.961Z" style="fill:none;fill-rule:nonzero;stroke:rgb(35,61,71);stroke-width:0.75px;"></path>    </g>    <g transform="matrix(2.66667,0,0,2.66667,72.7592,167.483)">        <path d="M0,1.5L7.375,8.875L23.625,-7.375" style="fill:white;fill-rule:nonzero;stroke:rgb(35,61,71);stroke-width:0.75px;"></path>    </g></svg>
  - **shipping** `shipping_FbFyEk`
    - `icon_themes`: none
    - `icon`: las la-shipping-fast
    - `text`: <p>fully customisable designs</p>
    - `html`: <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewbox="0 0 238 235" style="fill-rule:evenodd;clip-rule:evenodd;stroke-miterlimit:10;" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:serif="http://www.serif.com/" xml:space="preserve">    <g transform="matrix(2.66667,0,0,2.66667,119.003,40.2469)">        <path d="M0,58.821C-16.243,58.821 -29.41,45.654 -29.41,29.411C-29.41,13.168 -16.243,0 0,0C16.243,0 29.41,13.168 29.41,29.411C29.41,45.654 16.243,58.821 0,58.821M0,-8.687C-21.041,-8.687 -38.098,8.37 -38.098,29.411C-38.098,50.451 -21.041,67.508 0,67.508C21.041,67.508 38.097,50.451 38.097,29.411C38.097,8.37 21.041,-8.687 0,-8.687" style="fill:white;fill-rule:nonzero;"></path>    </g>    <g transform="matrix(2.66667,0,0,2.66667,119.003,40.2469)">        <path d="M0,58.821C-16.243,58.821 -29.41,45.654 -29.41,29.411C-29.41,13.168 -16.243,0 0,0C16.243,0 29.41,13.168 29.41,29.411C29.41,45.654 16.243,58.821 0,58.821ZM0,-8.687C-21.041,-8.687 -38.098,8.37 -38.098,29.411C-38.098,50.451 -21.041,67.508 0,67.508C21.041,67.508 38.097,50.451 38.097,29.411C38.097,8.37 21.041,-8.687 0,-8.687Z" style="fill:none;fill-rule:nonzero;stroke:rgb(35,61,71);stroke-width:0.75px;"></path>    </g>    <g transform="matrix(0,-2.66667,-2.66667,0,29.1832,99.5419)">        <path d="M-7.175,-7.175C-11.138,-7.175 -14.35,-3.963 -14.35,-0C-14.35,3.962 -11.138,7.175 -7.175,7.175C-3.213,7.175 -0,3.962 -0,-0C-0,-3.963 -3.213,-7.175 -7.175,-7.175" style="fill:white;fill-rule:nonzero;"></path>    </g>    <g transform="matrix(0,-2.66667,-2.66667,0,29.1832,99.5419)">        <circle cx="-7.175" cy="0" r="7.175" style="fill:none;stroke:rgb(35,61,71);stroke-width:0.75px;"></circle>    </g>    <g transform="matrix(0,-2.66667,-2.66667,0,119.002,186.565)">        <path d="M-7.175,-7.175C-11.138,-7.175 -14.35,-3.963 -14.35,-0C-14.35,3.962 -11.138,7.175 -7.175,7.175C-3.212,7.175 -0,3.962 -0,-0C-0,-3.963 -3.212,-7.175 -7.175,-7.175" style="fill:white;fill-rule:nonzero;"></path>    </g>    <g transform="matrix(0,-2.66667,-2.66667,0,119.002,186.565)">        <circle cx="-7.175" cy="0" r="7.175" style="fill:none;stroke:rgb(35,61,71);stroke-width:0.75px;"></circle>    </g>    <g transform="matrix(0,-2.66667,-2.66667,0,119.002,10.0499)">        <path d="M-7.175,-7.175C-11.138,-7.175 -14.35,-3.963 -14.35,-0C-14.35,3.962 -11.138,7.175 -7.175,7.175C-3.212,7.175 -0,3.962 -0,-0C-0,-3.963 -3.212,-7.175 -7.175,-7.175" style="fill:white;fill-rule:nonzero;"></path>    </g>    <g transform="matrix(0,-2.66667,-2.66667,0,119.002,10.0499)">        <circle cx="-7.175" cy="0" r="7.175" style="fill:none;stroke:rgb(35,61,71);stroke-width:0.75px;"></circle>    </g>    <g transform="matrix(0,-2.66667,-2.66667,0,208.785,99.5419)">        <path d="M-7.175,-7.175C-11.138,-7.175 -14.35,-3.963 -14.35,-0C-14.35,3.962 -11.138,7.175 -7.175,7.175C-3.213,7.175 -0,3.962 -0,-0C-0,-3.963 -3.213,-7.175 -7.175,-7.175" style="fill:white;fill-rule:nonzero;"></path>    </g>    <g transform="matrix(0,-2.66667,-2.66667,0,208.785,99.5419)">        <circle cx="-7.175" cy="0" r="7.175" style="fill:none;stroke:rgb(35,61,71);stroke-width:0.75px;"></circle>    </g></svg>
  - **shipping** `shipping_jAAiTU`
    - `icon_themes`: none
    - `icon`: las la-shipping-fast
    - `text`: <p>Free, insured shipping</p>
    - `html`: <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewbox="0 0 349 185" style="fill-rule:evenodd;clip-rule:evenodd;stroke-miterlimit:10;" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:serif="http://www.serif.com/" xml:space="preserve">    <g transform="matrix(2.66667,0,0,2.66667,101.943,10.0499)">        <path d="M0,51.909L-10.636,51.909L-10.636,0L60.165,0L60.165,51.909L19.659,51.909" style="fill:none;fill-rule:nonzero;stroke:rgb(35,61,71);stroke-width:0.75px;"></path>    </g>    <g transform="matrix(0,-2.66667,-2.66667,0,128.154,122.262)">        <ellipse cx="-9.83" cy="0" rx="9.829" ry="9.83" style="fill:none;stroke:rgb(35,61,71);stroke-width:0.75px;"></ellipse>    </g>    <g transform="matrix(0,-2.66667,-2.66667,0,296.744,122.262)">        <ellipse cx="-9.83" cy="0" rx="9.829" ry="9.83" style="fill:none;stroke:rgb(35,61,71);stroke-width:0.75px;"></ellipse>    </g>    <g transform="matrix(2.66667,0,0,2.66667,262.383,148.474)">        <path d="M0,0L3.056,0" style="fill:none;fill-rule:nonzero;stroke:rgb(35,61,71);stroke-width:0.75px;"></path>    </g>    <g transform="matrix(2.66667,0,0,2.66667,322.956,45.4712)">        <path d="M0,38.626L5.761,38.626L5.761,15.807L-6.776,0L-22.715,0" style="fill:none;fill-rule:nonzero;stroke:rgb(35,61,71);stroke-width:0.75px;"></path>    </g>    <g transform="matrix(-2.66667,0,0,2.66667,44.1211,45.4712)">        <path d="M-18.098,0L0,0" style="fill:none;fill-rule:nonzero;stroke:rgb(35,61,71);stroke-width:0.75px;"></path>    </g>    <g transform="matrix(-2.66667,0,0,2.66667,10.0499,100.786)">        <path d="M-29.201,0L0,0" style="fill:none;fill-rule:nonzero;stroke:rgb(35,61,71);stroke-width:0.75px;"></path>    </g>    <g transform="matrix(-2.66667,0,0,2.66667,44.1229,81.3117)">        <path d="M-25.401,0L0,0" style="fill:none;fill-rule:nonzero;stroke:rgb(35,61,71);stroke-width:0.75px;"></path>    </g>    <g transform="matrix(-2.66667,0,0,2.66667,28.2912,63.392)">        <path d="M-20.849,0L0,0" style="fill:none;fill-rule:nonzero;stroke:rgb(35,61,71);stroke-width:0.75px;"></path>    </g></svg>
  - **shipping** `shipping_L4p6LB`
    - `icon_themes`: none
    - `icon`: las la-shipping-fast
    - `text`: <p>Free Resizing For One Year</p>
    - `html`: <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewbox="0 0 251 243" style="fill-rule:evenodd;clip-rule:evenodd;stroke-miterlimit:10;" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:serif="http://www.serif.com/" xml:space="preserve">    <g transform="matrix(-1.88562,-1.88562,-1.88562,1.88562,49.0445,-6.10224)">        <path d="M-35.303,14.623L6.057,14.623" style="fill:none;fill-rule:nonzero;stroke:rgb(35,61,71);stroke-width:0.75px;"></path>    </g>    <g transform="matrix(2.66667,0,0,2.66667,88.0392,88.0384)">        <path d="M0,-22.548L0,0L-21.327,0" style="fill:none;fill-rule:nonzero;stroke:rgb(35,61,71);stroke-width:0.75px;"></path>    </g>    <g transform="matrix(1.88562,-1.88562,-1.88562,-1.88562,201.713,104.191)">        <path d="M-6.057,14.623L35.303,14.623" style="fill:none;fill-rule:nonzero;stroke:rgb(35,61,71);stroke-width:0.75px;"></path>    </g>    <g transform="matrix(2.66667,0,0,2.66667,162.718,88.0384)">        <path d="M0,-22.548L0,0L21.327,0" style="fill:none;fill-rule:nonzero;stroke:rgb(35,61,71);stroke-width:0.75px;"></path>    </g>    <g transform="matrix(1.88562,1.88562,1.88562,-1.88562,201.713,138.761)">        <path d="M-6.057,-14.623L35.303,-14.623" style="fill:none;fill-rule:nonzero;stroke:rgb(35,61,71);stroke-width:0.75px;"></path>    </g>    <g transform="matrix(2.66667,0,0,2.66667,162.718,154.914)">        <path d="M0,22.548L0,0L21.327,0" style="fill:none;fill-rule:nonzero;stroke:rgb(35,61,71);stroke-width:0.75px;"></path>    </g>    <g transform="matrix(-1.88562,1.88562,1.88562,1.88562,49.0445,249.055)">        <path d="M-35.303,-14.623L6.057,-14.623" style="fill:none;fill-rule:nonzero;stroke:rgb(35,61,71);stroke-width:0.75px;"></path>    </g>    <g transform="matrix(2.66667,0,0,2.66667,88.0392,154.914)">        <path d="M0,22.548L0,0L-21.327,0" style="fill:none;fill-rule:nonzero;stroke:rgb(35,61,71);stroke-width:0.75px;"></path>    </g></svg>
  - **shipping** `shipping_bVDUpk`
    - `icon_themes`: none
    - `icon`: las la-shipping-fast
    - `text`: <p>Lifetime Warranty*</p>
    - `html`: <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewbox="0 0 222 264" style="fill-rule:evenodd;clip-rule:evenodd;stroke-miterlimit:10;" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:serif="http://www.serif.com/" xml:space="preserve">    <g transform="matrix(2.66667,0,0,2.66667,110.853,10.0499)">        <path d="M0,91.204C16.04,85.858 25.744,76.925 31.296,69.785C35.53,64.34 37.801,57.627 37.801,50.73L37.801,14.162L16.417,14.162L0,0L-16.417,14.162L-37.801,14.162L-37.801,50.73C-37.801,57.627 -35.53,64.34 -31.296,69.785C-25.744,76.925 -16.04,85.858 0,91.204" style="fill:none;fill-rule:nonzero;stroke:rgb(35,61,71);stroke-width:0.75px;"></path>    </g>    <g transform="matrix(0,-2.66667,-2.66667,0,110.852,76.6664)">        <circle cx="-21.621" cy="0" r="21.621" style="fill:none;stroke:rgb(35,61,71);stroke-width:0.75px;"></circle>    </g>    <g transform="matrix(2.66667,0,0,2.66667,84.8797,132.522)">        <path d="M0,1.35L6.637,7.987L21.26,-6.637" style="fill:white;fill-opacity:0;fill-rule:nonzero;stroke:rgb(35,61,71);stroke-width:0.75px;"></path>    </g></svg>

### `fye-media-text` — id `fye_mediatext_consult_eter`

- `band`: sage
- `reverse`: true
- `full_bleed`: true
- `image`: shopify://shop_images/fffg1_1.png
- `image_alt`: Ring presented for a personalised consultation
- `placeholder`: Consultation photo
- `eyebrow`: Your Forever Begins Here
- `heading`: Book A Personalised Consultation
- `body`: <ul><li>Ensure you choose the right ring</li><li>Discover different ring styles</li><li>Pick the right ring for your budget</li><li>Find out how to choose the correct size</li></ul>
- blocks:
  - **button** `btn_book`
    - `label`: Book Consultation
    - `link`: https://calendar.app.google/UKFkGvMLzAYEviqy8
    - `style`: btn--onteal

### `accordion` — id `accordion_faq_eter`

- `design_heading`: 2
- `heading_align`: t4s-text-center
- `top_heading`: frequently asked questions
- `icon_heading`: las la-gem
- `left_heading`: Have More Questions To Ask?
- `left_text`: <p>We’re here to help! If you have any questions about our rings, designs, or ethical sourcing, feel free to reach out. Our experts are happy to guide you.</p>
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
  - **accor_item** `accor_item_ii7YzP`
    - `icon`: none
    - `title`: What makes your eternity rings ethical?
    - `content`: <p>At For Your Eternity, we are committed to ethical sourcing and responsible practices. Our rings are crafted using conflict-free or lab-grown diamonds, responsibly sourced or recycled precious metals, and sustainable materials wherever possible. We adhere to the Kimberley Process Certification Scheme (KPCS) and the World Diamond Council System of Warranties (SoW) to ensure all our diamonds are ethically obtained. Additionally, we work only with trusted suppliers who meet strict environmental and human rights standards.</p>
  - **accor_item** `accor_item_H98KiF`
    - `icon`: none
    - `title`: Do you offer custom ring designs?
    - `content`: <p>Yes! We offer a <strong>fully bespoke ring design service</strong>, allowing you to create a one-of-a-kind engagement or wedding ring. Our experts will guide you through the process, from selecting the perfect diamond or gemstone to designing a setting that reflects your unique style. Whether you want a modern, classic, or vintage-inspired design, we can bring your vision to life.</p>
  - **accor_item** `accor_item_DiqKtg`
    - `icon`: none
    - `title`: How long does it take to receive a custom wedding or engagement ring?
    - `content`: <p>Custom rings typically take 4–6 weeks from the date of design approval to completion. However, this timeframe can vary depending on the complexity of the design, material availability, and any additional customisation requests. If you need a ring by a specific date, please contact us, and we’ll do our best to accommodate your timeline.</p>
  - **accor_item** `accor_item_xc9rtw`
    - `icon`: none
    - `title`: What is your return policy?
    - `content`: <p>We want you to love your ring, and we stand by the quality of our craftsmanship. However, due to the personalised nature of engagement and wedding rings, we can only accept returns in the following circumstances:</p><ul><li>Custom, bespoke, or made-to-order rings are non-returnable and non-refundable.</li><li>Ready-to-wear rings can be returned within 30 days of purchase, provided they are unworn, in original packaging, and in resalable condition.</li><li>If there is a manufacturing defect or the ring does not match the agreed specifications, we will replace or repair it free of charge.</li></ul><p>To initiate a return, please email <a>hello@foryoureternity.com</a> with your order details.</p>
  - **accor_item** `accor_item_inPnDK`
    - `icon`: none
    - `title`: Are your diamonds certified?
    - `content`: <p>Yes, all our natural and lab-grown diamonds come with independent certification from leading gemological institutes, such as the Gemological Institute of America (GIA) and International Gemological Institute (IGI). This certification guarantees the diamond’s authenticity and provides a detailed analysis of its cut, colour, clarity, and carat weight.</p>
  - **accor_item** `accor_item_ptL8Qy`
    - `icon`: none
    - `title`: Do you offer matching wedding bands?
    - `content`: <p>Absolutely! We can create perfectly matching wedding bands to complement your engagement ring. Whether you want a classic plain band, diamond-set band, or a custom-fitted design, we’ll ensure your wedding band sits seamlessly alongside your engagement ring. We can also design bands to match rings purchased elsewhere—simply book a consultation to discuss your options.</p>
  - **accor_item** `accor_item_ieUPmV`
    - `icon`: none
    - `title`: Do you offer financing or payment plans?
    - `content`: <p>Yes, we offer flexible financing and payment plans to help make your dream ring more affordable. Our options may include:</p><ul><li>Interest-free instalments</li><li>Buy now, pay later options</li><li>Custom payment schedules for bespoke pieces</li></ul><p>Please contact us at <a href="mailto:hello@foryoureternity.com" title="mailto:hello@foryoureternity.com">hello@foryoureternity.com</a> for details on available financing options and eligibility requirements.</p>

### `fye-media-text` — id `fye_mediatext_guarantee_eter`

- `band`: mist
- `full_bleed`: true
- `image`: shopify://shop_images/Ring_211_5.png
- `image_alt`: Hand wearing a For Your Eternity ring
- `placeholder`: Hand with ring
- `heading`: The For Your Eternity Guarantee
- `body`: <ul><li>GIA & IGI Certified Diamonds</li><li>Ethical, conflict free gemstones & precious metals</li><li>20% discount on your eternity ring for returning customers</li><li>Free insured delivery</li><li>Complimentary resizing for one year</li><li>Complimentary cleaning for life</li><li>Lifetime warranty against manufacturing defects</li></ul>

### `fye-consultation` — id `fye_consultation_eter`

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
