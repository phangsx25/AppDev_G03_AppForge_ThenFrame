import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "prompt",
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.js",
      injectManifest: { globPatterns: ["**/*.{js,css,html,png,svg}"] },
      manifest: {
        name: "ThenFrame Photography",
        short_name: "ThenFrame",
        description: "Wedding portfolio and studio gallery",
        theme_color: "#762e43",
        background_color: "#fff9f4",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
  test: { exclude: ["tests/e2e/**", "node_modules/**"] },
});
