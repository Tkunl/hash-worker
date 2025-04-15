import { BaseWorkerWrapper } from '../shared'
import { GetFn, Reject, Resolve, RestoreFn, WorkerStatusEnum } from '../types'

export class BrowserWorkerWrapper extends BaseWorkerWrapper<Worker> {
  constructor(worker: Worker) {
    super(worker)
  }

  run<T, U>(param: U, index: number, getFn: GetFn<U>, restoreFn: RestoreFn): Promise<T> {
    this.status = WorkerStatusEnum.RUNNING

    return new Promise<T>((resolve, reject) => {
      this.setupListeners(resolve, reject, restoreFn, index)
      this.worker.postMessage(param, [getFn(param)])
    })
  }

  protected setupListeners(resolve: Resolve, reject: Reject, restoreFn: RestoreFn, index: number) {
    this.worker.onmessage = (event: MessageEvent) =>
      this.handleMessage(event.data, resolve, restoreFn, index)
    this.worker.onerror = (event: ErrorEvent) =>
      this.handleError(reject, event.error || new Error('Unknown worker error'))
  }

  protected isBrowserEnvironment() {
    return true
  }
}
