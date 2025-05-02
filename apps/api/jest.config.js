// apps/api/jest.config.js
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.test.ts'],
    collectCoverage: true,
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
      'src/**/*.ts',
      '!src/**/*.d.ts',
      '!src/index.ts'
    ],
    coverageThreshold: {
      global: {
        branches: 70,
        functions: 80,
        lines: 80,
        statements: 80
      }
    },
    moduleNameMapper: {
      '@url-shortener/storage': '<rootDir>/../../packages/storage/src',
      '@url-shortener/shortener': '<rootDir>/../../packages/shortener/src'
    },
    transform: {
      '^.+\\.tsx?$': 'ts-jest'
    },
    verbose: true,
    maxWorkers: "50%"
  };