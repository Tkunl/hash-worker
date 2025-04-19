import { Worker as NodeWorker } from 'worker_threads'
import { BaseWorkerPool } from '../shared'
import { NodeWorkerWrapper } from '.'

// TODO 待重构掉静态方法
export class NodeWorkerPool extends BaseWorkerPool {
  createWorker(): NodeWorkerWrapper {
    return new NodeWorkerWrapper(
      new NodeWorker(new URL('./worker/node.worker.mjs', import.meta.url)),
    )
  }
}
