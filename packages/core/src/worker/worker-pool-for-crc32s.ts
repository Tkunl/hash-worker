import { WorkerPool } from '../entity'
import { WorkerWrapper } from '../entity'
import { isBrowser, isNode } from '../utils'
import WebWorker from 'web-worker:./crc32.web-worker.ts'

export class WorkerPoolForCrc32s extends WorkerPool {
  constructor(maxWorkers = navigator.hardwareConcurrency || 4) {
    super(maxWorkers)
  }

  static async create(maxWorkers: number) {
    const instance = new WorkerPoolForCrc32s(maxWorkers)
    const countArr = Array.from({ length: maxWorkers })
    const createWorkerWrapper = (worker: any) => countArr.map(() => new WorkerWrapper(worker))
    if (isBrowser()) {
      instance.pool = createWorkerWrapper(new WebWorker())
    }

    if (isNode()) {
      const { Worker } = await import('worker_threads')
      instance.pool = createWorkerWrapper(new Worker('web-worker:./crc32.web-worker.ts'))
    }

    return instance
  }
}
