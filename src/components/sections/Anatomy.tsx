import { useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/animations/gsap';
import { motion, setStage } from '@/lib/motionState';
import { chapterToggle } from '@/lib/sections';
import { isMobile } from '@/lib/env';
import { cn } from '@/utils/cn';

// bottom → top, mirrors LAYER_RANGES in ShoeRig
const LABELS = [
  { title: 'High-grip outsole', sub: 'Traction', side: 'left' },
  { title: 'Responsive foam', sub: 'Energy return', side: 'right' },
  { title: 'Engineered upper', sub: 'Breathability', side: 'left' },
  { title: 'Lockdown collar & lacing', sub: 'Fit', side: 'right' },
];
const THRESHOLDS = [0.18, 0.34, 0.5, 0.66];

/**
 * SECTION 03 — THE ANATOMY
 * The single-mesh shoe is cut into four horizontal strata with clipping
 * planes in the WebGL stage; here we own the pin, the background shift to
 * bone, and the technical labels whose positions the 3D loop projects.
 */
export function Anatomy() {
  const ref = useRef<HTMLElement>(null);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    motion.anatomyLabelEls = labelRefs.current.slice();

    const prev = motion.sequenceReady ? 'hidden' : 'motion';
    const ctx = gsap.context(() => {
      gsap.to(document.getElementById('stage-bg'), {
        backgroundColor: '#f2f0eb',
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'top top', scrub: true },
      });

      // hand the stage over while the chapter is still sliding in, so the
      // outgoing (opaque) chapter wipes the assembled shoe into view
      ScrollTrigger.create({
        trigger: el,
        start: 'top bottom',
        end: 'top top',
        onEnter: () => setStage('anatomy'),
        onLeaveBack: () => setStage(prev),
      });

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: isMobile ? '+=220%' : '+=260%',
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
          onToggle: chapterToggle('anatomy', 'anatomy', 'anatomy'),
          onUpdate: (self) => {
            const p = self.progress;
            motion.anatomy = p;
            labelRefs.current.forEach((l, i) =>
              l?.classList.toggle('is-on', p >= THRESHOLDS[i] && p < 0.97),
            );
          },
        },
      });

      tl.fromTo('.anatomy-title', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: 'power2.out' }, 0)
        .fromTo('.anatomy-meta', { opacity: 0 }, { opacity: 1, duration: 1 }, 0.4)
        .fromTo('.anatomy-specs', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2 }, 7.4)
        .to({}, { duration: 0.1 }, 9.9);
    }, el);

    return () => {
      ctx.revert();
      motion.anatomyLabelEls = [];
    };
  }, []);

  return (
    <section
      id="anatomy"
      ref={ref}
      className="vh-full relative overflow-hidden text-ink"
      aria-label="The anatomy"
    >
      <div className="anatomy-title absolute left-6 top-24 max-w-sm md:left-10">
        <p className="hud mb-4 text-ember">03 — The anatomy</p>
        <h2 className="display display-lg">
          Built in
          <br />
          strata.
        </h2>
        <p className="mt-6 max-w-[30ch] text-sm leading-relaxed text-ink/70">
          Four systems, one motion. Scroll to separate the layers and read the shoe like a
          section drawing.
        </p>
      </div>

      <div className="anatomy-meta hud absolute right-6 top-24 hidden text-right text-ink/60 md:right-10 md:block">
        Section view
        <br />
        Cut along Y · Live clipping
      </div>

      <div className="pointer-events-none absolute inset-0">
        {LABELS.map((l, i) => (
          <div
            key={l.title}
            ref={(n) => {
              labelRefs.current[i] = n;
            }}
            className={cn('anatomy-label', l.side === 'left' ? 'side-left' : 'side-right')}
          >
            <span className="dot" />
            <span className="leader" />
            <div className="tag">
              <p className="label">{l.title}</p>
              <p className="hud mt-1 hidden text-ink/55 sm:block">{l.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="anatomy-specs absolute inset-x-6 bottom-8 grid grid-cols-2 gap-6 border-t border-ink/15 pt-5 opacity-0 md:inset-x-10 md:grid-cols-4">
        {[
          ['Layers', '04'],
          ['Cut', 'Horizontal / Y axis'],
          ['Method', 'Single mesh, clipped live'],
          ['Colourway', 'Midnight'],
        ].map(([k, v]) => (
          <div key={k}>
            <p className="hud text-ink/50">{k}</p>
            <p className="mt-1 text-sm font-medium">{v}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
