import test from 'ava'
import { isBrowser, isBrowser2, isEmpty, isNode } from '../src/utils'

test('isEmpty correctly identifies empty values', (t) => {
  t.true(isEmpty(undefined))
  t.true(isEmpty(null))
  t.true(isEmpty(''))
  t.true(isEmpty([]))
  t.true(isEmpty(new Map()))
  t.true(isEmpty(new Set()))
  t.true(isEmpty({}))
})

test('isEmpty correctly identifies non-empty values', (t) => {
  t.false(isEmpty('text'))
  t.false(isEmpty([1, 2, 3]))
  t.false(isEmpty(new Map([['key', 'value']])))
  t.false(isEmpty(new Set([1, 2, 3])))
  t.false(isEmpty({ key: 'value' }))
})

test('Environment detection functions', (t) => {
  // 通常这些测试的结果取决于测试运行的环境（Node.js, 浏览器, 浏览器的 Web Worker 等）
  // 下面是基于常见环境（Node.js环境）的预期结果
  // 在Node.js环境中，预期结果
  t.false(isBrowser())
  t.false(isBrowser2())
  t.true(isNode())
})
