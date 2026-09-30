import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  test: { include: ["test/**/*.test.ts"] },
  plugins: [react()],
  server: { host: "0.0.0.0", allowedHosts: ["terminal.local"] },
  build: { outDir: "dist", target: "es2022", sourcemap: false },
});
