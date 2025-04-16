import { BaseWorkerPool } from '../shared'
import { BrowserWorkerWrapper } from '.'

export class BrowserWorkerPool extends BaseWorkerPool {
  constructor(maxWorkers: number) {
    super(maxWorkers)
  }

  static async create(maxWorkers: number) {
    const instance = new BrowserWorkerPool(maxWorkers)
    const countArr = Array.from({ length: maxWorkers })

    instance.pool = countArr.map(() => {
      return new BrowserWorkerWrapper(
        // 指向打包后的 worker 路径
        new Worker(new URL('./worker/browser.worker.mjs', import.meta.url), { type: 'module' }),
      )
    })

    return instance
  }
}
