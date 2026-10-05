/**
 * Tiny keyframe sampler for 3D poses.
 * Each key is a full pose at time `t` (0…1). Sampling eases between the two
 * neighbouring keys with a smoothstep so every "FRAME" reads as a deliberate
 * camera move rather than a linear tween.
 */
export interface Pose {
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
  s: number;
}

export interface Key extends Pose {
  t: number;
}

const ease = (t: number) => t * t * (3 - 2 * t);

export function createPose(): Pose {
  return { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, s: 1 };
}

export function copyPose(from: Pose, to: Pose) {
  to.x = from.x;
  to.y = from.y;
  to.z = from.z;
  to.rx = from.rx;
  to.ry = from.ry;
  to.rz = from.rz;
  to.s = from.s;
  return to;
}

export function samplePose(keys: Key[], t: number, out: Pose): Pose {
  if (t <= keys[0].t) return copyPose(keys[0], out);
  const last = keys[keys.length - 1];
  if (t >= last.t) return copyPose(last, out);

  let i = 0;
  while (keys[i + 1].t < t) i++;
  const a = keys[i];
  const b = keys[i + 1];
  const k = ease((t - a.t) / (b.t - a.t));

  out.x = a.x + (b.x - a.x) * k;
  out.y = a.y + (b.y - a.y) * k;
  out.z = a.z + (b.z - a.z) * k;
  out.rx = a.rx + (b.rx - a.rx) * k;
  out.ry = a.ry + (b.ry - a.ry) * k;
  out.rz = a.rz + (b.rz - a.rz) * k;
  out.s = a.s + (b.s - a.s) * k;
  return out;
}

/**
 * SECTION 01 — THE DROP. Nine "frames" the shoe travels through while the
 * hero is pinned. Positive rx tilts the top (laces) toward the camera,
 * negative rx presents the sole. Units are multiplied by a responsive factor
 * at runtime so the same choreography works in portrait.
 */
export const HERO_KEYS: Key[] = [
  { t: 0.0, x: 0.1, y: -0.05, z: 0, rx: 0.15, ry: -0.75, rz: -0.08, s: 2.0 }, // 001 appear
  { t: 0.14, x: 0.1, y: -0.05, z: 0, rx: 0.1, ry: -0.35, rz: -0.05, s: 2.05 }, // 002 slight rotation
  { t: 0.3, x: 0.0, y: 0.05, z: 0, rx: -1.05, ry: 0.15, rz: 0.1, s: 2.15 }, // 003 sole visible
  { t: 0.44, x: -0.1, y: 0.05, z: 0, rx: -0.45, ry: 0.55, rz: 0.0, s: 2.7 }, // 004 camera closer
  { t: 0.58, x: -0.2, y: -0.12, z: 0, rx: 0.8, ry: 1.1, rz: -0.1, s: 3.2 }, // 005/006 materials + lacing
  { t: 0.72, x: 0.0, y: -0.05, z: 0, rx: 0.35, ry: 2.3, rz: 0.05, s: 3.0 }, // 007 rotate
  { t: 0.86, x: 0.35, y: -0.1, z: 0, rx: 0.25, ry: 3.0, rz: 0.15, s: 4.6 }, // 008 extreme close-up
  { t: 1.0, x: -4.6, y: 0.3, z: 0.3, rx: 0.1, ry: 3.6, rz: -0.4, s: 3.8 }, // 009 exits frame
];

export const HERO_FRAME_LABELS: [number, string, string][] = [
  [0.0, '001', 'APPEAR'],
  [0.14, '002', 'ROTATE'],
  [0.3, '003', 'SOLE'],
  [0.44, '004', 'APPROACH'],
  [0.58, '005', 'MATERIAL'],
  [0.66, '006', 'LACING'],
  [0.72, '007', 'ROTATE'],
  [0.86, '008', 'CLOSE-UP'],
  [0.96, '009', 'EXIT'],
];
