import { BrowserWorkerWrapper } from '../../src/browser/browserWorkerWrapper'
import { Strategy, WorkerStatusEnum } from '../../src/types'

// Mock Worker
class MockWorker {
  onmessage: ((event: MessageEvent) => void) | null = null
  onerror: ((event: ErrorEvent) => void) | null = null
  postMessage = jest.fn()
  terminate = jest.fn()
}

// Mock obtainBuf function
jest.mock('../../src/shared', () => ({
  ...jest.requireActual('../../src/shared'),
  obtainBuf: jest.fn((param) => param.chunk),
}))

// 全局 Mock
global.Worker = jest.fn().mockImplementation(() => new MockWorker()) as any

describe('BrowserWorkerWrapper', () => {
  let mockWorker: MockWorker
  let browserWorkerWrapper: BrowserWorkerWrapper

  beforeEach(() => {
    jest.clearAllMocks()
    mockWorker = new MockWorker()
    browserWorkerWrapper = new BrowserWorkerWrapper(mockWorker as any)
  })

  afterEach(() => {
    browserWorkerWrapper.terminate()
  })

  describe('构造函数', () => {
    it('应该正确初始化 BrowserWorkerWrapper', () => {
      expect(browserWorkerWrapper).toBeInstanceOf(BrowserWorkerWrapper)
      expect(browserWorkerWrapper.status).toBe(WorkerStatusEnum.WAITING)
    })

    it('应该设置 worker 实例', () => {
      expect(browserWorkerWrapper['worker']).toBe(mockWorker)
    })
  })

  describe('run 方法', () => {
    it('应该成功执行任务并返回结果', async () => {
      const mockParam = {
        chunk: new ArrayBuffer(8),
        strategy: Strategy.md5,
      }
      const mockResult = 'test-hash-result'
      const index = 0

      // 模拟 worker 成功响应
      setTimeout(() => {
        if (mockWorker.onmessage) {
          mockWorker.onmessage({
            data: {
              result: mockResult,
              chunk: mockParam.chunk,
            },
          } as MessageEvent)
        }
      }, 0)

      const result = await browserWorkerWrapper.run<string>(mockParam, index)

      expect(result).toBe(mockResult)
      expect(browserWorkerWrapper.status).toBe(WorkerStatusEnum.WAITING)
      expect(mockWorker.postMessage).toHaveBeenCalledWith(mockParam, [mockParam.chunk])
    })

    it('应该在执行期间设置状态为 RUNNING', async () => {
      const mockParam = {
        chunk: new ArrayBuffer(8),
        strategy: Strategy.crc32,
      }
      const index = 1

      // 立即检查状态
      expect(browserWorkerWrapper.status).toBe(WorkerStatusEnum.WAITING)

      const runPromise = browserWorkerWrapper.run<string>(mockParam, index)

      // 在异步操作开始后检查状态
      expect(browserWorkerWrapper.status).toBe(WorkerStatusEnum.RUNNING)

      // 模拟响应以完成测试
      setTimeout(() => {
        if (mockWorker.onmessage) {
          mockWorker.onmessage({
            data: {
              result: 'test-result',
              chunk: mockParam.chunk,
            },
          } as MessageEvent)
        }
      }, 0)

      await runPromise
    })

    it('应该处理不同的策略类型', async () => {
      const strategies = [Strategy.md5, Strategy.crc32, Strategy.xxHash64, Strategy.mixed]

      for (const strategy of strategies) {
        const mockParam = {
          chunk: new ArrayBuffer(8),
          strategy,
        }
        const index = 0

        setTimeout(() => {
          if (mockWorker.onmessage) {
            mockWorker.onmessage({
              data: {
                result: `result-${strategy}`,
                chunk: mockParam.chunk,
              },
            } as MessageEvent)
          }
        }, 0)

        const result = await browserWorkerWrapper.run<string>(mockParam, index)
        expect(result).toBe(`result-${strategy}`)
      }
    })

    it('应该处理 worker 错误', async () => {
      const mockParam = {
        chunk: new ArrayBuffer(8),
        strategy: Strategy.md5,
      }
      const index = 0
      const mockError = new Error('Worker execution failed')

      // 模拟 worker 错误
      setTimeout(() => {
        if (mockWorker.onerror) {
          mockWorker.onerror({
            error: mockError,
          } as ErrorEvent)
        }
      }, 0)

      await expect(browserWorkerWrapper.run<string>(mockParam, index)).rejects.toThrow(
        'Worker execution failed',
      )
      expect(browserWorkerWrapper.status).toBe(WorkerStatusEnum.WAITING)
    })

    it('应该处理没有 error 对象的错误事件', async () => {
      const mockParam = {
        chunk: new ArrayBuffer(8),
        strategy: Strategy.md5,
      }
      const index = 0

      // 模拟没有 error 对象的错误事件
      setTimeout(() => {
        if (mockWorker.onerror) {
          mockWorker.onerror({} as ErrorEvent)
        }
      }, 0)

      await expect(browserWorkerWrapper.run<string>(mockParam, index)).rejects.toThrow(
        'Unknown worker error',
      )
      expect(browserWorkerWrapper.status).toBe(WorkerStatusEnum.WAITING)
    })

    it('应该正确处理 ArrayBuffer 传输', async () => {
      const mockParam = {
        chunk: new ArrayBuffer(16),
        strategy: Strategy.md5,
      }
      const index = 0

      // 模拟成功响应
      setTimeout(() => {
        if (mockWorker.onmessage) {
          mockWorker.onmessage({
            data: {
              result: 'test-result',
              chunk: mockParam.chunk,
            },
          } as MessageEvent)
        }
      }, 0)

      await browserWorkerWrapper.run<string>(mockParam, index)

      // 验证 postMessage 被调用时包含了正确的传输列表
      expect(mockWorker.postMessage).toHaveBeenCalledWith(mockParam, [mockParam.chunk])
    })

    it('应该处理多个连续的 run 调用', async () => {
      const mockParam1 = {
        chunk: new ArrayBuffer(8),
        strategy: Strategy.md5,
      }
      const mockParam2 = {
        chunk: new ArrayBuffer(16),
        strategy: Strategy.crc32,
      }

      // 第一个调用
      const promise1 = browserWorkerWrapper.run<string>(mockParam1, 0)

      // 模拟第一个响应
      if (mockWorker.onmessage) {
        mockWorker.onmessage({
          data: {
            result: 'result1',
            chunk: mockParam1.chunk,
          },
        } as MessageEvent)
      }

      const result1 = await promise1
      expect(result1).toBe('result1')

      // 第二个调用
      const promise2 = browserWorkerWrapper.run<string>(mockParam2, 1)

      // 模拟第二个响应
      if (mockWorker.onmessage) {
        mockWorker.onmessage({
          data: {
            result: 'result2',
            chunk: mockParam2.chunk,
          },
        } as MessageEvent)
      }

      const result2 = await promise2
      expect(result2).toBe('result2')
      expect(mockWorker.postMessage).toHaveBeenCalledTimes(2)
    })
  })

  describe('terminate 方法', () => {
    it('应该调用 worker 的 terminate 方法', () => {
      browserWorkerWrapper.terminate()
      expect(mockWorker.terminate).toHaveBeenCalledTimes(1)
    })
  })

  describe('状态管理', () => {
    it('应该在成功执行后重置状态为 WAITING', async () => {
      const mockParam = {
        chunk: new ArrayBuffer(8),
        strategy: Strategy.md5,
      }
      const index = 0

      setTimeout(() => {
        if (mockWorker.onmessage) {
          mockWorker.onmessage({
            data: {
              result: 'test-result',
              chunk: mockParam.chunk,
            },
          } as MessageEvent)
        }
      }, 0)

      await browserWorkerWrapper.run<string>(mockParam, index)
      expect(browserWorkerWrapper.status).toBe(WorkerStatusEnum.WAITING)
    })

    it('应该在错误后重置状态为 WAITING', async () => {
      const mockParam = {
        chunk: new ArrayBuffer(8),
        strategy: Strategy.md5,
      }
      const index = 0

      setTimeout(() => {
        if (mockWorker.onerror) {
          mockWorker.onerror({
            error: new Error('Test error'),
          } as ErrorEvent)
        }
      }, 0)

      try {
        await browserWorkerWrapper.run<string>(mockParam, index)
      } catch (error) {
        console.log(error)
      }

      expect(browserWorkerWrapper.status).toBe(WorkerStatusEnum.WAITING)
    })
  })

  describe('边界情况', () => {
    it('应该处理空的 ArrayBuffer', async () => {
      const mockParam = {
        chunk: new ArrayBuffer(0),
        strategy: Strategy.md5,
      }
      const index = 0

      setTimeout(() => {
        if (mockWorker.onmessage) {
          mockWorker.onmessage({
            data: {
              result: 'empty-result',
              chunk: mockParam.chunk,
            },
          } as MessageEvent)
        }
      }, 0)

      const result = await browserWorkerWrapper.run<string>(mockParam, index)
      expect(result).toBe('empty-result')
    })

    it('应该处理大型 ArrayBuffer', async () => {
      const mockParam = {
        chunk: new ArrayBuffer(1024 * 1024), // 1MB
        strategy: Strategy.md5,
      }
      const index = 0

      setTimeout(() => {
        if (mockWorker.onmessage) {
          mockWorker.onmessage({
            data: {
              result: 'large-result',
              chunk: mockParam.chunk,
            },
          } as MessageEvent)
        }
      }, 0)

      const result = await browserWorkerWrapper.run<string>(mockParam, index)
      expect(result).toBe('large-result')
    })
  })
})
