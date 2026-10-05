/**
 * Shared, mutable animation state.
 *
 * ScrollTrigger callbacks WRITE to this object (no React state, no re-renders);
 * the R3F frame loop READS from it every frame. This keeps the scroll → 3D
 * bridge allocation-free and outside of React's render cycle.
 */
export type Stage =
  | 'intro'
  | 'hero'
  | 'motion'
  | 'anatomy'
  | 'hidden'
  | 'product'
  | 'final';

export const motion = {
  stage: 'intro' as Stage,
  /** 0 → 1 entrance animation after the preloader */
  intro: 0,
  /** Scroll progress of each pinned chapter */
  hero: 0,
  motionP: 0,
  anatomy: 0,
  product: 0,
  final: 0,
  /** Normalised pointer, x right / y up, -1 … 1 */
  pointer: { x: 0, y: 0 },
  /** Lenis velocity (px per frame) */
  velocity: 0,
  /** Product interactions */
  hover: 0,
  focused: false,
  /** Capabilities discovered at boot */
  modelReady: false,
  sequenceReady: false,
  /** DOM anchors the 3D loop positions (anatomy labels) */
  anatomyLabelEls: [] as (HTMLElement | null)[],
};

export function setStage(stage: Stage) {
  motion.stage = stage;
}

/** Global pointer tracking – one listener for the whole experience. */
let pointerBound = false;
export function bindPointer() {
  if (pointerBound || typeof window === 'undefined') return;
  pointerBound = true;
  window.addEventListener(
    'pointermove',
    (e) => {
      motion.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      motion.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    },
    { passive: true },
  );
}
