/**
 * @param chunks 原始数组
 * @param size 分 part 大小
 * @example
 * [1, 2, 3, 4] => [[1, 2], [3, 4]]
 */
export function getArrParts<T>(chunks: T[], size: number): T[][] {
  // 添加输入验证
  if (!Array.isArray(chunks)) {
    throw new TypeError('chunks must be an array')
  }

  if (!Number.isInteger(size) || size <= 0) {
    throw new RangeError('size must be a positive integer')
  }

  // 空数组直接返回
  if (chunks.length === 0) {
    return []
  }

  const result: T[][] = []
  for (let i = 0; i < chunks.length; i += size) {
    result.push(chunks.slice(i, i + size))
  }
  return result
}

/**
 * 按顺序串行执行多个返回数组的异步函数，并合并所有结果到一个扁平数组中
 * @param tasks - 由异步函数组成的数组，每个函数需返回一个 Promise，其解析值为 T 类型的数组
 * @returns Promise 对象，解析后为所有任务结果的合并数组（T 类型）
 * @throws {TypeError} 当 tasks 不是数组时
 * @throws {Error} 当某个任务执行失败时
 * @example
 * runAsyncFuncSerialized([
 *   () => Promise.resolve([1, 2]),
 *   () => Promise.resolve([3, 4])
 * ]).then(console.log); // 输出 [1, 2, 3, 4]
 */
export async function runAsyncFuncSerialized<T>(tasks: (() => Promise<T[]>)[]): Promise<T[]> {
  // 输入验证
  if (!Array.isArray(tasks)) {
    throw new TypeError('tasks must be an array')
  }

  // 空数组直接返回
  if (tasks.length === 0) {
    return []
  }

  const results: T[] = []

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i]

    // 验证每个任务是否为函数
    if (typeof task !== 'function') {
      throw new TypeError(`Task at index ${i} is not a function`)
    }

    try {
      const result = await task()

      // 验证结果是否为数组
      if (!Array.isArray(result)) {
        throw new TypeError(`Task at index ${i} did not return an array`)
      }

      results.push(...result)
    } catch (error) {
      // 包装错误信息，提供更多上下文
      throw new Error(
        `Task at index ${i} failed: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  return results
}

/**
 * 生成符合 UUID v4 标准的唯一标识符
 * @returns 标准格式的 UUID 字符串 (xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx)
 * @example
 * generateUUID(); // 输出类似 "f47ac10b-58cc-4372-a567-0e02b2c3d479"
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * 获取文件的完整扩展名，支持复合扩展名
 * @param fileName 文件名
 * @returns 文件扩展名，如 .txt, .tar.gz, .min.js 等
 * @example
 * getFileExtension('test.txt'); // 输出 ".txt"
 * getFileExtension('archive.tar.gz'); // 输出 ".tar.gz"
 * getFileExtension('script.min.js'); // 输出 ".min.js"
 * getFileExtension('.hidden'); // 输出 ""
 */
export function getFileExtension(fileName: string): string {
  if (!fileName || !fileName.includes('.') || fileName.startsWith('.') || fileName.endsWith('.')) {
    return ''
  }

  // 常见的复合扩展名列表（按从长到短排序以确保正确匹配）
  const compoundExtensions = [
    '.tar.gz',
    '.tar.bz2',
    '.tar.xz',
    '.tar.lz',
    '.tar.Z',
    '.min.js',
    '.min.css',
    '.min.html',
    '.spec.js',
    '.spec.ts',
    '.test.js',
    '.test.ts',
    '.d.ts',
    '.map.js',
    '.backup.sql',
    '.log.gz',
  ]

  const lowerFileName = fileName.toLowerCase()

  // 检查是否匹配复合扩展名
  for (const ext of compoundExtensions) {
    if (lowerFileName.endsWith(ext)) {
      return ext
    }
  }

  // 如果没有匹配的复合扩展名，使用单一扩展名逻辑
  const lastDot = fileName.lastIndexOf('.')
  if (lastDot > 0 && lastDot < fileName.length - 1) {
    return '.' + fileName.slice(lastDot + 1)
  }

  return ''
}
