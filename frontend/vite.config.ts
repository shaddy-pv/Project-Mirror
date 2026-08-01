import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tsConfigPaths(),
    tailwindcss(),
    // No preset here — Nitro auto-detects the environment at build time.
    // On Vercel it uses the "vercel" preset; locally it falls back to "node-server".
    tanstackStart(),
    react(),
  ],
  server: {
    allowedHosts: ["eclair-strife-clarity.ngrok-free.dev"],
  },
});
