import { BaseWorkerService } from '../shared'
import { BrowserWorkerPool } from '.'

export class BrowserWorkerService extends BaseWorkerService {
  constructor(maxWorkers: number) {
    super(maxWorkers)
  }

  async createWorkerPool(maxWorkers: number): Promise<BrowserWorkerPool> {
    const pool = await BrowserWorkerPool.create(maxWorkers)
    return pool
  }
}
