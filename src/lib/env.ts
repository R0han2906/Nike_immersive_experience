/**
 * Environment capabilities, evaluated once. Used to pick asset sizes,
 * frame counts and to respect user preferences.
 */
const hasWindow = typeof window !== 'undefined';

export const prefersReducedMotion =
  hasWindow && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isTouch = hasWindow && window.matchMedia('(pointer: coarse)').matches;

export const isFinePointer = hasWindow && window.matchMedia('(pointer: fine)').matches;

export const isMobile = hasWindow && window.innerWidth < 768;

export const isPortrait = hasWindow && window.innerHeight > window.innerWidth;

export const isLowPower =
  isMobile || (hasWindow && (navigator.hardwareConcurrency ?? 8) <= 4);

/** Frame-sequence budget per device class. */
export const SEQUENCE_BUDGET = isMobile
  ? { frames: 36, width: 720, height: 1280 }
  : { frames: 72, width: 1440, height: 810 };
