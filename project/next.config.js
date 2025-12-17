/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove or set output: 'standalone' instead of 'export'
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
}

module.exports = nextConfig
