import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" so the built index.html loads assets over file:// inside Electron.
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    outDir: "dist",
    target: "es2022",
    sourcemap: true,
  },
  server: {
    port: 5173,
  },
});
