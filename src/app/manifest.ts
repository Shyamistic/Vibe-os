import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'VIBE_OS',
    short_name: 'VIBE_OS',
    description:
      'Developer flow state operating system. 8 presets, binaural audio, focus tracking.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0e27',
    theme_color: '#38bdf8',
    scope: '/',
    categories: ['productivity', 'utilities'],
    icons: [],
    screenshots: [],
  };
}

