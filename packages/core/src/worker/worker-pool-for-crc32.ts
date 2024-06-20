import { WorkerPool } from '../entity'
import { WorkerWrapper } from '../entity'
import { isBrowser, isNode } from '../utils'

export class WorkerPoolForCrc32 extends WorkerPool {
  constructor(maxWorkers: number) {
    super(maxWorkers)
  }

  static async create(maxWorkers: number) {
    const instance = new WorkerPoolForCrc32(maxWorkers)
    const countArr = Array.from({ length: maxWorkers })

    if (isBrowser()) {
      instance.pool = countArr.map(() => {
        return new WorkerWrapper(
          new Worker(new URL('./worker/crc32.web-worker.mjs', import.meta.url), { type: 'module' }),
        )
      })
    }

    if (isNode()) {
      const { Worker: NodeWorker } = await import('worker_threads')
      instance.pool = countArr.map(() => {
        return new WorkerWrapper(
          new NodeWorker(new URL('./worker/crc32.web-worker.mjs', import.meta.url)),
        )
      })
    }

    return instance
  }
}
