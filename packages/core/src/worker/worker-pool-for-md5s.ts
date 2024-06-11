import { WorkerPool } from '../entity'
import { WorkerWrapper } from '../entity'
import { isBrowser, isNode } from '../utils'
import WebWorker from 'web-worker:./md5.web-worker.ts'

export class WorkerPoolForMd5s extends WorkerPool {
  constructor(maxWorkers: number) {
    super(maxWorkers)
  }

  static async create(maxWorkers: number) {
    const instance = new WorkerPoolForMd5s(maxWorkers)
    const countArr = Array.from({ length: maxWorkers })
    const createWorkerWrapper = (worker: any) => countArr.map(() => new WorkerWrapper(worker))
    if (isBrowser()) {
      instance.pool = createWorkerWrapper(new WebWorker())
    }

    if (isNode()) {
      const { Worker } = await import('worker_threads')
      instance.pool = createWorkerWrapper(new Worker('./md5.web-worker.ts'))
    }

    return instance
  }
}
