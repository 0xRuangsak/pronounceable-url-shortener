// File: jest.config.js at root level
module.exports = {
    // Run tests from all packages
    projects: ['<rootDir>/packages/*/jest.config.js'],
    
    // Collect coverage from all packages
    collectCoverageFrom: [
      "packages/*/src/**/*.ts",
      "!packages/*/src/**/*.d.ts",
      "!**/node_modules/**"
    ],
    
    // Global coverage thresholds
    coverageThreshold: {
      global: {
        branches: 80,
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