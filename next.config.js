/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Ignore ALL .map files (fix chrome-aws-lambda source map crash)
    config.module.rules.push({
      test: /\.map$/,
      type: "asset/source",
    });

    return config;
  },
};

module.exports = nextConfig;
