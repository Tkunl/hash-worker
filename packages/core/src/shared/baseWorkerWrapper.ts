import { GetFn, Reject, Resolve, RestoreFn, WorkerRes, WorkerStatusEnum } from '../types'

export abstract class BaseWorkerWrapper<
  T extends { terminate: () => void } = { terminate: () => void },
> {
  protected worker: T
  status: WorkerStatusEnum

  constructor(worker: T) {
    this.worker = worker
    this.status = WorkerStatusEnum.WAITING
  }

  abstract run<T, U>(param: U, index: number, getFn: GetFn<U>, restoreFn: RestoreFn): Promise<T>

  terminate() {
    this.worker.terminate()
  }

  protected abstract setupListeners(
    resolve: Resolve,
    reject: Reject,
    restoreFn: RestoreFn,
    index: number,
  ): void

  protected handleMessage(data: unknown, resolve: Resolve, restoreFn: RestoreFn, index: number) {
    const workerRes = this.parseWorkerData(data)
    if (workerRes?.result && workerRes?.chunk) {
      restoreFn({ buf: workerRes.chunk, index })
      this.status = WorkerStatusEnum.WAITING
      resolve(workerRes.result)
    }
  }

  protected handleError(reject: Reject, error: Error) {
    this.status = WorkerStatusEnum.WAITING
    reject(error)
  }

  private parseWorkerData(data: unknown): WorkerRes {
    if (this.isBrowserEnvironment()) {
      return (data as { data: WorkerRes }).data
    }
    return data as WorkerRes
  }

  protected abstract isBrowserEnvironment(): boolean
}
