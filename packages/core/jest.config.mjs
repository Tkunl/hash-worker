export default {
  collectCoverage: true,
  coverageReporters: ['lcov'],
  projects: [
    {
      displayName: 'node',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: ['**/__tests__/node/**/*.spec.ts']
    },
    {
      displayName: 'browser',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      testMatch: ['**/__tests__/browser/**/*.spec.ts']
    },
  ],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  }
}
