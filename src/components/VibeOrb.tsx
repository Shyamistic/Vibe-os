'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { useVibeStore } from '@/lib/store';

type VibeOrbProps = {
  jitter?: number;          // from stressLevel → extra wobble
};

export function VibeOrb({ jitter = 0 }: VibeOrbProps) {
  const { currentVibe, timer, isMusicActive } = useVibeStore();

  // strong typing + initial null to satisfy TS
  const materialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);

  useFrame((state, delta) => {
    const mat = materialRef.current as any; // MeshDistortMaterial is a custom material
    const mesh = meshRef.current;
    if (!mat || !mesh) return;

    // Smoothly lerp orb color toward current vibe color
    mat.color.lerp(new THREE.Color(currentVibe.colors.orb), delta * 2);

    // Distortion + speed based on vibe shape params
    mat.distort = THREE.MathUtils.lerp(
      mat.distort,
      currentVibe.shapeParams.distort + jitter * 0.2, // extra wobble on stress
      delta * 2
    );
    mat.speed = THREE.MathUtils.lerp(
      mat.speed,
      currentVibe.shapeParams.speed + jitter * 0.5,
      delta * 2
    );

    // Base scale
    let targetScale = 2.2;

    // Timer → orb shrinks as time runs out
    if (timer.active && timer.duration > 0) {
      const progress = timer.timeLeft / timer.duration;     // 1 → 0
      targetScale = 0.8 + 1.4 * progress;
    }

    // Music pulse → subtle breathing
    if (isMusicActive) {
      const beat = Math.sin(state.clock.elapsedTime * 4) * 0.06;
      targetScale += beat;
    }

    // Stress-driven micro jitter on scale
    const stress = currentVibe.stressLevel ?? 0;
    if (stress > 60) {
      const sJitter = (stress - 60) / 40; // 0–1
      const micro = Math.sin(state.clock.elapsedTime * 20) * 0.04 * sJitter;
      targetScale += micro;
    }

    mesh.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      delta * 3
    );
  });

  return (
    <Sphere ref={meshRef} args={[1, 96, 96]} scale={2.2}>
      <MeshDistortMaterial
        // Drei’s material extends MeshPhysicalMaterial internally
        ref={materialRef as any}
        color={currentVibe.colors.orb}
        envMapIntensity={0.6}
        clearcoat={1}
        clearcoatRoughness={0.1}
        metalness={0.2}
        roughness={currentVibe.shapeParams.roughness}
        transparent
        opacity={0.96}
      />
    </Sphere>
  );
}
