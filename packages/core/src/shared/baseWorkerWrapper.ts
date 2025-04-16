import { GetFn, Reject, Resolve, RestoreFn, WorkerRes, WorkerStatusEnum } from '../types'

type WorkerLike = { terminate: () => void }

export abstract class BaseWorkerWrapper<T extends WorkerLike = WorkerLike> {
  status: WorkerStatusEnum
  protected worker: T

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

  protected handleMessage(
    workerRes: WorkerRes<string>,
    resolve: Resolve,
    restoreFn: RestoreFn,
    index: number,
  ) {
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
}
