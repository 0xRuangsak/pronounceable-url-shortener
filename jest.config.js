// Root level jest.config.js
module.exports = {
  // Run tests from all packages and apps
  projects: [
    '<rootDir>/packages/*/jest.config.js',
    '<rootDir>/apps/*/jest.config.js'
  ],
  
  // Collect coverage from all packages and apps
  collectCoverageFrom: [
    "packages/*/src/**/*.ts",
    "apps/*/src/**/*.ts",
    "!packages/*/src/**/*.d.ts",
    "!apps/*/src/**/*.d.ts",
    "!**/node_modules/**"
  ],
  
  // Global coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Verbose output for better debugging
  verbose: true,
  
  // Allow running tests in parallel across packages
  maxWorkers: "50%"
};