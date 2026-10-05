import { applyVariant, loadShoe, type LoadedShoe } from './three/loadShoe';
import { bakeSequence } from './three/bakeSequence';
import { fetchManifest, loadFileSequence, sequence } from './sequence';
import { SEQUENCE_BUDGET, isMobile } from './env';
import { motion } from './motionState';

/**
 * Boot pipeline. The preloader percentage is real work:
 *   0 – 45 %  model download (7.8 MB GLB)
 *  45 – 95 %  frame sequence (pre-rendered files if present, else baked on-device)
 *  95 – 100 % warm-up
 */
export interface BootState {
  progress: number;
  status: string;
  step: number;
  done: boolean;
}

export const bootState: BootState = { progress: 0, status: 'INITIALISING', step: 0, done: false };

const listeners = new Set<(s: BootState) => void>();

export function subscribeBoot(fn: (s: BootState) => void) {
  listeners.add(fn);
  fn(bootState);
  return () => {
    listeners.delete(fn);
  };
}

function emit(patch: Partial<BootState>) {
  const next = { ...bootState, ...patch, progress: Math.round(patch.progress ?? bootState.progress) };
  if (
    next.progress === bootState.progress &&
    next.status === bootState.status &&
    next.step === bootState.step &&
    next.done === bootState.done
  )
    return;
  Object.assign(bootState, next);
  listeners.forEach((l) => l(bootState));
}

export interface BootResult {
  shoe: LoadedShoe | null;
}

let bootPromise: Promise<BootResult> | null = null;

export function startBoot(): Promise<BootResult> {
  if (!bootPromise) bootPromise = run();
  return bootPromise;
}

async function run(): Promise<BootResult> {
  let shoe: LoadedShoe | null = null;

  try {
    emit({ step: 1, status: 'LOADING MODEL' });
    shoe = await loadShoe((p) => emit({ progress: p * 45 }));
    await applyVariant(shoe, 'Midnight');
    motion.modelReady = true;
    emit({ progress: 45, step: 2, status: 'ENVIRONMENT' });
  } catch (err) {
    console.warn('[boot] model unavailable', err);
  }

  try {
    const manifest = await fetchManifest();
    if (manifest) {
      emit({ step: 3, status: 'LOADING FRAMES' });
      sequence.frames = await loadFileSequence(manifest, isMobile, (p) =>
        emit({ progress: 45 + p * 50 }),
      );
      sequence.source = 'files';
    } else if (shoe) {
      emit({ step: 3, status: `RENDERING ${SEQUENCE_BUDGET.frames} FRAMES` });
      sequence.frames = await bakeSequence(shoe.root, {
        ...SEQUENCE_BUDGET,
        onProgress: (p) => emit({ progress: 45 + p * 50 }),
      });
      sequence.source = 'baked';
    }
    motion.sequenceReady = sequence.frames.length > 1;
  } catch (err) {
    console.warn('[boot] sequence unavailable', err);
    sequence.frames = [];
    sequence.source = 'none';
  }

  emit({ progress: 100, step: 4, status: 'READY', done: true });
  return { shoe };
}
