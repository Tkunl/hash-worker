import { StatusEnum, WorkerMessage, WorkerWrapper } from '../../src/entity'
import { WorkerLabelsEnum } from '../../src/enum'

class WebWorker {
  onmessage?: (event: any) => void
  onerror?: (event: ErrorEvent) => void
  postMessage = jest.fn().mockImplementation(() => {
    this.onmessage &&
      this.onmessage(new WorkerMessage(WorkerLabelsEnum.DONE, { result: 'hash-string' }))
  })
  terminate = jest.fn()
}

// 在全局空间中声明这个类，以模拟在浏览器中的 Worker 行为
;(global as any).Worker = WebWorker

describe('WorkerWrapper', () => {
  it('should handle messages correctly in browser environment', async () => {
    const webWorker = new Worker('')

    const workerWrapper = new WorkerWrapper(webWorker)
    const promise = workerWrapper.run(new ArrayBuffer(1), [new ArrayBuffer(5)], 0)

    await expect(promise).resolves.toBe('hash-string')
    expect(workerWrapper.status).toBe(StatusEnum.WAITING)
    expect(webWorker.terminate).toHaveBeenCalledTimes(0) // 根据需要测试 terminate 被调用的次数
  })

  it('should call terminate on the worker', () => {
    const mockTerminate = jest.fn()
    const worker = new Worker('')
    worker.terminate = mockTerminate

    const workerWrapper = new WorkerWrapper(worker)
    workerWrapper.terminate()

    expect(mockTerminate).toHaveBeenCalled()
  })
})
