/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true, // 启用 SWC 压缩
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    domains: [],
  },
  // 性能优化
  experimental: {
    optimizeCss: true, // 优化 CSS
  },
  // 生产环境优化
  productionBrowserSourceMaps: false, // 禁用生产环境 source maps
}

module.exports = withBundleAnalyzer(nextConfig)