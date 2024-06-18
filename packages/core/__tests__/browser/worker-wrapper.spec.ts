import { WorkerMessage, WorkerWrapper } from '../../src/entity'
import { WorkerLabelsEnum } from '../../src/enum'

class WebWorker {
  onmessage() {
    console.log('called onmessage ....')
    return jest.fn().mockImplementation((event, handler) => {
      if (event === 'message') {
        console.log('do rec msg ....')
        setTimeout(
          () =>
            handler(
              new WorkerMessage(WorkerLabelsEnum.DONE, {
                result: 'hash-string',
              }),
            ),
          0,
        )
      }
    })
  }
  onerror?: (event: ErrorEvent) => void
  postMessage = jest.fn()
  terminate = jest.fn()
}

// 在全局空间中声明这个类，以模拟在浏览器中的 Worker 行为
;(global as any).Worker = WebWorker

describe('WorkerWrapper', () => {
  it('should handle messages correctly in browser environment', async () => {
    const webWorker = new Worker('')

    const workerWrapper = new WorkerWrapper(new WebWorker() as any)
    const promise = workerWrapper.run(new ArrayBuffer(1), [new ArrayBuffer(5)], 0)

    await expect(promise).resolves.toBe('hash-string')
    // expect(workerWrapper.status).toBe(StatusEnum.WAITING)
    expect(webWorker.terminate).toHaveBeenCalledTimes(0) // 根据需要测试 terminate 被调用的次数
  })

  // it('should call terminate on the worker', () => {
  //   const mockTerminate = jest.fn()
  //   Worker.prototype.terminate = mockTerminate
  //
  //   const workerWrapper = new WorkerWrapper(new Worker(''))
  //   workerWrapper.terminate()
  //
  //   expect(mockTerminate).toHaveBeenCalled()
  // })
})
