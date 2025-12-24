import { defineConfig } from "vitest/config";
import { resolve } from "path";

const commonProjectConfig = {
  globals: true,
  environment: "jsdom",
  setupFiles: "./vitest.setup.ts",
} as const;

const commonExcludes = [
  "node_modules/**/*",
  "e2e/**/*",
  "dist/**/*",
  "coverage/**/*",
  "build/**/*",
  "out/**/*",
  "temp/**/*",
  "tmp/**/*",
  "cache/**/*",
  "logs/**/*",
] as const satisfies string[];

const commonResolveConfig = {
  alias: {
    "@": resolve(__dirname, "./src"),
  },
};

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
    },
    projects: [
      {
        resolve: commonResolveConfig,
        test: {
          ...commonProjectConfig,
          name: "unit",
          include: ["src/**/*.test.{ts,tsx}"],
          exclude: [...commonExcludes, "src/**/*.integ.test.{ts,tsx}"],
        },
      },

      {
        resolve: commonResolveConfig,
        test: {
          ...commonProjectConfig,
          name: "integration",
          include: ["src/**/*.integ.test.{ts,tsx}"],
          exclude: commonExcludes,
        },
      },
    ],
  },
});
