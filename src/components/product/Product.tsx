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
      className="min-vh-full relative bg-gradient-to-br from-bone via-bone to-smoke/10"
      aria-label="The shoe"
      onPointerEnter={() => {
        motion.hover = 1;
      }}
      onPointerLeave={() => {
        motion.hover = 0;
      }}
    >
      {/* Subtle radial gradient overlay for depth */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(10,10,10,0.03)_100%)]" aria-hidden="true" />
      
      <div
        className={cn(
          'relative grid min-h-[100svh] grid-cols-12 gap-x-6 px-6 pb-16 pt-28 transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] md:px-10 md:pb-20 md:pt-36',
          focused && 'pointer-events-none opacity-0',
        )}
      >
        {/* left column */}
        <div className="prod-reveal col-span-12 flex flex-col justify-between md:col-span-3">
          <div className="rounded-xl border border-ink/8 bg-white/40 p-6 shadow-sm backdrop-blur-sm">
            <p className="hud text-ember">07 — The shoe</p>
            <p className="hud mt-8 text-ink/70">Nike</p>
            <h2 className="display display-xl mt-1 text-ink drop-shadow-sm">
              Motion
              <br />
              01
            </h2>
            <p className="label mt-6 text-ink/90">Running / Performance</p>
          </div>
          <p className="mt-10 max-w-[32ch] rounded-xl border border-ink/8 bg-white/40 p-6 text-sm leading-loose text-ink/90 shadow-sm backdrop-blur-sm md:mt-6">
            A neutral daily trainer built around one idea: the shoe should already be moving
            when your foot arrives. Rockered geometry, responsive foam, a knit upper that
            breathes where you sweat and holds where you push.
          </p>
        </div>

        {/* centre – 3D shoe lives here (fixed WebGL stage behind) */}
        <div
          className="relative col-span-12 order-first h-[48svh] rounded-2xl border border-ink/10 bg-gradient-to-b from-white/20 to-transparent backdrop-blur-sm transition-all duration-500 hover:border-ember/30 hover:shadow-lg md:order-none md:col-span-6 md:h-auto"
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
          <Corner className="left-2 top-2 border-l-2 border-t-2 border-ink/20" />
          <Corner className="right-2 top-2 border-r-2 border-t-2 border-ink/20" />
          <Corner className="bottom-2 left-2 border-b-2 border-l-2 border-ink/20" />
          <Corner className="bottom-2 right-2 border-b-2 border-r-2 border-ink/20" />
          <span className="hud absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-ink/10 bg-white/80 px-4 py-2 text-ink/70 shadow-sm backdrop-blur-sm">
            Move cursor · Click to explore
          </span>
        </div>

        {/* right column */}
        <div className="prod-reveal col-span-12 mt-12 flex flex-col justify-end gap-6 md:col-span-3 md:mt-0">
          <div className="rounded-xl border border-ink/8 bg-white/40 p-6 shadow-sm backdrop-blur-sm">
            <p className="hud text-ink/60">Price</p>
            <p className="display display-md mt-1 text-ink drop-shadow-sm">₹ 14,995</p>
          </div>

          <div className="rounded-xl border border-ink/8 bg-white/40 p-6 shadow-sm backdrop-blur-sm">
            <div className="hud mb-4 flex items-center justify-between text-ink/70">
              <span>Colour</span>
              <span className="flex items-center gap-2 text-ink/90">
                <span 
                  className="inline-block h-3 w-3 rounded-full border border-ink/20" 
                  style={{ background: VARIANT_META[variant]?.swatch ?? '#333' }}
                />
                {VARIANT_META[variant]?.note ?? variant}
              </span>
            </div>
            <div className="flex gap-3">
              {list.map((v) => (
                <button
                  key={v}
                  className="swatch group relative"
                  aria-pressed={v === variant}
                  aria-label={`Colour ${v}`}
                  onClick={() => onVariant(v)}
                  data-cursor="hover"
                >
                  <i style={{ background: VARIANT_META[v]?.swatch ?? '#333' }} />
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium uppercase tracking-wider text-ink/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    {v}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-ink/8 bg-white/40 p-6 shadow-sm backdrop-blur-sm">
            <div className="hud mb-4 flex items-center justify-between text-ink/70">
              <span>Size · US</span>
              <span className="text-ink/90">Guide</span>
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
            <MagneticButton tone="dark" className="w-full shadow-md" onClick={() => onAdd(size)}>
              Add to bag <span aria-hidden="true">→</span>
            </MagneticButton>
            <MagneticButton tone="dark" variant="outline" className="w-full" onClick={() => onFocus(true)}>
              Explore in 3D
            </MagneticButton>
            <p className="hud text-center text-ink/70">Free delivery · 30-day returns</p>
          </div>
        </div>
      </div>

      {/* focused view */}
      <div
        className={cn(
          'fixed inset-0 z-[45] flex flex-col justify-between bg-gradient-to-br from-bone via-bone to-smoke/10 p-6 transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] md:p-10',
          focused ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        aria-hidden={!focused}
      >
        {/* Subtle overlay */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(10,10,10,0.03)_100%)]" aria-hidden="true" />
        
        <div className="relative flex items-start justify-between pt-16 md:pt-20">
          <div className="rounded-xl border border-ink/10 bg-white/50 p-6 shadow-md backdrop-blur-sm">
            <p className="hud text-ember">Focused view</p>
            <h3 className="display display-lg mt-2 text-ink drop-shadow-sm">
              Motion 01
              <br />
              <span className="text-ink/75">{variant}</span>
            </h3>
          </div>
          <button
            onClick={() => onFocus(false)}
            className="hud rounded-lg border-2 border-ink/20 bg-white/80 px-5 py-3 text-ink/90 shadow-md backdrop-blur-sm transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-ember hover:bg-ink hover:text-bone"
            data-cursor="hover"
          >
            Close ✕
          </button>
        </div>

        <ul className="relative hidden md:block">
          <Callout className="left-[12%] top-[38%]" k="Upper" v="Engineered knit" />
          <Callout className="right-[10%] top-[46%]" k="Midsole" v="Responsive foam" />
          <Callout className="left-[18%] bottom-[24%]" k="Outsole" v="High-grip rubber" />
        </ul>

        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="hud text-ink/70">Colour</span>
            <div className="flex gap-3">
              {list.map((v) => (
                <button
                  key={v}
                  className="swatch group relative"
                  aria-pressed={v === variant}
                  aria-label={`Colour ${v}`}
                  onClick={() => onVariant(v)}
                  data-cursor="hover"
                >
                  <i style={{ background: VARIANT_META[v]?.swatch ?? '#333' }} />
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium uppercase tracking-wider text-ink/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    {v}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-ink/10 bg-white/50 px-6 py-3 shadow-md backdrop-blur-sm">
            <span className="hud text-ink/70">US {size}</span>
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
  return <span className={cn('absolute h-6 w-6 rounded-sm', className)} aria-hidden="true" />;
}

function Callout({ className, k, v }: { className: string; k: string; v: string }) {
  return (
    <li className={cn('absolute flex items-center gap-3', className)}>
      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-ember shadow-md shadow-ember/50" />
      <span className="h-px w-20 bg-gradient-to-r from-ink/40 to-transparent" />
      <span className="rounded-lg border border-ink/10 bg-white/80 px-4 py-2 shadow-sm backdrop-blur-sm">
        <span className="hud block text-ink/70">{k}</span>
        <span className="label block text-ink/90">{v}</span>
      </span>
    </li>
  );
}
