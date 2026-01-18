import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Ustukan Menu',
    short_name: 'Ustukan',
    description: 'Меню ресторана Ustukan',
    start_url: '/',
    display: 'standalone',
    background_color: '#F8F6F7',
    theme_color: '#ffffff',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
