import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Allow react-dom/server in API Route handlers (Node.js runtime).
  // Without this, Turbopack blocks the import inside the RSC module graph.
  serverExternalPackages: ["react-dom"],
};

export default nextConfig;
