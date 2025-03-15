
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Generate a unique build ID for this build
const buildId = new Date().getTime().toString();

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Add timestamp to assets for cache busting
    assetsDir: `assets_${buildId}`,
    rollupOptions: {
      output: {
        // Add content hash to file names for cache invalidation
        entryFileNames: `assets/[name]-${buildId}-[hash].js`,
        chunkFileNames: `assets/[name]-${buildId}-[hash].js`,
        assetFileNames: `assets/[name]-${buildId}-[hash].[ext]`,
        manualChunks: {
          vendor: [
            'react', 
            'react-dom', 
            'react-router-dom',
            '@tanstack/react-query'
          ],
        },
      },
    },
  },
  // Add unique query parameter to the index.html file
  experimental: {
    renderBuiltUrl(filename) {
      return filename + `?v=${buildId}`;
    },
  },
  // Add base URL to make sure assets are loaded correctly
  base: '/',
}));
