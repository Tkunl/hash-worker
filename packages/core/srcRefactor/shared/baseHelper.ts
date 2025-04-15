import { BORDER_COUNT, DEFAULT_MAX_WORKERS } from '.'
import { Strategy } from '../types'
import { crc32, md5, xxhash64 } from 'hash-wasm'
import { WorkerService } from '../worker/workerService'

export abstract class BaseHelper {
  private constructor() {}

  static mergeConfig(paramConfig?: {
    chunkSize?: number
    workerCount?: number
    strategy?: Strategy
    borderCount?: number
    isCloseWorkerImmediately?: boolean
    isShowLog?: boolean
  }) {
    const { chunkSize, workerCount, strategy, borderCount, isCloseWorkerImmediately, isShowLog } =
      paramConfig ?? {}

    return {
      chunkSize: chunkSize ?? 10,
      workerCount: workerCount ?? DEFAULT_MAX_WORKERS,
      strategy: strategy ?? Strategy.mixed,
      borderCount: borderCount ?? BORDER_COUNT,
      isCloseWorkerImmediately: isCloseWorkerImmediately ?? true,
      isShowLog: isShowLog ?? false,
    }
  }

  /**
   * 计算单个文件分片的 Hash
   * @param strategy hash 策略
   * @param arrayBuffer 文件分片的 arrayBuffer
   */
  static async getChunksHashSingle(strategy: Strategy, arrayBuffer: ArrayBuffer) {
    const unit8Array = new Uint8Array(arrayBuffer)
    const getHashStrategy = (strategy: Strategy) => {
      if (strategy === Strategy.md5) return md5
      if (strategy === Strategy.crc32) return crc32
      if (strategy === Strategy.xxHash64) return xxhash64
      throw Error('Unknown strategy')
    }

    return [
      await getHashStrategy(strategy === Strategy.mixed ? Strategy.md5 : strategy)(unit8Array),
    ]
  }

  static getChunksHashMultiple(
    strategy: Strategy,
    arrayBuffers: ArrayBuffer[],
    chunksCount: number,
    borderCount: number,
    workerSvc: WorkerService,
  ) {
    const processor = {
      [Strategy.xxHash64]: () => workerSvc.getXxHash64ForFiles(arrayBuffers),
      [Strategy.md5]: () => workerSvc.getMD5ForFiles(arrayBuffers),
      [Strategy.crc32]: () => workerSvc.getCRC32ForFiles(arrayBuffers),
      [Strategy.mixed]: () =>
        chunksCount <= borderCount
          ? workerSvc.getMD5ForFiles(arrayBuffers)
          : workerSvc.getCRC32ForFiles(arrayBuffers),
    }

    return processor[strategy]()
  }
}
