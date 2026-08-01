import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tsConfigPaths(),
    tailwindcss(),
    // Preset is hardcoded to "vercel" — this project is deployed on Vercel.
    // Local development uses `vite dev` (not `vite build`) so this has no impact locally.
    tanstackStart({
      server: { preset: "vercel" },
    }),
    react(),
  ],
  server: {
    allowedHosts: ["eclair-strife-clarity.ngrok-free.dev"],
  },
});
