import { BaseWorkerPool, initBufService } from '.'
import { Strategy, WorkerReq } from '../types'

export class WorkerService {
  protected maxWorkers: number
  protected pool: BaseWorkerPool | null = null

  constructor(maxWorkers: number, pool: BaseWorkerPool) {
    this.maxWorkers = maxWorkers
    this.pool = pool
  }

  getHashForFiles(chunks: ArrayBuffer[], strategy: Strategy): Promise<string[]> {
    const params: WorkerReq[] = chunks.map((chunk) => ({
      chunk,
      strategy,
    }))
    initBufService(chunks)
    return this.pool!.exec<string>(params)
  }

  adjustSvcWorkerPool(workerCount: number): void {
    this.pool!.adjustPool(workerCount)
  }

  terminate(): void {
    this.pool && this.pool.terminate()
    this.pool = null
  }
}
