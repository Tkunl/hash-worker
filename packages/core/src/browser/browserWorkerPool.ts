import { BaseWorkerPool } from '../shared'
import { BrowserWorkerWrapper } from '.'

export class BrowserWorkerPool extends BaseWorkerPool<BrowserWorkerWrapper> {
  createWorker(): BrowserWorkerWrapper {
    return new BrowserWorkerWrapper(
      // 指向打包后的 worker 路径
      new Worker(new URL('./worker/browser.worker.mjs', import.meta.url), { type: 'module' }),
    )
  }
}
