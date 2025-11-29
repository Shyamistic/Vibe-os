'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useVibeStore, VibeData } from '@/lib/store';

function safeDecodeState(encoded: string | null): VibeData | null {
  if (!encoded) return null;
  try {
    const json = atob(encoded);
    const data = JSON.parse(json);
    return data as VibeData;
  } catch {
    return null;
  }
}

export default function VibeSharePage() {
  const params = useSearchParams();
  const router = useRouter();
  const setVibeAbsolute = useVibeStore((s) => s.setVibeAbsolute);

  useEffect(() => {
    const encoded = params.get('state');
    const vibe = safeDecodeState(encoded);
    if (vibe) {
      setVibeAbsolute(vibe);
      router.replace('/'); // go back to main UI with applied vibe
    } else {
      router.replace('/');
    }
  }, [params, router, setVibeAbsolute]);

  return (
    <main className="vibe-wrapper">
      <div className="center-message">
        <p className="ai-text" style={{ fontSize: '1rem', opacity: 0.6 }}>
          Loading shared vibe…
        </p>
      </div>
    </main>
  );
}
