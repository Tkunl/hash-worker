import { restoreBuf } from '.'
import { Reject, Resolve, WorkerReq, WorkerRes, WorkerStatusEnum, TaskConfig } from '../types'

type WorkerLike = { terminate: () => void }

export abstract class BaseWorkerWrapper<
  TWorker extends WorkerLike = WorkerLike,
  TTimeout = NodeJS.Timeout,
> {
  status: WorkerStatusEnum
  protected worker: TWorker
  protected currentTaskId: string | null = null
  protected timeoutId: TTimeout | null = null

  constructor(worker: TWorker) {
    this.worker = worker
    this.status = WorkerStatusEnum.WAITING
  }

  abstract run<TResult>(param: WorkerReq, index: number, config?: TaskConfig): Promise<TResult>

  terminate() {
    this.cleanup()
    this.cleanupEventListeners()
    this.worker.terminate()
  }

  private cleanup() {
    if (this.timeoutId) {
      this.clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
    this.currentTaskId = null
    this.status = WorkerStatusEnum.WAITING
  }

  protected abstract cleanupEventListeners(): void

  protected setRunning(taskId: string) {
    this.currentTaskId = taskId
    this.status = WorkerStatusEnum.RUNNING
  }

  protected setError() {
    this.status = WorkerStatusEnum.ERROR
    this.cleanup()
  }

  protected isCurrentTask(taskId: string): boolean {
    return this.currentTaskId === taskId
  }

  protected handleMessage<TResult>(
    workerRes: WorkerRes<TResult>,
    resolve: Resolve<TResult>,
    reject: Reject,
    index: number,
  ) {
    try {
      restoreBuf({ buf: workerRes.chunk, index })
      this.cleanup()
      resolve(workerRes.result)
    } catch (error) {
      this.handleError(
        reject,
        error instanceof Error ? error : new Error('Unknown error in handleMessage'),
      )
    }
  }

  protected handleError(reject: Reject, error: Error) {
    this.setError()
    reject(error)
  }

  protected setTimeout(timeoutMs: number, reject: Reject, taskId: string) {
    this.timeoutId = this.createTimeout(timeoutMs, reject, taskId)
  }

  protected abstract createTimeout(timeoutMs: number, reject: Reject, taskId: string): TTimeout
  protected abstract clearTimeout(timeoutId: TTimeout): void
}
