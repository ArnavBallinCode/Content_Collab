import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // Optional: turn off strict mode if needed
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  swcMinify: true, // Faster builds with SWC
  // Add other platform-specific or Coreel custom options below
};

export default nextConfig;
