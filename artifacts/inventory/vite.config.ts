import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    host: "0.0.0.0",
    port: Number(process.env.PORT) || 3000,
    allowedHosts: [
      "1eb6c5bf-e7fe-4302-af5e-14810ef1dc81-00-3os85mrabsebh.riker.replit.dev",
    ],
  },
});