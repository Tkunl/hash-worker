import { WorkerPool } from '../entity'
import { WorkerWrapper } from '../entity'
import Worker from 'web-worker:./md5-single.web-worker.ts'

export class WorkerPoolForMd5s extends WorkerPool {
  constructor(maxWorkers: number) {
    super(maxWorkers)
    this.pool = Array.from({ length: this.maxWorkerCount }).map(
      () => new WorkerWrapper(new Worker()),
    )
  }
}
