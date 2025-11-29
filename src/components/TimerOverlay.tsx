'use client';
import { useEffect, useState } from 'react';
import { useVibeStore } from '@/lib/store';

export function TimerOverlay() {
  const { timer, isImmersive, toggleImmersive } = useVibeStore();
  const [hoverBottom, setHoverBottom] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handler = (e: MouseEvent) => {
      const threshold = window.innerHeight * 0.9;
      setHoverBottom(e.clientY >= threshold);
    };

    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  if (!timer.active && !isImmersive) return null;

  const minutes = Math.floor(timer.timeLeft / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (timer.timeLeft % 60).toString().padStart(2, '0');

  return (
    <>
      {timer.active && (
        <div className="timer-display">
          {minutes}:{seconds}
        </div>
      )}

      {isImmersive && (
        <div
          className={`immersive-exit-hint ${
            hoverBottom ? 'visible' : ''
          }`}
          onClick={toggleImmersive}
        >
          Exit Immersive (Move cursor down or click here)
        </div>
      )}
    </>
  );
}
