/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== 'production';

/**
 * Content-Security-Policy directives.
 * Restricts resource origins to prevent XSS, data injection, and clickjacking.
 */
const cspDirectives = [
  "default-src 'self'",
  // Styles: allow inline for Tailwind's JIT output
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // Scripts: allow self + Next.js inline scripts (nonce not used — strict-dynamic alternative)
  isDev ? "script-src 'self' 'unsafe-eval' 'unsafe-inline'" : "script-src 'self' 'unsafe-inline'",
  // Fonts
  "font-src 'self' https://fonts.gstatic.com data:",
  // Images: allow data URIs for inline SVG/canvas
  "img-src 'self' data: blob:",
  // API calls: only to self and Groq
  "connect-src 'self' https://api.groq.com",
  // No iframes
  "frame-src 'none'",
  // No object/embed
  "object-src 'none'",
  // No base tag hijacking
  "base-uri 'self'",
  // Form submissions only to self
  "form-action 'self'",
  // Upgrade insecure requests in production
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join('; ');

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control',            value: 'on' },
  { key: 'X-Content-Type-Options',            value: 'nosniff' },
  { key: 'X-Frame-Options',                   value: 'DENY' },
  { key: 'X-XSS-Protection',                  value: '1; mode=block' },
  { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
  { key: 'Referrer-Policy',                   value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',                value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
  { key: 'Strict-Transport-Security',         value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'Content-Security-Policy',           value: cspDirectives },
];

const nextConfig = {
  // Enable gzip/brotli compression
  compress: true,

  // Optimise images
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },

  // Strip console.* in production (keep error + warn)
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error', 'warn'] }
      : false,
  },

  // Catch common bugs early
  reactStrictMode: true,

  // Reduce bundle size for large icon/animation libraries
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'recharts'],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        // Immutable cache for fingerprinted static assets
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // No CDN caching for API routes (in-memory cache handles deduplication)
        source: '/api/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
