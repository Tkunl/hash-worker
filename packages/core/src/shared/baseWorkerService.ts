import { BaseWorkerPool } from '.'
import { Strategy, WorkerReq, GetFn, RestoreFn } from '../types'

export abstract class BaseWorkerService {
  protected maxWorkers: number
  protected pool: BaseWorkerPool | undefined

  constructor(maxWorkers: number) {
    this.maxWorkers = maxWorkers
  }

  protected abstract createWorkerPool(maxWorkers: number): Promise<BaseWorkerPool>

  private async getHashForFiles(chunks: ArrayBuffer[], strategy: Strategy) {
    if (this.pool === undefined) {
      this.pool = await this.createWorkerPool(this.maxWorkers)
    }
    const params: WorkerReq[] = chunks.map((chunk) => ({
      chunk,
      strategy,
    }))
    const getFn: GetFn<WorkerReq> = (param: WorkerReq) => param.chunk
    const restoreFn: RestoreFn = (options) => {
      const { index, buf } = options
      chunks[index] = buf
    }
    return this.pool!.exec<string, WorkerReq>(params, getFn, restoreFn)
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
    this.pool = undefined
  }
}
