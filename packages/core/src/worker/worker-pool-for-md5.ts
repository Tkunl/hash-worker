import { WorkerPool } from '../entity'
import { WorkerWrapper } from '../entity'
import { isBrowser, isNode } from '../utils'

// TODO 考虑将两个 Worker Pool 合并
export class WorkerPoolForMd5 extends WorkerPool {
  constructor(maxWorkers: number) {
    super(maxWorkers)
  }

  static async create(maxWorkers: number) {
    const instance = new WorkerPoolForMd5(maxWorkers)
    const countArr = Array.from({ length: maxWorkers })

    if (isBrowser()) {
      instance.pool = countArr.map(() => {
        return new WorkerWrapper(
          new Worker(new URL('./worker/md5.worker.mjs', import.meta.url), { type: 'module' }),
        )
      })
    }

    if (isNode()) {
      const { Worker: NodeWorker } = await import('worker_threads')
      instance.pool = countArr.map(() => {
        return new WorkerWrapper(
          new NodeWorker(new URL('./worker/md5.worker.mjs', import.meta.url)),
        )
      })
    }

    return instance
  }
}
