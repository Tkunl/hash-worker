import { StatusEnum, WorkerWrapper } from './worker-wrapper'
import { isBrowser, isNode, MiniSubject } from 'shared-tools'

export class WorkerPool2 {
  pool: WorkerWrapper[] = []
  maxWorkerCount: number
  curRunningCount = new MiniSubject(0)
  results: any[] = []

  constructor(maxWorkers: number) {
    this.maxWorkerCount = maxWorkers
  }

  static async create(maxWorkers: number) {
    const instance = new WorkerPool2(maxWorkers)
    const countArr = Array.from({ length: maxWorkers })

    if (isBrowser()) {
      instance.pool = countArr.map(
        () =>
          new WorkerWrapper(
            new Worker(new URL('./worker-container.js', import.meta.url), { type: 'module' }),
          ),
      )
    }

    if (isNode()) {
      const { Worker: NodeWorker } = await import('worker_threads')
      instance.pool = countArr.map(
        () => new WorkerWrapper(new NodeWorker(new URL('./worker-container.js', import.meta.url))),
      )
    }
  }

  exec<T>(params: ArrayBuffer[]) {
    this.results.length = 0
    const workerParams = params.map((param, index) => ({ data: param, index }))

    return new Promise<T[]>((rs) => {
      this.curRunningCount.subscribe((count) => {
        if (count < this.maxWorkerCount && workerParams.length !== 0) {
          // 当前能跑的任务数量
          let curTaskCount = this.maxWorkerCount - count
          if (curTaskCount > params.length) {
            curTaskCount = params.length
          }

          // 此时可以用来执行任务的 Worker
          const canUseWorker: WorkerWrapper[] = []
          for (const worker of this.pool) {
            if (worker.status === StatusEnum.WAITING) {
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
              .run<string>(param.data, params, param.index)
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
