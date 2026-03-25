const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

/** @type {import('jest').Config} */
const config = {
  testEnvironment: "jest-environment-jsdom",
  setupFiles: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(woff|woff2|ttf|eot)$": "<rootDir>/src/__mocks__/fileMock.ts",
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(three|@react-three|postprocessing|troika-three-text|troika-worker-utils)/)",
  ],
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.test.{ts,tsx}",
    "<rootDir>/src/**/*.test.{ts,tsx}",
  ],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/__mocks__/**",
    "!src/**/__tests__/**",
  ],
  coverageThreshold: {
    // Global thresholds account for WebGL/R3F component animation code
    // that cannot run in JSDOM. Pure logic is tested at 100% via animation.ts.
    global: {
      branches: 60,
      functions: 70,
      lines: 75,
      statements: 75,
    },
  },
};

module.exports = createJestConfig(config);
