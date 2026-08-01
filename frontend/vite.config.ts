import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tsConfigPaths from "vite-tsconfig-paths";

// Vercel sets VERCEL=1 at build time. We must explicitly pass the preset
// because the beta Nitro version does not reliably auto-detect the environment.
const nitroPreset = process.env.VERCEL ? "vercel" : "node-server";

export default defineConfig({
  plugins: [
    tsConfigPaths(),
    tailwindcss(),
    tanstackStart({
      server: { preset: nitroPreset },
    }),
    react(),
  ],
  server: {
    allowedHosts: ["eclair-strife-clarity.ngrok-free.dev"],
  },
});
