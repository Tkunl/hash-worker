import { WorkerPool } from '../../src/entity'
import { MockMiniSubject } from './mockMiniSubject'
import { MockWorkerWrapper } from './mockWorkerWrapper'

export class MockWorkerPool extends WorkerPool {
  constructor(maxWorkers = 4) {
    super(maxWorkers)
    this.curRunningCount = new MockMiniSubject(0)
    for (let i = 0; i < maxWorkers; i++) {
      this.pool.push(new MockWorkerWrapper())
    }
  }
}
