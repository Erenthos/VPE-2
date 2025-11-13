/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // FIX 1 — Ignore electron module required by playwright-core
    config.resolve.fallback = {
      ...config.resolve.fallback,
      electron: false,
      fs: false,
      path: false
    };

    return config;
  },
};

module.exports = nextConfig;
