import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Allow react-dom/server in API Route handlers (Node.js runtime).
  // @base-ui/react: marked 'use client' upstream; RSC replaces named exports
  // with client references which renderToString() can't invoke.
  serverExternalPackages: ["react-dom", "@base-ui/react", "@tailwindcss/node", "lightningcss", "tailwindcss"],
};

export default nextConfig;
