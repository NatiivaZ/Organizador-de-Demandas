import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Garantir que o middleware seja executado
    serverActions: {
      allowedOrigins: ['localhost:3000', '192.168.1.69:3000']
    }
  },
  // Garantir que o middleware seja carregado
  async rewrites() {
    return []
  }
};

export default nextConfig;
