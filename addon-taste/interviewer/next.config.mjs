/** @type {import('next').NextConfig} */
const nextConfig = {
  // Build autoportant → image Docker / hôte Node minimal, sans dépendre de Vercel.
  output: "standalone",
  // pg n'est utilisé que si STORE=postgres → on le garde externe (jamais bundlé).
  experimental: { serverComponentsExternalPackages: ["pg"] },
};

export default nextConfig;
