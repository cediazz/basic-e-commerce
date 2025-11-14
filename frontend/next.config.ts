import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/media/products/**',
        search: '',
      },
    ],
  },
  eslint: {
    // Ignorar errores de ESLint durante el build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Opcional: también ignorar errores de TypeScript
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
