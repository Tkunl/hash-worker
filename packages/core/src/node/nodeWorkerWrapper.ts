import { Worker as NodeWorker } from 'worker_threads'
import { BaseWorkerWrapper, obtainBuf, generateUUID } from '../shared'
import { WorkerReq, TaskConfig } from '../types'

export class NodeWorkerWrapper extends BaseWorkerWrapper<NodeWorker> {
  constructor(worker: NodeWorker) {
    super(worker)
    worker.setMaxListeners(1024)
  }

  run<T>(param: WorkerReq, index: number, config?: TaskConfig): Promise<T> {
    const taskId = generateUUID()
    this.setRunning(taskId)

    return new Promise<T>((resolve, reject) => {
      // 设置超时（如果配置了）
      let timeoutHandle: NodeJS.Timeout | null = null
      if (config?.timeout) {
        timeoutHandle = this.createTimeout(config.timeout, reject, taskId)
      }

      const cleanup = () => {
        if (timeoutHandle) {
          clearTimeout(timeoutHandle)
        }
        this.worker.removeAllListeners('message')
        this.worker.removeAllListeners('error')
      }

      this.worker
        .on('message', (data) => {
          cleanup()
          this.handleMessage(data, resolve, index)
        })
        .on('error', (error) => {
          cleanup()
          this.handleError(reject, error)
        })

      this.worker.postMessage(param, [obtainBuf(param)])
    })
  }
}
