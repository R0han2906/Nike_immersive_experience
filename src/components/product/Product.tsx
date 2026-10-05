import { useLayoutEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/animations/gsap';
import { motion } from '@/lib/motionState';
import { chapterToggle } from '@/lib/sections';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { cn } from '@/utils/cn';

const VARIANT_META: Record<string, { swatch: string; note: string }> = {
  Midnight: { swatch: '#171c2b', note: 'Black / Deep navy' },
  Street: { swatch: '#6f6f6f', note: 'Grey / Bone' },
  Beach: { swatch: '#3fa9a0', note: 'Teal / Sand' },
};
const SIZES = ['7', '8', '9', '10', '11'];

interface Props {
  variants: string[];
  variant: string;
  onVariant: (v: string) => void;
  focused: boolean;
  onFocus: (f: boolean) => void;
  onAdd: (size: string) => void;
}

/**
 * SECTION 07 — THE SHOE
 * Transparent chapter: the live 3D shoe sits between the two editorial
 * columns. Colour swatches swap the model's KHR material variant in place;
 * EXPLORE expands into a focused view with the shoe centred and enlarged.
 */
export function Product({ variants, variant, onVariant, focused, onFocus, onAdd }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [size, setSize] = useState('9');

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.to(document.getElementById('stage-bg'), {
        backgroundColor: '#f2f0eb',
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 55%', scrub: true },
      });
      ScrollTrigger.create({
        trigger: el,
        start: 'top 78%',
        end: 'bottom 22%',
        onUpdate: (self) => {
          motion.product = self.progress;
        },
        onToggle: chapterToggle('product', 'product', 'hidden'),
      });
      gsap.from('.prod-reveal', {
        y: 28,
        opacity: 0,
        duration: 1,
        stagger: 0.06,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 60%', once: true },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  const list = variants.length ? variants : Object.keys(VARIANT_META);

  return (
    <section
      id="product"
      ref={ref}
      className="min-vh-full relative text-ink"
      aria-label="The shoe"
      onPointerEnter={() => {
        motion.hover = 1;
      }}
      onPointerLeave={() => {
        motion.hover = 0;
      }}
    >
      <div
        className={cn(
          'relative grid min-h-[100svh] grid-cols-12 gap-x-6 px-6 pb-16 pt-28 transition-opacity duration-500 md:px-10 md:pb-20 md:pt-36',
          focused && 'pointer-events-none opacity-0',
        )}
      >
        {/* left column */}
        <div className="prod-reveal col-span-12 flex flex-col justify-between md:col-span-3">
          <div>
            <p className="hud text-ember">07 — The shoe</p>
            <p className="hud mt-8 text-ink/50">Nike</p>
            <h2 className="display display-xl mt-1">
              Motion
              <br />
              01
            </h2>
            <p className="label mt-6 text-ink/60">Running / Performance</p>
          </div>
          <p className="mt-10 max-w-[32ch] text-sm leading-relaxed text-ink/70 md:mt-0">
            A neutral daily trainer built around one idea: the shoe should already be moving
            when your foot arrives. Rockered geometry, responsive foam, a knit upper that
            breathes where you sweat and holds where you push.
          </p>
        </div>

        {/* centre – 3D shoe lives here (fixed WebGL stage behind) */}
        <div
          className="relative col-span-12 order-first h-[48svh] md:order-none md:col-span-6 md:h-auto"
          data-cursor="explore"
          role="button"
          tabIndex={0}
          aria-label="Explore the shoe in focused view"
          onClick={() => onFocus(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onFocus(true);
            }
          }}
        >
          <Corner className="left-0 top-0 border-l border-t" />
          <Corner className="right-0 top-0 border-r border-t" />
          <Corner className="bottom-0 left-0 border-b border-l" />
          <Corner className="bottom-0 right-0 border-b border-r" />
          <span className="hud absolute bottom-3 left-1/2 -translate-x-1/2 text-ink/50">
            Move the cursor · Click to explore
          </span>
        </div>

        {/* right column */}
        <div className="prod-reveal col-span-12 mt-12 flex flex-col justify-end gap-10 md:col-span-3 md:mt-0">
          <div>
            <p className="hud text-ink/50">Price</p>
            <p className="display display-md mt-1">₹ 14,995</p>
          </div>

          <div>
            <div className="hud mb-3 flex items-center justify-between text-ink/50">
              <span>Colour</span>
              <span className="text-ink">{VARIANT_META[variant]?.note ?? variant}</span>
            </div>
            <div className="flex gap-3">
              {list.map((v) => (
                <button
                  key={v}
                  className="swatch"
                  aria-pressed={v === variant}
                  aria-label={`Colour ${v}`}
                  onClick={() => onVariant(v)}
                  data-cursor="hover"
                >
                  <i style={{ background: VARIANT_META[v]?.swatch ?? '#333' }} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="hud mb-3 flex items-center justify-between text-ink/50">
              <span>Size · US</span>
              <span className="text-ink">Guide</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((s) => (
                <button
                  key={s}
                  className="size-chip"
                  aria-pressed={s === size}
                  onClick={() => setSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <MagneticButton tone="dark" className="w-full" onClick={() => onAdd(size)}>
              Add to bag <span aria-hidden="true">→</span>
            </MagneticButton>
            <MagneticButton tone="dark" variant="outline" className="w-full" onClick={() => onFocus(true)}>
              Explore in 3D
            </MagneticButton>
            <p className="hud text-center text-ink/45">Free delivery · 30-day returns</p>
          </div>
        </div>
      </div>

      {/* focused view */}
      <div
        className={cn(
          'fixed inset-0 z-[45] flex flex-col justify-between p-6 text-ink transition-opacity duration-500 md:p-10',
          focused ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        aria-hidden={!focused}
      >
        <div className="flex items-start justify-between pt-16 md:pt-20">
          <div>
            <p className="hud text-ember">Focused view</p>
            <h3 className="display display-lg mt-2">
              Motion 01
              <br />
              <span className="text-ink/40">{variant}</span>
            </h3>
          </div>
          <button
            onClick={() => onFocus(false)}
            className="hud border border-ink/30 px-4 py-3 transition-colors hover:bg-ink hover:text-bone"
            data-cursor="hover"
          >
            Close ✕
          </button>
        </div>

        <ul className="hidden md:block">
          <Callout className="left-[12%] top-[38%]" k="Upper" v="Engineered knit" />
          <Callout className="right-[10%] top-[46%]" k="Midsole" v="Responsive foam" />
          <Callout className="left-[18%] bottom-[24%]" k="Outsole" v="High-grip rubber" />
        </ul>

        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="flex gap-3">
            {list.map((v) => (
              <button
                key={v}
                className="swatch"
                aria-pressed={v === variant}
                aria-label={`Colour ${v}`}
                onClick={() => onVariant(v)}
                data-cursor="hover"
              >
                <i style={{ background: VARIANT_META[v]?.swatch ?? '#333' }} />
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <span className="hud text-ink/50">US {size}</span>
            <MagneticButton tone="dark" onClick={() => onAdd(size)}>
              Add to bag <span aria-hidden="true">→</span>
            </MagneticButton>
          </div>
        </div>
      </div>
    </section>
  );
}

function Corner({ className }: { className: string }) {
  return <span className={cn('absolute h-5 w-5 border-ink/40', className)} aria-hidden="true" />;
}

function Callout({ className, k, v }: { className: string; k: string; v: string }) {
  return (
    <li className={cn('absolute flex items-center gap-3', className)}>
      <span className="h-2 w-2 rounded-full bg-ember" />
      <span className="h-px w-16 bg-ink/40" />
      <span>
        <span className="hud block text-ink/50">{k}</span>
        <span className="label block">{v}</span>
      </span>
    </li>
  );
}
