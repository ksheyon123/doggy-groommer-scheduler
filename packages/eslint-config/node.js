import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: ["dist", "node_modules", ".turbo"],
  },
  {
    files: ["**/*.{ts,js}"],
    ...js.configs.recommended,
    ...tseslint.configs.recommended,
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
    },
  },
];
