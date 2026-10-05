import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/animations/gsap';
import { isFinePointer, prefersReducedMotion } from '@/lib/env';

const LABEL_MODES = new Set(['view', 'explore', 'drag', 'enter', 'open']);

/**
 * Two-layer cursor (dot + lagging ring) in `mix-blend-mode: difference`.
 * Context comes from `data-cursor="view|explore|drag|enter|hover"` on any
 * ancestor of the hovered element; interactive elements default to "hover".
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!isFinePointer || prefersReducedMotion) return;
    const d = dot.current;
    const r = ring.current;
    const l = label.current;
    if (!d || !r || !l) return;

    document.documentElement.classList.add('has-cursor');

    const rx = gsap.quickTo(r, 'x', { duration: 0.35, ease: 'power3.out' });
    const ry = gsap.quickTo(r, 'y', { duration: 0.35, ease: 'power3.out' });
    const dx = gsap.quickTo(d, 'x', { duration: 0.12, ease: 'power2.out' });
    const dy = gsap.quickTo(d, 'y', { duration: 0.12, ease: 'power2.out' });

    let visible = false;
    let mode = 'default';

    const setMode = (next: string) => {
      if (next === mode) return;
      mode = next;
      const isLabel = LABEL_MODES.has(next);
      l.textContent = isLabel ? next : '';
      r.classList.toggle('is-label', isLabel);
      gsap.to(r, {
        scale: isLabel ? 2.1 : next === 'hover' ? 1.5 : 1,
        backgroundColor: isLabel ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0)',
        duration: 0.35,
        ease: 'power3.out',
      });
      gsap.to(d, { scale: isLabel ? 0 : next === 'hover' ? 0.5 : 1, duration: 0.3 });
    };

    const move = (e: PointerEvent) => {
      rx(e.clientX);
      ry(e.clientY);
      dx(e.clientX);
      dy(e.clientY);
      if (!visible) {
        visible = true;
        gsap.to([d, r], { opacity: 1, duration: 0.3 });
      }
    };
    const over = (e: Event) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const tagged = target.closest<HTMLElement>('[data-cursor]');
      if (tagged) {
        setMode(tagged.dataset.cursor || 'hover');
        return;
      }
      setMode(target.closest('a, button, [role="button"], input, select, textarea, label') ? 'hover' : 'default');
    };
    const leave = () => {
      visible = false;
      gsap.to([d, r], { opacity: 0, duration: 0.3 });
    };

    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerover', over);
    document.documentElement.addEventListener('pointerleave', leave);
    return () => {
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerover', over);
      document.documentElement.removeEventListener('pointerleave', leave);
      document.documentElement.classList.remove('has-cursor');
    };
  }, []);

  if (!isFinePointer) return null;
  return (
    <>
      <div ref={ring} className="cursor-ring" aria-hidden="true">
        <span ref={label} />
      </div>
      <div ref={dot} className="cursor-dot" aria-hidden="true" />
    </>
  );
}
