import { useEffect, useLayoutEffect, useRef } from 'react';
import { gsap } from '@/lib/animations/gsap';
import { motion } from '@/lib/motionState';
import { chapterToggle } from '@/lib/sections';
import { isMobile, prefersReducedMotion } from '@/lib/env';
import { ASSET_LIST, MODEL_CREDIT } from '@/lib/assets';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { scrollToTarget } from '@/hooks/useLenis';

/**
 * SECTION 08 — WHAT WILL YOU MOVE?
 * The stage fades to black, the shoe recedes into fog and the question scales
 * in. Below: a velocity-driven marquee and the credits / asset attributions.
 */
export function Final() {
  const ref = useRef<HTMLElement>(null);
  const marquee = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.to(document.getElementById('stage-bg'), {
        backgroundColor: '#0a0a0a',
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'top top', scrub: true },
      });

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: isMobile ? '+=140%' : '+=170%',
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          onToggle: chapterToggle('final', 'final', 'product'),
          onUpdate: (self) => {
            motion.final = self.progress;
          },
        },
      });

      tl.fromTo('.final-title', { scale: 0.62, opacity: 0 }, { scale: 1, opacity: 1, duration: 6 }, 0)
        .fromTo('.final-sub', { opacity: 0 }, { opacity: 1, duration: 1.5 }, 4)
        .fromTo('.final-cta', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 2 }, 6.5)
        .to({}, { duration: 0.1 }, 9.9);
    }, el);
    return () => ctx.revert();
  }, []);

  // velocity-driven marquee
  useEffect(() => {
    const track = marquee.current;
    if (!track || prefersReducedMotion) return;
    let x = 0;
    const tick = () => {
      const half = track.scrollWidth / 2;
      if (!half) return;
      x -= 0.7 + Math.min(Math.abs(motion.velocity) * 0.08, 9);
      if (x <= -half) x += half;
      track.style.transform = `translate3d(${x}px,0,0)`;
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
    };
  }, []);

  const credits = Array.from(new Set(ASSET_LIST.map((a) => a.credit)));

  return (
    <>
      <section
        id="final"
        ref={ref}
        className="vh-full relative flex flex-col items-center justify-center overflow-hidden text-center text-bone"
        aria-label="What will you move"
      >
        <h2 className="final-title display display-hero will-change-transform">
          What will
          <br />
          you move<span className="text-ember">?</span>
        </h2>
        <p className="final-sub hud mt-8 text-bone/75">Motion 01 · Available now · Concept</p>
        <div className="final-cta mt-10">
          <MagneticButton onClick={() => scrollToTarget('#product')} data-cursor="hover">
            Shop the collection <span aria-hidden="true">→</span>
          </MagneticButton>
        </div>
      </section>

      <footer className="relative bg-ink text-bone" aria-label="Credits">
        <div className="overflow-hidden border-y border-bone/10 py-6">
          <div ref={marquee} className="flex w-max whitespace-nowrap will-change-transform">
            {[0, 1].map((n) => (
              <span key={n} className="display text-[9vw] leading-none md:text-[6vw]" aria-hidden={n === 1}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <span key={i} className="mr-[6vw]">
                    What will you move <span className="text-ember">—</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8 px-6 py-16 md:px-10 md:py-24">
          <div className="col-span-12 md:col-span-4">
            <p className="display text-4xl">NIKE</p>
            <p className="hud mt-4 max-w-[40ch] text-bone/70">
              The shoe in motion — an independent concept experience inspired by Nike. Not
              affiliated with, endorsed by or produced for Nike, Inc. Product name, price and
              specifications are fictional.
            </p>
          </div>

          <div className="col-span-6 md:col-span-2">
            <p className="hud mb-4 text-bone/70">Chapters</p>
            <ul className="hud space-y-2">
              {['hero', 'motion', 'anatomy', 'material', 'speed', 'athlete', 'product'].map((id, i) => (
                <li key={id}>
                  <button onClick={() => scrollToTarget(`#${id}`)} className="hover:text-ember">
                    0{i + 1} {id}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-6 md:col-span-3">
            <p className="hud mb-4 text-bone/70">3D model</p>
            <p className="hud leading-relaxed">
              {MODEL_CREDIT.name}
              <br />© {MODEL_CREDIT.author} — {MODEL_CREDIT.license}
              <br />
              <a href={MODEL_CREDIT.source} className="underline underline-offset-4 hover:text-ember" target="_blank" rel="noreferrer">
                Khronos glTF sample assets
              </a>
            </p>
            <p className="hud mt-6 text-bone/65">Frame sequence rendered on-device from the model.</p>
          </div>

          <div className="col-span-12 md:col-span-3">
            <p className="hud mb-4 text-bone/70">Photography — Pexels</p>
            <ul className="hud space-y-1 leading-relaxed">
              {credits.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="hud flex flex-wrap items-center justify-between gap-4 border-t border-bone/10 px-6 py-6 text-bone/60 md:px-10">
          <span>© 2026 — Concept study</span>
          <span>React · Three.js · GSAP ScrollTrigger · Lenis</span>
        </div>
      </footer>
    </>
  );
}
