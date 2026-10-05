# Asset manifest — THE SHOE IN MOTION

Every visual in the experience, its source and licence. Nothing Nike-owned is
used; the brand reference is conceptual.

## 3D

| asset | source | licence | purpose | sections |
|---|---|---|---|---|
| `MaterialsVariantsShoe.glb` (7.8 MB) | [Khronos glTF-Sample-Assets](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/MaterialsVariantsShoe) — © 2021 Shopify | CC-BY 4.0 | Live WebGL shoe (hero, anatomy, product, final) · source for the baked 72-frame sequence · 3 colourways via `KHR_materials_variants` (Midnight / Street / Beach) | 01, 02, 03, 07, 08 |

Served from jsDelivr (`cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Assets@main/...`) with raw GitHub as fallback. Both send `Access-Control-Allow-Origin: *`.

## Image sequence

| asset | source | purpose | section |
|---|---|---|---|
| 72 × 1440×810 JPEG (desktop) / 36 × 720×1280 (mobile) | **Rendered on-device** from the model above at load time (`src/lib/three/bakeSequence.ts`) | Scroll-scrubbed turntable on a 2D canvas | 02 MOTION |

Drop-in replacement workflow: `public/sequence/README.md`.

## Photography (Pexels licence — free to use, attribution appreciated)

| id | photographer | source | purpose | section |
|---|---|---|---|---|
| 10221754 | Engin Akyurt | https://www.pexels.com/photo/10221754/ | Knit macro | 04 MATERIAL |
| 7500610 | Erik Mclean | https://www.pexels.com/photo/7500610/ | Midsole / foam | 04 MATERIAL |
| 28645960 | Atakan Tok | https://www.pexels.com/photo/28645960/ | Outsole on black | 04 MATERIAL |
| 21879445 | Jonas Baumann | https://www.pexels.com/photo/21879445/ | Stitch detail, B&W | 04 MATERIAL |
| 30159784 | Ansey Photography | https://www.pexels.com/photo/30159784/ | Sprinter | 05 SPEED |
| 5961805 | RUN 4 FFWPU | https://www.pexels.com/photo/5961805/ | Track | 05 SPEED |
| 8692281 | Yaroslav Shuraev | https://www.pexels.com/photo/8692281/ | Start line | 05 SPEED |
| 33995258 | Mathias Reding | https://www.pexels.com/photo/33995258/ | Legs in motion, B&W | 06 ATHLETE |
| 6504853 | RUN 4 FFWPU | https://www.pexels.com/photo/6504853/ | Starting blocks, B&W | 06 ATHLETE |
| 33974329 | Ozan Yavuz | https://www.pexels.com/photo/33974329/ | Trail runner, B&W | 06 ATHLETE |
| 12628400 | HamZa NOUASRIA | https://www.pexels.com/photo/12628400/ | Hero fallback (no WebGL) | 01 THE DROP |

All served from `images.pexels.com` with `?auto=compress&cs=tinysrgb&w=…`
sized per use (1400 / 1600 / 1920). Below-the-fold images use
`loading="lazy" decoding="async"`.

## Typography (Google Fonts, OFL)

* Anton — display / campaign type
* Archivo — body & labels
* JetBrains Mono — HUD / engineering microtype

## Generated / procedural

* Film grain: inline SVG `feTurbulence` tile (CSS)
* Studio lighting: `RoomEnvironment` PMREM (no HDR download)
* Anatomy exploded view: clipping planes on the live mesh (no extra assets)
