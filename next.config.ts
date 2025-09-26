import type { NextConfig } from "next";

const apiDomain = process.env.NEXT_PUBLIC_API_DOMAIN;

const nextConfig: NextConfig = {
  images: {
    domains: [apiDomain],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: apiDomain,
        port: '3030',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
