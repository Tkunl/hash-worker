import { BaseWorkerService } from '../shared'
import { NodeWorkerPool } from './nodeWorkerPool'

export class NodeWorkerService extends BaseWorkerService {
  constructor(maxWorkers: number) {
    super(maxWorkers)
  }

  async createWorkerPool(maxWorkers: number): Promise<NodeWorkerPool> {
    const pool = await NodeWorkerPool.create(maxWorkers)
    return pool
  }
}
