import { WorkerPool } from '../entity/worker-pool'
import { WorkerWrapper } from '../entity/worker-wrapper'

export class WorkerPoolForCrc32s extends WorkerPool {
  constructor(maxWorkers = navigator.hardwareConcurrency || 4) {
    super(maxWorkers)
    this.pool = Array.from({ length: this.maxWorkerCount }).map(
      () => new WorkerWrapper(new Worker(new URL('./crc32-single.web-worker', import.meta.url))),
    )
  }
}
