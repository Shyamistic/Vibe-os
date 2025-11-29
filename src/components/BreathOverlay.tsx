'use client';
import { useEffect, useState } from 'react';
import { useVibeStore } from '@/lib/store';

type Phase = 'inhale' | 'hold' | 'exhale';

const INHALE = 4;
const HOLD = 4;
const EXHALE = 8;
const TOTAL = INHALE + HOLD + EXHALE;

export function BreathOverlay() {
  const { breathModeActive } = useVibeStore();
  const [phase, setPhase] = useState<Phase>('inhale');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!breathModeActive) return;
    let start = performance.now();
    let frame: number;

    const loop = (t: number) => {
      const elapsed = (t - start) / 1000;
      const mod = elapsed % TOTAL;

      let nextPhase: Phase = 'inhale';
      if (mod < INHALE) nextPhase = 'inhale';
      else if (mod < INHALE + HOLD) nextPhase = 'hold';
      else nextPhase = 'exhale';

      setPhase(nextPhase);

      let p = 0;
      if (nextPhase === 'inhale') p = mod / INHALE;
      if (nextPhase === 'hold') p = 1;
      if (nextPhase === 'exhale') {
        const tEx = mod - (INHALE + HOLD);
        p = 1 - tEx / EXHALE;
      }
      setProgress(p);

      frame = requestAnimationFrame(loop);
    };

    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [breathModeActive]);

  if (!breathModeActive) return null;

  const radius = 180 + progress * 40;

  return (
    <div className="breath-overlay">
      <div
        className="breath-ring"
        style={{
          width: `${radius}px`,
          height: `${radius}px`,
        }}
      />
      <div className="breath-label">
        {phase === 'inhale' && 'Inhale'}
        {phase === 'hold' && 'Hold'}
        {phase === 'exhale' && 'Exhale'}
      </div>
    </div>
  );
}
