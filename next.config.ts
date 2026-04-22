import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [65, 75],

    // 1. Кэшируем оптимизированные картинки на 1 день (в секундах)
    // Это снизит нагрузку на сервер при повторных заходах
    minimumCacheTTL: 86400,

    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'imenu.kg',
      },
      {
        protocol: 'https',
        hostname: 'joinposter.com',
      },
      {
        protocol: 'https',
        hostname: 'joinposter.comnone',
      }
    ],

    // 2. Добавляем промежуточные размеры (640 и 1080)
    // 640 - идеально для Retina мобилок (2x-3x для половинчатых картинок)
    // 1080/1200 - для планшетов и десктопов
    deviceSizes: [320, 420, 640, 750, 828, 1080, 1200],

    // imageSizes оставляем для очень маленьких иконок
    imageSizes: [16, 32, 48, 64, 96, 128],
  },
};

export default withNextIntl(nextConfig);
