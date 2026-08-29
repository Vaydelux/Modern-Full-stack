import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    hmr: {
      port: 3000,
    },
  },
  build: {
    target: "es2020",
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom") || id.includes("react-router-dom")) {
              return "vendor-react";
            }
            if (id.includes("framer-motion") || id.includes("canvas-confetti")) {
              return "vendor-motion";
            }
            if (id.includes("recharts")) {
              return "vendor-charts";
            }
            if (id.includes("@dnd-kit")) {
              return "vendor-dnd";
            }
            if (id.includes("lucide-react")) {
              return "vendor-icons";
            }
            if (id.includes("@supabase")) {
              return "vendor-supabase";
            }
          }
        },
      },
    },
  },
});
