/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // La landing es 100% estática (sin datos de servidor) → Next la pre-renderiza (SSG)
  // y Vercel la sirve desde el CDN. Clave para SEO y para zonas de baja conectividad.
  poweredByHeader: false,
};

export default nextConfig;
