import type { NextConfig } from "next";

const backendUrl = (process.env.BACKEND_URL ?? "http://localhost:8080").replace(/\/$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: "/oauth2/:path*",
        destination: `${backendUrl}/oauth2/:path*`,
      },
      {
        source: "/login/oauth2/:path*",
        destination: `${backendUrl}/login/oauth2/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      { source: "/admin", destination: "/administracion", permanent: false },
      { source: "/administracion/representacion", destination: "/administracion/representacion-estudiantil", permanent: false },
      { source: "/administracion/oportunidades", destination: "/administracion/becas-y-oportunidades", permanent: false },
      { source: "/administracion/estadisticas", destination: "/administracion/inicio#estadisticas", permanent: false },
      { source: "/administracion/formularios", destination: "/administracion", permanent: false },
      { source: "/administracion/archivos", destination: "/administracion", permanent: false },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ltjsxwygwsqczlxjigzm.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
