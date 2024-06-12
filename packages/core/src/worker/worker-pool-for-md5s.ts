import { WorkerPool } from '../entity'
import { WorkerWrapper } from '../entity'
import { isBrowser, isNode } from '../utils'

export class WorkerPoolForMd5s extends WorkerPool {
  constructor(maxWorkers: number) {
    super(maxWorkers)
  }

  static async create(maxWorkers: number) {
    const instance = new WorkerPoolForMd5s(maxWorkers)
    const countArr = Array.from({ length: maxWorkers })
    const createWorkerWrapper = (worker: any) => countArr.map(() => new WorkerWrapper(worker))

    if (isBrowser()) {
      instance.pool = createWorkerWrapper(
        new Worker(new URL('./worker/md5.web-worker.mjs', import.meta.url), { type: 'module' }),
      )
    }

    if (isNode()) {
      const { Worker: NodeWorker } = await import('worker_threads')
      instance.pool = createWorkerWrapper(
        new NodeWorker(new URL('./worker/md5.web-worker.mjs', import.meta.url)),
      )
    }

    return instance
  }
}
