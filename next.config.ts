import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Fallback for platforms where Next Image optimizer endpoint isn't available
    // Serves static images directly without /_next/image proxy
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'imenu.kg',
        port: '',
        pathname: '/media/**',
      },
    ],
  },
  // Produce a self-contained build for Docker/Node runtime
  output: 'standalone',
  // Hard-disable Lightning CSS optimizations to prevent native binary issues on CI
  experimental: {
    optimizeCss: false,
  },
};

export default nextConfig;
