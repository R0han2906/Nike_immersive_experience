import type { ScrollTrigger } from './animations/gsap';
import { setStage, type Stage } from './motionState';

export interface Chapter {
  id: string;
  index: string;
  title: string;
}

export const CHAPTERS: Chapter[] = [
  { id: 'hero', index: '01', title: 'THE DROP' },
  { id: 'motion', index: '02', title: 'MOTION' },
  { id: 'anatomy', index: '03', title: 'THE ANATOMY' },
  { id: 'material', index: '04', title: 'MATERIAL' },
  { id: 'speed', index: '05', title: 'SPEED' },
  { id: 'athlete', index: '06', title: 'ATHLETE' },
  { id: 'product', index: '07', title: 'THE SHOE' },
  { id: 'final', index: '08', title: 'MOVE' },
];

let current: Chapter = CHAPTERS[0];
const subs = new Set<(c: Chapter) => void>();

export function setChapter(id: string) {
  const c = CHAPTERS.find((ch) => ch.id === id);
  if (!c || c === current) return;
  current = c;
  subs.forEach((fn) => fn(c));
}

export function subscribeChapter(fn: (c: Chapter) => void) {
  subs.add(fn);
  fn(current);
  return () => {
    subs.delete(fn);
  };
}

/**
 * Shared onToggle for chapter triggers: when active → own stage; when left
 * scrolling upwards → hand the 3D stage back to the previous chapter.
 */
export function chapterToggle(id: string, stage: Stage, prevStage: Stage) {
  return (self: ScrollTrigger) => {
    if (self.isActive) {
      setStage(stage);
      setChapter(id);
    } else if (self.direction < 0) {
      setStage(prevStage);
    }
  };
}
