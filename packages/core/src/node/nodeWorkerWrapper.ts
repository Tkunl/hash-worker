import { Worker as NodeWorker } from 'worker_threads'
import { BaseWorkerWrapper, obtainBuf, generateUUID } from '../shared'
import { WorkerReq, TaskConfig } from '../types'

export class NodeWorkerWrapper extends BaseWorkerWrapper<NodeWorker, NodeJS.Timeout> {
  constructor(worker: NodeWorker) {
    super(worker)
    worker.setMaxListeners(1024)
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
        this.worker.removeAllListeners('message')
        this.worker.removeAllListeners('error')
      }

      this.worker
        .on('message', (data) => {
          cleanup()
          this.handleMessage(data, resolve, reject, index)
        })
        .on('error', (error) => {
          cleanup()
          this.handleError(reject, error)
        })

      this.worker.postMessage(param, [obtainBuf(param)])
    })
  }

  protected createTimeout(
    timeoutMs: number,
    reject: (reason: any) => void,
    taskId: string,
  ): NodeJS.Timeout {
    return setTimeout(() => {
      if (this.currentTaskId === taskId) {
        this.handleError(reject, new Error(`Worker task timeout after ${timeoutMs}ms`))
      }
    }, timeoutMs)
  }

  protected clearTimeout(timeoutId: NodeJS.Timeout): void {
    clearTimeout(timeoutId)
  }

  protected cleanupEventListeners(): void {
    this.worker.removeAllListeners('message')
    this.worker.removeAllListeners('error')
  }
}
