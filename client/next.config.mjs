/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nexworldtravel.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    unoptimized: true,
  },
  async rewrites() {
    const rawBackendUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').trim();
    const withProtocol = /^https?:\/\//i.test(rawBackendUrl)
      ? rawBackendUrl
      : `${/^(localhost|127\.0\.0\.1)/i.test(rawBackendUrl) ? 'http' : 'https'}://${rawBackendUrl}`;
    const backendUrl = withProtocol
      .replace(/\/+$/, '')
      .replace(/\/api\/v1$/, '')
      .replace(/\/api$/, '');
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

