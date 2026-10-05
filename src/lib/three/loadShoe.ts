import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * The sneaker: Khronos "MaterialsVariantsShoe" — © 2021 Shopify, CC-BY 4.0.
 * A real, production-quality sneaker model with three colourways delivered via
 * KHR_materials_variants (Beach / Midnight / Street). 7.8 MB, CORS-enabled.
 * Two mirrors: jsDelivr (CDN-cached) with raw GitHub as fallback.
 */
export const SHOE_SOURCES = [
  'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Assets@main/Models/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb',
  'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb',
];
const SHOE_BYTES = 7_833_592;

export interface LoadedShoe {
  gltf: GLTF;
  /** Normalised root: centred on origin, longest side = 1 unit, length along X. */
  root: THREE.Group;
  /** Y extent of the normalised shoe. */
  height: number;
  variants: string[];
}

interface VariantsExtension {
  variants: { name: string }[];
}
interface MeshVariantDef {
  mappings: { material: number; variants: number[] }[];
}
interface VariantParser {
  getDependency(type: string, index: number): Promise<THREE.Material>;
  assignFinalMaterial(mesh: THREE.Mesh): void;
}

function loadWithProgress(
  loader: GLTFLoader,
  url: string,
  onProgress: (p: number) => void,
): Promise<GLTF> {
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      resolve,
      (ev) => {
        const total = ev.lengthComputable && ev.total > 0 ? ev.total : SHOE_BYTES;
        onProgress(Math.min(0.98, ev.loaded / total));
      },
      reject,
    );
  });
}

function tuneMaterial(material: THREE.Material | THREE.Material[]) {
  const list = Array.isArray(material) ? material : [material];
  for (const m of list) {
    const std = m as THREE.MeshStandardMaterial;
    if ('envMapIntensity' in std) std.envMapIntensity = 1.15;
  }
}

/** Centre the model, scale its longest dimension to 1 and lay it along X. */
function normalise(scene: THREE.Group) {
  scene.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(scene);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z) || 1;

  scene.position.sub(center);

  const pivot = new THREE.Group();
  pivot.name = 'shoe-pivot';
  pivot.add(scene);
  pivot.scale.setScalar(1 / maxDim);
  if (size.z > size.x) pivot.rotation.y = Math.PI / 2;

  const root = new THREE.Group();
  root.name = 'shoe-root';
  root.add(pivot);

  scene.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (mesh.isMesh) {
      mesh.frustumCulled = false;
      tuneMaterial(mesh.material);
    }
  });

  return { root, height: size.y / maxDim };
}

export function getVariantNames(gltf: GLTF): string[] {
  const exts = gltf.userData?.gltfExtensions as Record<string, unknown> | undefined;
  const ext = exts?.KHR_materials_variants as VariantsExtension | undefined;
  return ext?.variants.map((v) => v.name) ?? [];
}

/** Swap every mesh to the material mapped to the named KHR variant. */
export async function applyVariant(shoe: LoadedShoe, name: string): Promise<void> {
  const { gltf } = shoe;
  const exts = gltf.userData?.gltfExtensions as Record<string, unknown> | undefined;
  const ext = exts?.KHR_materials_variants as VariantsExtension | undefined;
  if (!ext) return;
  const idx = ext.variants.findIndex((v) => v.name.toLowerCase() === name.toLowerCase());
  if (idx < 0) return;

  const parser = gltf.parser as unknown as VariantParser;
  const tasks: Promise<void>[] = [];

  gltf.scene.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh) return;
    const meshExts = mesh.userData.gltfExtensions as Record<string, MeshVariantDef> | undefined;
    const def = meshExts?.KHR_materials_variants;
    if (!def) return;
    if (!mesh.userData.originalMaterial) mesh.userData.originalMaterial = mesh.material;

    const mapping = def.mappings.find((m) => m.variants.includes(idx));
    if (mapping) {
      tasks.push(
        parser.getDependency('material', mapping.material).then((material) => {
          mesh.material = material;
          parser.assignFinalMaterial(mesh);
          tuneMaterial(mesh.material);
        }),
      );
    } else {
      mesh.material = mesh.userData.originalMaterial as THREE.Material;
    }
  });

  await Promise.all(tasks);
}

let pending: Promise<LoadedShoe> | null = null;

export function loadShoe(onProgress: (p: number) => void = () => {}): Promise<LoadedShoe> {
  if (pending) return pending;
  pending = (async () => {
    const loader = new GLTFLoader();
    let gltf: GLTF | null = null;
    let lastError: unknown = null;
    for (const url of SHOE_SOURCES) {
      try {
        gltf = await loadWithProgress(loader, url, onProgress);
        break;
      } catch (err) {
        lastError = err;
      }
    }
    if (!gltf) throw lastError ?? new Error('Shoe model unavailable');
    const { root, height } = normalise(gltf.scene);
    return { gltf, root, height, variants: getVariantNames(gltf) };
  })();
  return pending;
}
