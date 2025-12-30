import { defineConfig } from "eslint/config";
import baseConfig from "../../eslint.config.js";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  {
    extends: [baseConfig, reactHooks.configs.flat["recommended-latest"]],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: globals.browser,
    },
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);
