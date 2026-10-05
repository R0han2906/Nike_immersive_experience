# /public/sequence — frame-sequence drop-in

The MOTION chapter plays a frame-by-frame sequence on a `<canvas>` driven by
GSAP ScrollTrigger progress:

```
scroll → Lenis → ScrollTrigger progress (0…1) → frameIndex → canvas.drawImage
```

## What ships by default

**No pre-rendered files ship in this folder.** Instead, `src/lib/boot.ts`
bakes the sequence at load time from the real 3D shoe
(`MaterialsVariantsShoe.glb`, © Shopify, CC-BY 4.0) using an offscreen WebGL
renderer (`src/lib/three/bakeSequence.ts`):

| device  | frames | size        | format |
|---------|--------|-------------|--------|
| desktop | 72     | 1440 × 810  | JPEG   |
| mobile  | 36     | 720 × 1280  | JPEG   |

The preloader percentage reflects this work. Nothing is faked from photos.

## Replacing it with a pre-rendered sequence

If `manifest.json` exists here, boot uses the files instead of baking.

```
public/sequence/
  manifest.json
  frame-001.webp
  frame-002.webp
  …
  frame-120.webp
  m/frame-001.webp      (optional mobile set)
```

`manifest.json`:

```json
{
  "count": 120,
  "pattern": "frame-{index}.webp",
  "pad": 3,
  "mobile": { "count": 60, "pattern": "m/frame-{index}.webp", "pad": 3 }
}
```

### Producing frames from the same model (Blender)

1. Import `MaterialsVariantsShoe.glb` (File → Import → glTF 2.0).
2. Camera at (0, −3, 0.35), 32 mm, looking at origin; world background `#0a0a0a`.
3. Keyframe object rotation Z from −52° to 308° across 120 frames; add a
   ±45° X-tilt peaking at frame 60 to reveal the outsole; dolly the camera in
   over the last 25 frames for the close-up.
4. Render PNG 1920 × 1080 (or 1080 × 1920 for the mobile set), Filmic, no AA
   dithering.
5. Convert + compress:

```bash
# WebP, quality 82, resized to 1440 wide
for f in render/*.png; do
  cwebp -q 82 -resize 1440 0 "$f" -o "public/sequence/frame-$(basename "${f%.png}").webp"
done
```

Keep the total under ~6 MB for desktop (≈50 KB/frame). Frames are decoded
once (`img.decode()`) and drawn with "contain" fitting on a black canvas, so
the sequence background must be `#0a0a0a`.

### Notes

* Nike's own product / campaign renders are trademarked and copyrighted —
  do not drop them in here for anything other than a private prototype.
* The live WebGL shoe uses the same asset, so a re-rendered sequence will
  match the hero and product chapters exactly.
