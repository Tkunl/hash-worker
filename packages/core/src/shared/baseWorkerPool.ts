import { BaseWorkerWrapper, MiniSubject } from '.'
import { WorkerReq, WorkerStatusEnum } from '../types'

export abstract class BaseWorkerPool {
  pool: BaseWorkerWrapper[] = []
  maxWorkerCount: number
  curRunningCount = new MiniSubject(0)

  protected constructor(maxWorkers: number) {
    this.maxWorkerCount = maxWorkers
    this.pool = Array.from({ length: maxWorkers }).map(() => this.createWorker())
  }

  abstract createWorker(): BaseWorkerWrapper

  exec<T>(params: WorkerReq[]): Promise<T[]> {
    const results: (T | Error)[] = new Array(params.length)
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
          const canUseWorker = this.pool
            .filter((w) => w.status === WorkerStatusEnum.WAITING)
            .slice(0, curTaskCount)

          const paramsToRun = workerParams.splice(0, curTaskCount)

          // 更新当前正在跑起来的 worker 数量
          this.curRunningCount.next(this.curRunningCount.value + curTaskCount)
          canUseWorker.forEach((workerApp, index) => {
            const param = paramsToRun[index]
            workerApp
              .run<T>(param.data, param.index)
              .then((res) => {
                results[param.index] = res
              })
              .catch((e) => {
                results[param.index] = e
              })
              .finally(() => {
                this.curRunningCount.next(this.curRunningCount.value - 1)
              })
          })
        }

        if (this.curRunningCount.value === 0 && workerParams.length === 0) {
          rs(results as T[])
        }
      })
    })
  }

  adjustPool(workerCount: number): void {
    const curCount = this.pool.length
    const diff = workerCount - curCount
    if (diff > 0) {
      Array.from({ length: diff }).forEach(() => {
        this.pool.push(this.createWorker())
      })
    }
    if (diff < 0) {
      let count = diff
      for (let i = 0; i < this.pool.length && count > 0; ) {
        const workerWraper = this.pool[i]
        if (workerWraper.status === WorkerStatusEnum.WAITING) {
          workerWraper.terminate()
          this.pool.splice(i, 1)
          count--
        } else {
          i++
        }
      }
    }
  }

  terminate(): void {
    this.pool.forEach((workerWrapper) => workerWrapper.terminate())
  }
}
