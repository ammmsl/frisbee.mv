import type { NextConfig } from 'next'
import { PHASE_PRODUCTION_BUILD } from 'next/constants'

export default function config(phase: string): NextConfig {
  return {
    env: {
      // Injected only during `next build` — signals league-db to skip DB connections
      ...(phase === PHASE_PRODUCTION_BUILD ? { LEAGUE_BUILD_PHASE: '1' } : {}),
    },
    output: 'standalone',
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'photos.google.com',
        },
        {
          protocol: 'https',
          hostname: 'lh3.googleusercontent.com',
        },
        {
          protocol: 'https',
          hostname: '**.googleusercontent.com',
        },
      ],
    },
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
            { key: 'X-Content-Type-Options', value: 'nosniff' },
            { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          ],
        },
        {
          source: '/_next/static/(.*)',
          headers: [
            { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          ],
        },
      ]
    },
  }
}
