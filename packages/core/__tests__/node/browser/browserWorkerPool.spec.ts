import { BrowserWorkerPool } from '../../../src/browser/browserWorkerPool'
import { BrowserWorkerWrapper } from '../../../src/browser/browserWorkerWrapper'
import { Strategy, WorkerStatusEnum } from '../../../src/types'

// Mock Worker
class MockWorker {
  onmessage: ((event: MessageEvent) => void) | null = null
  onerror: ((event: ErrorEvent) => void) | null = null
  postMessage = jest.fn()
  terminate = jest.fn()
}

// Mock URL.createObjectURL
const mockCreateObjectURL = jest.fn()
const mockRevokeObjectURL = jest.fn()

// Mock import.meta.url
const mockImportMetaUrl = 'https://test.com/browserWorkerPool.spec.ts'

// 全局 Mock
global.Worker = jest.fn().mockImplementation(() => new MockWorker()) as any
global.URL.createObjectURL = mockCreateObjectURL
global.URL.revokeObjectURL = mockRevokeObjectURL

// Mock import.meta
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      url: mockImportMetaUrl,
    },
  },
  writable: true,
})

describe('BrowserWorkerPool', () => {
  let workerPool: BrowserWorkerPool

  beforeEach(() => {
    jest.clearAllMocks()
    workerPool = new BrowserWorkerPool(2)
  })

  afterEach(() => {
    workerPool.terminate()
  })

  describe('构造函数', () => {
    it('应该正确初始化 worker 池', () => {
      expect(workerPool.maxWorkerCount).toBe(2)
      expect(workerPool.pool).toHaveLength(2)
    })

    it('应该创建指定数量的 BrowserWorkerWrapper 实例', () => {
      workerPool.pool.forEach((worker: BrowserWorkerWrapper) => {
        expect(worker).toBeInstanceOf(BrowserWorkerWrapper)
      })
    })

    it('应该使用不同的 maxWorkerCount 初始化', () => {
      const poolWith3Workers = new BrowserWorkerPool(3)
      expect(poolWith3Workers.maxWorkerCount).toBe(3)
      expect(poolWith3Workers.pool).toHaveLength(3)
      poolWith3Workers.terminate()
    })
  })

  describe('createWorker', () => {
    it('应该创建 BrowserWorkerWrapper 实例', () => {
      const worker = workerPool.createWorker()
      expect(worker).toBeInstanceOf(BrowserWorkerWrapper)
    })

    it('应该使用正确的 Worker 构造函数参数', () => {
      const createWorkerSpy = jest.spyOn(workerPool, 'createWorker')
      workerPool.createWorker()

      expect(createWorkerSpy).toHaveBeenCalledTimes(1)
      // 验证 Worker 被正确创建
      expect(global.Worker).toHaveBeenCalled()
    })

    it('应该为每个 worker 创建独立的 Worker 实例', () => {
      const worker1 = workerPool.createWorker()
      const worker2 = workerPool.createWorker()

      expect(worker1).not.toBe(worker2)
      // 通过调用 terminate 方法来验证它们是不同的实例
      const terminateSpy1 = jest.spyOn(worker1, 'terminate')
      const terminateSpy2 = jest.spyOn(worker2, 'terminate')

      worker1.terminate()
      worker2.terminate()

      expect(terminateSpy1).toHaveBeenCalledTimes(1)
      expect(terminateSpy2).toHaveBeenCalledTimes(1)
    })
  })

  describe('继承的方法', () => {
    describe('exec', () => {
      it('应该能够执行任务', async () => {
        const mockData = new ArrayBuffer(8)
        const params = [
          { chunk: mockData, strategy: Strategy.md5 },
          { chunk: mockData, strategy: Strategy.md5 },
        ]

        // Mock worker 响应
        const mockResults = ['hash1', 'hash2']

        workerPool.pool.forEach((worker: BrowserWorkerWrapper) => {
          jest.spyOn(worker, 'run').mockImplementation((param, taskIndex) => {
            return Promise.resolve(mockResults[taskIndex as number] as any)
          })
        })

        const results = await workerPool.exec(params)

        expect(results).toHaveLength(2)
      })

      it('应该处理任务数量超过 worker 数量的情况', async () => {
        const mockData = new ArrayBuffer(8)
        const params = [
          { chunk: mockData, strategy: Strategy.md5 },
          { chunk: mockData, strategy: Strategy.xxHash128 },
        ]

        const mockResults = ['hash1', 'hash2']
        let callIndex = 0

        workerPool.pool.forEach((worker: BrowserWorkerWrapper) => {
          jest.spyOn(worker, 'run').mockImplementation(() => {
            return Promise.resolve(mockResults[callIndex++] as any)
          })
        })

        const results = await workerPool.exec(params)

        expect(results).toHaveLength(2)
      })

      it('应该处理 worker 执行失败的情况', async () => {
        const mockData = new ArrayBuffer(8)
        const params = [
          { chunk: mockData, strategy: Strategy.md5 },
          { chunk: mockData, strategy: Strategy.md5 },
        ]

        const error = new Error('Worker execution failed')
        workerPool.pool.forEach((worker: BrowserWorkerWrapper) => {
          jest.spyOn(worker, 'run').mockRejectedValue(error)
        })

        const results = await workerPool.exec(params)

        expect(results).toHaveLength(2)
      })
    })

    describe('adjustPool', () => {
      it('应该增加 worker 数量', () => {
        const initialCount = workerPool.pool.length
        workerPool.adjustPool(4)

        expect(workerPool.pool.length).toBe(4)
        expect(workerPool.pool.length).toBeGreaterThan(initialCount)
      })

      it('应该减少 worker 数量', () => {
        // 确保所有 worker 都是等待状态，这样才能被移除
        workerPool.pool.forEach((worker: BrowserWorkerWrapper) => {
          worker.status = WorkerStatusEnum.WAITING
        })

        workerPool.adjustPool(1)

        expect(workerPool.pool.length).toBe(1)
        expect(workerPool.maxWorkerCount).toBe(1)
      })

      it('应该保持 worker 数量不变', () => {
        const initialCount = workerPool.pool.length
        workerPool.adjustPool(initialCount)

        expect(workerPool.pool.length).toBe(initialCount)
      })

      it('应该只终止等待状态的 worker', () => {
        // 设置一些 worker 为运行状态
        workerPool.pool[0].status = WorkerStatusEnum.RUNNING
        workerPool.pool[1].status = WorkerStatusEnum.WAITING

        const terminateSpy = jest.spyOn(workerPool.pool[1], 'terminate')

        workerPool.adjustPool(1)

        // 应该减少到1个worker，只移除等待状态的worker
        expect(workerPool.pool.length).toBe(1)
        expect(workerPool.maxWorkerCount).toBe(1)
        expect(terminateSpy).toHaveBeenCalled()
      })
    })

    describe('terminate', () => {
      it('应该终止所有 worker', () => {
        const terminateSpies = workerPool.pool.map((worker: BrowserWorkerWrapper) =>
          jest.spyOn(worker, 'terminate'),
        )

        workerPool.terminate()

        terminateSpies.forEach((spy: jest.SpyInstance) => {
          expect(spy).toHaveBeenCalledTimes(1)
        })
      })

      it('应该清空 worker 池', () => {
        workerPool.terminate()
        expect(workerPool.pool).toHaveLength(0)
      })
    })
  })

  describe('集成测试', () => {
    it('应该能够创建、调整和终止 worker 池', () => {
      // 创建
      expect(workerPool.pool).toHaveLength(2)

      // 调整 - 增加 worker 数量
      workerPool.adjustPool(3)
      expect(workerPool.pool).toHaveLength(3)

      // 调整 - 减少 worker 数量
      workerPool.pool.forEach((worker: BrowserWorkerWrapper) => {
        worker.status = WorkerStatusEnum.WAITING
      })
      workerPool.adjustPool(1)
      expect(workerPool.pool).toHaveLength(1)

      // 终止 - 应该清空数组
      workerPool.terminate()
      expect(workerPool.pool).toHaveLength(0)
    })

    it('应该正确处理并发任务执行', async () => {
      const mockData = new ArrayBuffer(8)
      const params = [
        { chunk: mockData, strategy: Strategy.md5 },
        { chunk: mockData, strategy: Strategy.xxHash128 },
      ]

      const executionOrder: number[] = []
      workerPool.pool.forEach((worker: BrowserWorkerWrapper, index: number) => {
        jest.spyOn(worker, 'run').mockImplementation(async (param, taskIndex) => {
          executionOrder.push(index)
          // 模拟不同的执行时间
          await new Promise((resolve) => setTimeout(resolve, Math.random() * 100))
          return `result-${taskIndex}` as any
        })
      })

      const results = await workerPool.exec(params)

      expect(results).toHaveLength(2)

      // 验证 worker 被使用
      expect(executionOrder.length).toBeGreaterThan(0)
    })
  })
})
