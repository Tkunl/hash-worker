import { Worker as NodeWorker } from 'worker_threads'
import { BaseWorkerPool } from '../shared'
import { NodeWorkerWrapper } from '.'

export class NodeWorkerPool extends BaseWorkerPool {
  constructor(maxWorkers: number) {
    super(maxWorkers)
  }

  static async create(maxWorkers: number) {
    const instance = new NodeWorkerPool(maxWorkers)
    const countArr = Array.from({ length: maxWorkers })

    instance.pool = countArr.map(() => {
      // 指向打包后的 worker 路径
      return new NodeWorkerWrapper(
        new NodeWorker(new URL('./worker/hash.worker.mjs', import.meta.url)),
      )
    })

    return instance
  }
}
