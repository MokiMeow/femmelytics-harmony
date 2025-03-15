import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

const buildId = "20230512"; // Static version identifier

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [ react() ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Force zod to resolve to its ESM build
      zod: path.resolve(__dirname, "node_modules/zod/dist/zod.mjs"),
    },
  },
  optimizeDeps: {
    include: ['zod', '@hookform/resolvers/zod'],
  },
  build: {
    assetsDir: `assets_${buildId}`,
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-${buildId}-[hash].js`,
        chunkFileNames: `assets/[name]-${buildId}-[hash].js`,
        assetFileNames: `assets/[name]-${buildId}-[hash].[ext]`,
        manualChunks: {
          vendor: [
            'react', 
            'react-dom', 
            'react-router-dom',
            '@tanstack/react-query',
            'zod',
            '@hookform/resolvers/zod'
          ],
        },
      },
    },
  },
  experimental: {
    renderBuiltUrl(filename) {
      return filename + `?v=${buildId}`;
    },
  },
  base: '/',
}));
