import { BaseWorkerWrapper, obtainBuf, generateUUID } from '../shared'
import { WorkerReq, TaskConfig } from '../types'

export class BrowserWorkerWrapper extends BaseWorkerWrapper<Worker> {
  constructor(worker: Worker) {
    super(worker)
  }

  run<T>(param: WorkerReq, index: number, config?: TaskConfig): Promise<T> {
    const taskId = generateUUID()
    this.setRunning(taskId)

    return new Promise<T>((resolve, reject) => {
      // 设置超时（如果配置了）
      let timeoutHandle: number | null = null
      if (config?.timeout) {
        timeoutHandle = this.createBrowserTimeout(config.timeout, reject, taskId)
      }

      const cleanup = () => {
        if (timeoutHandle) {
          clearTimeout(timeoutHandle)
        }
        this.worker.onmessage = null
        this.worker.onerror = null
      }

      this.worker.onmessage = (event: MessageEvent) => {
        cleanup()
        this.handleMessage(event.data, resolve, index)
      }
      this.worker.onerror = (event: ErrorEvent) => {
        cleanup()
        this.handleError(reject, event.error || new Error('Unknown worker error'))
      }

      this.worker.postMessage(param, [obtainBuf(param)])
    })
  }

  private createBrowserTimeout(
    timeoutMs: number,
    reject: (reason: any) => void,
    taskId: string,
  ): number {
    return window.setTimeout(() => {
      if (this.isCurrentTask(taskId)) {
        this.handleError(reject, new Error(`Worker task timeout after ${timeoutMs}ms`))
      }
    }, timeoutMs)
  }
}
