import { useLayoutEffect, useRef } from 'react';
import { gsap } from '@/lib/animations/gsap';
import { motion } from '@/lib/motionState';
import { sequence } from '@/lib/sequence';
import { chapterToggle } from '@/lib/sections';
import { isMobile } from '@/lib/env';
import { useImageSequence } from '@/hooks/useImageSequence';
import { cn } from '@/utils/cn';

const WORDS = ['SPEED', 'CONTROL', 'ENERGY', 'PRECISION'];
const CAPTIONS = [
  ['Speed', 'A rocker geometry that tips you onto your toes before you decide to go.'],
  ['Control', 'A wider platform under the heel; the shoe lands before you do.'],
  ['Energy', 'Foam that compresses on impact and hands the load back at toe-off.'],
  ['Precision', 'Every millimetre of the last is tuned to the geometry of a stride.'],
];

/**
 * SECTION 02 — MOTION
 * Pinned frame sequence. ScrollTrigger progress → frame index → canvas.
 * Four words enter from four directions on the quarter marks; the last one
 * scales past the viewport and hands over to the next chapter.
 */
export function Motion() {
  const ref = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const degrees = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  const frames = sequence.frames;
  const hasSequence = frames.length > 1;
  const { setProgress } = useImageSequence(canvasRef, frames);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const total = frames.length || 72;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: isMobile ? '+=260%' : '+=320%',
          pin: true,
          scrub: 0.4,
          anticipatePin: 1,
          onToggle: chapterToggle('motion', hasSequence ? 'hidden' : 'motion', 'hero'),
          onUpdate: (self) => {
            const p = self.progress;
            motion.motionP = p;
            const idx = setProgress(p);
            const shown = idx >= 0 ? idx : Math.round(p * (total - 1));
            if (counter.current) counter.current.textContent = String(shown + 1).padStart(3, '0');
            if (degrees.current) degrees.current.textContent = `${String(Math.round(p * 360)).padStart(3, '0')}°`;
            if (bar.current) bar.current.style.transform = `scaleX(${p})`;
          },
        },
      });

      const words = gsap.utils.toArray<HTMLElement>('.motion-word');
      const ins = [{ xPercent: -120 }, { yPercent: -160 }, { xPercent: 120 }, { yPercent: 160 }];
      const outs = [{ xPercent: 120 }, { yPercent: 160 }, { xPercent: -120 }, { scale: 7 }];
      words.forEach((w, i) => {
        tl.fromTo(
          w,
          { ...ins[i], opacity: 0 },
          { xPercent: 0, yPercent: 0, opacity: 1, duration: 0.32, ease: 'power3.out' },
          i + 0.06,
        ).to(w, { ...outs[i], opacity: 0, duration: 0.34, ease: 'power3.in' }, i + 0.64);
      });

      gsap.utils.toArray<HTMLElement>('.motion-cap').forEach((c, i) => {
        tl.fromTo(c, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.22 }, i + 0.18).to(
          c,
          { opacity: 0, y: -24, duration: 0.22 },
          i + 0.74,
        );
      });
    }, el);
    return () => ctx.revert();
  }, [setProgress, hasSequence, frames.length]);

  return (
    <section
      id="motion"
      ref={ref}
      className={cn('vh-full relative overflow-hidden', hasSequence ? 'bg-ink' : 'bg-transparent')}
      aria-label="Motion"
    >
      {hasSequence && (
        <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />
      )}

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {WORDS.map((w) => (
          <span
            key={w}
            className="motion-word display display-hero absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-white opacity-0 mix-blend-difference will-change-transform"
          >
            {w}
          </span>
        ))}
      </div>

      <div className="hud absolute left-6 top-24 md:left-10">
        <span className="text-ember">02</span> — Motion
      </div>

      <div className="hud absolute right-6 top-24 space-y-1 text-right md:right-10">
        <p>
          Frame <span ref={counter}>001</span> / {String(frameTotal(frames.length)).padStart(3, '0')}
        </p>
        <p>
          Rotation <span ref={degrees}>000°</span>
        </p>
        <p className="text-bone/50">
          {sequence.source === 'baked'
            ? 'Sequence rendered on device'
            : sequence.source === 'files'
              ? 'Pre-rendered sequence'
              : 'Live render'}
        </p>
      </div>

      <div className="absolute bottom-20 left-6 h-28 w-[min(80vw,20rem)] md:bottom-12 md:left-10">
        {CAPTIONS.map(([k, t], i) => (
          <p
            key={k}
            className="motion-cap absolute bottom-0 left-0 text-sm leading-relaxed text-bone/80 opacity-0"
          >
            <span className="hud mb-2 block text-ember">
              0{i + 1} / {k}
            </span>
            {t}
          </p>
        ))}
      </div>

      <div className="absolute inset-x-0 bottom-0 h-px bg-bone/10">
        <div ref={bar} className="h-full origin-left scale-x-0 bg-bone" />
      </div>
    </section>
  );
}

const frameTotal = (n: number) => (n > 1 ? n : 72);
