// Mock the arrayBufferService module
jest.mock('../../../src/shared/arrayBufferService', () => ({
  restoreBuf: jest.fn(),
}))

import { BaseWorkerWrapper } from '../../../src/shared/baseWorkerWrapper'
import { WorkerStatusEnum, WorkerReq, WorkerRes } from '../../../src/types'

// 创建一个具体的实现类用于测试
class TestWorkerWrapper extends BaseWorkerWrapper<{ terminate: () => void }, NodeJS.Timeout> {
  run<T>(param: WorkerReq, index: number): Promise<T> {
    return new Promise((resolve, reject) => {
      // 模拟异步操作
      setTimeout(() => {
        const mockResult = { data: 'test result' } as T
        const mockResponse: WorkerRes<T> = {
          result: mockResult,
          chunk: param.chunk,
        }
        this.handleMessage(mockResponse, resolve, reject, index)
      }, 10)
    })
  }

  // 实现抽象方法
  protected cleanupEventListeners(): void {
    // 测试用的空实现
  }

  protected createTimeout(
    timeoutMs: number,
    reject: (reason?: any) => void,
    taskId: string,
  ): NodeJS.Timeout {
    return setTimeout(() => {
      reject(new Error(`Task ${taskId} timed out after ${timeoutMs}ms`))
    }, timeoutMs)
  }

  protected clearTimeout(timeoutId: NodeJS.Timeout): void {
    clearTimeout(timeoutId)
  }

  // 暴露受保护的方法用于测试
  public testHandleMessage(
    workerRes: WorkerRes<string>,
    resolve: (value: any) => void,
    reject: (reason?: any) => void,
    index: number,
  ) {
    this.handleMessage(workerRes, resolve, reject, index)
  }

  public testHandleError(reject: (reason?: any) => void, error: Error) {
    this.handleError(reject, error)
  }
}

describe('BaseWorkerWrapper', () => {
  let mockWorker: { terminate: () => void }
  let wrapper: TestWorkerWrapper

  beforeEach(() => {
    mockWorker = {
      terminate: jest.fn(),
    }
    wrapper = new TestWorkerWrapper(mockWorker)
  })

  describe('constructor', () => {
    it('应该正确初始化状态和worker', () => {
      expect(wrapper.status).toBe(WorkerStatusEnum.WAITING)
      expect((wrapper as any).worker).toBe(mockWorker)
    })
  })

  describe('run', () => {
    it('应该能够运行并返回结果', async () => {
      const mockParam: WorkerReq = {
        chunk: new ArrayBuffer(8),
        strategy: 'md5' as any,
      }
      const index = 0

      const result = await wrapper.run(mockParam, index)

      expect(result).toEqual({ data: 'test result' })
    })

    it('应该在运行过程中更新状态', async () => {
      const mockParam: WorkerReq = {
        chunk: new ArrayBuffer(8),
        strategy: 'md5' as any,
      }
      const index = 0

      // 创建一个新的包装器来测试状态变化
      const testWrapper = new TestWorkerWrapper(mockWorker)

      const runPromise = testWrapper.run(mockParam, index)

      // 等待异步操作完成
      await runPromise

      // 运行完成后状态应该回到 WAITING
      expect(testWrapper.status).toBe(WorkerStatusEnum.WAITING)
    })
  })

  describe('terminate', () => {
    it('应该调用worker的terminate方法', () => {
      wrapper.terminate()
      expect(mockWorker.terminate).toHaveBeenCalledTimes(1)
    })
  })

  describe('handleMessage', () => {
    it('应该正确处理消息并更新状态', () => {
      const mockResolve = jest.fn()
      const mockReject = jest.fn()
      const mockResponse: WorkerRes<string> = {
        result: 'test result',
        chunk: new ArrayBuffer(8),
      }
      const index = 0

      wrapper.testHandleMessage(mockResponse, mockResolve, mockReject, index)

      expect(wrapper.status).toBe(WorkerStatusEnum.WAITING)
      expect(mockResolve).toHaveBeenCalledWith('test result')
    })
  })

  describe('handleError', () => {
    it('应该正确处理错误并更新状态', () => {
      const mockReject = jest.fn()
      const testError = new Error('Test error')

      wrapper.testHandleError(mockReject, testError)

      expect(wrapper.status).toBe(WorkerStatusEnum.WAITING)
      expect(mockReject).toHaveBeenCalledWith(testError)
    })
  })

  describe('WorkerStatusEnum', () => {
    it('应该包含正确的状态值', () => {
      expect(WorkerStatusEnum.RUNNING).toBe('running')
      expect(WorkerStatusEnum.WAITING).toBe('waiting')
    })
  })

  describe('类型兼容性', () => {
    it('应该能够接受任何具有terminate方法的worker', () => {
      const customWorker = {
        terminate: () => console.log('custom terminate'),
        customMethod: () => 'custom',
      }

      const customWrapper = new TestWorkerWrapper(customWorker)
      expect((customWrapper as any).worker).toBe(customWorker)
    })
  })
})
