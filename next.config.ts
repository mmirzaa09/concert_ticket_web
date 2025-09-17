import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['192.168.1.135'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '192.168.1.135',
        port: '3030',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
