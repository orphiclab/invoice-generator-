import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  turbopack: {},
  allowedDevOrigins: [
    '*.trycloudflare.com',
  ],
}

export default nextConfig;
