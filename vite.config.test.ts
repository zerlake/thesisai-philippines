/// <reference types="vitest" />

import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    include: ['__tests__/**/*.test.{ts,tsx}'],
    exclude: [
      'node_modules',
      'dist',
      '.idea',
      '.git',
      '.nuxt',
      'build',
      'coverage'
    ],
    environment: 'node',
    globals: true,
    setupFiles: ['./__tests__/setup.ts'],
    testTimeout: 30000, // 30 seconds timeout for AI function calls
    hookTimeout: 30000, // 30 seconds timeout for setup/teardown hooks
    reporters: ['verbose'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/types/**',
        'src/lib/similarity-algorithms.ts',
        '**/node_modules/**',
        '**/test/**',
        '**/tests/**',
        '__tests__/**'
      ]
    }
  },
});