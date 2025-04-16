import { BaseWorkerService } from '../shared'
import { NodeWorkerPool } from './nodeWorkerPool'

export class NodeWorkerService extends BaseWorkerService {
  constructor(maxWorkers: number) {
    super(maxWorkers)
  }

  createWorkerPool(maxWorkers: number): Promise<NodeWorkerPool> {
    return NodeWorkerPool.create(maxWorkers)
  }
}
