import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import baseConfig from "../eslint.config.js";

export default tseslint.config([
  ...baseConfig,
  reactHooks.configs.flat.recommended,
  reactRefresh.configs.vite,

  // Your custom overrides
  {
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
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      "react-hooks/exhaustive-deps": "warn", // Override if needed
    },
  },
]);
