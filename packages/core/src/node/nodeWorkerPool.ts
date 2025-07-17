import { Worker as NodeWorker } from 'worker_threads'
import { BaseWorkerPool } from '../shared'
import { NodeWorkerWrapper } from './nodeWorkerWrapper'

export class NodeWorkerPool extends BaseWorkerPool<NodeWorkerWrapper> {
  createWorker(): NodeWorkerWrapper {
    return new NodeWorkerWrapper(
      new NodeWorker(new URL('./worker/node.worker.mjs', import.meta.url)),
    )
  }
}
