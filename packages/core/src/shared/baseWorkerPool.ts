import { BaseWorkerWrapper } from './baseWorkerWrapper'
import { generateUUID } from './utils'
import { WorkerReq, WorkerStatusEnum, TaskResult, TaskConfig } from '../types'

interface QueuedTask<T> {
  id: string
  param: WorkerReq
  index: number
  resolve: (value: TaskResult<T>) => void
  config?: TaskConfig
}

/**
 * 基础工作池抽象类
 * @template TWorkerWrapper - 工作包装器类型，必须继承自BaseWorkerWrapper
 *
 * 注意：这里使用 <any, any> 是必要的，因为：
 * - 浏览器环境：BaseWorkerWrapper<Worker, number>
 * - Node.js环境：BaseWorkerWrapper<NodeWorker, NodeJS.Timeout>
 * 两种环境的泛型参数完全不同，使用any可以同时支持两种环境
 *
 * 类型安全性在具体的 BrowserWorkerWrapper 和 NodeWorkerWrapper 中得到保障
 */
export abstract class BaseWorkerPool<
  TWorkerWrapper extends BaseWorkerWrapper<any, any> = BaseWorkerWrapper<any, any>,
> {
  pool: TWorkerWrapper[] = []
  maxWorkerCount: number
  private taskQueue: QueuedTask<any>[] = []
  private isProcessing = false

  constructor(maxWorkers: number) {
    this.maxWorkerCount = maxWorkers
    this.pool = Array.from({ length: maxWorkers }).map(() => this.createWorker())
  }

  abstract createWorker(): TWorkerWrapper

  async exec<T>(params: WorkerReq[], config?: TaskConfig): Promise<TaskResult<T>[]> {
    if (params.length === 0) {
      return []
    }

    return new Promise<TaskResult<T>[]>((resolve) => {
      const results: TaskResult<T>[] = new Array(params.length)
      let completedCount = 0

      // 将所有任务加入队列
      params.forEach((param, index) => {
        const taskId = generateUUID()
        const queuedTask: QueuedTask<T> = {
          id: taskId,
          param,
          index,
          config,
          resolve: (result: TaskResult<T>) => {
            results[index] = result
            completedCount++

            // 当所有任务完成时，返回结果
            if (completedCount === params.length) {
              resolve(results)
            }
          },
        }
        this.taskQueue.push(queuedTask)
      })

      // 开始处理队列
      this.processQueue()
    })
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing) {
      return
    }

    this.isProcessing = true

    try {
      while (this.taskQueue.length > 0) {
        const availableWorkers = this.getAvailableWorkers()

        if (availableWorkers.length === 0) {
          // 没有可用的worker，等待一段时间后重试
          await this.waitForAvailableWorker()
          continue
        }

        // 分配任务给可用的workers
        const tasksToProcess = Math.min(availableWorkers.length, this.taskQueue.length)
        const currentTasks = this.taskQueue.splice(0, tasksToProcess)

        // 并行执行任务
        const promises = currentTasks.map((task, i) => this.executeTask(availableWorkers[i], task))

        // 等待当前这批任务完成
        await Promise.allSettled(promises)
      }
    } finally {
      this.isProcessing = false
    }
  }

  private async executeTask<T>(worker: TWorkerWrapper, task: QueuedTask<T>): Promise<void> {
    const { param, index, resolve, config } = task

    try {
      const result = await worker.run<T>(param, index, config)
      resolve({
        success: true,
        data: result,
        index,
      })
    } catch (error) {
      resolve({
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
        index,
      })
    }
  }

  private getAvailableWorkers(): TWorkerWrapper[] {
    return this.pool.filter((worker) => worker.status === WorkerStatusEnum.WAITING)
  }

  private getRunningWorkers(): TWorkerWrapper[] {
    return this.pool.filter((worker) => worker.status === WorkerStatusEnum.RUNNING)
  }

  private async waitForAvailableWorker(): Promise<void> {
    return new Promise((resolve) => {
      const checkWorkers = () => {
        const availableWorkers = this.getAvailableWorkers()
        if (availableWorkers.length > 0) {
          resolve()
        } else {
          // 50ms后重新检查
          setTimeout(checkWorkers, 50)
        }
      }
      checkWorkers()
    })
  }

  adjustPool(workerCount: number): void {
    const curCount = this.pool.length
    const diff = workerCount - curCount

    if (diff > 0) {
      // 增加workers
      Array.from({ length: diff }).forEach(() => {
        this.pool.push(this.createWorker())
      })
    } else if (diff < 0) {
      // 减少workers
      let count = Math.abs(diff)
      for (let i = this.pool.length - 1; i >= 0 && count > 0; i--) {
        const workerWrapper = this.pool[i]
        if (workerWrapper.status === WorkerStatusEnum.WAITING) {
          workerWrapper.terminate()
          this.pool.splice(i, 1)
          count--
        }
      }
    }

    this.maxWorkerCount = workerCount
  }

  terminate(): void {
    // 清空任务队列
    this.taskQueue.length = 0

    // 终止所有workers
    this.pool.forEach((workerWrapper) => workerWrapper.terminate())
    this.pool.length = 0

    // 重置状态
    this.isProcessing = false
  }

  // 获取池状态信息，用于调试和监控
  getPoolStatus() {
    const runningWorkers = this.getRunningWorkers()
    const waitingWorkers = this.getAvailableWorkers()
    const errorWorkers = this.pool.filter((w) => w.status === WorkerStatusEnum.ERROR)

    return {
      totalWorkers: this.pool.length,
      runningWorkers: runningWorkers.length,
      waitingWorkers: waitingWorkers.length,
      errorWorkers: errorWorkers.length,
      queuedTasks: this.taskQueue.length,
      isProcessing: this.isProcessing,
      // 添加更详细的运行时信息
      runningTasksInfo: runningWorkers.map((w, i) => ({ workerId: i, status: w.status })),
    }
  }
}
