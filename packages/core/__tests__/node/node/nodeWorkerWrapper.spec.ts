// Mock import.meta
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      url: 'https://test.com',
    },
  },
})

// Mock worker_threads 模块
jest.mock('worker_threads')

// Mock the arrayBufferService module
jest.mock('../../../src/shared/arrayBufferService', () => ({
  restoreBuf: jest.fn(),
  obtainBuf: jest.fn((param) => param.chunk),
}))

import { Worker as NodeWorker } from 'worker_threads'
import { NodeWorkerWrapper } from '../../../src/node/nodeWorkerWrapper'
import { Strategy, WorkerStatusEnum } from '../../../src/types'

const mockNodeWorker = NodeWorker as jest.MockedClass<typeof NodeWorker>

describe('NodeWorkerWrapper', () => {
  let nodeWorkerWrapper: NodeWorkerWrapper
  let mockWorkerInstance: jest.Mocked<NodeWorker>

  beforeEach(() => {
    jest.clearAllMocks()

    // 创建 mock worker 实例
    mockWorkerInstance = {
      setMaxListeners: jest.fn(),
      on: jest.fn().mockReturnThis(),
      postMessage: jest.fn(),
      terminate: jest.fn(),
      removeAllListeners: jest.fn(),
    } as any

    // Mock NodeWorker 构造函数
    mockNodeWorker.mockImplementation(() => mockWorkerInstance)

    // 创建 NodeWorkerWrapper 实例
    nodeWorkerWrapper = new NodeWorkerWrapper(mockWorkerInstance)
  })

  afterEach(() => {
    // 清理
    if (nodeWorkerWrapper) {
      nodeWorkerWrapper.terminate()
    }
  })

  describe('构造函数', () => {
    it('应该正确初始化 NodeWorkerWrapper', () => {
      expect(nodeWorkerWrapper).toBeInstanceOf(NodeWorkerWrapper)
      expect(nodeWorkerWrapper.status).toBe(WorkerStatusEnum.WAITING)
      expect(mockWorkerInstance.setMaxListeners).toHaveBeenCalledWith(1024)
    })

    it('应该为 worker 设置最大监听器数量', () => {
      expect(mockWorkerInstance.setMaxListeners).toHaveBeenCalledWith(1024)
    })
  })

  describe('run 方法', () => {
    it('应该正确执行任务并返回结果', async () => {
      const mockParam = {
        chunk: new ArrayBuffer(8),
        strategy: Strategy.md5,
      }
      const mockResult = 'test-hash-result'
      const index = 0

      // Mock worker 的消息响应
      let messageCallback: (data: any) => void

      mockWorkerInstance.on.mockImplementation((event, callback) => {
        if (event === 'message') {
          messageCallback = callback
        }
        return mockWorkerInstance
      })

      // 启动任务
      const runPromise = nodeWorkerWrapper.run(mockParam, index)

      // 验证状态和 postMessage 调用
      expect(nodeWorkerWrapper.status).toBe(WorkerStatusEnum.RUNNING)
      expect(mockWorkerInstance.postMessage).toHaveBeenCalledWith(mockParam, [mockParam.chunk])

      // 模拟成功响应
      messageCallback!({
        result: mockResult,
        chunk: mockParam.chunk,
      })

      const result = await runPromise

      expect(result).toBe(mockResult)
      expect(nodeWorkerWrapper.status).toBe(WorkerStatusEnum.WAITING)
    })

    it('应该正确处理错误情况', async () => {
      const mockParam = {
        chunk: new ArrayBuffer(8),
        strategy: Strategy.md5,
      }
      const mockError = new Error('Worker execution failed')
      const index = 1

      // Mock worker 的错误响应
      let errorCallback: (error: Error) => void

      mockWorkerInstance.on.mockImplementation((event, callback) => {
        if (event === 'error') {
          errorCallback = callback
        }
        return mockWorkerInstance
      })

      // 启动任务
      const runPromise = nodeWorkerWrapper.run(mockParam, index)

      // 验证状态
      expect(nodeWorkerWrapper.status).toBe(WorkerStatusEnum.RUNNING)

      // 模拟错误响应
      errorCallback!(mockError)

      await expect(runPromise).rejects.toThrow('Worker execution failed')
      expect(nodeWorkerWrapper.status).toBe(WorkerStatusEnum.WAITING)
    })

    it('应该正确传递参数给 worker', () => {
      const mockParam = {
        chunk: new ArrayBuffer(16),
        strategy: Strategy.md5,
      }
      const index = 2

      mockWorkerInstance.on.mockReturnThis()

      nodeWorkerWrapper.run(mockParam, index)

      expect(mockWorkerInstance.postMessage).toHaveBeenCalledWith(mockParam, [mockParam.chunk])
    })

    it('应该为不同索引设置正确的监听器', () => {
      const mockParam = {
        chunk: new ArrayBuffer(8),
        strategy: Strategy.xxHash128,
      }
      const index = 3

      mockWorkerInstance.on.mockReturnThis()

      nodeWorkerWrapper.run(mockParam, index)

      expect(mockWorkerInstance.on).toHaveBeenCalledWith('message', expect.any(Function))
      expect(mockWorkerInstance.on).toHaveBeenCalledWith('error', expect.any(Function))
    })
  })

  describe('消息处理', () => {
    it('应该正确处理包含结果的消息', async () => {
      const mockParam = {
        chunk: new ArrayBuffer(8),
        strategy: Strategy.md5,
      }
      const mockResult = 'success-hash'
      const index = 0

      let messageCallback: (data: any) => void

      mockWorkerInstance.on.mockImplementation((event, callback) => {
        if (event === 'message') {
          messageCallback = callback
        }
        return mockWorkerInstance
      })

      const runPromise = nodeWorkerWrapper.run(mockParam, index)

      // 模拟消息响应
      messageCallback!({
        result: mockResult,
        chunk: mockParam.chunk,
      })

      const result = await runPromise

      expect(result).toBe(mockResult)
      expect(nodeWorkerWrapper.status).toBe(WorkerStatusEnum.WAITING)
    })

    it('应该正确处理不同策略的消息', async () => {
      const strategies = [Strategy.md5, Strategy.xxHash128]

      for (const strategy of strategies) {
        const mockParam = {
          chunk: new ArrayBuffer(8),
          strategy,
        }
        const mockResult = `hash-${strategy}`
        const index = 0

        let messageCallback: (data: any) => void

        mockWorkerInstance.on.mockImplementation((event, callback) => {
          if (event === 'message') {
            messageCallback = callback
          }
          return mockWorkerInstance
        })

        const runPromise = nodeWorkerWrapper.run(mockParam, index)

        messageCallback!({
          result: mockResult,
          chunk: mockParam.chunk,
        })

        const result = await runPromise

        expect(result).toBe(mockResult)
        expect(nodeWorkerWrapper.status).toBe(WorkerStatusEnum.WAITING)
      }
    })
  })

  describe('错误处理', () => {
    it('应该正确处理不同类型的错误', async () => {
      const mockParam = {
        chunk: new ArrayBuffer(8),
        strategy: Strategy.md5,
      }
      const index = 0

      const errorTypes = [
        new Error('Network error'),
        new TypeError('Invalid parameter'),
        new RangeError('Out of range'),
      ]

      for (const error of errorTypes) {
        let errorCallback: (error: Error) => void

        mockWorkerInstance.on.mockImplementation((event, callback) => {
          if (event === 'error') {
            errorCallback = callback
          }
          return mockWorkerInstance
        })

        const runPromise = nodeWorkerWrapper.run(mockParam, index)

        errorCallback!(error)

        await expect(runPromise).rejects.toThrow(error.message)
        expect(nodeWorkerWrapper.status).toBe(WorkerStatusEnum.WAITING)
      }
    })

    it('应该在错误后重置状态为等待', async () => {
      const mockParam = {
        chunk: new ArrayBuffer(8),
        strategy: Strategy.md5,
      }
      const mockError = new Error('Test error')
      const index = 0

      let errorCallback: (error: Error) => void

      mockWorkerInstance.on.mockImplementation((event, callback) => {
        if (event === 'error') {
          errorCallback = callback
        }
        return mockWorkerInstance
      })

      const runPromise = nodeWorkerWrapper.run(mockParam, index)

      // 验证运行状态
      expect(nodeWorkerWrapper.status).toBe(WorkerStatusEnum.RUNNING)

      errorCallback!(mockError)

      await expect(runPromise).rejects.toThrow('Test error')
      expect(nodeWorkerWrapper.status).toBe(WorkerStatusEnum.WAITING)
    })
  })

  describe('状态管理', () => {
    it('应该在任务开始时设置状态为运行中', () => {
      const mockParam = {
        chunk: new ArrayBuffer(8),
        strategy: Strategy.md5,
      }
      const index = 0

      mockWorkerInstance.on.mockReturnThis()

      nodeWorkerWrapper.run(mockParam, index)

      expect(nodeWorkerWrapper.status).toBe(WorkerStatusEnum.RUNNING)
    })

    it('应该在任务完成后重置状态为等待', async () => {
      const mockParam = {
        chunk: new ArrayBuffer(8),
        strategy: Strategy.md5,
      }
      const mockResult = 'test-result'
      const index = 0

      let messageCallback: (data: any) => void

      mockWorkerInstance.on.mockImplementation((event, callback) => {
        if (event === 'message') {
          messageCallback = callback
        }
        return mockWorkerInstance
      })

      const runPromise = nodeWorkerWrapper.run(mockParam, index)

      // 验证运行状态
      expect(nodeWorkerWrapper.status).toBe(WorkerStatusEnum.RUNNING)

      messageCallback!({
        result: mockResult,
        chunk: mockParam.chunk,
      })

      await runPromise

      expect(nodeWorkerWrapper.status).toBe(WorkerStatusEnum.WAITING)
    })
  })

  describe('terminate 方法', () => {
    it('应该调用 worker 的 terminate 方法', () => {
      nodeWorkerWrapper.terminate()

      expect(mockWorkerInstance.terminate).toHaveBeenCalled()
    })
  })

  describe('并发执行', () => {
    it('应该能够处理多个并发任务', async () => {
      const mockParams = [
        { chunk: new ArrayBuffer(8), strategy: Strategy.md5 },
        { chunk: new ArrayBuffer(16), strategy: Strategy.md5 },
        { chunk: new ArrayBuffer(32), strategy: Strategy.xxHash128 },
      ]

      const mockResults = ['hash1', 'hash2', 'hash3']

      // 创建多个 worker wrapper 实例
      const wrappers = mockParams.map(() => {
        const mockWorker = {
          setMaxListeners: jest.fn(),
          on: jest.fn().mockReturnThis(),
          postMessage: jest.fn(),
          terminate: jest.fn(),
          removeAllListeners: jest.fn(),
        } as any

        return new NodeWorkerWrapper(mockWorker)
      })

      // 模拟每个 wrapper 的成功执行
      const promises = wrappers.map((wrapper, index) => {
        let messageCallback: (data: any) => void
        ;(wrapper['worker'] as any).on.mockImplementation((event: string, callback: any) => {
          if (event === 'message') {
            messageCallback = callback
          }
          return wrapper['worker']
        })

        const runPromise = wrapper.run(mockParams[index], index)

        // 延迟模拟消息响应
        setTimeout(() => {
          messageCallback!({
            result: mockResults[index],
            chunk: mockParams[index].chunk,
          })
        }, 10)

        return runPromise
      })

      const results = await Promise.all(promises)

      expect(results).toEqual(mockResults)

      // 清理
      wrappers.forEach((wrapper) => wrapper.terminate())
    })
  })

  describe('createTimeout 方法', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('应该创建超时计时器并在超时时调用 handleError', async () => {
      const mockParam = {
        chunk: new ArrayBuffer(8),
        strategy: Strategy.md5,
      }
      const index = 0
      const timeoutMs = 1000

      // Mock worker 的消息响应以确保不会正常完成
      mockWorkerInstance.on.mockReturnThis()

      // 开始执行任务，但不让它正常完成
      const runPromise = nodeWorkerWrapper.run(mockParam, index, { timeout: timeoutMs })

      // 验证任务已开始运行
      expect(nodeWorkerWrapper.status).toBe(WorkerStatusEnum.RUNNING)

      // 快进时间以触发超时
      jest.advanceTimersByTime(timeoutMs)

      // 验证任务拒绝并包含超时错误信息
      await expect(runPromise).rejects.toThrow(`Worker task timeout after ${timeoutMs}ms`)
      // 注意：由于 setError() 方法会调用 cleanup()，状态会重置为 WAITING
      expect(nodeWorkerWrapper.status).toBe(WorkerStatusEnum.WAITING)
    })

    it('应该在任务 ID 匹配时触发超时处理', (done) => {
      const mockParam = {
        chunk: new ArrayBuffer(8),
        strategy: Strategy.md5,
      }
      const index = 0
      const timeoutMs = 500

      mockWorkerInstance.on.mockReturnThis()

      const runPromise = nodeWorkerWrapper.run(mockParam, index, { timeout: timeoutMs })

      // 验证当前任务 ID 已设置
      expect((nodeWorkerWrapper as any).currentTaskId).toBeTruthy()

      runPromise.catch((error) => {
        expect(error.message).toContain('Worker task timeout after')
        expect(error.message).toContain(`${timeoutMs}ms`)
        done()
      })

      // 触发超时
      jest.advanceTimersByTime(timeoutMs)
    })

    it('应该在任务正常完成后不触发超时', async () => {
      const mockParam = {
        chunk: new ArrayBuffer(8),
        strategy: Strategy.md5,
      }
      const mockResult = 'test-hash-result'
      const index = 0
      const timeoutMs = 1000

      let messageCallback: (data: any) => void

      mockWorkerInstance.on.mockImplementation((event, callback) => {
        if (event === 'message') {
          messageCallback = callback
        }
        return mockWorkerInstance
      })

      const runPromise = nodeWorkerWrapper.run(mockParam, index, { timeout: timeoutMs })

      // 立即完成任务（在超时之前）
      messageCallback!({
        result: mockResult,
        chunk: mockParam.chunk,
      })

      const result = await runPromise
      expect(result).toBe(mockResult)
      expect(nodeWorkerWrapper.status).toBe(WorkerStatusEnum.WAITING)

      // 验证即使时间过去了，也不会触发超时错误
      jest.advanceTimersByTime(timeoutMs)
      // 如果没有抛出错误，测试通过
    })

    it('应该正确清理超时计时器', () => {
      const mockParam = {
        chunk: new ArrayBuffer(8),
        strategy: Strategy.md5,
      }
      const index = 0
      const timeoutMs = 1000

      let messageCallback: (data: any) => void

      mockWorkerInstance.on.mockImplementation((event, callback) => {
        if (event === 'message') {
          messageCallback = callback
        }
        return mockWorkerInstance
      })

      const runPromise = nodeWorkerWrapper.run(mockParam, index, { timeout: timeoutMs })

      // 验证超时 ID 已设置
      expect((nodeWorkerWrapper as any).timeoutId).toBeTruthy()

      // 完成任务
      messageCallback!({
        result: 'test-result',
        chunk: mockParam.chunk,
      })

      return runPromise.then(() => {
        // 验证超时 ID 已清理
        expect((nodeWorkerWrapper as any).timeoutId).toBeNull()
      })
    })

    it('应该在不同的任务 ID 时不触发超时', async () => {
      const timeoutMs = 500
      const mockReject = jest.fn()

      // 获取一个假的任务 ID
      const fakeTaskId = 'fake-task-id'

      // 设置当前任务 ID 为不同的值
      ;(nodeWorkerWrapper as any).currentTaskId = 'different-task-id'

      // 直接测试 createTimeout 方法
      const timeoutId = (nodeWorkerWrapper as any).createTimeout(timeoutMs, mockReject, fakeTaskId)

      // 快进时间触发超时
      jest.advanceTimersByTime(timeoutMs)

      // 由于当前任务 ID 不匹配，reject 不应该被调用
      expect(mockReject).not.toHaveBeenCalled()

      // 清理
      clearTimeout(timeoutId)
    })
  })
})
