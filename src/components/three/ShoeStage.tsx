import { memo, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { gsap } from '@/lib/animations/gsap';
import { motion } from '@/lib/motionState';
import { createEnvironment } from '@/lib/three/environment';
import type { LoadedShoe } from '@/lib/three/loadShoe';
import { isLowPower } from '@/lib/env';
import { ShoeRig } from './ShoeRig';

function Environment() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    const texture = createEnvironment(gl);
    scene.environment = texture;
    invalidate();
    return () => {
      scene.environment = null;
      texture.dispose();
    };
  }, [gl, scene, invalidate]);
  return null;
}

function Lights() {
  const key = useRef<THREE.DirectionalLight>(null);
  // the key light follows the pointer → specular highlights travel across the upper
  useFrame(() => {
    const l = key.current;
    if (!l) return;
    l.position.x += (2 + motion.pointer.x * 2.5 - l.position.x) * 0.08;
    l.position.y += (3 - motion.pointer.y * 1.5 - l.position.y) * 0.08;
  });
  return (
    <>
      <ambientLight intensity={0.12} />
      <directionalLight ref={key} position={[2, 3, 2]} intensity={2.2} />
      <directionalLight position={[-3, 1.5, -2.5]} intensity={2.6} color="#dfe8ff" />
    </>
  );
}

/**
 * Demand rendering: we only ask for frames while the shoe can be seen
 * (plus a short tail so it collapses cleanly before a chapter covers it).
 */
function FrameDriver() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    let hiddenSince = 0;
    const tick = () => {
      if (motion.stage === 'hidden' && !motion.focused) {
        if (!hiddenSince) hiddenSince = performance.now();
        if (performance.now() - hiddenSince > 900) return;
      } else hiddenSince = 0;
      invalidate();
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
    };
  }, [invalidate]);
  return null;
}

interface Props {
  shoe: LoadedShoe | null;
  variant: string;
}

export const ShoeStage = memo(function ShoeStage({ shoe, variant }: Props) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[1]" aria-hidden="true">
      <Canvas
        frameloop="demand"
        dpr={[1, isLowPower ? 1.5 : 1.75]}
        camera={{ position: [0, 0, 3], fov: 35, near: 0.1, far: 30 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', stencil: false }}
        onCreated={({ gl, scene }) => {
          gl.localClippingEnabled = true;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          gl.setClearColor(0x000000, 0);
          scene.fog = new THREE.Fog('#0a0a0a', 4.5, 9.5);
        }}
      >
        <Environment />
        <Lights />
        <FrameDriver />
        {shoe && <ShoeRig shoe={shoe} variant={variant} />}
      </Canvas>
    </div>
  );
});
