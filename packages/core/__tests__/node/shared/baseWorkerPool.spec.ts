import { BaseWorkerPool, BaseWorkerWrapper } from '../../../src/shared'
import { WorkerReq, WorkerStatusEnum } from '../../../src/types'

// 创建一个具体的实现类用于测试
class TestWorkerWrapper extends BaseWorkerWrapper<{ terminate: () => void }> {
  constructor(worker: { terminate: () => void }) {
    super(worker)
  }

  run<T>(param: WorkerReq, index: number): Promise<T> {
    return new Promise((resolve, reject) => {
      // 模拟异步操作
      setTimeout(() => {
        if (param.chunk.byteLength === 0) {
          reject(new Error('Empty chunk'))
        } else {
          const mockResult = `result_${index}` as T
          resolve(mockResult)
        }
      }, 10)
    })
  }

  protected cleanupEventListeners(): void {
    // 在测试环境中，不需要清理事件监听器
  }

  protected createTimeout(
    timeoutMs: number,
    reject: (reason?: any) => void,
    taskId: string,
  ): NodeJS.Timeout {
    return setTimeout(() => {
      reject(new Error(`Task ${taskId} timeout after ${timeoutMs}ms`))
    }, timeoutMs)
  }

  protected clearTimeout(timeoutId: NodeJS.Timeout): void {
    clearTimeout(timeoutId)
  }
}

// 创建一个具体的 BaseWorkerPool 实现用于测试
class TestWorkerPool extends BaseWorkerPool {
  createWorker(): BaseWorkerWrapper {
    return new TestWorkerWrapper({
      terminate: jest.fn(),
    })
  }
}

