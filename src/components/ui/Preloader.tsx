import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/animations/gsap';
import { bootState, subscribeBoot, type BootState } from '@/lib/boot';
import { prefersReducedMotion, SEQUENCE_BUDGET } from '@/lib/env';
import { cn } from '@/utils/cn';
import { MagneticButton } from './MagneticButton';

const STEPS = [
  ['01', 'MODEL'],
  ['02', 'ENVIRONMENT'],
  ['03', 'SEQUENCE'],
  ['04', 'WARM-UP'],
];

interface Props {
  ready: boolean;
  onEnter: () => void;
  onExited: () => void;
}

export function Preloader({ ready, onEnter, onExited }: Props) {
  const [state, setState] = useState<BootState>({ ...bootState });
  const root = useRef<HTMLDivElement>(null);
  const exiting = useRef(false);

  useEffect(() => subscribeBoot((s) => setState({ ...s })), []);

  const enter = () => {
    if (exiting.current || !ready) return;
    exiting.current = true;
    onEnter();
    const el = root.current;
    if (!el || prefersReducedMotion) {
      onExited();
      return;
    }
    gsap
      .timeline({ onComplete: onExited })
      .to(el.querySelectorAll('.pre-fade'), {
        yPercent: -30,
        opacity: 0,
        duration: 0.5,
        stagger: 0.05,
        ease: 'power3.in',
      })
      .to(el, { clipPath: 'inset(0 0 100% 0)', duration: 1.05, ease: 'power4.inOut' }, 0.3);
  };

  useEffect(() => {
    if (!ready) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') enter();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  return (
    <div
      ref={root}
      role="dialog"
      aria-label="Loading the experience"
      className="fixed inset-0 z-[80] bg-ink text-bone"
      style={{ clipPath: 'inset(0 0 0% 0)' }}
    >
      <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-10">
        <header className="pre-fade hud flex items-start justify-between">
          <span>
            <span className="display text-2xl leading-none tracking-wide">NIKE</span>
            <span className="ml-4 align-top text-bone/75">The shoe in motion</span>
          </span>
          <span className="text-right text-bone/70">
            SS26 · Concept
            <br />
            Not affiliated with Nike, Inc.
          </span>
        </header>

        <div className="grid grid-cols-12 items-end gap-6">
          <div className="pre-fade col-span-12 md:col-span-7">
            {!ready ? (
              <div className="display display-hero tabular-nums">
                {String(state.progress).padStart(3, '0')}
                <span className="align-top text-[0.32em] text-ember">%</span>
              </div>
            ) : (
              <div className="display display-xl">
                Ready
                <br />
                to move?
              </div>
            )}
          </div>

          <div className="pre-fade col-span-12 md:col-span-5 md:justify-self-end md:text-right">
            <ul className="hud space-y-2 md:inline-block md:text-left">
              {STEPS.map(([n, name], i) => {
                const done = state.done || state.step > i + 1;
                const active = !done && state.step === i + 1;
                return (
                  <li
                    key={n}
                    className={cn(
                      'flex items-center gap-4 transition-opacity duration-500',
                      done || active ? 'opacity-100' : 'opacity-30',
                    )}
                  >
                    <span className="text-bone/70">{n}</span>
                    <span className="w-28">{name}</span>
                    <span className={cn('text-ember', active && 'animate-pulse')}>
                      {done ? '●' : active ? '○' : ''}
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="hud mt-6 text-bone/65">
              {state.status}
              {!state.done && state.step === 3 && (
                <>
                  <br />
                  {SEQUENCE_BUDGET.frames} frames · rendered on your device
                </>
              )}
            </p>
            {ready && (
              <div className="mt-8">
                <MagneticButton onClick={enter} data-cursor="enter" autoFocus>
                  Enter <span aria-hidden="true">→</span>
                </MagneticButton>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 h-[2px] w-full origin-left bg-bone transition-transform duration-200 ease-linear"
        style={{ transform: `scaleX(${state.progress / 100})` }}
        aria-hidden="true"
      />
    </div>
  );
}
