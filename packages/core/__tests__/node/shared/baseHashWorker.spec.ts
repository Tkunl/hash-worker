import { BaseHashWorker } from '../../../src/shared/baseHashWorker'
import { WorkerService } from '../../../src/shared/workerService'
import { Config, FileMetaInfo, HashWorkerOptions, Strategy } from '../../../src/types'

// 创建一个具体的测试实现类
class TestHashWorker extends BaseHashWorker {
  protected normalizeParams(param: HashWorkerOptions): Required<HashWorkerOptions> {
    const baseConfig = {
      chunkSize: 1,
      workerCount: 2,
      strategy: Strategy.md5,
      borderCount: 10,
      isCloseWorkerImmediately: false,
      isShowLog: false,
    }

    if ('file' in param) {
      return {
        config: {
          ...baseConfig,
          ...param.config,
        },
        file: param.file!,
        filePath: undefined as never,
      }
    } else {
      return {
        config: {
          ...baseConfig,
          ...param.config,
        },
        file: undefined as never,
        filePath: param.filePath!,
      }
    }
  }

  protected async processFile({
    file,
    filePath,
    config,
  }: {
    file?: File
    filePath?: string
    config: Required<Config>
  }): Promise<{ chunksBlob?: Blob[]; chunksHash: string[]; fileHash: string }> {
    // 模拟处理文件，使用参数避免 linter 警告
    void file
    void filePath
    void config
    // 增加1ms延迟，避免overTime为0
    await new Promise((resolve) => setTimeout(resolve, 1))
    const chunksHash = ['hash1', 'hash2', 'hash3']
    const fileHash = 'merkleHash123'
    return { chunksHash, fileHash }
  }

  protected async getFileMetadata({
    file,
    filePath,
  }: {
    file?: File
    filePath?: string
  }): Promise<FileMetaInfo> {
    // 模拟获取文件元数据，使用参数避免 linter 警告
    void file
    void filePath
    return {
      name: 'test.txt',
      size: 1024,
      lastModified: Date.now(),
      type: 'txt',
    }
  }

  protected createWorkerService(workerCount: number): WorkerService {
    // 使用参数避免 linter 警告
    void workerCount
    // 创建一个模拟的 BaseWorkerPool
    const mockPool = {
      exec: jest.fn().mockResolvedValue([
        { success: true, data: 'hash1', index: 0 },
        { success: true, data: 'hash2', index: 1 },
      ]),
      adjustPool: jest.fn(),
      terminate: jest.fn(),
    }
    return new WorkerService(mockPool as any)
  }
}

