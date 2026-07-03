import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DESPERTA! Acampadentro',
    short_name: 'DESPERTA!',
    description: 'App do Acampadentro 2026',
    start_url: '/entrar',
    display: 'standalone',
    background_color: '#061d3f',
    theme_color: '#061d3f',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
