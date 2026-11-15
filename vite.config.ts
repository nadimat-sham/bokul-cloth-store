import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The Express server (server/index.ts) runs Vite in middleware mode during
// development and serves dist/client + the SSR bundle in production.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist/client",
    emptyOutDir: true,
    cssCodeSplit: false,
  },
  ssr: {
    noExternal: [],
  },
});
