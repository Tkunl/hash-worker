import { WorkerPool } from '../../src/entity'
import { MockMiniSubject } from './mock-mini-subject'
import { MockWorkerWrapper } from './mock-worker-wrapper'

export class MockWorkerPool extends WorkerPool {
  constructor(maxWorkers = 4) {
    super(maxWorkers)
    this.curRunningCount = new MockMiniSubject(0)
    for (let i = 0; i < maxWorkers; i++) {
      this.pool.push(new MockWorkerWrapper())
    }
  }
}
