import { useRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { useMagnetic } from '@/hooks/useMagnetic';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  tone?: 'light' | 'dark';
  variant?: 'solid' | 'outline';
}

export function MagneticButton({
  children,
  className,
  tone = 'light',
  variant = 'solid',
  ...rest
}: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  useMagnetic(ref, 0.3, '.mb-inner');

  const skin =
    variant === 'solid'
      ? tone === 'light'
        ? 'bg-bone text-ink hover:bg-white'
        : 'bg-ink text-bone hover:bg-black'
      : tone === 'light'
        ? 'border border-bone/60 text-bone hover:border-bone'
        : 'border border-ink/40 text-ink hover:border-ink';

  return (
    <button
      ref={ref}
      data-cursor="hover"
      className={cn(
        'label relative inline-flex items-center justify-center rounded-full px-8 py-4 transition-colors duration-300 will-change-transform',
        skin,
        className,
      )}
      {...rest}
    >
      <span className="mb-inner inline-flex items-center gap-3 will-change-transform">{children}</span>
    </button>
  );
}
