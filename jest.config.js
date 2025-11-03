const { defaults } = require('jest-config');

module.exports = {
  // Use the default set of file extensions from Jest.
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts', 'tsx'],
  // Map @/* imports to the src directory.
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Set up global variables for ts-jest.
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.jest.json',
    },
  },
  // Use jsdom as the test environment.
  testEnvironment: 'jsdom',
  // Setup file to run before each test.
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // Transform files with ts-jest for TypeScript files.
  transform: {
    '^.+\.(ts|tsx)$': 'ts-jest',
  },
  // Ignore node_modules when transforming.
  transformIgnorePatterns: [
    '/node_modules/',
    '\.pnp\.[^\/]+$',
  ],
  // Ignore paths for tests
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/supabase/functions/',
    '<rootDir>/tests/',
    '<rootDir>/baseline-demos/'
  ]
};