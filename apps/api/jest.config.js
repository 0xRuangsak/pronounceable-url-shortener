// apps/api/jest.config.js
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: [
      '<rootDir>/src/__test__/**/*.test.ts'
    ],
    moduleNameMapper: {
      '^@url-shortener/storage$': '<rootDir>/../../packages/storage/src',
      '^@url-shortener/shortener$': '<rootDir>/../../packages/shortener/src'
    },
    transform: {
      '^.+\\.tsx?$': 'ts-jest'
    },
    testPathIgnorePatterns: [
      '/node_modules/',
      '/dist/'
    ],
    verbose: true
  };