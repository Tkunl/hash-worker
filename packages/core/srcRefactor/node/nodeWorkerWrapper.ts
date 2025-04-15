import { Worker as NodeWorker } from 'worker_threads'
import { BaseWorkerWrapper } from '../shared'
import { getFn, Reject, Resolve, restoreFn, WorkerStatusEnum } from '../types'

export class NodeWorkerWrapper extends BaseWorkerWrapper<NodeWorker> {
  constructor(worker: NodeWorker) {
    super(worker)
    ;(worker as NodeWorker).setMaxListeners(1024)
  }

  run<T, U>(param: U, index: number, getFn: getFn<U>, restoreFn: restoreFn): Promise<T> {
    this.status = WorkerStatusEnum.RUNNING

    return new Promise<T>((resolve, reject) => {
      this.setupListeners(resolve, reject, restoreFn, index)
      ;(this.worker as NodeWorker).postMessage(param, [getFn(param)])
    })
  }

  protected setupListeners(resolve: Resolve, reject: Reject, restoreFn: restoreFn, index: number) {
    ;(this.worker as NodeWorker)
      .on('message', (data) => this.handleMessage(data, resolve, restoreFn, index))
      .on('error', (error) => this.handleError(reject, error))
  }

  protected isBrowserEnvironment() {
    return false
  }
}
