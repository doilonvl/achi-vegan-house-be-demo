/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",

  // ts-jest: biên dịch TypeScript, dùng tsconfig riêng cho tests (có types: jest)
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "tsconfig.test.json" }],
  },

  // Tìm test files trong thư mục src/__tests__/
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts"],

  // Load biến môi trường giả trước khi chạy tests
  setupFiles: ["<rootDir>/src/__tests__/setup.ts"],

  verbose: true,
};
