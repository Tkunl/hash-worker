import { BaseWorkerPool } from './baseWorkerPool'
import { clearBufService, initBufService } from './arrayBufferService'
import { Strategy, WorkerReq, TaskConfig } from '../types'

/**
 * 工作服务类，封装了基于 Worker 的批量哈希计算功能
 */
export class WorkerService {
  private pool: BaseWorkerPool | null = null

  constructor(pool: BaseWorkerPool) {
    this.pool = pool
  }

  /**
   * 为文件块计算哈希值
   * @param chunks - 要计算哈希的数据块数组
   * @param strategy - 哈希计算策略
   * @param config - 任务配置（可选）
   * @returns 返回每个块对应的哈希值数组
   * @throws 如果有任务失败，会抛出包含详细错误信息的错误
   */
  async getHashForFiles(
    chunks: ArrayBuffer[],
    strategy: Strategy,
    config?: TaskConfig,
  ): Promise<string[]> {
    if (!this.pool) {
      throw new Error('WorkerService has been terminated')
    }

    if (chunks.length === 0) {
      return []
    }

    const params: WorkerReq[] = chunks.map((chunk) => ({
      chunk,
      strategy,
    }))

    // 初始化缓冲区服务以支持 Worker 间的数据传输
    initBufService(chunks)

    const results = await this.pool.exec<string>(params, config)

    // 收集所有错误和成功结果
    const hashResults: string[] = []
    const errors: Array<{ index: number; error: Error }> = []

    for (const result of results) {
      if (result.success) {
        hashResults[result.index] = result.data
      } else {
        errors.push({ index: result.index, error: result.error })
      }
    }

    // 如果有错误，抛出包含所有错误信息的详细错误
    if (errors.length > 0) {
      const errorMessage = errors
        .map(({ index, error }) => `Chunk ${index}: ${error.message}`)
        .join('; ')
      throw new Error(`Hash calculation failed for ${errors.length} chunks: ${errorMessage}`)
    }

    clearBufService()
    return hashResults
  }

  /**
   * 调整工作池中的 Worker 数量
   * @param workerCount - 新的 Worker 数量
   * @throws 如果服务已被终止，会抛出错误
   */
  adjustWorkerPoolSize(workerCount: number): void {
    if (!this.pool) {
      throw new Error('WorkerService has been terminated')
    }

    if (workerCount < 1) {
      throw new Error('Worker count must be at least 1')
    }

    this.pool.adjustPool(workerCount)
  }

  /**
   * 获取工作池状态信息
   * @returns 工作池的状态统计信息，如果服务已终止则返回 null
   */
  getPoolStatus() {
    return this.pool?.getPoolStatus() || null
  }

  /**
   * 检查服务是否处于活动状态
   * @returns 如果服务可用则返回 true，否则返回 false
   */
  isActive(): boolean {
    return this.pool !== null
  }

  /**
   * 终止工作服务，清理所有资源
   */
  terminate(): void {
    if (this.pool) {
      this.pool.terminate()
      this.pool = null
    }
    clearBufService()
  }
}
