import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {\n    host: "0.0.0.0",\n    port: 5173,\n    strictPort: true,\n    proxy: { "/api": { target: "http://127.0.0.1:8765", changeOrigin: false } },\n  },
});