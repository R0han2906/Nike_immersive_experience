import { useEffect, useRef, useState } from 'react';
import { ScrollTrigger } from '@/lib/animations/gsap';
import { CHAPTERS, subscribeChapter, type Chapter } from '@/lib/sections';
import { scrollToTarget } from '@/hooks/useLenis';
import { cn } from '@/utils/cn';

const LINKS = [
  ['COLLECTION', '#product'],
  ['TECHNOLOGY', '#anatomy'],
  ['STORY', '#athlete'],
  ['SHOP', '#final'],
] as const;

interface Props {
  bag: number;
  visible: boolean;
}

export function Nav({ bag, visible }: Props) {
  const [chapter, setChapter] = useState<Chapter>(CHAPTERS[0]);
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const header = useRef<HTMLElement>(null);

  useEffect(() => subscribeChapter(setChapter), []);

  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 80,
      end: 'max',
      onToggle: (self) => setScrolled(self.isActive),
    });
    return () => st.kill();
  }, []);

  const go = (target: string) => {
    setMenu(false);
    window.setTimeout(() => scrollToTarget(target), menu ? 350 : 0);
  };

  return (
    <>
      <header
        ref={header}
        className={cn(
          'fixed inset-x-0 top-0 z-[60] text-white mix-blend-difference transition-all duration-700',
          visible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0',
        )}
      >
        <nav
          aria-label="Primary"
          className={cn(
            'flex items-center justify-between px-6 transition-[padding] duration-500 md:px-10',
            scrolled ? 'py-4' : 'py-6 md:py-8',
          )}
        >
          <button
            onClick={() => go('#hero')}
            className={cn(
              'display origin-left leading-none tracking-wide transition-transform duration-500',
              scrolled ? 'scale-90' : 'scale-100',
            )}
            aria-label="Back to top"
          >
            <span className="text-2xl md:text-3xl">NIKE</span>
          </button>

          <ul className="hud hidden items-center gap-8 md:flex">
            {LINKS.map(([label, target]) => (
              <li key={label}>
                <button
                  onClick={() => go(target)}
                  className="relative py-1 after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-500 hover:after:origin-left hover:after:scale-x-100"
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>

          <div className="hud flex items-center gap-6">
            <span className="hidden tabular-nums sm:inline" aria-live="polite">
              <span className="text-ember">{chapter.index}</span>
              <span className="mx-2 opacity-50">/</span>
              {chapter.title}
            </span>
            <button onClick={() => go('#product')} className="tabular-nums">
              BAG ({String(bag).padStart(2, '0')})
            </button>
            <button
              onClick={() => setMenu((m) => !m)}
              className="md:hidden"
              aria-expanded={menu}
              aria-controls="site-menu"
            >
              {menu ? 'CLOSE' : 'MENU'}
            </button>
          </div>
        </nav>
      </header>

      <div
        id="site-menu"
        className={cn(
          'fixed inset-0 z-[55] flex flex-col justify-end bg-ink p-6 pb-16 text-bone transition-transform duration-700 ease-[cubic-bezier(.76,0,.24,1)] md:hidden',
          menu ? 'translate-y-0' : '-translate-y-full',
        )}
        aria-hidden={!menu}
      >
        <ul className="space-y-2">
          {LINKS.map(([label, target], i) => (
            <li key={label}>
              <button onClick={() => go(target)} className="display display-lg flex items-baseline gap-4">
                <span className="hud text-ember">0{i + 1}</span>
                {label}
              </button>
            </li>
          ))}
        </ul>
        <p className="hud mt-10 text-bone/50">The shoe in motion · SS26 concept</p>
      </div>
    </>
  );
}
