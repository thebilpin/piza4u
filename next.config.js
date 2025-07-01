/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  reactStrictMode: true,
  output: "export",
  distDir: "dist",
  trailingSlash: true,
};

module.exports = nextConfig;
