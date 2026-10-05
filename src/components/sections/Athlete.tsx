import { useLayoutEffect, useRef } from 'react';
import { gsap } from '@/lib/animations/gsap';
import { chapterToggle } from '@/lib/sections';
import { isMobile } from '@/lib/env';
import { ASSETS } from '@/lib/assets';

const FRAMES = [
  {
    asset: ASSETS.legsBlur,
    meta: 'Athlete 01 — Street / 10K',
    lines: ['Built for', 'the last 400m.'],
    from: 'inset(0 0 0 0)',
    to: 'inset(0 0 0 0)',
  },
  {
    asset: ASSETS.blocks,
    meta: 'Athlete 02 — Track / 100M',
    lines: ['Every stride', 'is data.'],
    from: 'polygon(0 0, 0 0, 0 100%, 0 100%)',
    to: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
  },
  {
    asset: ASSETS.trail,
    meta: 'Athlete 03 — Trail / Vert',
    lines: ['Move like', 'you mean it.'],
    from: 'circle(0% at 50% 50%)',
    to: 'circle(80% at 50% 50%)',
  },
];

/**
 * SECTION 06 — ATHLETE
 * Three full-bleed frames stacked in a pin. Each new frame reveals through a
 * different mask (diagonal wipe, iris) while the previous one scales and dims;
 * copy enters from alternating directions.
 */
export function Athlete() {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: isMobile ? '+=240%' : '+=300%',
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          onToggle: chapterToggle('athlete', 'hidden', 'hidden'),
        },
      });

      const frames = gsap.utils.toArray<HTMLElement>('.ath-frame');
      const imgs = gsap.utils.toArray<HTMLElement>('.ath-img');
      const copies = gsap.utils.toArray<HTMLElement>('.ath-copy');

      tl.fromTo(imgs[0], { scale: 1.15 }, { scale: 1.0, duration: 1.2 }, 0);
      tl.fromTo(
        copies[0].querySelectorAll('.line'),
        { yPercent: 110 },
        { yPercent: 0, duration: 0.4, stagger: 0.08, ease: 'power3.out' },
        0.05,
      );

      for (let i = 1; i < frames.length; i++) {
        const at = i - 0.4;
        tl.fromTo(
          frames[i],
          { clipPath: FRAMES[i].from },
          { clipPath: FRAMES[i].to, duration: 0.65, ease: 'power2.inOut' },
          at,
        )
          .fromTo(imgs[i], { scale: 1.2 }, { scale: 1.0, duration: 1.2 }, at)
          .to(imgs[i - 1], { scale: 1.12, opacity: 0.35, duration: 0.65 }, at)
          .to(copies[i - 1], { y: i % 2 ? -60 : 60, opacity: 0, duration: 0.3, ease: 'power2.in' }, at)
          .fromTo(
            copies[i].querySelectorAll('.line'),
            { yPercent: 110 },
            { yPercent: 0, duration: 0.4, stagger: 0.08, ease: 'power3.out' },
            at + 0.35,
          )
          .fromTo(copies[i], { opacity: 0 }, { opacity: 1, duration: 0.1 }, at + 0.3);
      }
      tl.to({}, { duration: 0.45 }, frames.length - 0.45);
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section id="athlete" ref={ref} className="vh-full relative overflow-hidden bg-ink" aria-label="Athlete">
      {FRAMES.map((f, i) => (
        <figure
          key={f.meta}
          className="ath-frame absolute inset-0 overflow-hidden"
          style={{ clipPath: i === 0 ? f.to : f.from }}
          data-cursor="view"
        >
          <img
            src={f.asset.src}
            alt={f.asset.alt}
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding="async"
            className="ath-img h-full w-full object-cover grayscale will-change-transform"
          />
          <div className="absolute inset-0 bg-ink/30" />
          <figcaption className="hud absolute right-6 top-24 text-right text-bone/70 md:right-10">
            {f.meta}
            <br />
            <span className="text-bone/40">Photo — {f.asset.credit}</span>
          </figcaption>
        </figure>
      ))}

      <div className="hud absolute left-6 top-24 md:left-10">
        <span className="text-ember">06</span> — Athlete
      </div>

      <div className="pointer-events-none absolute inset-x-6 bottom-14 md:inset-x-10">
        {FRAMES.map((f, i) => (
          <div
            key={f.meta}
            className="ath-copy absolute bottom-0 left-0"
            style={{ opacity: i === 0 ? 1 : 0 }}
          >
            <h2 className="display display-xl">
              {f.lines.map((l) => (
                <span key={l} className="line-mask">
                  <span className="line">{l}</span>
                </span>
              ))}
            </h2>
          </div>
        ))}
      </div>
    </section>
  );
}
