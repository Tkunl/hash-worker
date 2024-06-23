import { crc32, md5 } from 'hash-wasm'
import { Strategy } from './enum'
import { WorkerService } from './worker/worker-service'
import { HashChksParam } from './interface'
import { isBrowser, isNode } from './utils'

const DEFAULT_MAX_WORKERS = 8
const BORDER_COUNT = 100

/**
 * 标准化参数
 * @param param
 */
export function normalizeParam(param: HashChksParam) {
  const env: 'node' | 'browser' = (() => {
    if (isNode()) return 'node'
    if (isBrowser()) return 'browser'
    throw new Error('Unsupported environment')
  })()

  const { chunkSize, workerCount, strategy, borderCount, isCloseWorkerImmediately } =
    param.config ?? {}

  const config = {
    // 默认 10MB 分片大小
    chunkSize: chunkSize ?? 10,
    // 默认使用 8个 Worker 线程
    workerCount: workerCount ?? DEFAULT_MAX_WORKERS,
    // 默认使用混合模式计算 hash
    strategy: strategy ?? Strategy.mixed,
    // 默认以 100 分片数量作为边界
    borderCount: borderCount ?? BORDER_COUNT,
    // 默认计算 hash 后立即关闭 worker
    isCloseWorkerImmediately: isCloseWorkerImmediately ?? true,
  }

  if (env === 'node') {
    if (!param.filePath) {
      throw new Error('The filePath attribute is required in node environment')
    }
    return {
      ...param,
      config,
      filePath: param.filePath,
    }
  }

  if (env === 'browser') {
    if (!param.file) {
      throw new Error('The file attribute is required in browser environment')
    }
    return {
      ...param,
      config,
      file: param.file,
    }
  }

  throw new Error('Unsupported environment')
}

/**
 * 计算单个文件分片的 Hash
 * @param strategy hash 策略
 * @param arrayBuffer 文件分片的 arrayBuffer
 */
export async function getChunksHashSingle(strategy: Strategy, arrayBuffer: ArrayBuffer) {
  const unit8Array = new Uint8Array(arrayBuffer)
  return strategy === Strategy.md5 || strategy === Strategy.mixed
    ? [await md5(unit8Array)]
    : [await crc32(unit8Array)]
}

/**
 * 计算多个文件分片的 Hash
 * @param strategy hash 策略
 * @param arrayBuffers 文件分片的 arrayBuffer 数组
 * @param chunksCount TODO 此处存疑待优化
 * @param borderCount Strategy.mixed 时的边界个数
 * @param workerSvc WorkerService
 */
export async function getChunksHashMultiple(
  strategy: Strategy,
  arrayBuffers: ArrayBuffer[],
  chunksCount: number,
  borderCount: number,
  workerSvc: WorkerService,
) {
  const processor = {
    [Strategy.md5]: () => workerSvc.getMD5ForFiles(arrayBuffers),
    [Strategy.crc32]: () => workerSvc.getCRC32ForFiles(arrayBuffers),
    [Strategy.mixed]: () =>
      chunksCount <= borderCount
        ? workerSvc.getMD5ForFiles(arrayBuffers)
        : workerSvc.getCRC32ForFiles(arrayBuffers),
  }

  return processor[strategy]()
}
