import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Fallback for platforms where Next Image optimizer endpoint isn't available
    // Serves static images directly without /_next/image proxy
    unoptimized: true,
  },
  // Hard-disable Lightning CSS optimizations to prevent native binary issues on CI
  experimental: {
    optimizeCss: false,
  },
};

export default nextConfig;
