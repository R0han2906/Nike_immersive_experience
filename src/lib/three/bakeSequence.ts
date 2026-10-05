import * as THREE from 'three';
import { createEnvironment } from './environment';

/**
 * RUNTIME TURNTABLE BAKE
 * ----------------------
 * Real shoe → controlled camera path → offscreen WebGL → N JPEG frames →
 * pre-decoded <img> elements. The Motion chapter plays these back on a 2D
 * canvas driven by ScrollTrigger progress, exactly like a pre-rendered
 * sequence – except the frames are produced on the visitor's GPU while the
 * preloader runs, so no fake/stitched photography is involved.
 *
 * If a real pre-rendered sequence exists in /public/sequence (see README),
 * boot.ts uses that instead and this never runs.
 */
export interface BakeOptions {
  frames: number;
  width: number;
  height: number;
  onProgress?: (p: number) => void;
}

const TAU = Math.PI * 2;
const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Camera / object choreography for frame t ∈ [0, 1]. */
function poseFrame(
  shoe: THREE.Object3D,
  camera: THREE.PerspectiveCamera,
  key: THREE.DirectionalLight,
  t: number,
  base: number,
) {
  const closeUp = smooth(0.78, 1, t);
  // negative rx presents the sole, so the outsole is revealed mid-rotation
  shoe.rotation.set(0.15 - Math.sin(t * Math.PI) * 0.85, -0.9 + t * TAU, Math.sin(t * TAU) * 0.12);
  shoe.scale.setScalar(base * (1 + 0.22 * Math.sin(t * Math.PI) + closeUp * 0.95));
  shoe.position.set(-0.55 * closeUp * base, 0.08 * closeUp * base, 0);
  camera.position.set(0, 0.12 + Math.sin(t * TAU) * 0.12, 3);
  camera.lookAt(0, 0, 0);
  key.position.set(Math.cos(t * TAU) * 3, 2.5, Math.sin(t * TAU) * 3 + 0.5);
}

function canvasToImage(canvas: HTMLCanvasElement): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('toBlob returned null'));
          return;
        }
        const img = new Image();
        img.onload = () => {
          if (typeof img.decode === 'function') {
            img.decode().then(() => resolve(img), () => resolve(img));
          } else resolve(img);
        };
        img.onerror = () => reject(new Error('frame decode failed'));
        img.src = URL.createObjectURL(blob);
      },
      'image/jpeg',
      0.9,
    );
  });
}

export async function bakeSequence(
  source: THREE.Object3D,
  opts: BakeOptions,
): Promise<HTMLImageElement[]> {
  const { frames, width, height, onProgress } = opts;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    preserveDrawingBuffer: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(1);
  renderer.setSize(width, height, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0a0a0a');
  const envTexture = createEnvironment(renderer);
  scene.environment = envTexture;

  const aspect = width / height;
  const camera = new THREE.PerspectiveCamera(32, aspect, 0.1, 30);
  const key = new THREE.DirectionalLight('#ffffff', 2.4);
  const rim = new THREE.DirectionalLight('#dfe8ff', 2.8);
  rim.position.set(-3, 1.5, -2.5);
  const fill = new THREE.AmbientLight('#ffffff', 0.12);
  scene.add(key, rim, fill);

  const shoe = source.clone(true);
  scene.add(shoe);

  // portrait frames (mobile) get a smaller shoe so the full turn stays in frame
  const base = 2.1 * Math.min(1, aspect / 1.6);
  const result: HTMLImageElement[] = [];

  try {
    for (let i = 0; i < frames; i++) {
      const t = frames > 1 ? i / (frames - 1) : 0;
      poseFrame(shoe, camera, key, t, base);
      renderer.render(scene, camera);
      result.push(await canvasToImage(canvas));
      onProgress?.((i + 1) / frames);
    }
  } finally {
    scene.remove(shoe);
    envTexture.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
  }

  return result;
}
