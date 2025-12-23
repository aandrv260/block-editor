import { defineConfig } from "vitest/config";
import { resolve } from "path";

const commonProjectConfig = {
  environment: "node",
  globals: true,
};

const commonExcludes = [
  "node_modules/**/*",
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
    globals: false,
    include: ["src/**/*.test.ts"],
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
          include: ["src/**/*.test.ts"],
          exclude: [...commonExcludes, "src/**/*.integ.test.ts"],
        },
      },

      {
        resolve: commonResolveConfig,
        test: {
          ...commonProjectConfig,
          name: "integration",
          include: ["src/**/*.integ.test.ts"],
          exclude: commonExcludes,
        },
      },
    ],
  },
});
