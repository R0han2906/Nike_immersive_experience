import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { applyVariant, type LoadedShoe } from '@/lib/three/loadShoe';
import { motion } from '@/lib/motionState';
import { HERO_KEYS, createPose, samplePose } from '@/lib/animations/keyframes';
import { smoothstep } from '@/lib/animations/gsap';
import { prefersReducedMotion } from '@/lib/env';

/**
 * THE RIG
 * One shoe, many chapters. Each frame we derive a target pose from
 * `motion.stage` + that chapter's scroll progress and critically damp toward it.
 *
 * ANATOMY uses four clones of the same geometry, each clipped to a horizontal
 * band by two world-space planes. Pulling the bands apart produces a true
 * exploded/section view of a single-mesh model.
 */
interface Layer {
  group: THREE.Group;
  planes: THREE.Plane[];
  anchor: THREE.Object3D;
  range: [number, number];
}

// bottom → top, as fractions of the shoe's height
const LAYER_RANGES: [number, number][] = [
  [0, 0.11],
  [0.11, 0.27],
  [0.27, 0.6],
  [0.6, 1],
];

function collectMeshes(root: THREE.Object3D) {
  const list: THREE.Mesh[] = [];
  root.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) list.push(o as THREE.Mesh);
  });
  return list;
}

function clipMaterial(source: THREE.Material | THREE.Material[], planes: THREE.Plane[]) {
  const apply = (m: THREE.Material) => {
    const c = m.clone();
    c.clippingPlanes = planes;
    c.side = THREE.DoubleSide;
    return c;
  };
  return Array.isArray(source) ? source.map(apply) : apply(source);
}

function buildLayers(root: THREE.Group, height: number): Layer[] {
  return LAYER_RANGES.map((range) => {
    const group = root.clone(true);
    const planes = [
      new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
      new THREE.Plane(new THREE.Vector3(0, -1, 0), 0),
    ];
    for (const mesh of collectMeshes(group)) mesh.material = clipMaterial(mesh.material, planes);
    const anchor = new THREE.Object3D();
    anchor.position.set(0, -height / 2 + (height * (range[0] + range[1])) / 2, 0);
    group.add(anchor);
    return { group, planes, anchor, range };
  });
}

function syncLayerMaterials(root: THREE.Group, layers: Layer[]) {
  const sources = collectMeshes(root);
  for (const layer of layers) {
    collectMeshes(layer.group).forEach((mesh, i) => {
      const src = sources[i];
      if (src) mesh.material = clipMaterial(src.material, layer.planes);
    });
  }
}

function disposeLayers(layers: Layer[]) {
  for (const layer of layers) {
    for (const mesh of collectMeshes(layer.group)) {
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((m) => m.dispose());
    }
  }
}

