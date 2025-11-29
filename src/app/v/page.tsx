// app/v/page.tsx
import { Suspense } from 'react';
import VibeShareClient from './VibeShareClient';

export default function VPage() {
  return (
    <Suspense fallback={null}>
      <VibeShareClient />
    </Suspense>
  );
}
