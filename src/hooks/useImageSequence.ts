import { useCallback, useEffect, useRef, type RefObject } from 'react';
import { drawContain } from '@/lib/sequence';

/**
 * Canvas frame player. `setProgress(0…1)` maps to a frame index and repaints
 * only when the index changes – scroll jitter never causes redundant draws.
 */
export function useImageSequence(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  frames: HTMLImageElement[],
) {
  const state = useRef({
    ctx: null as CanvasRenderingContext2D | null,
    w: 0,
    h: 0,
    dpr: 1,
    index: -1,
  });

  const paint = useCallback(
    (index: number) => {
      const s = state.current;
      const img = frames[index];
      if (!s.ctx || !img) return;
      s.ctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0);
      s.ctx.fillStyle = '#0a0a0a';
      s.ctx.fillRect(0, 0, s.w, s.h);
      drawContain(s.ctx, img, s.w, s.h);
      s.index = index;
    },
    [frames],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || frames.length === 0) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    const s = state.current;
    s.ctx = ctx;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      s.w = w;
      s.h = h;
      s.dpr = dpr;
      paint(Math.max(0, s.index));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => {
      ro.disconnect();
      s.ctx = null;
    };
  }, [canvasRef, frames, paint]);

  const setProgress = useCallback(
    (p: number) => {
      const n = frames.length;
      if (!n) return -1;
      const index = Math.min(n - 1, Math.max(0, Math.round(p * (n - 1))));
      if (index !== state.current.index) paint(index);
      return index;
    },
    [frames, paint],
  );

  return { setProgress, frameCount: frames.length };
}
