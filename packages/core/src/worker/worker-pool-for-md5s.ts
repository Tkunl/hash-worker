import { WorkerPool } from '../entity/worker-pool'
import { WorkerWrapper } from '../entity/worker-wrapper'

export class WorkerPoolForMd5s extends WorkerPool {
  constructor(maxWorkers: number) {
    super(maxWorkers)
    this.pool = Array.from({ length: this.maxWorkerCount }).map(
      () => new WorkerWrapper(new Worker(new URL('./md5-single.web-worker', import.meta.url))),
    )
  }
}
