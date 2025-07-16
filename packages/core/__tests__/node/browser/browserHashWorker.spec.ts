// Mock Worker 全局对象
global.Worker = jest.fn().mockImplementation(() => ({
  postMessage: jest.fn(),
  terminate: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  onmessage: null,
  onerror: null,
}))

// Mock import.meta
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      url: 'https://test.com',
    },
  },
})

// Mock window 对象 (for browser environment)
Object.defineProperty(global, 'window', {
  value: {
    setTimeout: jest.fn().mockImplementation((fn, delay) => setTimeout(fn, delay)),
    clearTimeout: jest.fn().mockImplementation((id) => clearTimeout(id)),
  },
})

// Mock BrowserWorkerWrapper
const mockBrowserWorkerWrapper = {
  postMessage: jest.fn(),
  terminate: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  run: jest.fn().mockResolvedValue(['mock-hash-1']),
  setRunning: jest.fn(),
  setTimeout: jest.fn(),
  handleMessage: jest.fn(),
  handleError: jest.fn(),
  createTimeout: jest.fn(),
  clearTimeout: jest.fn(),
  cleanupEventListeners: jest.fn(),
}

// Mock BrowserWorkerPool
const mockBrowserWorkerPoolInstance = {
  workers: [mockBrowserWorkerWrapper],
  createWorker: jest.fn().mockReturnValue(mockBrowserWorkerWrapper),
  getWorker: jest.fn().mockReturnValue(mockBrowserWorkerWrapper),
  terminate: jest.fn(),
  adjustWorkerPoolSize: jest.fn(),
}

// Mock WorkerService
const mockWorkerServiceInstance = {
  getHashForFiles: jest.fn().mockResolvedValue(['mock-hash-1']),
  terminate: jest.fn(),
  adjustWorkerPoolSize: jest.fn(),
}

// Mock 依赖模块
jest.mock('../../../src/browser/browserWorkerPool', () => ({
  BrowserWorkerPool: jest.fn().mockImplementation(() => mockBrowserWorkerPoolInstance),
}))

jest.mock('../../../src/browser/browserWorkerWrapper', () => ({
  BrowserWorkerWrapper: jest.fn().mockImplementation(() => mockBrowserWorkerWrapper),
}))

jest.mock('../../../src/browser/browserUtils', () => ({
  getArrayBufFromBlobs: jest.fn(),
  getFileMetadataInBrowser: jest.fn(),
  sliceFile: jest.fn(),
}))

jest.mock('../../../src/shared/workerService', () => ({
  WorkerService: jest.fn().mockImplementation(() => mockWorkerServiceInstance),
}))

jest.mock('../../../src/shared/helper', () => ({
  getChunksHashMultipleStrategy: jest.fn(),
  getChunksHashSingle: jest.fn(),
  mergeConfig: jest.fn(),
  getMerkleRootHashByChunks: jest.fn(),
}))

jest.mock('../../../src/shared/utils', () => ({
  getArrParts: jest.fn(),
  runAsyncFuncSerialized: jest.fn(),
}))

// 导入被测试的函数
const { getFileHashChunks, destroyWorkerPool } = require('../../../src/browser/browserHashWorker')

// 导入 mock 函数
const {
  getArrayBufFromBlobs,
  getFileMetadataInBrowser,
  sliceFile,
} = require('../../../src/browser/browserUtils')
const { WorkerService } = require('../../../src/shared/workerService')
const { BrowserWorkerPool } = require('../../../src/browser/browserWorkerPool')
const {
  getChunksHashMultipleStrategy,
  getChunksHashSingle,
  mergeConfig,
  getMerkleRootHashByChunks,
} = require('../../../src/shared/helper')
const { getArrParts, runAsyncFuncSerialized } = require('../../../src/shared/utils')

type HashChksParam = any
type Strategy = 'md5' | 'crc32' | 'mixed'

