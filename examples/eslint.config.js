// ESLint flat config that backs the "senior style" rules with tooling.
// Agents follow lint errors far more reliably than prose, so the limits live here.
// Install: npm i -D eslint @eslint/js typescript-eslint eslint-plugin-react-hooks
import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  { ignores: ["dist/", "build/", ".next/", "coverage/"] },
  js.configs.recommended,
  tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      // Size and complexity limits: the main guard against over-engineered code.
      complexity: ["error", 10],
      "max-depth": ["error", 3],
      "max-params": ["error", 4],
      "max-lines-per-function": ["warn", { max: 80, skipBlankLines: true, skipComments: true }],
      "max-lines": ["warn", { max: 300, skipBlankLines: true, skipComments: true }],
      "no-nested-ternary": "error",
      "no-else-return": "error",
      // Type safety.
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
  {
    // Tests may be long and flat.
    files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}", "e2e/**"],
    rules: { "max-lines-per-function": "off", "max-lines": "off" },
  },
);
