'use client';
import { useVibeStore } from '@/lib/store';

export function AnalogNoiseOverlay() {
  const { currentVibe } = useVibeStore();
  const stress = currentVibe.stressLevel ?? 10;
  const intensity = Math.min(stress / 100, 1);

  return (
    <div
      className="analog-noise-overlay"
      style={{ opacity: 0.1 + intensity * 0.4 }}
    />
  );
}
