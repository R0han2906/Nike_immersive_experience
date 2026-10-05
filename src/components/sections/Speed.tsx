import { useLayoutEffect, useRef } from 'react';
import { gsap } from '@/lib/animations/gsap';
import { motion } from '@/lib/motionState';
import { chapterToggle } from '@/lib/sections';
import { isLowPower, prefersReducedMotion } from '@/lib/env';
import { ASSETS } from '@/lib/assets';

const STRIP = [ASSETS.sprint, ASSETS.track, ASSETS.startLine];
const WORDS = ['RUN', 'FASTER', 'MOVE', 'FORWARD'];

/**
 * SECTION 05 — SPEED
 * Visual flip to bone. Vertical scroll becomes horizontal travel; the four
 * words skew (and, on capable devices, blur) with scroll velocity, and each
 * photo slides inside its frame via `containerAnimation` parallax.
 */
export function Speed() {
  const ref = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    const tr = track.current;
    if (!el || !tr) return;

    const words = Array.from(el.querySelectorAll<HTMLElement>('.speed-word'));
    let tick: (() => void) | null = null;

    const ctx = gsap.context(() => {
      const distance = () => Math.max(0, tr.scrollWidth - window.innerWidth);
      const horizontal = gsap.to(tr, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onToggle: chapterToggle('speed', 'hidden', 'hidden'),
        },
      });

      gsap.utils.toArray<HTMLElement>('.speed-img').forEach((img) => {
        gsap.fromTo(
          img,
          { xPercent: -10 },
          {
            xPercent: 10,
            ease: 'none',
            scrollTrigger: {
              trigger: img.parentElement,
              containerAnimation: horizontal,
              start: 'left right',
              end: 'right left',
              scrub: true,
            },
          },
        );
      });

      if (!prefersReducedMotion && words.length) {
        const skewTo = gsap.quickTo(words, 'skewX', { duration: 0.45, ease: 'power3.out' });
        let lastBlur = -1;
        tick = () => {
          const v = motion.velocity;
          skewTo(gsap.utils.clamp(-16, 16, -v * 0.22));
          if (isLowPower) return;
          const blur = Math.round(Math.min(7, Math.abs(v) * 0.06) * 2) / 2;
          if (blur !== lastBlur) {
            lastBlur = blur;
            const value = blur > 0.4 ? `blur(${blur}px)` : 'none';
            for (const w of words) w.style.filter = value;
          }
        };
        gsap.ticker.add(tick);
      }
    }, el);

    return () => {
      if (tick) gsap.ticker.remove(tick);
      ctx.revert();
    };
  }, []);

  return (
    <section id="speed" ref={ref} className="vh-full relative overflow-hidden bg-bone text-ink" aria-label="Speed">
      <div className="hud absolute left-6 top-24 z-10 md:left-10">
        <span className="text-ember">05</span> — Speed
      </div>
      <div className="hud absolute right-6 top-24 z-10 hidden text-right md:right-10 md:block">
        Scroll ↓ &nbsp;=&nbsp; Move →
      </div>

      <div
        ref={track}
        className="flex h-full items-center gap-[7vw] pl-[6vw] pr-[14vw] will-change-transform"
      >
        {WORDS.map((w, i) => (
          <div key={w} className="flex shrink-0 items-center gap-[7vw]">
            <h2
              className={`speed-word display shrink-0 text-[34vw] leading-none md:text-[24vw] ${
                i % 2 === 1 ? 'text-stroke' : ''
              } ${i === 3 ? 'text-ember' : ''}`}
              style={{ willChange: 'transform, filter' }}
            >
              {w}
            </h2>
            {STRIP[i] && (
              <figure
                className="relative h-[46vh] w-[72vw] shrink-0 overflow-hidden md:h-[62vh] md:w-[36vw]"
                data-cursor="view"
              >
                <img
                  src={STRIP[i].src}
                  alt={STRIP[i].alt}
                  loading="lazy"
                  decoding="async"
                  className="speed-img -ml-[10%] h-full w-[120%] max-w-none object-cover grayscale"
                />
                <figcaption className="hud absolute bottom-4 left-4 text-bone/80">
                  0{i + 1} — {STRIP[i].credit}
                </figcaption>
              </figure>
            )}
          </div>
        ))}
        <p className="hud w-[26vw] shrink-0 text-ink/60">
          Velocity-reactive type — scroll faster and the letters lean and smear.
        </p>
      </div>

      <div className="hairline absolute inset-x-0 bottom-[16%]" />
    </section>
  );
}
