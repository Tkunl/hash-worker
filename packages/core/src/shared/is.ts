/**
 * 检查一个值是否为空。空值的定义包括：
 * - `undefined` 或 `null`
 * - 空字符串 (`''`)
 * - 空数组（长度为0）
 * - 空的 `Map` 或 `Set`（size为0）
 * - 空对象（没有可枚举的自身属性，且非 `Date` 实例）
 * @param value - 需要检查的值，可以是任意类型
 * @returns 如果值为空则返回 `true`，否则返回 `false`
 */
export function isEmpty(value: unknown) {
  if (value === void 0 || value === null || value === '') {
    return true
  }
  if (Array.isArray(value)) {
    return value.length === 0
  }
  if (value instanceof Map || value instanceof Set) {
    return value.size === 0
  }
  if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
    return Object.keys(value).length === 0
  }
  return false
}

/**
 * 判断当前运行环境是否是浏览器
 * @returns {boolean} 如果是在浏览器环境中运行，返回 true；否则返回 false
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.document !== 'undefined'
}

/**
 * 判断当前运行环境是否是浏览器(Worker 中)
 * @returns {boolean} 如果是在浏览器环境中运行，返回 true；否则返回 false
 */
export function isBrowser2(): boolean {
  return typeof self !== 'undefined' && typeof self.postMessage === 'function'
}

/**
 * 判断当前运行环境是否是 Node.js
 * @returns {boolean} 如果是在 Node.js 环境中运行，返回 true；否则返回 false
 */
export function isNode(): boolean {
  return (
    typeof global !== 'undefined' &&
    typeof process !== 'undefined' &&
    typeof process.versions !== 'undefined' &&
    typeof process.versions.node !== 'undefined'
  )
}
