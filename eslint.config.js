import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: { 
      globals: {
        ...globals.browser,
        ...globals.node
      },
      ecmaVersion: 2022,
      sourceType: "module"
    }
  },
  ...tseslint.configs.recommended,
  {
    ignores: [
      "dist/**",
      "build/**", 
      "node_modules/**",
      "**/*.js.map",
      "src/constants/*.js",
      "src/constants/*.d.ts",
      "backup-before-migration/**",
      "coverage/**"
    ]
  },
  {
    files: ["**/*.ts"],
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "@typescript-eslint/no-explicit-any": "warn"
    }
  }
]);
