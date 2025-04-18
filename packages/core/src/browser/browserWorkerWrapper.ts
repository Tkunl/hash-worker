import { BaseWorkerWrapper, obtainBuf } from '../shared'
import { WorkerReq, WorkerStatusEnum } from '../types'

export class BrowserWorkerWrapper extends BaseWorkerWrapper<Worker> {
  constructor(worker: Worker) {
    super(worker)
  }

  run<T>(param: WorkerReq, index: number): Promise<T> {
    this.status = WorkerStatusEnum.RUNNING
    return new Promise<T>((resolve, reject) => {
      this.worker.onmessage = (event: MessageEvent) =>
        this.handleMessage(event.data, resolve, index)
      this.worker.onerror = (event: ErrorEvent) =>
        this.handleError(reject, event.error || new Error('Unknown worker error'))
      this.worker.postMessage(param, [obtainBuf(param)])
    })
  }
}
