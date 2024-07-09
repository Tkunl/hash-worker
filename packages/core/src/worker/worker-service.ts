import { WorkerPoolForHash } from './worker-pool-for-hash'
import { getFn, restoreFn, Strategy, WorkerReq } from '../interface'

export class WorkerService {
  MAX_WORKERS
  pool: WorkerPoolForHash | undefined

  constructor(maxWorkers: number) {
    this.MAX_WORKERS = maxWorkers
  }

  private async getHashForFiles(chunks: ArrayBuffer[], strategy: Strategy) {
    if (this.pool === undefined) {
      this.pool = await WorkerPoolForHash.create(this.MAX_WORKERS)
    }
    const params: WorkerReq[] = chunks.map((chunk) => ({
      chunk,
      strategy,
    }))

    const getFn: getFn<WorkerReq> = (param: WorkerReq) => param.chunk
    const restoreFn: restoreFn = (options) => {
      const { index, buf } = options
      chunks[index] = buf
    }

    return this.pool.exec<string, WorkerReq>(params, getFn, restoreFn)
  }

  getMD5ForFiles(chunks: ArrayBuffer[]) {
    return this.getHashForFiles(chunks, Strategy.md5)
  }

  getCRC32ForFiles(chunks: ArrayBuffer[]) {
    return this.getHashForFiles(chunks, Strategy.crc32)
  }

  terminate() {
    this.pool && this.pool.terminate()
    this.pool = undefined
  }
}
