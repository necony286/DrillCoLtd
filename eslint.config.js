import js from "@eslint/js";
import globals from "globals";

const { browser, node } = globals;

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...browser,
        ...node,
      },
    },
    rules: {},
  },
];
