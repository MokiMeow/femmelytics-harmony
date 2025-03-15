import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Use a static build ID instead of generating a new one each time
const buildId = "20230512"; // Static version identifier

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ['zod', '@hookform/resolvers/zod'],
  },
  build: {
    assetsDir: `assets_${buildId}`,
    rollupOptions: {
      // Removed external: ['zod'],
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
