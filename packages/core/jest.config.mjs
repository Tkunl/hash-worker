const projectsConfigWrapper = (configs) =>
  configs.map((config) => ({
    ...config,
    preset: 'ts-jest',
    transform: {
      '^.+\\.tsx?$': [
        // 为了解决报错: The 'import.meta' meta-property is only allowed when the '--module' option is 'es2020', 'esnext', or 'system'.
        'ts-jest',
        {
          diagnostics: {
            ignoreCodes: [1343]
          },
          astTransformers: {
            before: [
              {
                path: 'ts-jest-mock-import-meta',
                options: { metaObjectReplacement: { url: 'https://test.com' } }
              }
            ]
          }
        }
      ]
    }
  }))

/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  collectCoverage: true,
  coverageReporters: ['lcov'],
  projects: projectsConfigWrapper([
    {
      displayName: 'node',
      testEnvironment: 'node',
      testMatch: ['**/__tests__/node/**/*.spec.ts'],
    },
    {
      displayName: 'browser',
      testEnvironment: 'jsdom',
      testMatch: ['**/__tests__/browser/**/*.spec.ts'],
    },
  ]),
}
