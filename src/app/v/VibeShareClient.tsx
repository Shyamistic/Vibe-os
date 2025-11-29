// app/v/VibeShareClient.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useVibeStore } from '@/lib/store';

export default function VibeShareClient() {
  const searchParams = useSearchParams();
  const setVibeAbsolute = useVibeStore((s) => s.setVibeAbsolute);
  const hasHydrated = useRef(false);

  useEffect(() => {
    if (hasHydrated.current) return;        // prevent re-running
    hasHydrated.current = true;

    const state = searchParams.get('state');
    if (!state) return;

    try {
      const decoded = JSON.parse(atob(state));
      setVibeAbsolute(decoded);
    } catch (e) {
      console.error('Failed to decode shared vibe', e);
    }
  }, [searchParams, setVibeAbsolute]);

  return null;
}
