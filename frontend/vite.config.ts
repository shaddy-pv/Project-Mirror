import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

export default defineConfig({
  plugins: [
    tsConfigPaths(),
    tailwindcss(),
    // Explicitly configure nitro to use the vercel preset
    // Local dev works fine via `vite dev` which does not use the nitro build
    tanstackStart(),
    nitro({ preset: "vercel" }),
    react(),
  ],
  server: {
    allowedHosts: ["eclair-strife-clarity.ngrok-free.dev"],
  },
});
