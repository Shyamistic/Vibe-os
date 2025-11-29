// app/v/VibeShareClient.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useVibeStore } from '@/lib/store';

export default function VibeShareClient() {
  const searchParams = useSearchParams();
  const store = useVibeStore();

  useEffect(() => {
    const state = searchParams.get('state');
    if (!state) return;

    try {
      const decoded = JSON.parse(atob(state));
      store.setVibeAbsolute(decoded); // or applyVibe(decoded)
    } catch (e) {
      console.error('Failed to decode shared vibe', e);
    }
  }, [searchParams, store]);

  return null; // or small status UI if you want
}
