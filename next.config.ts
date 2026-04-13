import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  turbopack: {},
  // Allow Cloudflare Quick Tunnels (*.trycloudflare.com) to access
  // Next.js dev WebSocket/HMR resources without Unauthorized errors.
  allowedDevOrigins: [
    '*.trycloudflare.com',
  ],
}

export default nextConfig;
