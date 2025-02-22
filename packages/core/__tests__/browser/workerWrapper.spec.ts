import { StatusEnum, WorkerWrapper } from '../../src/entity'
import { MockWebWorker } from '../fixture/mockWebWorker'

// 在全局空间中声明这个类，以模拟在浏览器中的 Worker 行为
;(global as any).Worker = MockWebWorker

describe('WorkerWrapper', () => {
  it('should handle messages correctly in browser environment', async () => {
    const webWorker = new Worker('')
    const workerWrapper = new WorkerWrapper(webWorker)
    const getFn = (param: ArrayBuffer) => param
    const restoreFn: any = () => {}
    const promise = workerWrapper.run(new ArrayBuffer(1), 0, getFn, restoreFn)

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
