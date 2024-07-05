import { Worker as NodeWorker } from 'worker_threads'
import { isBrowser, isNode } from 'shared-tools'
import { WorkerReq, WorkerRes } from './types'

type Resolve<T = any> = (value: T | PromiseLike<T>) => void
type Reject = (reason?: any) => void

export enum StatusEnum2 {
  RUNNING = 'running',
  WAITING = 'waiting',
}

export class WorkerWrapper2 {
  worker: Worker | NodeWorker
  status: StatusEnum2

  constructor(worker: Worker | NodeWorker) {
    this.worker = worker
    this.status = StatusEnum2.WAITING
  }

  run<T>(param: any, index: number, option: WorkerReq) {
    this.status = StatusEnum2.RUNNING
    const { fn, transferList, transferBackFn } = option
    console.log('running worker app...')

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
        // params[index] = chunk
        if (transferList && transferBackFn) {
          transferBackFn(chunk, transferList, index)
        }
        this.status = StatusEnum2.WAITING
        rs(result as T)
      }
    }

    const onError = (rj: Reject) => (ev: ErrorEvent) => {
      this.status = StatusEnum2.WAITING
      rj(ev)
    }

    const workerMsg = {
      fn: fn.toString(),
      fnArgs: [param],
      // transferList,
    }

    if (isBrowser()) {
      const worker = this.worker as Worker
      return new Promise<T>((rs, rj) => {
        worker.onmessage = onMessage(rs)
        worker.onerror = onError(rj)
        worker.postMessage(workerMsg, [...(transferList ?? [])])
      })
    }

    if (isNode()) {
      const worker = this.worker as NodeWorker
      return new Promise<T>((rs, rj) => {
        // 处理 MaxListenersExceededWarning: Possible EventEmitter memory leak detected 警告
        worker.setMaxListeners(1024)
        worker.on('message', onMessage(rs))
        worker.on('error', onError(rj))
        console.log('begin post msg to worker ...', workerMsg)
        // worker.postMessage(workerMsg, [...(transferList ?? [])])
        worker.postMessage(workerMsg)
      })
    }

    throw new Error('Unsupported environment')
  }

  terminate() {
    this.worker.terminate()
  }
}
