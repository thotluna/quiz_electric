/* eslint-disable @typescript-eslint/no-explicit-any */
import prettier from "eslint-plugin-prettier";
import { defineConfig, globalIgnores } from "eslint/config";
// @ts-expect-error - Manejo de tipos para Next.js 16
import nextVitals from "eslint-config-next/core-web-vitals";
// @ts-expect-error - Manejo de tipos para Next.js 16
import nextTs from "eslint-config-next/typescript";
import type { Linter } from "eslint";

import jsonc from "eslint-plugin-jsonc";
import * as jsoncParser from "jsonc-eslint-parser";

const fixConfig = (config: any): Linter.Config[] => {
  if (Array.isArray(config)) return config;
  if (config?.rules) return [config];
  return [];
};

const eslintConfig = defineConfig([
  ...fixConfig(nextVitals),
  ...fixConfig(nextTs),

  {
    files: ["**/*.json"],
    plugins: {
      jsonc: jsonc as any,
      prettier: prettier as any,
    },
    languageOptions: {
      parser: jsoncParser as any,
    },
    rules: {
      "prettier/prettier": "error",
    },
  } as any,

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;