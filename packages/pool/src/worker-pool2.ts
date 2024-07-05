import { StatusEnum2, WorkerWrapper2 } from './worker-wrapper2'
import { isBrowser, isNode, MiniSubject } from 'shared-tools'
import { WorkerReq } from './types'

export class WorkerPool2 {
  pool: WorkerWrapper2[] = []
  maxWorkerCount: number
  curRunningCount = new MiniSubject(0)
  results: any[] = []

  constructor(maxWorkers: number) {
    this.maxWorkerCount = maxWorkers
  }

  async create(maxWorkers: number) {
    const countArr = Array.from({ length: maxWorkers })

    if (isBrowser()) {
      this.pool = countArr.map(
        () =>
          new WorkerWrapper2(
            new Worker(new URL('./worker-container.js', import.meta.url), { type: 'module' }),
          ),
      )
    }

    if (isNode()) {
      const { Worker: NodeWorker } = await import('worker_threads')
      this.pool = countArr.map(
        () => new WorkerWrapper2(new NodeWorker(new URL('./worker-container.js', import.meta.url))),
      )
    }
  }

  exec<T>(option: WorkerReq<T>) {
    this.results.length = 0
    const { fnArgs: params } = option
    const workerParams = params.map((param, index) => ({ data: param, index }))
    console.log('pool exec...', workerParams)

    return new Promise<T[]>((rs) => {
      this.curRunningCount.subscribe((count) => {
        if (count < this.maxWorkerCount && workerParams.length !== 0) {
          // 当前能跑的任务数量
          let curTaskCount = this.maxWorkerCount - count
          if (curTaskCount > params.length) {
            curTaskCount = params.length
          }

          // 此时可以用来执行任务的 Worker
          const canUseWorker: WorkerWrapper2[] = []
          for (const worker of this.pool) {
            if (worker.status === StatusEnum2.WAITING) {
              canUseWorker.push(worker)
              if (canUseWorker.length === curTaskCount) {
                break
              }
            }
          }

          const paramsToRun = workerParams.splice(0, curTaskCount)

          // 更新当前正在跑起来的 worker 数量
          this.curRunningCount.next(this.curRunningCount.value + curTaskCount)
          canUseWorker.forEach((workerApp, index) => {
            const param = paramsToRun[index]
            workerApp
              .run<string>(param.data, param.index, option)
              .then((res) => {
                this.results[param.index] = res
              })
              .catch((e) => {
                this.results[param.index] = e
              })
              .finally(() => {
                this.curRunningCount.next(this.curRunningCount.value - 1)
              })
          })
        }

        if (this.curRunningCount.value === 0 && workerParams.length === 0) {
          rs(this.results as T[])
        }
      })
    })
  }

  terminate() {
    this.pool.forEach((workerWrapper) => workerWrapper.terminate())
  }
}
