import { BaseWorkerPool, initBufService } from '.'
import { Strategy, WorkerReq, TaskConfig } from '../types'

export class WorkerService {
  protected maxWorkers: number
  protected pool: BaseWorkerPool | null = null

  constructor(maxWorkers: number, pool: BaseWorkerPool) {
    this.maxWorkers = maxWorkers
    this.pool = pool
  }

  async getHashForFiles(
    chunks: ArrayBuffer[],
    strategy: Strategy,
    config?: TaskConfig,
  ): Promise<string[]> {
    const params: WorkerReq[] = chunks.map((chunk) => ({
      chunk,
      strategy,
    }))
    initBufService(chunks)

    const results = await this.pool!.exec<string>(params, config)

    // 处理结果，提取成功的数据或抛出第一个错误
    const hashResults: string[] = []
    for (const result of results) {
      if (result.success) {
        hashResults[result.index] = result.data
      } else {
        // 如果有任务失败，抛出错误
        throw new Error(
          `Hash calculation failed for chunk ${result.index}: ${result.error.message}`,
        )
      }
    }

    return hashResults
  }

  adjustSvcWorkerPool(workerCount: number): void {
    this.pool!.adjustPool(workerCount)
  }

  terminate(): void {
    this.pool && this.pool.terminate()
    this.pool = null
  }
}
