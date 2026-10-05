import { useEffect, useLayoutEffect, useRef } from 'react';
import { gsap } from '@/lib/animations/gsap';
import { motion } from '@/lib/motionState';
import { HERO_FRAME_LABELS } from '@/lib/animations/keyframes';
import { chapterToggle } from '@/lib/sections';
import { isMobile, prefersReducedMotion } from '@/lib/env';
import { ASSETS } from '@/lib/assets';

interface Props {
  modelReady: boolean;
  entered: boolean;
}

/**
 * SECTION 01 — THE DROP
 * Pinned for ~2.8 viewports. Scroll progress drives the shoe through nine
 * keyframes (see HERO_KEYS) while the type exits, two editorial beats punch
 * in, and a 38vw outlined "MOTION" crosses the frame and gets clipped.
 */
export function Hero({ modelReady, entered }: Props) {
  const ref = useRef<HTMLElement>(null);
  const frameNo = useRef<HTMLSpanElement>(null);
  const frameName = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      let labelIdx = -1;
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: isMobile ? '+=220%' : '+=280%',
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
          onToggle: chapterToggle('hero', 'hero', 'hero'),
          onUpdate: (self) => {
            const p = self.progress;
            motion.hero = p;
            let i = 0;
            for (let k = 0; k < HERO_FRAME_LABELS.length; k++) if (p >= HERO_FRAME_LABELS[k][0]) i = k;
            if (i !== labelIdx) {
              labelIdx = i;
              if (frameNo.current) frameNo.current.textContent = HERO_FRAME_LABELS[i][1];
              if (frameName.current) frameName.current.textContent = HERO_FRAME_LABELS[i][2];
            }
            if (bar.current) bar.current.style.transform = `scaleX(${p})`;
          },
        },
      });

      // timeline is 10 units long → 1 unit = 10 % of the pin
      tl.fromTo(
        '.hero-title .line',
        { yPercent: 0 },
        { yPercent: -110, stagger: 0.08, duration: 1.4, ease: 'power2.in', immediateRender: false },
        0.4,
      )
        .to('.hero-scroll', { opacity: 0, duration: 0.5 }, 0.2)
        .to('.hero-meta', { opacity: 0, y: -20, duration: 1 }, 0.6)
        .fromTo('.hero-beat-sole', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7 }, 2.7)
        .to('.hero-beat-sole', { opacity: 0, y: -40, duration: 0.7 }, 4.1)
        .fromTo('.hero-beat-material', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7 }, 5.5)
        .to('.hero-beat-material', { opacity: 0, y: -40, duration: 0.7 }, 6.9)
        .fromTo('.hero-word', { xPercent: 110 }, { xPercent: -135, duration: 4.4 }, 5.6);
    }, el);
    return () => ctx.revert();
  }, []);

  // Entrance, once the preloader lifts
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!entered) {
      gsap.set(el.querySelectorAll('.hero-title .line'), { yPercent: 110 });
      gsap.set(el.querySelectorAll('.hero-meta, .hero-scroll, .hero-hud'), { opacity: 0 });
      return;
    }
    if (prefersReducedMotion) {
      motion.intro = 1;
      gsap.set(el.querySelectorAll('.hero-title .line'), { yPercent: 0 });
      gsap.set(el.querySelectorAll('.hero-meta, .hero-scroll, .hero-hud'), { opacity: 1 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap
        .timeline({ delay: 0.35 })
        .to(motion, { intro: 1, duration: 2.4, ease: 'power3.out' }, 0)
        .to('.hero-title .line', { yPercent: 0, duration: 1.4, ease: 'power4.out', stagger: 0.12 }, 0.6)
        .fromTo(
          '.hero-hud, .hero-meta, .hero-scroll',
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 1, stagger: 0.1 },
          1.2,
        );
    }, el);
    return () => ctx.revert();
  }, [entered]);

  return (
    <section id="hero" ref={ref} className="vh-full relative overflow-hidden" aria-label="The drop">
      {!modelReady && (
        <img
          src={ASSETS.heroFallback.src}
          alt={ASSETS.heroFallback.alt}
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
      )}

      <div className="hero-hud hud absolute left-6 top-24 flex items-center gap-4 md:left-10">
        <span className="text-ember">●</span>
        <span>
          Frame <span ref={frameNo}>001</span>
        </span>
        <span className="opacity-40">/</span>
        <span ref={frameName}>APPEAR</span>
      </div>

      <div className="hero-meta hud absolute right-6 top-1/2 hidden -translate-y-1/2 [writing-mode:vertical-rl] opacity-80 md:right-10 md:block text-bone/80">
        Nike Motion 01 — Performance running — SS26 concept
      </div>

      <h1 className="hero-title display display-hero absolute bottom-24 left-6 text-white md:bottom-14 md:left-10">
        <span className="line-mask">
          <span className="line">Engineered</span>
        </span>
        <span className="line-mask">
          <span className="line">
            To move<span className="text-ember">.</span>
          </span>
        </span>
      </h1>

      <div className="hero-beat-sole absolute bottom-24 right-6 text-right opacity-0 md:bottom-14 md:right-10">
        <p className="hud mb-3 text-ember">003 / Outsole</p>
        <p className="display display-md text-white">
          Grip that
          <br />
          reads the ground
        </p>
      </div>

      <div className="hero-beat-material absolute left-6 top-1/3 opacity-0 md:left-10">
        <p className="hud mb-3 text-ember">005 / Upper</p>
        <p className="display display-md text-white">
          One piece.
          <br />
          Zero wasted motion.
        </p>
      </div>

      <div
        className="hero-word display text-stroke-thin pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 whitespace-nowrap text-[38vw] leading-none opacity-70"
        aria-hidden="true"
      >
        MOTION
      </div>

      <div className="hero-scroll hud absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3">
        <span>Scroll</span>
        <span className="block h-10 w-px animate-pulse bg-bone/60" />
      </div>

      <div className="absolute inset-x-0 bottom-0 h-px bg-bone/10">
        <div ref={bar} className="h-full origin-left scale-x-0 bg-ember" />
      </div>
    </section>
  );
}
