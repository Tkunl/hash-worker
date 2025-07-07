jest.doMock('../../../src/shared', () => {
  const actual = jest.requireActual('../../../src/shared')
  return {
    ...actual,
    initBufService: jest.fn(),
  }
})

const { WorkerService } = require('../../../src/shared/workerService')
const { Strategy } = require('../../../src/types')
const sharedModule = require('../../../src/shared')

// Mock BaseWorkerPool
class MockWorkerPool {
  exec = jest.fn()
  adjustPool = jest.fn()
  terminate = jest.fn()
}

describe('WorkerService', () => {
  let workerService: any
  let mockPool: MockWorkerPool

  beforeEach(() => {
    mockPool = new MockWorkerPool()
    workerService = new WorkerService(4, mockPool)
    jest.clearAllMocks()
  })

  describe('constructor', () => {
    it('应该正确初始化 WorkerService', () => {
      const maxWorkers = 8
      const pool = new MockWorkerPool()
      const service = new WorkerService(maxWorkers, pool)

      expect(service).toBeInstanceOf(WorkerService)
      // 由于 maxWorkers 是 protected 属性，我们通过其他方式验证
      expect(service.getHashForFiles).toBeDefined()
      expect(service.adjustSvcWorkerPool).toBeDefined()
      expect(service.terminate).toBeDefined()
    })
  })

  describe('getHashForFiles', () => {
    it('应该正确调用 pool.exec 并返回结果', async () => {
      const chunks = [new ArrayBuffer(8), new ArrayBuffer(16)]
      const strategy = Strategy.md5
      const expectedResult = ['hash1', 'hash2']

      mockPool.exec.mockResolvedValue(expectedResult)

      const result = await workerService.getHashForFiles(chunks, strategy)

      expect(sharedModule.initBufService).toHaveBeenCalledWith(chunks)
      expect(mockPool.exec).toHaveBeenCalledWith([
        { chunk: chunks[0], strategy },
        { chunk: chunks[1], strategy },
      ])
      expect(result).toEqual(expectedResult)
    })

    it('应该处理空数组的情况', async () => {
      const chunks: ArrayBuffer[] = []
      const strategy = Strategy.crc32
      const expectedResult: string[] = []

      mockPool.exec.mockResolvedValue(expectedResult)

      const result = await workerService.getHashForFiles(chunks, strategy)

      expect(sharedModule.initBufService).toHaveBeenCalledWith(chunks)
      expect(mockPool.exec).toHaveBeenCalledWith([])
      expect(result).toEqual(expectedResult)
    })

    it('应该处理单个 chunk 的情况', async () => {
      const chunks = [new ArrayBuffer(32)]
      const strategy = Strategy.xxHash64
      const expectedResult = ['single-hash']

      mockPool.exec.mockResolvedValue(expectedResult)

      const result = await workerService.getHashForFiles(chunks, strategy)

      expect(sharedModule.initBufService).toHaveBeenCalledWith(chunks)
      expect(mockPool.exec).toHaveBeenCalledWith([{ chunk: chunks[0], strategy }])
      expect(result).toEqual(expectedResult)
    })

    it('应该处理 mixed 策略', async () => {
      const chunks = [new ArrayBuffer(8), new ArrayBuffer(16), new ArrayBuffer(24)]
      const strategy = Strategy.mixed
      const expectedResult = ['mixed-hash1', 'mixed-hash2', 'mixed-hash3']

      mockPool.exec.mockResolvedValue(expectedResult)

      const result = await workerService.getHashForFiles(chunks, strategy)

      expect(sharedModule.initBufService).toHaveBeenCalledWith(chunks)
      expect(mockPool.exec).toHaveBeenCalledWith([
        { chunk: chunks[0], strategy },
        { chunk: chunks[1], strategy },
        { chunk: chunks[2], strategy },
      ])
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
      expect(sharedModule.initBufService).toHaveBeenCalledWith(chunks)
      expect(mockPool.exec).toHaveBeenCalledWith([{ chunk: chunks[0], strategy }])
    })
  })

  describe('adjustSvcWorkerPool', () => {
    it('应该正确调用 pool.adjustPool', () => {
      const workerCount = 6

      workerService.adjustSvcWorkerPool(workerCount)

      expect(mockPool.adjustPool).toHaveBeenCalledWith(workerCount)
    })

    it('应该处理增加 worker 数量的情况', () => {
      const newWorkerCount = 10

      workerService.adjustSvcWorkerPool(newWorkerCount)

      expect(mockPool.adjustPool).toHaveBeenCalledWith(newWorkerCount)
    })

    it('应该处理减少 worker 数量的情况', () => {
      const newWorkerCount = 2

      workerService.adjustSvcWorkerPool(newWorkerCount)

      expect(mockPool.adjustPool).toHaveBeenCalledWith(newWorkerCount)
    })

    it('应该处理 worker 数量为 0 的情况', () => {
      const newWorkerCount = 0

      workerService.adjustSvcWorkerPool(newWorkerCount)

      expect(mockPool.adjustPool).toHaveBeenCalledWith(newWorkerCount)
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

      mockPool.exec.mockResolvedValue(expectedResult)

      // 执行 hash 计算
      const result = await workerService.getHashForFiles(chunks, strategy)
      expect(result).toEqual(expectedResult)

      // 调整 worker 池大小
      workerService.adjustSvcWorkerPool(6)
      expect(mockPool.adjustPool).toHaveBeenCalledWith(6)

      // 终止服务
      workerService.terminate()
      expect(mockPool.terminate).toHaveBeenCalled()
    })

    it('应该能够处理不同策略的 hash 计算', async () => {
      const chunks = [new ArrayBuffer(32)]
      const strategies = [Strategy.md5, Strategy.crc32, Strategy.xxHash64, Strategy.mixed]

      for (const strategy of strategies) {
        const expectedResult = [`${strategy}-hash`]
        mockPool.exec.mockResolvedValue(expectedResult)

        const result = await workerService.getHashForFiles(chunks, strategy)
        expect(result).toEqual(expectedResult)
        expect(mockPool.exec).toHaveBeenCalledWith([{ chunk: chunks[0], strategy }])
      }
    })
  })
})
