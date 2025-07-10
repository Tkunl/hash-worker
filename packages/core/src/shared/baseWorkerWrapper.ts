import { restoreBuf } from '.'
import { Reject, Resolve, WorkerReq, WorkerRes, WorkerStatusEnum, TaskConfig } from '../types'

type WorkerLike = { terminate: () => void }

export abstract class BaseWorkerWrapper<TWorker extends WorkerLike = WorkerLike> {
  status: WorkerStatusEnum
  protected worker: TWorker
  private currentTaskId: string | null = null
  private timeoutHandle: NodeJS.Timeout | null = null

  constructor(worker: TWorker) {
    this.worker = worker
    this.status = WorkerStatusEnum.WAITING
  }

  abstract run<TResult>(param: WorkerReq, index: number, config?: TaskConfig): Promise<TResult>

  terminate() {
    this.cleanup()
    this.worker.terminate()
  }

  private cleanup() {
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle)
      this.timeoutHandle = null
    }
    this.currentTaskId = null
    this.status = WorkerStatusEnum.WAITING
  }

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
    index: number,
  ) {
    try {
      restoreBuf({ buf: workerRes.chunk, index })
      this.cleanup()
      resolve(workerRes.result)
    } catch (error) {
      this.handleError(
        (err) => resolve(Promise.reject(err)),
        error instanceof Error ? error : new Error('Unknown error in handleMessage'),
      )
    }
  }

  protected handleError(reject: Reject, error: Error) {
    this.setError()
    reject(error)
  }

  protected createTimeout(timeoutMs: number, reject: Reject, taskId: string): NodeJS.Timeout {
    return setTimeout(() => {
      if (this.currentTaskId === taskId) {
        this.handleError(reject, new Error(`Worker task timeout after ${timeoutMs}ms`))
      }
    }, timeoutMs)
  }
}
