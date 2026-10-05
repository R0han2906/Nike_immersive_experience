import { useLayoutEffect, useRef } from 'react';
import { gsap } from '@/lib/animations/gsap';
import { chapterToggle } from '@/lib/sections';
import { isMobile } from '@/lib/env';
import { ASSETS } from '@/lib/assets';

const MATERIALS = [
  {
    key: 'Knit',
    asset: ASSETS.knit,
    title: 'Engineered knit',
    copy: 'Zonal density: open where the foot breathes, locked where it loads.',
  },
  {
    key: 'Foam',
    asset: ASSETS.foam,
    title: 'Responsive foam',
    copy: 'Compression that gives the energy back instead of storing it.',
  },
  {
    key: 'Rubber',
    asset: ASSETS.rubber,
    title: 'High-grip outsole',
    copy: 'Directional lugs read the surface and bite in the turn.',
  },
  {
    key: 'Stitch',
    asset: ASSETS.stitch,
    title: 'Reinforced seams',
    copy: 'Every stitch placed along a line of stress, none along a line of flex.',
  },
];

/**
 * SECTION 04 — MATERIAL
 * Sticky macro-photography stack. Each image reveals through a bottom-up
 * mask while the previous one scales and drifts; the whole column travels
 * horizontally a few percent across the pin.
 */
export function Material() {
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
          end: isMobile ? '+=280%' : '+=340%',
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          onToggle: chapterToggle('material', 'hidden', 'anatomy'),
        },
      });

      const panels = gsap.utils.toArray<HTMLElement>('.mat-panel');
      const inners = gsap.utils.toArray<HTMLElement>('.mat-inner');
      const names = gsap.utils.toArray<HTMLElement>('.mat-name');
      const indices = gsap.utils.toArray<HTMLElement>('.mat-index');

      // timeline: 4 units, one per material
      tl.fromTo('.mat-column', { xPercent: 3 }, { xPercent: -3, duration: 4 }, 0);
      tl.fromTo(inners[0], { scale: 1.2 }, { scale: 1.05, duration: 1.2 }, 0);

      for (let i = 1; i < panels.length; i++) {
        const at = i - 0.45;
        tl.fromTo(
          panels[i],
          { clipPath: 'inset(100% 0 0 0)' },
          { clipPath: 'inset(0% 0 0 0)', duration: 0.7, ease: 'power2.inOut' },
          at,
        )
          .fromTo(inners[i], { scale: 1.25, yPercent: 6 }, { scale: 1.02, yPercent: 0, duration: 1.3 }, at)
          .to(inners[i - 1], { scale: 1.12, yPercent: -8, duration: 0.7 }, at)
          .to(names[i - 1], { yPercent: -110, opacity: 0, duration: 0.35, ease: 'power2.in' }, at + 0.05)
          .fromTo(
            names[i],
            { yPercent: 110, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 0.45, ease: 'power3.out' },
            at + 0.3,
          )
          .to(indices[i - 1], { opacity: 0, duration: 0.2 }, at + 0.1)
          .fromTo(indices[i], { opacity: 0 }, { opacity: 1, duration: 0.2 }, at + 0.3);
      }
      tl.to({}, { duration: 0.35 }, 3.65);
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section id="material" ref={ref} className="vh-full relative overflow-hidden bg-ink" aria-label="Material">
      {/* image column */}
      <div className="mat-column absolute inset-y-0 right-0 left-0 md:left-[38%]">
        {MATERIALS.map((m, i) => (
          <figure
            key={m.key}
            className="mat-panel absolute inset-0 overflow-hidden"
            style={{ clipPath: i === 0 ? 'inset(0 0 0 0)' : 'inset(100% 0 0 0)' }}
          >
            <img
              src={m.asset.src}
              alt={m.asset.alt}
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
              className="mat-inner h-full w-full object-cover will-change-transform"
            />
            <div className="absolute inset-0 bg-ink/25 md:bg-ink/10" />
            <figcaption className="hud absolute bottom-6 right-6 text-bone/60 md:bottom-8 md:right-10">
              Photo — {m.asset.credit}
            </figcaption>
          </figure>
        ))}
      </div>

      {/* text panel */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6 md:w-[38%] md:p-10">
        <div className="hud pt-16 md:pt-14">
          <span className="text-ember">04</span> — Material
        </div>

        <div>
          <div className="display display-lg relative mb-6 h-[1em] text-bone/25 md:mb-8">
            {MATERIALS.map((m, i) => (
              <span key={m.key} className="mat-index absolute left-0 top-0" style={{ opacity: i === 0 ? 1 : 0 }}>
                0{i + 1}
              </span>
            ))}
          </div>
          <div className="relative h-[3.2em]">
            {MATERIALS.map((m, i) => (
              <div
                key={m.key}
                className="mat-name absolute left-0 top-0 w-full will-change-transform"
                style={{ opacity: i === 0 ? 1 : 0 }}
              >
                <h2 className="display display-md">{m.title}</h2>
                <p className="mt-4 max-w-[34ch] text-sm leading-relaxed text-bone/75">{m.copy}</p>
              </div>
            ))}
          </div>
        </div>

        <ul className="hud flex gap-6 text-bone/50">
          {MATERIALS.map((m) => (
            <li key={m.key}>{m.key}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