export function ShoeRig({ shoe, variant }: { shoe: LoadedShoe; variant: string }) {
  const { root, height } = shoe;
  const main = useRef<THREE.Group>(null);
  const anatomy = useRef<THREE.Group>(null);
  const layers = useMemo(() => buildLayers(root, height), [root, height]);

  const viewport = useThree((s) => s.viewport);
  const size = useThree((s) => s.size);
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const invalidate = useThree((s) => s.invalidate);

  const tmp = useMemo(() => ({ pose: createPose(), v: new THREE.Vector3() }), []);

  // Compile shaders while the preloader is still up → no hitch on first reveal.
  useEffect(() => {
    gl.compile(scene, camera);
    invalidate();
  }, [gl, scene, camera, invalidate]);

  useEffect(() => {
    let alive = true;
    applyVariant(shoe, variant).then(() => {
      if (!alive) return;
      syncLayerMaterials(root, layers);
      invalidate();
    });
    return () => {
      alive = false;
    };
  }, [shoe, variant, root, layers, invalidate]);

  useEffect(() => () => disposeLayers(layers), [layers]);

  useFrame((state, delta) => {
    const g = main.current;
    const a = anatomy.current;
    if (!g || !a) return;

    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const stage = motion.stage;
    const portrait = viewport.width < viewport.height;
    // responsive world-unit factor: ≈1 on a 16:9 desktop (shoe length 2.0 ≈ 60 % of
    // the viewport width), proportionally smaller in portrait
    const unit = viewport.width / 3.4;
    const pose = tmp.pose;

    let showMain = true;
    let showAnatomy = false;
    let live = false;

    switch (stage) {
      case 'intro':
      case 'hero': {
        samplePose(HERO_KEYS, motion.hero, pose);
        const i = motion.intro;
        pose.s *= 0.25 + 0.75 * i;
        pose.ry += (1 - i) * -2.4;
        pose.y -= (1 - i) * 0.5;
        pose.x += (1 - i) * 0.6;
        live = true;
        break;
      }
      case 'motion': {
        // live fallback when no frame sequence could be produced
        const p = motion.motionP;
        pose.x = 0;
        pose.y = 0;
        pose.z = 0;
        pose.rx = 0.15 - Math.sin(p * Math.PI) * 0.85;
        pose.ry = -0.9 + p * Math.PI * 2;
        pose.rz = Math.sin(p * Math.PI * 2) * 0.12;
        pose.s = 2.1 * (1 + 0.22 * Math.sin(p * Math.PI));
        break;
      }
      case 'anatomy': {
        showMain = false;
        showAnatomy = true;
        break;
      }
      case 'hidden': {
        showMain = false;
        break;
      }
      case 'product': {
        const enter = smoothstep(0, 0.22, motion.product);
        const hover = motion.hover;
        // vertical offsets are authored in world units (viewport.height based)
        // and pre-divided by `unit` because the pose is multiplied by it below
        const lift = (fraction: number) => (fraction * viewport.height) / unit;
        if (motion.focused) {
          pose.x = 0;
          pose.y = portrait ? lift(0.04) : 0;
          pose.s = portrait ? 2.3 : 2.5;
          pose.ry = -0.5 + t * 0.25;
          pose.rx = 0.15;
          pose.rz = -0.05;
        } else {
          pose.x = portrait ? 0 : 0.1;
          pose.y = portrait ? lift(0.16) : 0.02 + hover * 0.06;
          pose.s = (portrait ? 2.2 : 1.6) * enter;
          pose.ry = -0.75 + Math.sin(t * 0.35) * 0.18 + hover * 0.25;
          pose.rx = 0.14;
          pose.rz = -0.1;
        }
        pose.z = 0;
        live = true;
        break;
      }
      case 'final': {
        const p = motion.final;
        pose.x = 0;
        pose.y = 0.05;
        pose.z = -p * 7.5;
        pose.rx = 0.2 + p * 0.6;
        pose.ry = -0.6 + p * 2.6 + t * 0.1;
        pose.rz = p * 0.3;
        pose.s = 1.8;
        break;
      }
    }

    const k = 1 - Math.exp(-dt * 6.5);

    if (showMain) {
      const par = live && !prefersReducedMotion ? 1 : 0;
      const floatY = par ? Math.sin(t * 1.3) * 0.02 : 0;
      const tx = pose.rx + motion.pointer.y * 0.1 * par;
      const ty = pose.ry + motion.pointer.x * 0.3 * par;
      const targetS = pose.s * unit;

      g.position.x += (pose.x * unit - g.position.x) * k;
      g.position.y += ((pose.y + floatY) * unit - g.position.y) * k;
      g.position.z += (pose.z - g.position.z) * k;
      g.rotation.x += (tx - g.rotation.x) * k;
      g.rotation.y += (ty - g.rotation.y) * k;
      g.rotation.z += (pose.rz - g.rotation.z) * k;
      const s = g.scale.x + (targetS - g.scale.x) * k;
      g.scale.setScalar(Math.max(s, 1e-4));
      g.visible = true;
    } else {
      const s = g.scale.x * (1 - k);
      g.scale.setScalar(Math.max(s, 1e-4));
      g.visible = s > 0.02;
    }

    a.visible = showAnatomy;
    if (showAnatomy) {
      const p = motion.anatomy;
      const S = (portrait ? 1.9 : 2.0) * unit;
      a.scale.setScalar(S);
      a.position.set(portrait ? 0 : 0.25 * unit, portrait ? 0.04 * viewport.height : -0.02, 0);
      a.rotation.set(0, -0.55 + p * 0.5, 0);
      const gap = (portrait ? 0.15 : 0.13) * smoothstep(0.05, 0.85, p);

      for (let i = 0; i < layers.length; i++) {
        const L = layers[i];
        const offset = (i - 1.5) * gap;
        L.group.position.y = offset;
        const lower = -height / 2 + height * L.range[0] + offset;
        const upper = -height / 2 + height * L.range[1] + offset;
        // planes live in world space: y_world = a.position.y + S * y_local
        L.planes[0].constant = -(a.position.y + S * lower);
        L.planes[1].constant = a.position.y + S * upper;

        const el = motion.anatomyLabelEls[i];
        if (el) {
          L.anchor.getWorldPosition(tmp.v).project(camera);
          const px = ((tmp.v.x + 1) / 2) * size.width;
          const py = ((1 - tmp.v.y) / 2) * size.height;
          el.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0)`;
        }
      }
    }
  });

  return (
    <>
      <group ref={main} visible={false}>
        <primitive object={root} />
      </group>
      <group ref={anatomy} visible={false}>
        {layers.map((l, i) => (
          <primitive key={i} object={l.group} />
        ))}
      </group>
    </>
  );
}
