// Mock import.meta
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      url: 'https://test.com',
    },
  },
})

// Mock 依赖模块
jest.mock(require.resolve('../../../src/browser'), () => ({
  BrowserWorkerPool: jest.fn(),
  getArrayBufFromBlobs: jest.fn(),
  getFileMetadataInBrowser: jest.fn(),
  sliceFile: jest.fn(),
  BrowserWorkerWrapper: jest.fn(),
}))

// 使用 require 来避免 TypeScript 模块解析问题
const { getFileHashChunks, destroyWorkerPool } = require(
  require.resolve('../../../src/browser/browserHashWorker'),
)
type HashChksParam = any
type Strategy = 'md5' | 'crc32' | 'mixed'

// 获取 mock 函数
const mockBrowserWorkerPool = require(require.resolve('../../../src/browser')).BrowserWorkerPool
const mockGetArrayBufFromBlobs = require(
  require.resolve('../../../src/browser'),
).getArrayBufFromBlobs
const mockGetFileMetadataInBrowser = require(
  require.resolve('../../../src/browser'),
).getFileMetadataInBrowser
const mockSliceFile = require(require.resolve('../../../src/browser')).sliceFile

// 动态 mock shared 相关 util/service
const helper = require('../../../src/shared/helper')
const utils = require('../../../src/shared/utils')
const workerServiceModule = require('../../../src/shared/workerService')

