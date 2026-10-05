import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '@/lib/animations/gsap';
import { motion } from '@/lib/motionState';
import { prefersReducedMotion } from '@/lib/env';

export const lenisRef: { current: Lenis | null } = { current: null };

/**
 * Lenis drives native scroll; GSAP's ticker drives Lenis; Lenis feeds
 * ScrollTrigger. One clock for everything → no drift between smooth scroll,
 * pinned chapters and the 3D stage.
 */
export function useLenis(enabled: boolean) {
  useEffect(() => {
    if (prefersReducedMotion) return;
    const lenis = new Lenis({
      lerp: 0.085,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 1,
    });
    lenisRef.current = lenis;
    lenis.stop();
    lenis.on('scroll', ScrollTrigger.update);

    const tick = (time: number) => {
      lenis.raf(time * 1000);
      motion.velocity = lenis.isScrolling ? lenis.velocity : 0;
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    const lenis = lenisRef.current;
    if (lenis) {
      if (enabled) {
        lenis.start();
        lenis.resize();
      } else lenis.stop();
    }
    document.documentElement.classList.toggle('is-locked', !enabled);
  }, [enabled]);
}

export function scrollToTarget(target: string | HTMLElement, offset = 0) {
  const lenis = lenisRef.current;
  if (lenis) {
    lenis.scrollTo(target, { offset, duration: 1.8 });
    return;
  }
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  el?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
}
