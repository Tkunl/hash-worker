import { Worker as NodeWorker } from 'worker_threads'
import { WorkerPool } from '../shared'
import { NodeWorkerWrapper } from './nodeWorkerWrapper'

export class HashWorkerPool extends WorkerPool {
  constructor(maxWorkers: number) {
    super(maxWorkers)
  }

  static async create(maxWorkers: number) {
    const instance = new HashWorkerPool(maxWorkers)
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
