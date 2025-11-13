/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // keep those heavy runtime modules external so they remain in node_modules at runtime
    config.externals = [
      ...(config.externals || []),
      // `commonjs <module>` tells webpack to require('<module>') at runtime instead of bundling it
      'puppeteer-core',
      '@sparticuz/chromium',
    ];

    // keep existing fallbacks you already added
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      electron: false,
      fs: false,
      path: false
    };

    // ignore .map files (if present)
    config.module.rules.push({
      test: /\.map$/,
      type: "asset/source",
    });

    return config;
  },
};

module.exports = nextConfig;
