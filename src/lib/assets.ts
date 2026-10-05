/**
 * ASSET MANIFEST
 * All photography is licensed Pexels imagery (free to use, credit appreciated).
 * The 3D model is © Shopify, CC-BY 4.0 (Khronos glTF Sample Assets).
 * No Nike-owned campaign or product photography is used.
 *
 * Pexels CDN accepts `w` for responsive sizing – we request only what we draw.
 */
export interface Asset {
  id: string;
  src: string;
  alt: string;
  credit: string;
  source: string;
  purpose: string;
  section: string;
}

const px = (id: number, w: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

export const ASSETS = {
  knit: {
    id: 'knit',
    src: px(10221754, 1600),
    alt: 'Macro of grey knitted fabric showing the weave structure',
    credit: 'Engin Akyurt',
    source: 'https://www.pexels.com/photo/10221754/',
    purpose: 'Material study – engineered knit upper',
    section: '04 MATERIAL',
  },
  foam: {
    id: 'foam',
    src: px(7500610, 1600),
    alt: 'Close-up of a black midsole and rubberised sole',
    credit: 'Erik Mclean',
    source: 'https://www.pexels.com/photo/7500610/',
    purpose: 'Material study – responsive foam midsole',
    section: '04 MATERIAL',
  },
  rubber: {
    id: 'rubber',
    src: px(28645960, 1600),
    alt: 'Low-angle close-up of an athletic outsole on black',
    credit: 'Atakan Tok',
    source: 'https://www.pexels.com/photo/28645960/',
    purpose: 'Material study – high-grip outsole',
    section: '04 MATERIAL',
  },
  stitch: {
    id: 'stitch',
    src: px(21879445, 1600),
    alt: 'Black and white close-up of a sneaker and striped sock',
    credit: 'Jonas Baumann',
    source: 'https://www.pexels.com/photo/21879445/',
    purpose: 'Material study – reinforced stitching',
    section: '04 MATERIAL',
  },
  legsBlur: {
    id: 'legsBlur',
    src: px(33995258, 1920),
    alt: "Runner's legs in motion on a city street, motion blur, black and white",
    credit: 'Mathias Reding',
    source: 'https://www.pexels.com/photo/33995258/',
    purpose: 'Athlete chapter – frame 01',
    section: '06 ATHLETE',
  },
  blocks: {
    id: 'blocks',
    src: px(6504853, 1920),
    alt: 'Athletes in starting blocks ready for a sprint, black and white',
    credit: 'RUN 4 FFWPU',
    source: 'https://www.pexels.com/photo/6504853/',
    purpose: 'Athlete chapter – frame 02',
    section: '06 ATHLETE',
  },
  trail: {
    id: 'trail',
    src: px(33974329, 1920),
    alt: 'Trail runner beneath a sunlit cliff, black and white',
    credit: 'Ozan Yavuz',
    source: 'https://www.pexels.com/photo/33974329/',
    purpose: 'Athlete chapter – frame 03',
    section: '06 ATHLETE',
  },
  sprint: {
    id: 'sprint',
    src: px(30159784, 1400),
    alt: 'Track runner sprinting in competition',
    credit: 'Ansey Photography',
    source: 'https://www.pexels.com/photo/30159784/',
    purpose: 'Speed chapter – horizontal strip',
    section: '05 SPEED',
  },
  track: {
    id: 'track',
    src: px(5961805, 1400),
    alt: 'Three runners on a red stadium track',
    credit: 'RUN 4 FFWPU',
    source: 'https://www.pexels.com/photo/5961805/',
    purpose: 'Speed chapter – horizontal strip',
    section: '05 SPEED',
  },
  startLine: {
    id: 'startLine',
    src: px(8692281, 1400),
    alt: "Athlete's hands and foot at the start line",
    credit: 'Yaroslav Shuraev',
    source: 'https://www.pexels.com/photo/8692281/',
    purpose: 'Speed chapter – horizontal strip',
    section: '05 SPEED',
  },
  heroFallback: {
    id: 'heroFallback',
    src: px(12628400, 1600),
    alt: 'White sneakers suspended against a dark studio backdrop',
    credit: 'HamZa NOUASRIA',
    source: 'https://www.pexels.com/photo/12628400/',
    purpose: 'Hero fallback if WebGL / the model is unavailable',
    section: '01 THE DROP',
  },
} satisfies Record<string, Asset>;

export const MODEL_CREDIT = {
  name: 'MaterialsVariantsShoe',
  author: 'Shopify',
  license: 'CC-BY 4.0',
  source: 'https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/MaterialsVariantsShoe',
};

export const ASSET_LIST: Asset[] = Object.values(ASSETS);
