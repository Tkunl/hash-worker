import { BaseWorkerPool, initBufService } from '.'
import { Strategy, WorkerReq } from '../types'

export abstract class BaseWorkerService {
  protected maxWorkers: number
  protected pool: BaseWorkerPool | null = null

  constructor(maxWorkers: number) {
    this.maxWorkers = maxWorkers
  }

  protected abstract createWorkerPool(maxWorkers: number): Promise<BaseWorkerPool>

  async getHashForFiles(chunks: ArrayBuffer[], strategy: Strategy) {
    if (this.pool === null) {
      this.pool = await this.createWorkerPool(this.maxWorkers)
    }
    const params: WorkerReq[] = chunks.map((chunk) => ({
      chunk,
      strategy,
    }))
    initBufService(chunks)
    return this.pool!.exec<string>(params)
  }

  getMD5ForFiles(chunks: ArrayBuffer[]) {
    return this.getHashForFiles(chunks, Strategy.md5)
  }

  getCRC32ForFiles(chunks: ArrayBuffer[]) {
    return this.getHashForFiles(chunks, Strategy.crc32)
  }

  getXxHash64ForFiles(chunks: ArrayBuffer[]) {
    return this.getHashForFiles(chunks, Strategy.xxHash64)
  }

  terminate() {
    this.pool && this.pool.terminate()
    this.pool = null
  }
}
