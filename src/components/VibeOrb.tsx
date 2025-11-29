'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere } from '@react-three/drei';
import { useVibeStore } from '@/lib/store';
import * as THREE from 'three';

export function VibeOrb() {
  const { currentVibe, timer, isMusicActive } = useVibeStore();
  const materialRef = useRef<any>();
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!materialRef.current || !meshRef.current) return;

    materialRef.current.color.lerp(
      new THREE.Color(currentVibe.colors.orb),
      delta * 2
    );
    materialRef.current.distort = THREE.MathUtils.lerp(
      materialRef.current.distort,
      currentVibe.shapeParams.distort,
      delta * 2
    );
    materialRef.current.speed = THREE.MathUtils.lerp(
      materialRef.current.speed,
      currentVibe.shapeParams.speed,
      delta * 2
    );

    let targetScale = 2.2;

    if (timer.active && timer.duration > 0) {
      const progress = timer.timeLeft / timer.duration;
      targetScale = 0.8 + 1.4 * progress;
    }

    if (isMusicActive) {
      const beat = Math.sin(state.clock.elapsedTime * 10) * 0.1;
      targetScale += beat;
    }

    meshRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      delta * 2
    );
  });

  return (
    <Sphere ref={meshRef} args={[1, 64, 64]} scale={2.2}>
      <MeshDistortMaterial
        ref={materialRef}
        color={currentVibe.colors.orb}
        envMapIntensity={0.4}
        clearcoat={1}
        clearcoatRoughness={0}
        metalness={0.1}
      />
    </Sphere>
  );
}