describe('BaseHashWorker', () => {
  let worker: TestHashWorker
  let mockConsoleLog: jest.SpyInstance

  beforeEach(() => {
    worker = new TestHashWorker()
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation()
  })

  afterEach(() => {
    worker.destroyWorkerPool()
    mockConsoleLog.mockRestore()
  })

  describe('getFileHashChunks', () => {
    it('应该正确处理文件参数并返回结果', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
      const param: HashWorkerOptions = {
        file: mockFile,
        config: {
          workerCount: 2,
          isShowLog: false,
        },
      }

      const result = await worker.getFileHashChunks(param)

      expect(result).toEqual({
        chunksBlob: undefined,
        chunksHash: ['hash1', 'hash2', 'hash3'],
        merkleHash: 'merkleHash123',
        metadata: {
          name: 'test.txt',
          size: 1024,
          lastModified: expect.any(Number),
          type: 'txt',
        },
      })
    })

    it('应该正确处理文件路径参数', async () => {
      const param: HashWorkerOptions = {
        filePath: '/path/to/file.txt',
        config: {
          workerCount: 3,
          isShowLog: false,
        },
      }

      const result = await worker.getFileHashChunks(param)

      expect(result).toEqual({
        chunksBlob: undefined,
        chunksHash: ['hash1', 'hash2', 'hash3'],
        merkleHash: 'merkleHash123',
        metadata: {
          name: 'test.txt',
          size: 1024,
          lastModified: expect.any(Number),
          type: 'txt',
        },
      })
    })

    it('应该显示日志当 isShowLog 为 true', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
      const param: HashWorkerOptions = {
        file: mockFile,
        config: {
          workerCount: 2,
          isShowLog: true,
        },
      }

      await worker.getFileHashChunks(param)

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringMatching(/get file hash in: \d+ ms by using 2 worker, speed: [\d.]+ MB\/s/),
      )
    })

    it('应该立即关闭 worker 当 isCloseWorkerImmediately 为 true', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
      const param: HashWorkerOptions = {
        file: mockFile,
        config: {
          workerCount: 2,
          isCloseWorkerImmediately: true,
          isShowLog: false,
        },
      }

      await worker.getFileHashChunks(param)

      // 验证 workerService 被设置为 null
      expect((worker as any).workerService).toBeNull()
      expect((worker as any).curWorkerCount).toBe(0)
    })

    it('应该重用现有的 workerService 当 workerCount 相同', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
      const param: HashWorkerOptions = {
        file: mockFile,
        config: {
          workerCount: 2,
          isShowLog: false,
        },
      }

      // 第一次调用
      await worker.getFileHashChunks(param)
      const firstWorkerService = (worker as any).workerService

      // 第二次调用，workerCount 相同
      await worker.getFileHashChunks(param)
      const secondWorkerService = (worker as any).workerService

      // 应该重用同一个 workerService
      expect(secondWorkerService).toBe(firstWorkerService)
    })

    it('应该调整 worker 池当 workerCount 改变', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
      const param1: HashWorkerOptions = {
        file: mockFile,
        config: {
          workerCount: 2,
          isShowLog: false,
        },
      }

      // 第一次调用
      await worker.getFileHashChunks(param1)

      const param2: HashWorkerOptions = {
        file: mockFile,
        config: {
          workerCount: 4,
          isShowLog: false,
        },
      }

      // 第二次调用，workerCount 不同
      await worker.getFileHashChunks(param2)

      expect((worker as any).curWorkerCount).toBe(4)
    })

    it('应该使用默认配置当没有提供配置', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
      const param: HashWorkerOptions = {
        file: mockFile,
      }

      const result = await worker.getFileHashChunks(param)

      expect(result).toBeDefined()
      expect(result.chunksHash).toEqual(['hash1', 'hash2', 'hash3'])
      expect(result.merkleHash).toBe('merkleHash123')
    })
  })

  describe('destroyWorkerPool', () => {
    it('应该正确销毁 worker 池', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
      const param: HashWorkerOptions = {
        file: mockFile,
        config: {
          workerCount: 2,
          isShowLog: false,
        },
      }

      // 先创建 worker
      await worker.getFileHashChunks(param)
      expect((worker as any).workerService).not.toBeNull()

      // 销毁 worker
      worker.destroyWorkerPool()
      expect((worker as any).workerService).toBeNull()
      expect((worker as any).curWorkerCount).toBe(0)
    })

    it('应该安全地处理重复销毁', () => {
      // 当没有 worker 时，销毁应该不会报错
      expect(() => worker.destroyWorkerPool()).not.toThrow()
      expect((worker as any).workerService).toBeNull()
      expect((worker as any).curWorkerCount).toBe(0)
    })
  })

  describe('参数验证', () => {
    it('应该正确处理空的配置对象', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
      const param: HashWorkerOptions = {
        file: mockFile,
        config: {},
      }

      const result = await worker.getFileHashChunks(param)

      expect(result).toBeDefined()
      expect(result.chunksHash).toEqual(['hash1', 'hash2', 'hash3'])
    })

    it('应该正确处理部分配置', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
      const param: HashWorkerOptions = {
        file: mockFile,
        config: {
          chunkSize: 5,
          strategy: Strategy.md5,
        },
      }

      const result = await worker.getFileHashChunks(param)

      expect(result).toBeDefined()
      expect(result.chunksHash).toEqual(['hash1', 'hash2', 'hash3'])
    })
  })
})
