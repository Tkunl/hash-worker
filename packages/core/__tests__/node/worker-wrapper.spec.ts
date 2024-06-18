import { WorkerMessage, WorkerWrapper } from '../../src/entity'
import { Worker as NodeWorker } from 'worker_threads'
import { WorkerLabelsEnum } from '../../src/enum'

// 模拟 Node.js 的 'worker_threads' 模块
jest.mock('worker_threads', () => {
  // 设置 NodeWorker 实例的模拟行为
  const mockPostMessage = jest.fn()
  const mockTerminate = jest.fn()
  const mockOnMessage = jest.fn().mockImplementation((event, handler) => {
    if (event === 'message') {
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

  return {
    Worker: jest.fn().mockImplementation(() => ({
      postMessage: mockPostMessage,
      on: mockOnMessage,
      terminate: mockTerminate,
      setMaxListeners: jest.fn(),
    })),
  }
})

describe('WorkerWrapper', () => {
  it('should send and process messages correctly in node environment', async () => {
    const NodeWorkerMock = NodeWorker as unknown as jest.Mock<NodeWorker>

    const worker = new NodeWorkerMock()
    const workerWrapper = new WorkerWrapper(worker)
    const promise = workerWrapper.run(new ArrayBuffer(1), [new ArrayBuffer(5)], 0)

    await expect(promise).resolves.toBe('hash-string')
    expect(worker.terminate).toHaveBeenCalledTimes(0) // 根据需要测试 terminate 被调用的次数
  })
})
