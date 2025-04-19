import { BaseWorkerService } from '../shared'
import { BrowserWorkerPool } from '.'

export class BrowserWorkerService extends BaseWorkerService {
  constructor(maxWorkers: number) {
    super(maxWorkers)
  }

  createWorkerPool(maxWorkers: number): Promise<BrowserWorkerPool> {
    return BrowserWorkerPool.createPool(maxWorkers)
  }
}
