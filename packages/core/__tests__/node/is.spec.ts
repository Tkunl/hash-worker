import { isBrowser, isBrowser2, isEmpty, isNode } from '../../src/utils'

test('isEmpty correctly identifies empty values', () => {
  expect(isEmpty(undefined)).toBe(true)
  expect(isEmpty(null)).toBe(true)
  expect(isEmpty('')).toBe(true)
  expect(isEmpty([])).toBe(true)
  expect(isEmpty(new Map())).toBe(true)
  expect(isEmpty(new Set())).toBe(true)
  expect(isEmpty({})).toBe(true)
})

// 测试 isEmpty 函数对非空值的正确判断
test('isEmpty correctly identifies non-empty values', () => {
  expect(isEmpty('text')).toBe(false)
  expect(isEmpty([1, 2, 3])).toBe(false)
  expect(isEmpty(new Map([['key', 'value']]))).toBe(false)
  expect(isEmpty(new Set([1, 2, 3]))).toBe(false)
  expect(isEmpty({ key: 'value' })).toBe(false)
})

// 测试环境检测函数
test('Environment detection functions', () => {
  // 例如，以下假设测试运行在 Node.js 环境中
  expect(isBrowser()).toBe(false)
  expect(isBrowser2()).toBe(false)
  expect(isNode()).toBe(true)
})
