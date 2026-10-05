import { useEffect, type RefObject } from 'react';
import { gsap } from '@/lib/animations/gsap';
import { isFinePointer, prefersReducedMotion } from '@/lib/env';

/**
 * Magnetic pull: the element (and optionally an inner label, at half strength)
 * drifts toward the pointer while hovered, then settles back.
 */
export function useMagnetic<T extends HTMLElement>(
  ref: RefObject<T | null>,
  strength = 0.35,
  innerSelector?: string,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !isFinePointer || prefersReducedMotion) return;
    const inner = innerSelector ? el.querySelector<HTMLElement>(innerSelector) : null;

    const xTo = gsap.quickTo(el, 'x', { duration: 0.55, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.55, ease: 'power3.out' });
    const ixTo = inner ? gsap.quickTo(inner, 'x', { duration: 0.55, ease: 'power3.out' }) : null;
    const iyTo = inner ? gsap.quickTo(inner, 'y', { duration: 0.55, ease: 'power3.out' }) : null;

    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      xTo(dx * strength);
      yTo(dy * strength);
      ixTo?.(dx * strength * 0.5);
      iyTo?.(dy * strength * 0.5);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
      ixTo?.(0);
      iyTo?.(0);
    };

    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, [ref, strength, innerSelector]);
}
