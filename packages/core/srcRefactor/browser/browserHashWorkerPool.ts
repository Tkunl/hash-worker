import { WorkerPool } from '../shared'
import { BrowserWorkerWrapper } from './browserWorkerWrapper'

export class HashWorkerPool extends WorkerPool {
  constructor(maxWorkers: number) {
    super(maxWorkers)
  }

  static async create(maxWorkers: number) {
    const instance = new HashWorkerPool(maxWorkers)
    const countArr = Array.from({ length: maxWorkers })

    instance.pool = countArr.map(() => {
      return new BrowserWorkerWrapper(
        // 指向打包后的 worker 路径
        new Worker(new URL('./worker/hash.worker.mjs', import.meta.url), { type: 'module' }),
      )
    })

    return instance
  }
}
