import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: [
      "node_modules/**/*",
      "dist/**/*",
      "coverage/**/*",
      "build/**/*",
      "out/**/*",
      "temp/**/*",
      "tmp/**/*",
      "cache/**/*",
      "logs/**/*",
    ],
    name: "playground",
    setupFiles: "./vitest.setup.ts",
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
    },
  },
});
