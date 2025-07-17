import { BaseWorkerWrapper, obtainBuf, generateUUID } from '../shared'
import { WorkerReq, TaskConfig } from '../types'

export class BrowserWorkerWrapper extends BaseWorkerWrapper<Worker, number> {
  constructor(worker: Worker) {
    super(worker)
  }

  run<T>(param: WorkerReq, index: number, config?: TaskConfig): Promise<T> {
    const taskId = generateUUID()
    this.setRunning(taskId)

    return new Promise<T>((resolve, reject) => {
      // 设置超时时间
      if (config?.timeout) {
        this.setTimeout(config.timeout, reject, taskId)
      }

      const cleanup = () => {
        this.worker.onmessage = null
        this.worker.onerror = null
      }

      this.worker.onmessage = (event: MessageEvent) => {
        cleanup()
        this.handleMessage(event.data, resolve, reject, index)
      }
      this.worker.onerror = (event: ErrorEvent) => {
        cleanup()
        this.handleError(reject, event.error || new Error('Unknown worker error'))
      }

      this.worker.postMessage(param, [obtainBuf(param)])
    })
  }

  protected createTimeout(
    timeoutMs: number,
    reject: (reason: any) => void,
    taskId: string,
  ): number {
    return window.setTimeout(() => {
      if (this.currentTaskId === taskId) {
        this.handleError(reject, new Error(`Worker task timeout after ${timeoutMs}ms`))
      }
    }, timeoutMs)
  }

  protected clearTimeout(timeoutId: number): void {
    window.clearTimeout(timeoutId)
  }

  protected cleanupEventListeners(): void {
    this.worker.onmessage = null
    this.worker.onerror = null
  }
}