describe('BaseWorkerPool', () => {
  let workerPool: TestWorkerPool

  beforeEach(() => {
    workerPool = new TestWorkerPool(3)
  })

  describe('构造函数', () => {
    it('应该正确初始化最大工作线程数', () => {
      expect(workerPool.maxWorkerCount).toBe(3)
    })

    it('应该创建指定数量的工作线程', () => {
      expect(workerPool.pool.length).toBe(3)
    })

    it('应该创建正确类型的工作线程包装器', () => {
      workerPool.pool.forEach((worker) => {
        expect(worker).toBeInstanceOf(TestWorkerWrapper)
        expect(worker.status).toBe(WorkerStatusEnum.WAITING)
      })
    })
  })

  describe('exec', () => {
    it('应该能够执行单个任务', async () => {
      const params: WorkerReq[] = [
        {
          chunk: new ArrayBuffer(8),
          strategy: 'md5' as any,
        },
      ]

      const results = await workerPool.exec<string>(params)

      expect(results).toHaveLength(1)
      expect(results[0]).toEqual({
        success: true,
        data: 'result_0',
        index: 0,
      })
    })

    it('应该能够执行多个任务', async () => {
      const params: WorkerReq[] = [
        {
          chunk: new ArrayBuffer(8),
          strategy: 'md5' as any,
        },
        {
          chunk: new ArrayBuffer(8),
          strategy: 'crc32' as any,
        },
        {
          chunk: new ArrayBuffer(8),
          strategy: 'xxHash64' as any,
        },
      ]

      const results = await workerPool.exec<string>(params)

      expect(results).toHaveLength(3)
      expect(results[0]).toEqual({
        success: true,
        data: 'result_0',
        index: 0,
      })
      expect(results[1]).toEqual({
        success: true,
        data: 'result_1',
        index: 1,
      })
      expect(results[2]).toEqual({
        success: true,
        data: 'result_2',
        index: 2,
      })
    })

    it('应该能够处理任务数量超过最大工作线程数的情况', async () => {
      const params: WorkerReq[] = Array.from({ length: 5 }, () => ({
        chunk: new ArrayBuffer(8),
        strategy: 'md5' as any,
      }))

      const results = await workerPool.exec<string>(params)

      expect(results).toHaveLength(5)
      results.forEach((result, index) => {
        expect(result).toEqual({
          success: true,
          data: `result_${index}`,
          index,
        })
      })
    })

    it('应该能够处理任务执行失败的情况', async () => {
      const params: WorkerReq[] = [
        {
          chunk: new ArrayBuffer(0), // 空 chunk 会触发错误
          strategy: 'md5' as any,
        },
        {
          chunk: new ArrayBuffer(8),
          strategy: 'crc32' as any,
        },
      ]

      const results = await workerPool.exec<string>(params)

      expect(results).toHaveLength(2)

      // 检查第一个任务失败
      expect(results[0]).toEqual({
        success: false,
        error: expect.any(Error),
        index: 0,
      })
      if (!results[0].success) {
        expect(results[0].error.message).toBe('Empty chunk')
      }

      // 检查第二个任务成功
      expect(results[1]).toEqual({
        success: true,
        data: 'result_1',
        index: 1,
      })
    })

    it('应该保持结果的原始顺序', async () => {
      const params: WorkerReq[] = Array.from({ length: 3 }, () => ({
        chunk: new ArrayBuffer(8),
        strategy: 'md5' as any,
      }))

      const results = await workerPool.exec<string>(params)

      // 结果应该按照原始参数的顺序返回
      expect(results).toHaveLength(3)
      results.forEach((result, index) => {
        expect(result).toEqual({
          success: true,
          data: `result_${index}`,
          index,
        })
      })
    })
  })

  describe('adjustPool', () => {
    it('应该能够增加工作线程数量', () => {
      const initialCount = workerPool.pool.length
      workerPool.adjustPool(5)

      expect(workerPool.pool.length).toBe(5)
      expect(workerPool.pool.length).toBeGreaterThan(initialCount)
    })

    it('应该能够减少工作线程数量', () => {
      // 确保所有工作线程都处于等待状态，这样才能被移除
      workerPool.pool.forEach((worker) => {
        worker.status = WorkerStatusEnum.WAITING
      })

      workerPool.adjustPool(2)

      expect(workerPool.pool.length).toBe(2)
      expect(workerPool.maxWorkerCount).toBe(2)
    })

    it('当减少工作线程数量时，应该只终止等待状态的工作线程', () => {
      // 先增加一些工作线程
      workerPool.adjustPool(5)
      expect(workerPool.pool.length).toBe(5)

      // 将一些工作线程设置为运行状态
      workerPool.pool[0].status = WorkerStatusEnum.RUNNING
      workerPool.pool[1].status = WorkerStatusEnum.RUNNING
      // 确保其他工作线程处于等待状态
      workerPool.pool[2].status = WorkerStatusEnum.WAITING
      workerPool.pool[3].status = WorkerStatusEnum.WAITING
      workerPool.pool[4].status = WorkerStatusEnum.WAITING

      workerPool.adjustPool(3)

      // 应该减少到3个worker，只移除等待状态的worker
      expect(workerPool.pool.length).toBe(3)
      expect(workerPool.maxWorkerCount).toBe(3)
    })

    it('当工作线程数量相同时，不应该做任何改变', () => {
      const initialCount = workerPool.pool.length
      const terminateSpy = jest.spyOn(workerPool.pool[0], 'terminate')

      workerPool.adjustPool(initialCount)

      expect(workerPool.pool.length).toBe(initialCount)
      expect(terminateSpy).not.toHaveBeenCalled()
    })

    it('应该创建正确类型的新工作线程', () => {
      workerPool.adjustPool(5)

      workerPool.pool.forEach((worker) => {
        expect(worker).toBeInstanceOf(TestWorkerWrapper)
      })
    })
  })

  describe('terminate', () => {
    it('应该终止所有工作线程', () => {
      const terminateSpies = workerPool.pool.map((worker) => jest.spyOn(worker, 'terminate'))

      workerPool.terminate()

      terminateSpies.forEach((spy) => {
        expect(spy).toHaveBeenCalledTimes(1)
      })
    })

    it('应该能够处理空池的情况', () => {
      const emptyPool = new TestWorkerPool(0)
      expect(() => emptyPool.terminate()).not.toThrow()
    })
  })

  describe('边界情况', () => {
    it('应该能够处理空任务列表', async () => {
      const results = await workerPool.exec<string>([])
      expect(results).toEqual([])
    })

    it('应该能够处理最大工作线程数为0的情况', () => {
      const zeroWorkerPool = new TestWorkerPool(0)
      expect(zeroWorkerPool.pool.length).toBe(0)
      expect(zeroWorkerPool.maxWorkerCount).toBe(0)
    })

    it('应该能够处理大量任务的情况', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const params: WorkerReq[] = Array.from({ length: 10 }, (_, i) => ({
        chunk: new ArrayBuffer(8),
        strategy: 'md5' as any,
      }))

      const results = await workerPool.exec<string>(params)

      expect(results).toHaveLength(10)
      results.forEach((result, index) => {
        expect(result).toEqual({
          success: true,
          data: `result_${index}`,
          index,
        })
      })
    })
  })

  describe('并发控制', () => {
    it('应该正确管理工作线程状态', async () => {
      const params: WorkerReq[] = [
        {
          chunk: new ArrayBuffer(8),
          strategy: 'md5' as any,
        },
      ]

      // 直接检查执行前和执行后的状态
      expect(workerPool.pool.every((w) => w.status === WorkerStatusEnum.WAITING)).toBe(true)

      const results = await workerPool.exec<string>(params)

      // 执行完成后，所有工作线程应该回到等待状态
      expect(workerPool.pool.every((w) => w.status === WorkerStatusEnum.WAITING)).toBe(true)
      expect(results[0]).toEqual({
        success: true,
        data: 'result_0',
        index: 0,
      })
    })

    it('应该能够获取池状态信息', () => {
      const status = workerPool.getPoolStatus()

      expect(status).toEqual({
        totalWorkers: 3,
        runningWorkers: 0,
        waitingWorkers: 3,
        errorWorkers: 0,
        queuedTasks: 0,
        isProcessing: false,
        runningTasksInfo: [],
      })
    })
  })
})
