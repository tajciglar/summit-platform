// Entry point for the lucide-react runtime bundle. esbuild compiles this
// (along with the entire lucide-react tree) into dist/lucide-bundle.js as
// a CJS module. The renderer then loads it via createRequire so Turbopack
// never sees the import and never applies the RSC client-component
// transform — the real component functions reach renderToString().
export * from 'lucide-react';
