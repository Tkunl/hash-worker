import { WorkerPool } from '../../src/entity'
import { MockWorkerWrapper } from './mock_worker_wrapper'
import { MockMiniSubject } from './mock_mini_subject'

export class MockWorkerPool extends WorkerPool {
  constructor(maxWorkers = 4) {
    super(maxWorkers)
    this.curRunningCount = new MockMiniSubject(0)
    for (let i = 0; i < maxWorkers; i++) {
      this.pool.push(new MockWorkerWrapper())
    }
  }
}
