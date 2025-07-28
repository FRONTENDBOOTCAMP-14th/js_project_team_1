import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser },
    env: {
      browser: true,
      es2021: true, //ES2021 문법 허용
    },
    parserOptions: {
      ecmaVersion: 12,
      sourceType: "module",
    },
    rules: {
      //엄격모드 강제
      strict: ["error", "global"],
      // 카멜케이스 네이밍 강제
      camelcase: ["error", { properties: "never" }],
      //따옴표는 더블 쿼테이션 사용
      quotes: ["error", "double"],
      //세미콜론 필수
      semi: ["error", "always"],
      //들여쓰기 2칸
      indent: ["error", 2],
      //var 키워드 사용 금지
      "no-var": "error",
      //함수 선언식 사용 강제, 화살표 함수는 허용
      "func-style": ["error", "declaration", { allowArrowFunctions: true }],
    },
  },
]);
