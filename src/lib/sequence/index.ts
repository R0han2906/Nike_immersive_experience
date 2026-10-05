/**
 * Frame-sequence store + loaders.
 *
 * Two sources feed the same canvas player:
 *  1. `files`  – a pre-rendered sequence in /public/sequence described by
 *                manifest.json (see public/sequence/README.md)
 *  2. `baked`  – frames rendered at runtime from the 3D shoe (bakeSequence.ts)
 */
export type SequenceSource = 'none' | 'files' | 'baked';

export const sequence = {
  frames: [] as HTMLImageElement[],
  source: 'none' as SequenceSource,
};

export interface SequenceVariant {
  count: number;
  /** e.g. "frame-{index}.webp" */
  pattern: string;
  pad?: number;
}
export interface SequenceManifest extends SequenceVariant {
  mobile?: SequenceVariant;
}

const base = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');

export async function fetchManifest(): Promise<SequenceManifest | null> {
  try {
    const res = await fetch(`${base}sequence/manifest.json`, { cache: 'force-cache' });
    if (!res.ok) return null;
    const type = res.headers.get('content-type') ?? '';
    if (!type.includes('json')) return null;
    const json = (await res.json()) as Partial<SequenceManifest>;
    if (typeof json.count !== 'number' || typeof json.pattern !== 'string') return null;
    return json as SequenceManifest;
  } catch {
    return null;
  }
}

export async function loadFileSequence(
  manifest: SequenceManifest,
  mobile: boolean,
  onProgress: (p: number) => void,
): Promise<HTMLImageElement[]> {
  const cfg = mobile && manifest.mobile ? manifest.mobile : manifest;
  const pad = cfg.pad ?? 3;
  const urls = Array.from({ length: cfg.count }, (_, i) =>
    `${base}sequence/${cfg.pattern.replace('{index}', String(i + 1).padStart(pad, '0'))}`,
  );
  let done = 0;
  return Promise.all(
    urls.map(async (url) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = url;
      await img.decode();
      done++;
      onProgress(done / urls.length);
      return img;
    }),
  );
}

/** Draw an image letterboxed ("contain") – sequence backgrounds are already black. */
export function drawContain(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number,
) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;
  const scale = Math.min(w / iw, h / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
}