const mockGetArrParts = jest.spyOn(utils, 'getArrParts')
const mockGetChunksHashMultipleStrategy = jest.spyOn(helper, 'getChunksHashMultipleStrategy')
const mockGetChunksHashSingle = jest.spyOn(helper, 'getChunksHashSingle')
const mockMergeConfig = jest.spyOn(helper, 'mergeConfig')
const mockRunAsyncFuncSerialized = jest.spyOn(utils, 'runAsyncFuncSerialized')
const mockGetMerkleRootHashByChunks = jest.spyOn(helper, 'getMerkleRootHashByChunks')
const mockWorkerService = jest.spyOn(workerServiceModule, 'WorkerService')

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
    mockMergeConfig.mockReturnValue({
      chunkSize: 1,
      strategy: 'md5' as Strategy,
      workerCount: 2,
      borderCount: 10,
      hashFn: jest.fn(),
    })

    // Mock 文件元数据
    mockGetFileMetadataInBrowser.mockResolvedValue({
      name: 'test.txt',
      size: 1024,
      lastModified: Date.now(),
      type: '.txt',
    })

    // Mock 文件分片
    mockSliceFile.mockReturnValue([mockBlob])

    // Mock ArrayBuffer 转换
    mockGetArrayBufFromBlobs.mockResolvedValue([mockArrayBuffer])

    // Mock Hash 计算
    mockGetChunksHashSingle.mockResolvedValue(['mock-hash-1'])
    mockGetChunksHashMultipleStrategy.mockReturnValue('md5')
    mockGetMerkleRootHashByChunks.mockResolvedValue('mock-merkle-hash')

    // Mock Worker 服务
    const mockWorkerServiceInstance = {
      getHashForFiles: jest.fn().mockResolvedValue(['mock-hash-1']),
      terminate: jest.fn(),
      adjustSvcWorkerPool: jest.fn(),
    }
    mockWorkerService.mockImplementation(() => mockWorkerServiceInstance)

    // Mock 数组分组
    mockGetArrParts.mockReturnValue([[mockBlob]])

    // Mock 串行执行
    mockRunAsyncFuncSerialized.mockResolvedValue(['mock-hash-1'])
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

      expect(mockSliceFile).toHaveBeenCalledWith(mockFile, 1)
      expect(mockGetChunksHashSingle).toHaveBeenCalledWith('md5', mockArrayBuffer)
      expect(mockGetMerkleRootHashByChunks).toHaveBeenCalledWith(
        ['mock-hash-1'],
        expect.any(Function),
      )
      expect(mockGetFileMetadataInBrowser).toHaveBeenCalledWith(mockFile)
    })

    it('应该正确处理多分片文件', async () => {
      const mockBlob1 = new Blob(['part1'], { type: 'text/plain' })
      const mockBlob2 = new Blob(['part2'], { type: 'text/plain' })
      const mockArrayBuffer1 = new ArrayBuffer(512)
      const mockArrayBuffer2 = new ArrayBuffer(512)
      mockBlob1.arrayBuffer = jest.fn().mockResolvedValue(mockArrayBuffer1)
      mockBlob2.arrayBuffer = jest.fn().mockResolvedValue(mockArrayBuffer2)
      // 单独 mock mergeConfig
      mockMergeConfig.mockReturnValue({
        chunkSize: 1,
        strategy: 'md5',
        workerCount: 2,
        borderCount: 10,
        hashFn: jest.fn(),
      })

      mockSliceFile.mockReturnValue([mockBlob1, mockBlob2])
      mockGetArrParts.mockReturnValue([[mockBlob1], [mockBlob2]])
      mockGetArrayBufFromBlobs
        .mockResolvedValueOnce([mockArrayBuffer1])
        .mockResolvedValueOnce([mockArrayBuffer2])
      mockRunAsyncFuncSerialized.mockResolvedValue(['mock-hash-1', 'mock-hash-2'])
      mockGetMerkleRootHashByChunks.mockResolvedValue('mock-merkle-hash-multi')

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

      expect(mockGetArrParts).toHaveBeenCalledWith([mockBlob1, mockBlob2], 2)
      expect(mockRunAsyncFuncSerialized).toHaveBeenCalled()
    })

    it('应该使用自定义配置', async () => {
      const customConfig = {
        chunkSize: 2,
        strategy: 'crc32' as Strategy,
        workerCount: 4,
        borderCount: 5,
        isShowLog: true,
      }

      mockMergeConfig.mockReturnValue(customConfig)

      const param: HashChksParam = {
        file: mockFile,
        config: customConfig,
      }

      await getFileHashChunks(param)

      expect(mockMergeConfig).toHaveBeenCalledWith(customConfig)
      expect(mockSliceFile).toHaveBeenCalledWith(mockFile, 2)
    })

    it('应该显示日志当 isShowLog 为 true', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      mockMergeConfig.mockReturnValue({
        chunkSize: 1,
        strategy: 'md5' as Strategy,
        workerCount: 2,
        borderCount: 10,
        hashFn: jest.fn(),
        isShowLog: true,
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
        mockMergeConfig.mockReturnValue({
          chunkSize: 1,
          strategy,
          workerCount: 2,
          borderCount: 10,
          hashFn: jest.fn(),
        })

        const param: HashChksParam = {
          file: mockFile,
          config: { strategy },
        }

        await getFileHashChunks(param)

        expect(mockGetChunksHashSingle).toHaveBeenCalledWith(strategy, mockArrayBuffer)
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

      expect(mockMergeConfig).toHaveBeenCalledWith(undefined)
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
      // mockBrowserWorkerPool 返回 mock 实例
      const mockPoolInstance = {}
      mockBrowserWorkerPool.mockImplementation(() => mockPoolInstance)
      // mockWorkerService 返回 mock 实例
      mockWorkerService.mockImplementation(() => ({
        getHashForFiles: jest.fn().mockResolvedValue(['mock-hash-1']),
        terminate: jest.fn(),
        adjustSvcWorkerPool: jest.fn(),
      }))
      // 单独 mock mergeConfig
      mockMergeConfig.mockReturnValue({
        chunkSize: 1,
        strategy: 'md5',
        workerCount: 3,
        borderCount: 10,
        hashFn: jest.fn(),
      })
      await getFileHashChunks(param)
      expect(mockWorkerService).toHaveBeenCalledWith(3, mockPoolInstance)
      expect(mockBrowserWorkerPool).toHaveBeenCalledWith(3)
    })

    it('应该能够销毁 Worker 池', () => {
      expect(() => destroyWorkerPool()).not.toThrow()
    })
  })

  describe('错误处理', () => {
    it('应该处理文件分片失败', async () => {
      mockSliceFile.mockImplementation(() => {
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
      mockGetChunksHashSingle.mockRejectedValue(new Error('Hash calculation failed'))

      const param: HashChksParam = {
        file: mockFile,
        config: {
          workerCount: 2,
        },
      }

      await expect(getFileHashChunks(param)).rejects.toThrow('Hash calculation failed')
    })

    it('应该处理文件元数据获取失败', async () => {
      mockGetFileMetadataInBrowser.mockRejectedValue(new Error('Metadata failed'))

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

      mockSliceFile.mockReturnValue([emptyBlob])
      mockGetArrayBufFromBlobs.mockResolvedValue([new ArrayBuffer(0)])

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

      mockSliceFile.mockReturnValue(largeBlobs)
      mockGetArrParts.mockReturnValue([largeBlobs.slice(0, 2), largeBlobs.slice(2)])
      mockRunAsyncFuncSerialized.mockResolvedValue(['hash1', 'hash2', 'hash3'])

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
