import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [".next", "dist", "node_modules", ".turbo"],
  },
  {
    files: ["**/*.{ts,tsx}"],
    ...js.configs.recommended,
    ...tseslint.configs.recommended,
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
];
