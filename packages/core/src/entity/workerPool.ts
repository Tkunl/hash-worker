import { StatusEnum, WorkerWrapper } from './workerWrapper'
import { MiniSubject } from '../utils'
import { getFn, restoreFn } from '../interface'

export abstract class WorkerPool<R = unknown> {
  pool: WorkerWrapper[] = []
  maxWorkerCount: number
  curRunningCount = new MiniSubject(0)
  results: R[] = []

  protected constructor(maxWorkers: number) {
    this.maxWorkerCount = maxWorkers
  }

  exec<T extends R, U>(params: U[], getFn: getFn<U>, restoreFn: restoreFn) {
    this.results.length = 0
    const workerParams = params.map((param, index) => ({ data: param, index }))

    return new Promise<T[]>((rs) => {
      this.curRunningCount.subscribe((count) => {
        if (count < this.maxWorkerCount && workerParams.length !== 0) {
          // 当前能跑的任务数量
          let curTaskCount = this.maxWorkerCount - count
          if (curTaskCount > workerParams.length) {
            curTaskCount = workerParams.length
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
              .run<T, U>(param.data, param.index, getFn, restoreFn)
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
