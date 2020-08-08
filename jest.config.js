module.exports = {
  moduleDirectories: [
    "node_modules"
  ],
  preset: "jest-puppeteer",
  setupFiles: ["<rootDir>/tests/setup"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup-env"],
  testMatch: [
    "**/tests/**/*.spec.(js|jsx|ts|tsx)|**/__tests__/*.(js|jsx|ts|tsx)"
  ]
};
