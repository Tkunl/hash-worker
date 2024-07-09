import { Worker as NodeWorker } from 'worker_threads'
import { isBrowser, isNode } from '../utils'
import { getFn, restoreFn, WorkerRes } from '../interface'

type Resolve<T = any> = (value: T | PromiseLike<T>) => void
type Reject = (reason?: any) => void

export enum StatusEnum {
  RUNNING = 'running',
  WAITING = 'waiting',
}

export class WorkerWrapper {
  worker: Worker | NodeWorker
  status: StatusEnum

  constructor(worker: Worker | NodeWorker) {
    this.worker = worker
    this.status = StatusEnum.WAITING
  }

  run<T, U>(param: U, params: U[], index: number, getFn: getFn<U>, restoreFn: restoreFn) {
    this.status = StatusEnum.RUNNING

    const onMessage = (rs: Resolve) => (dataFromWorker: unknown) => {
      let data: WorkerRes<string>

      if (isBrowser()) {
        data = (dataFromWorker as { data: WorkerRes }).data
      }
      if (isNode()) {
        data = dataFromWorker as WorkerRes
      }
      const { result, chunk } = data!
      if (result && chunk) {
        restoreFn({
          buf: chunk,
          index,
        })
        this.status = StatusEnum.WAITING
        rs(result as T)
      }
    }

    const onError = (rj: Reject) => (ev: ErrorEvent) => {
      this.status = StatusEnum.WAITING
      rj(ev)
    }

    if (isBrowser()) {
      const worker = this.worker as Worker
      return new Promise<T>((rs, rj) => {
        worker.onmessage = onMessage(rs)
        worker.onerror = onError(rj)
        worker.postMessage(param, [getFn(param)])
      })
    }

    if (isNode()) {
      const worker = this.worker as NodeWorker
      return new Promise<T>((rs, rj) => {
        // 处理 MaxListenersExceededWarning: Possible EventEmitter memory leak detected 警告
        worker.setMaxListeners(1024)
        worker.on('message', onMessage(rs))
        worker.on('error', onError(rj))
        worker.postMessage(param, [getFn(param)])
      })
    }

    throw new Error('Unsupported environment')
  }

  terminate() {
    this.worker.terminate()
  }
}
