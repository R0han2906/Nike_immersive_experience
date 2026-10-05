import { useEffect, useState } from 'react';
import { ScrollTrigger } from '@/lib/animations/gsap';
import { startBoot } from '@/lib/boot';
import { bindPointer, motion } from '@/lib/motionState';
import type { LoadedShoe } from '@/lib/three/loadShoe';
import { useLenis } from '@/hooks/useLenis';
import { ShoeStage } from '@/components/three/ShoeStage';
import { Nav } from '@/components/navigation/Nav';
import { Cursor } from '@/components/ui/Cursor';
import { Preloader } from '@/components/ui/Preloader';
import { Hero } from '@/components/hero/Hero';
import { Motion } from '@/components/sections/Motion';
import { Anatomy } from '@/components/sections/Anatomy';
import { Material } from '@/components/sections/Material';
import { Speed } from '@/components/sections/Speed';
import { Athlete } from '@/components/sections/Athlete';
import { Product } from '@/components/product/Product';
import { Final } from '@/components/sections/Final';

type Phase = 'loading' | 'ready' | 'entered';

export default function App() {
  const [phase, setPhase] = useState<Phase>('loading');
  const [showPreloader, setShowPreloader] = useState(true);
  const [shoe, setShoe] = useState<LoadedShoe | null>(null);
  const [variant, setVariant] = useState('Midnight');
  const [focused, setFocused] = useState(false);
  const [bag, setBag] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const entered = phase === 'entered';
  useLenis(entered && !focused);

  useEffect(() => {
    bindPointer();
    startBoot().then((result) => {
      setShoe(result.shoe);
      setPhase('ready');
    });
  }, []);

  useEffect(() => {
    motion.focused = focused;
  }, [focused]);

  useEffect(() => {
    if (!focused) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFocused(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focused]);

  // Layout is final once the curtain lifts and fonts are in → re-measure pins.
  useEffect(() => {
    if (!entered) return;
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(raf);
  }, [entered]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(id);
  }, [toast]);

  const handleAdd = (size: string) => {
    setBag((b) => b + 1);
    setToast(`Added — Motion 01 · ${variant} · US ${size}`);
  };

  return (
    <>
      <a
        href="#product"
        className="hud sr-only z-[90] bg-bone px-4 py-3 text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to product
      </a>

      {/* fixed stage: colour plate + WebGL shoe live behind the document */}
      <div id="stage-bg" className="fixed inset-0 z-0 bg-ink" aria-hidden="true" />
      <ShoeStage shoe={shoe} variant={variant} />

      {phase !== 'loading' && (
        <main className="relative z-[2]">
          <Hero modelReady={!!shoe} entered={entered} />
          <Motion />
          <Anatomy />
          <Material />
          <Speed />
          <Athlete />
          <Product
            variants={shoe?.variants ?? []}
            variant={variant}
            onVariant={setVariant}
            focused={focused}
            onFocus={setFocused}
            onAdd={handleAdd}
          />
          <Final />
        </main>
      )}

      <Nav bag={bag} visible={entered} />
      <div className="grain" aria-hidden="true" />
      <Cursor />

      <div
        role="status"
        aria-live="polite"
        className={`hud fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 border border-bone/20 bg-ink px-5 py-3 text-bone transition-all duration-500 ${
          toast ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
        }`}
      >
        {toast ?? ''}
      </div>

      {showPreloader && (
        <Preloader
          ready={phase === 'ready'}
          onEnter={() => setPhase('entered')}
          onExited={() => setShowPreloader(false)}
        />
      )}
    </>
  );
}
