import { BaseWorkerPool } from '../shared'
import { BrowserWorkerWrapper } from '.'
import { WorkerStatusEnum } from '../types'

// TODO 待重构掉静态方法
export class BrowserWorkerPool extends BaseWorkerPool {
  constructor(maxWorkers: number) {
    super(maxWorkers)
  }

  adjustPool(workerCount: number): void {
    const curCount = this.pool.length
    const diff = workerCount - curCount
    if (diff > 0) {
      Array.from({ length: diff }).forEach(() => {
        this.pool.push(BrowserWorkerPool.createWorker())
      })
    }
    if (diff < 0) {
      let count = diff
      for (let i = 0; i < this.pool.length && count > 0; ) {
        const workerWraper = this.pool[i]
        if (workerWraper.status === WorkerStatusEnum.WAITING) {
          workerWraper.terminate()
          this.pool.splice(i, 1)
          count--
        } else {
          i++
        }
      }
    }
  }

  static createWorker(): BrowserWorkerWrapper {
    return new BrowserWorkerWrapper(
      // 指向打包后的 worker 路径
      new Worker(new URL('./worker/browser.worker.mjs', import.meta.url), { type: 'module' }),
    )
  }

  static async createPool(maxWorkers: number) {
    const instance = new BrowserWorkerPool(maxWorkers)
    instance.pool = Array.from({ length: maxWorkers }).map(() => this.createWorker())
    return instance
  }
}
