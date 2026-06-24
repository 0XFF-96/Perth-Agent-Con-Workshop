/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: {
    port: 5173,
    proxy: {
      "/api/copilotkit": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
      "/api/agent-loop": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
    // App tests live in src/. scripts/*.test.mjs use node:test (run via
    // `node --test`), so keep vitest scoped to src to avoid collecting them.
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
