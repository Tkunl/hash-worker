import { Worker as NodeWorker } from 'worker_threads'
import { BaseWorkerPool } from '../shared'
import { NodeWorkerWrapper } from '.'
import { WorkerStatusEnum } from '../types'

// TODO 待重构掉静态方法
export class NodeWorkerPool extends BaseWorkerPool {
  constructor(maxWorkers: number) {
    super(maxWorkers)
  }

  adjustPool(workerCount: number): void {
    const curCount = this.pool.length
    const diff = workerCount - curCount
    if (diff > 0) {
      Array.from({ length: diff }).forEach(() => {
        this.pool.push(NodeWorkerPool.createWorker())
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

  static createWorker(): NodeWorkerWrapper {
    return new NodeWorkerWrapper(
      new NodeWorker(new URL('./worker/node.worker.mjs', import.meta.url)),
    )
  }

  static async createPool(maxWorkers: number) {
    const instance = new NodeWorkerPool(maxWorkers)
    instance.pool = Array.from({ length: maxWorkers }).map(() => this.createWorker())
    return instance
  }
}
