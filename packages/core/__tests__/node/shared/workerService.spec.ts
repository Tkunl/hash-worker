// Mock the arrayBufferService module
jest.mock('../../../src/shared/arrayBufferService', () => ({
  initBufService: jest.fn(),
  clearBufService: jest.fn(),
}))

import { WorkerService } from '../../../src/shared/workerService'
import { Strategy } from '../../../src/types'
import * as arrayBufferService from '../../../src/shared/arrayBufferService'

// Mock BaseWorkerPool
class MockWorkerPool {
  exec = jest.fn()
  adjustPool = jest.fn()
  terminate = jest.fn()
  pool = []
  maxWorkerCount = 4
  taskQueue = []
  isProcessing = false
  getPoolStatus = jest.fn()
}

describe('WorkerService', () => {
  let workerService: any
  let mockPool: MockWorkerPool

  beforeEach(() => {
    mockPool = new MockWorkerPool()
    workerService = new WorkerService(mockPool as any)
    jest.clearAllMocks()
  })

  describe('constructor', () => {
    it('应该正确初始化 WorkerService', () => {
      const pool = new MockWorkerPool()
      const service = new WorkerService(pool as any)

      expect(service).toBeInstanceOf(WorkerService)
      expect(service.getHashForFiles).toBeDefined()
      expect(service.adjustWorkerPoolSize).toBeDefined()
      expect(service.terminate).toBeDefined()
      expect(service.isActive()).toBe(true)
    })
  })

  describe('getHashForFiles', () => {
    it('应该正确调用 pool.exec 并返回结果', async () => {
      const chunks = [new ArrayBuffer(8), new ArrayBuffer(16)]
      const strategy = Strategy.md5
      const expectedResult = ['hash1', 'hash2']

      mockPool.exec.mockResolvedValue([
        { success: true, data: 'hash1', index: 0 },
        { success: true, data: 'hash2', index: 1 },
      ])

      const result = await workerService.getHashForFiles(chunks, strategy)

      expect(arrayBufferService.initBufService).toHaveBeenCalledWith(chunks)
      expect(mockPool.exec).toHaveBeenCalledWith(
        [
          { chunk: chunks[0], strategy },
          { chunk: chunks[1], strategy },
        ],
        undefined,
      )
      expect(result).toEqual(expectedResult)
    })

    it('应该处理空数组的情况', async () => {
      const chunks: ArrayBuffer[] = []
      const strategy = Strategy.md5
      const expectedResult: string[] = []

      const result = await workerService.getHashForFiles(chunks, strategy)

      expect(result).toEqual(expectedResult)
      // 空数组情况下不会调用 initBufService 和 pool.exec
      expect(arrayBufferService.initBufService).not.toHaveBeenCalled()
      expect(mockPool.exec).not.toHaveBeenCalled()
    })

    it('应该处理单个 chunk 的情况', async () => {
      const chunks = [new ArrayBuffer(32)]
      const strategy = Strategy.xxHash128
      const expectedResult = ['single-hash']

      mockPool.exec.mockResolvedValue([{ success: true, data: 'single-hash', index: 0 }])

      const result = await workerService.getHashForFiles(chunks, strategy)

      expect(arrayBufferService.initBufService).toHaveBeenCalledWith(chunks)
      expect(mockPool.exec).toHaveBeenCalledWith([{ chunk: chunks[0], strategy }], undefined)
      expect(result).toEqual(expectedResult)
    })

    it('应该正确处理 pool.exec 抛出的错误', async () => {
      const chunks = [new ArrayBuffer(8)]
      const strategy = Strategy.md5
      const error = new Error('Worker execution failed')

      mockPool.exec.mockRejectedValue(error)

      await expect(workerService.getHashForFiles(chunks, strategy)).rejects.toThrow(
        'Worker execution failed',
      )
      expect(arrayBufferService.initBufService).toHaveBeenCalledWith(chunks)
      expect(mockPool.exec).toHaveBeenCalledWith([{ chunk: chunks[0], strategy }], undefined)
    })

    it('应该正确处理部分任务失败的情况', async () => {
      const chunks = [new ArrayBuffer(8), new ArrayBuffer(16)]
      const strategy = Strategy.md5

      mockPool.exec.mockResolvedValue([
        { success: true, data: 'hash1', index: 0 },
        { success: false, error: new Error('Task failed'), index: 1 },
      ])

      await expect(workerService.getHashForFiles(chunks, strategy)).rejects.toThrow(
        'Hash calculation failed for 1 chunks: Chunk 1: Task failed',
      )
      expect(arrayBufferService.initBufService).toHaveBeenCalledWith(chunks)
      expect(mockPool.exec).toHaveBeenCalledWith(
        [
          { chunk: chunks[0], strategy },
          { chunk: chunks[1], strategy },
        ],
        undefined,
      )
    })
  })

  describe('adjustWorkerPoolSize', () => {
    it('应该正确调用 pool.adjustPool', () => {
      const workerCount = 6

      workerService.adjustWorkerPoolSize(workerCount)

      expect(mockPool.adjustPool).toHaveBeenCalledWith(workerCount)
    })

    it('应该处理增加 worker 数量的情况', () => {
      const newWorkerCount = 10

      workerService.adjustWorkerPoolSize(newWorkerCount)

      expect(mockPool.adjustPool).toHaveBeenCalledWith(newWorkerCount)
    })

    it('应该处理减少 worker 数量的情况', () => {
      const newWorkerCount = 2

      workerService.adjustWorkerPoolSize(newWorkerCount)

      expect(mockPool.adjustPool).toHaveBeenCalledWith(newWorkerCount)
    })

    it('应该处理 worker 数量为 0 的情况', () => {
      const newWorkerCount = 0

      expect(() => workerService.adjustWorkerPoolSize(newWorkerCount)).toThrow(
        'Worker count must be at least 1',
      )
    })
  })

  describe('terminate', () => {
    it('应该正确调用 pool.terminate 并设置 pool 为 null', () => {
      workerService.terminate()

      expect(mockPool.terminate).toHaveBeenCalled()
      // 由于 pool 是 protected 属性，我们通过其他方式验证
      // 这里我们验证 terminate 方法被正确调用
    })

    it('应该处理 pool 为 null 的情况', () => {
      // 先终止一次
      workerService.terminate()
      expect(mockPool.terminate).toHaveBeenCalledTimes(1)

      // 再次终止，应该不会出错
      workerService.terminate()
      expect(mockPool.terminate).toHaveBeenCalledTimes(1) // 仍然只调用一次，因为第二次时 pool 已经是 null
    })
  })

  describe('集成测试', () => {
    it('应该能够完整地执行工作流程', async () => {
      const chunks = [new ArrayBuffer(8), new ArrayBuffer(16)]
      const strategy = Strategy.md5
      const expectedResult = ['hash1', 'hash2']

      mockPool.exec.mockResolvedValue([
        { success: true, data: 'hash1', index: 0 },
        { success: true, data: 'hash2', index: 1 },
      ])

      // 执行 hash 计算
      const result = await workerService.getHashForFiles(chunks, strategy)
      expect(result).toEqual(expectedResult)

      // 调整 worker 池大小
      workerService.adjustWorkerPoolSize(6)
      expect(mockPool.adjustPool).toHaveBeenCalledWith(6)

      // 终止服务
      workerService.terminate()
      expect(mockPool.terminate).toHaveBeenCalled()
    })

    it('应该能够处理不同策略的 hash 计算', async () => {
      const chunks = [new ArrayBuffer(32)]
      const strategies = [Strategy.md5, Strategy.xxHash128]

      for (const strategy of strategies) {
        const expectedResult = [`${strategy}-hash`]
        mockPool.exec.mockResolvedValue([{ success: true, data: `${strategy}-hash`, index: 0 }])

        const result = await workerService.getHashForFiles(chunks, strategy)
        expect(result).toEqual(expectedResult)
        expect(mockPool.exec).toHaveBeenCalledWith([{ chunk: chunks[0], strategy }], undefined)
      }
    })
  })
})
