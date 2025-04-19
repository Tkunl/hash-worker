import { crc32, md5, xxhash64 } from 'hash-wasm'
import { Strategy, WorkerReq, WorkerRes } from '../types'

/**
 * @param chunks 原始数组
 * @param size 分 part 大小
 * @example
 * [1, 2, 3, 4] => [[1, 2], [3, 4]]
 */
export function getArrParts<T>(chunks: T[], size: number): T[][] {
  if (!Number.isInteger(size) || size <= 0) return []
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
 * @example
 * runAsyncFuncSerialized([
 *   () => Promise.resolve([1, 2]),
 *   () => Promise.resolve([3, 4])
 * ]).then(console.log); // 输出 [1, 2, 3, 4]
 */
export async function runAsyncFuncSerialized<T>(tasks: (() => Promise<T[]>)[]) {
  const results = []
  for (const task of tasks) {
    results.push(...(await task()))
  }
  return results
}

export function generateUUID(): string {
  return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// TODO 此处 hashFnMap 待优化
// 连同 getChunksHashSingle 和 getChunksHashMultipleStrategy
export async function calculateHashInWorker(req: WorkerReq): Promise<WorkerRes<string>> {
  const { chunk: buf, strategy } = req
  const data = new Uint8Array(buf)

  const hash = await {
    [Strategy.md5]: md5,
    [Strategy.crc32]: crc32,
    [Strategy.xxHash64]: xxhash64,
    [Strategy.mixed]: () => '', // 永远也不会执行到这里
  }[strategy](data)

  return { result: hash, chunk: buf }
}
