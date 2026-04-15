import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Allow react-dom/server in API Route handlers (Node.js runtime).
  // Without this, Turbopack blocks the import inside the RSC module graph.
  //
  // @base-ui/react + lucide-react: their source files are marked 'use client'
  // upstream. In RSC context Next replaces every named export with a client
  // reference, which renderToString() can't invoke (you get
  // "Attempted to call X() from the server but X is on the client").
  // Listing them here makes Turbopack treat them as runtime-resolved Node
  // modules so the actual functions are passed through to the renderer.
  // Note: lucide-react would help here too, but Next 16 auto-transpiles it
  // (conflicts with serverExternalPackages). For lucide we rely on the
  // wrapper in primitive-resolver.ts; sections that import lucide directly
  // will fail and be shown as render errors in the preview until we either
  // (a) bundle lucide into a runtime asset like client-runtime.js, or
  // (b) prompt Gemini away from importing lucide.
  serverExternalPackages: ["react-dom", "@base-ui/react"],
};

export default nextConfig;
