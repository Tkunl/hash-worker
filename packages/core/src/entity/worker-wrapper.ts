import { WorkerRep } from './worker-message'
import { WorkerLabelsEnum } from '../enum'
import { Worker as NodeWorker } from 'worker_threads'
import { isBrowser, isNode } from '../utils'

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

  run<T>(param: ArrayBuffer, params: ArrayBuffer[], index: number) {
    this.status = StatusEnum.RUNNING

    const onMessage =
      (rs: Resolve) =>
      ({ data }: WorkerRep<{ result: string; chunk: ArrayBuffer }>) => {
        // TODO 此处会出 undefined
        console.log('onMessage data ...', data)
        const { label, content } = data
        if (label === WorkerLabelsEnum.DONE && content) {
          params[index] = content.chunk
          this.status = StatusEnum.WAITING
          rs(content.result as T)
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
        worker.postMessage(param, [param])
      })
    }

    if (isNode()) {
      const worker = this.worker as NodeWorker
      return new Promise<T>((rs, rj) => {
        worker.on('message', onMessage(rs))
        worker.on('error', onError(rj))
        worker.postMessage(param, [param])
      })
    }

    throw new Error('Unsupported environment')
  }

  terminate() {
    this.worker.terminate()
  }
}
