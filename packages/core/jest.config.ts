import type { Config } from 'jest'
const projectsConfigWrapper = (configs: Record<string, any>[]): any[] =>
  configs.map((config) => ({
    ...config,
    coveragePathIgnorePatterns: ['/__tests__/fixture/'],
    preset: 'ts-jest',
    moduleNameMapper: {
      '^(\\.{1,2}/)*src/(.*)$': '<rootDir>/src/$2',
    },
    transform: {
      '^.+\\.tsx?$': [
        // 为了解决报错: The 'import.meta' meta-property is only allowed when the '--module' option is 'es2020', 'esnext', or 'system'.
        // make ts-jest happy ^_^
        'ts-jest',
        {
          diagnostics: {
            ignoreCodes: [1343],
          },
          astTransformers: {
            before: [
              {
                path: 'ts-jest-mock-import-meta',
                // 此处 url 可随便符合 url 格式的字符串, 因为在运行 Jest 时, Worker 会被 Mock Worker 换掉
                options: { metaObjectReplacement: { url: 'https://test.com' } },
              },
            ],
          },
        },
      ],
    },
  }))

const config: Config = {
  collectCoverage: true,
  coverageReporters: ['lcov'],
  projects: projectsConfigWrapper([
    {
      displayName: 'node',
      testEnvironment: 'node',
      testMatch: ['**/__tests__/node/**/*.spec.ts'],
    },
    // TODO: 此处貌似暂时没有用到
    {
      displayName: 'browser',
      testEnvironment: 'jsdom',
      testMatch: ['**/__tests__/browser/**/*.spec.ts'],
    },
  ]),
}

export default config
