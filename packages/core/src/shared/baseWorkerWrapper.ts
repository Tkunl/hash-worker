import { restoreBuf } from '.'
import { Reject, Resolve, WorkerReq, WorkerRes, WorkerStatusEnum } from '../types'

type WorkerLike = { terminate: () => void }

export abstract class BaseWorkerWrapper<T extends WorkerLike = WorkerLike> {
  status: WorkerStatusEnum
  protected worker: T

  constructor(worker: T) {
    this.worker = worker
    this.status = WorkerStatusEnum.WAITING
  }

  abstract run<T>(param: WorkerReq, index: number): Promise<T>

  terminate() {
    this.worker.terminate()
  }

  protected handleMessage(workerRes: WorkerRes<string>, resolve: Resolve, index: number) {
    restoreBuf({ buf: workerRes.chunk, index })
    this.status = WorkerStatusEnum.WAITING
    resolve(workerRes.result)
  }

  protected handleError(reject: Reject, error: Error) {
    this.status = WorkerStatusEnum.WAITING
    reject(error)
  }
}