describe('BrowserHashWorker', () => {
  let mockFile: File
  let mockBlob: Blob
  let mockArrayBuffer: ArrayBuffer

  beforeEach(() => {
    jest.clearAllMocks()

    // 创建 mock File 对象
    mockArrayBuffer = new ArrayBuffer(1024)
    mockBlob = new Blob(['test content'], { type: 'text/plain' })
    mockBlob.arrayBuffer = jest.fn().mockResolvedValue(mockArrayBuffer)
    mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' })

    // Mock 基础配置
    mergeConfig.mockReturnValue({
      chunkSize: 1,
      strategy: 'md5' as Strategy,
      workerCount: 2,
      borderCount: 10,
      hashFn: jest.fn(),
      isShowLog: false,
      isCloseWorkerImmediately: false,
      timeout: undefined,
    })

    // Mock 文件元数据
    getFileMetadataInBrowser.mockResolvedValue({
      name: 'test.txt',
      size: 1024,
      lastModified: Date.now(),
      type: '.txt',
    })

    // Mock 文件分片
    sliceFile.mockReturnValue([mockBlob])

    // Mock ArrayBuffer 转换
    getArrayBufFromBlobs.mockResolvedValue([mockArrayBuffer])

    // Mock Hash 计算
    getChunksHashSingle.mockResolvedValue(['mock-hash-1'])
    getChunksHashMultipleStrategy.mockReturnValue('md5')
    getMerkleRootHashByChunks.mockResolvedValue('mock-merkle-hash')

    // Mock 数组分组
    getArrParts.mockReturnValue([[mockBlob]])

    // Mock 串行执行
    runAsyncFuncSerialized.mockResolvedValue(['mock-hash-1'])

    // Reset worker service mock
    WorkerService.mockImplementation(() => mockWorkerServiceInstance)
    BrowserWorkerPool.mockImplementation(() => mockBrowserWorkerPoolInstance)
  })

  afterEach(() => {
    destroyWorkerPool()
  })

  describe('getFileHashChunks', () => {
    it('应该正确处理单分片文件', async () => {
      const param: HashChksParam = {
        file: mockFile,
        config: {
          workerCount: 2,
          isShowLog: false,
        },
      }

      const result = await getFileHashChunks(param)

      expect(result).toEqual({
        chunksBlob: [mockBlob],
        chunksHash: ['mock-hash-1'],
        merkleHash: 'mock-merkle-hash',
        metadata: {
          name: 'test.txt',
          size: 1024,
          lastModified: expect.any(Number),
          type: '.txt',
        },
      })

      expect(sliceFile).toHaveBeenCalledWith(mockFile, 1)
      expect(getChunksHashSingle).toHaveBeenCalledWith('md5', mockArrayBuffer)
      expect(getMerkleRootHashByChunks).toHaveBeenCalledWith(['mock-hash-1'], expect.any(Function))
      expect(getFileMetadataInBrowser).toHaveBeenCalledWith(mockFile)
    })

    it('应该正确处理多分片文件', async () => {
      const mockBlob1 = new Blob(['part1'], { type: 'text/plain' })
      const mockBlob2 = new Blob(['part2'], { type: 'text/plain' })
      const mockArrayBuffer1 = new ArrayBuffer(512)
      const mockArrayBuffer2 = new ArrayBuffer(512)
      mockBlob1.arrayBuffer = jest.fn().mockResolvedValue(mockArrayBuffer1)
      mockBlob2.arrayBuffer = jest.fn().mockResolvedValue(mockArrayBuffer2)

      // Mock 多分片场景
      sliceFile.mockReturnValue([mockBlob1, mockBlob2])
      getArrParts.mockReturnValue([[mockBlob1], [mockBlob2]])
      getArrayBufFromBlobs
        .mockResolvedValueOnce([mockArrayBuffer1])
        .mockResolvedValueOnce([mockArrayBuffer2])
      runAsyncFuncSerialized.mockResolvedValue(['mock-hash-1', 'mock-hash-2'])
      getMerkleRootHashByChunks.mockResolvedValue('mock-merkle-hash-multi')

      const param: HashChksParam = {
        file: mockFile,
        config: {
          workerCount: 2,
          isShowLog: false,
        },
      }

      const result = await getFileHashChunks(param)

      expect(result).toEqual({
        chunksBlob: [mockBlob1, mockBlob2],
        chunksHash: ['mock-hash-1', 'mock-hash-2'],
        merkleHash: 'mock-merkle-hash-multi',
        metadata: {
          name: 'test.txt',
          size: 1024,
          lastModified: expect.any(Number),
          type: '.txt',
        },
      })

      expect(getArrParts).toHaveBeenCalledWith([mockBlob1, mockBlob2], 2)
      expect(runAsyncFuncSerialized).toHaveBeenCalled()
    })

    it('应该使用自定义配置', async () => {
      const customConfig = {
        chunkSize: 2,
        strategy: 'crc32' as Strategy,
        workerCount: 4,
        borderCount: 5,
        isShowLog: true,
        isCloseWorkerImmediately: false,
        timeout: undefined,
        hashFn: jest.fn(),
      }

      mergeConfig.mockReturnValue(customConfig)

      const param: HashChksParam = {
        file: mockFile,
        config: {
          chunkSize: 2,
          strategy: 'crc32' as Strategy,
          workerCount: 4,
          borderCount: 5,
          isShowLog: true,
        },
      }

      await getFileHashChunks(param)

      expect(mergeConfig).toHaveBeenCalledWith(param.config)
      expect(sliceFile).toHaveBeenCalledWith(mockFile, 2)
    })

    it('应该显示日志当 isShowLog 为 true', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      mergeConfig.mockReturnValue({
        chunkSize: 1,
        strategy: 'md5' as Strategy,
        workerCount: 2,
        borderCount: 10,
        hashFn: jest.fn(),
        isShowLog: true,
        isCloseWorkerImmediately: false,
        timeout: undefined,
      })

      const param: HashChksParam = {
        file: mockFile,
        config: {
          workerCount: 2,
          isShowLog: true,
        },
      }

      await getFileHashChunks(param)

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('应该正确处理不同的 hash 策略', async () => {
      const strategies: Strategy[] = ['md5', 'crc32', 'mixed']

      for (const strategy of strategies) {
        mergeConfig.mockReturnValue({
          chunkSize: 1,
          strategy,
          workerCount: 2,
          borderCount: 10,
          hashFn: jest.fn(),
          isShowLog: false,
          isCloseWorkerImmediately: false,
          timeout: undefined,
        })

        const param: HashChksParam = {
          file: mockFile,
          config: { strategy },
        }

        await getFileHashChunks(param)

        expect(getChunksHashSingle).toHaveBeenCalledWith(strategy, mockArrayBuffer)
      }
    })
  })

  describe('参数验证', () => {
    it('应该在没有 file 时抛出错误', async () => {
      const param = {
        config: {
          workerCount: 2,
          isShowLog: false,
        },
      } as HashChksParam

      await expect(getFileHashChunks(param)).rejects.toThrow(
        'The file attribute is required in browser environment',
      )
    })

    it('应该在没有 config 时使用默认配置', async () => {
      const param: HashChksParam = {
        file: mockFile,
      }

      await getFileHashChunks(param)

      expect(mergeConfig).toHaveBeenCalledWith(undefined)
    })
  })

  describe('Worker 池管理', () => {
    it('应该创建 WorkerService 和 BrowserWorkerPool', async () => {
      const param: HashChksParam = {
        file: mockFile,
        config: {
          workerCount: 3,
        },
      }

      mergeConfig.mockReturnValue({
        chunkSize: 1,
        strategy: 'md5',
        workerCount: 3,
        borderCount: 10,
        hashFn: jest.fn(),
        isShowLog: false,
        isCloseWorkerImmediately: false,
        timeout: undefined,
      })

      await getFileHashChunks(param)

      expect(WorkerService).toHaveBeenCalledWith(mockBrowserWorkerPoolInstance)
      expect(BrowserWorkerPool).toHaveBeenCalledWith(3)
    })

    it('应该能够销毁 Worker 池', () => {
      expect(() => destroyWorkerPool()).not.toThrow()
    })
  })

  describe('错误处理', () => {
    it('应该处理文件分片失败', async () => {
      sliceFile.mockImplementation(() => {
        throw new Error('Slice file failed')
      })

      const param: HashChksParam = {
        file: mockFile,
        config: {
          workerCount: 2,
        },
      }

      await expect(getFileHashChunks(param)).rejects.toThrow('Slice file failed')
    })

    it('应该处理 Hash 计算失败', async () => {
      getChunksHashSingle.mockRejectedValue(new Error('Hash calculation failed'))

      const param: HashChksParam = {
        file: mockFile,
        config: {
          workerCount: 2,
        },
      }

      await expect(getFileHashChunks(param)).rejects.toThrow('Hash calculation failed')
    })

    it('应该处理文件元数据获取失败', async () => {
      getFileMetadataInBrowser.mockRejectedValue(new Error('Metadata failed'))

      const param: HashChksParam = {
        file: mockFile,
        config: {
          workerCount: 2,
        },
      }

      await expect(getFileHashChunks(param)).rejects.toThrow('Metadata failed')
    })
  })

  describe('边界情况', () => {
    it('应该处理空文件', async () => {
      const emptyFile = new File([''], 'empty.txt', { type: 'text/plain' })
      const emptyBlob = new Blob([''], { type: 'text/plain' })
      emptyBlob.arrayBuffer = jest.fn().mockResolvedValue(new ArrayBuffer(0))

      sliceFile.mockReturnValue([emptyBlob])
      getArrayBufFromBlobs.mockResolvedValue([new ArrayBuffer(0)])

      const param: HashChksParam = {
        file: emptyFile,
        config: {
          workerCount: 2,
        },
      }

      const result = await getFileHashChunks(param)

      expect(result.chunksBlob).toEqual([emptyBlob])
      expect(result.chunksHash).toEqual(['mock-hash-1'])
    })

    it('应该处理大文件（多分片）', async () => {
      const largeFile = new File(['x'.repeat(3 * 1024 * 1024)], 'large.txt', { type: 'text/plain' })
      const largeBlobs = Array.from(
        { length: 3 },
        (_, i) => new Blob([`part${i}`], { type: 'text/plain' }),
      )

      sliceFile.mockReturnValue(largeBlobs)
      getArrParts.mockReturnValue([largeBlobs.slice(0, 2), largeBlobs.slice(2)])
      runAsyncFuncSerialized.mockResolvedValue(['hash1', 'hash2', 'hash3'])

      const param: HashChksParam = {
        file: largeFile,
        config: {
          workerCount: 2,
          chunkSize: 1,
        },
      }

      const result = await getFileHashChunks(param)

      expect(result.chunksBlob).toEqual(largeBlobs)
      expect(result.chunksHash).toEqual(['hash1', 'hash2', 'hash3'])
    })
  })
})
