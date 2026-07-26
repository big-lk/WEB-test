/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/aitest/api/health',
          destination: '/api/aitest/health',
        },
        {
          source: '/aitest/api/turn',
          destination: '/api/aitest/turn',
        },
        {
          source: '/aitest',
          destination: '/aitest/index.html',
        },
        {
          source: '/aitest/',
          destination: '/aitest/index.html',
        },
      ],
    }
  },
  async headers() {
    return [
      {
        source: '/aitest/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'same-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), fullscreen=(self)',
          },
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; connect-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'",
          },
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
    ]
  },
};
export default nextConfig;
