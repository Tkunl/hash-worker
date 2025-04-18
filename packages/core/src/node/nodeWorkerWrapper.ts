import { Worker as NodeWorker } from 'worker_threads'
import { BaseWorkerWrapper, obtainBuf } from '../shared'
import { WorkerReq, WorkerStatusEnum } from '../types'

export class NodeWorkerWrapper extends BaseWorkerWrapper<NodeWorker> {
  constructor(worker: NodeWorker) {
    super(worker)
    worker.setMaxListeners(1024)
  }

  run<T, U extends WorkerReq>(param: U, index: number): Promise<T> {
    this.status = WorkerStatusEnum.RUNNING

    return new Promise<T>((resolve, reject) => {
      this.worker
        .on('message', (data) => this.handleMessage(data, resolve, index))
        .on('error', (error) => this.handleError(reject, error))
      this.worker.postMessage(param, [obtainBuf(param)])
    })
  }
}
