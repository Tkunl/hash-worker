// Mock import.meta
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      url: 'https://test.com',
    },
  },
})

// Mock fs 模块
jest.mock('fs')
jest.mock('fs/promises')
jest.mock('path')
jest.mock('worker_threads')

// Mock 依赖模块
jest.mock('../../../src/node/nodeUtils', () => ({
  getFileMetadata: jest.fn(),
  getFileSliceLocations: jest.fn(),
  readFileAsArrayBuffer: jest.fn(),
}))

// Mock shared modules
jest.mock('../../../src/shared/helper', () => ({
  ...jest.requireActual('../../../src/shared/helper'),
  getChunksHashSingle: jest.fn(),
  getMerkleRootHashByChunks: jest.fn(),
}))

jest.mock('../../../src/shared/workerService', () => ({
  WorkerService: jest.fn().mockImplementation(() => ({
    getHashForFiles: jest.fn().mockResolvedValue(['hash1', 'hash2']),
    adjustWorkerPoolSize: jest.fn(),
    terminate: jest.fn(),
  })),
}))

import fs from 'fs'
import path from 'path'
import { getFileHashChunks, destroyWorkerPool } from '../../../src/node/nodeHashWorker'
import { HashChksParam, Strategy } from '../../../src/types'

const mockFs = fs as jest.Mocked<typeof fs>
const mockPath = path as jest.Mocked<typeof path>

describe('NodeHashWorker', () => {
  let mockGetFileMetadata: jest.MockedFunction<any>
  let mockGetFileSliceLocations: jest.MockedFunction<any>
  let mockReadFileAsArrayBuffer: jest.MockedFunction<any>
  let mockGetChunksHashSingle: jest.MockedFunction<any>
  let mockGetMerkleRootHashByChunks: jest.MockedFunction<any>

  beforeEach(() => {
    jest.clearAllMocks()

    // 获取 mock 函数
    const nodeUtils = require('../../../src/node/nodeUtils')
    mockGetFileMetadata = nodeUtils.getFileMetadata
    mockGetFileSliceLocations = nodeUtils.getFileSliceLocations
    mockReadFileAsArrayBuffer = nodeUtils.readFileAsArrayBuffer

    const helper = require('../../../src/shared/helper')
    mockGetChunksHashSingle = helper.getChunksHashSingle
    mockGetMerkleRootHashByChunks = helper.getMerkleRootHashByChunks

    // 设置默认的 mock 返回值
    mockReadFileAsArrayBuffer.mockResolvedValue(new ArrayBuffer(1024))
    mockGetChunksHashSingle.mockResolvedValue(['single-hash'])
    mockGetMerkleRootHashByChunks.mockResolvedValue('merkle-hash')

    // Mock path.resolve
    mockPath.resolve.mockImplementation((p) => `/absolute/path/${p}`)
    mockPath.isAbsolute.mockImplementation((p) => p.startsWith('/'))
  })

  afterEach(() => {
    destroyWorkerPool()
  })

  describe('getFileHashChunks', () => {
    it('应该正确处理有效的文件路径', async () => {
      const filePath = '/test/file.txt'
      const mockStats = { isFile: () => true }
      const mockMetadata = {
        name: 'file.txt',
        size: 1024,
        lastModified: Date.now(),
        type: '.txt',
      }

      mockFs.statSync.mockReturnValue(mockStats as any)
      mockGetFileMetadata.mockResolvedValue(mockMetadata)
      mockGetFileSliceLocations.mockResolvedValue({
        sliceLocation: [[0, 1023]],
        endLocation: 1024,
      })

      const param: HashChksParam = {
        filePath,
        config: {
          workerCount: 2,
          isShowLog: false,
        },
      }

      const result = await getFileHashChunks(param)

      expect(result).toEqual({
        chunksBlob: undefined,
        chunksHash: ['single-hash'],
        merkleHash: 'merkle-hash',
        metadata: mockMetadata,
      })
      expect(mockFs.statSync).toHaveBeenCalledWith(filePath)
      expect(mockGetFileMetadata).toHaveBeenCalledWith(filePath)
    })

    it('应该将相对路径转换为绝对路径', async () => {
      const relativePath = 'test/file.txt'
      const absolutePath = '/absolute/path/test/file.txt'
      const mockStats = { isFile: () => true }
      const mockMetadata = {
        name: 'file.txt',
        size: 1024,
        lastModified: Date.now(),
        type: '.txt',
      }

      mockPath.isAbsolute.mockReturnValue(false)
      mockPath.resolve.mockReturnValue(absolutePath)
      mockFs.statSync.mockReturnValue(mockStats as any)
      mockGetFileMetadata.mockResolvedValue(mockMetadata)
      mockGetFileSliceLocations.mockResolvedValue({
        sliceLocation: [[0, 1023]],
        endLocation: 1024,
      })

      const param: HashChksParam = {
        filePath: relativePath,
        config: {
          workerCount: 2,
          isShowLog: false,
        },
      }

      await getFileHashChunks(param)

      expect(mockPath.resolve).toHaveBeenCalledWith(relativePath)
      expect(mockFs.statSync).toHaveBeenCalledWith(absolutePath)
    })

    it('应该处理多个文件分片', async () => {
      const filePath = '/test/file.txt'
      const mockStats = { isFile: () => true }
      const mockMetadata = {
        name: 'file.txt',
        size: 2048,
        lastModified: Date.now(),
        type: '.txt',
      }

      mockFs.statSync.mockReturnValue(mockStats as any)
      mockGetFileMetadata.mockResolvedValue(mockMetadata)
      mockGetFileSliceLocations.mockResolvedValue({
        sliceLocation: [
          [0, 1023],
          [1024, 2047],
        ],
        endLocation: 2048,
      })

      // 为多个分片设置不同的 ArrayBuffer
      mockReadFileAsArrayBuffer
        .mockResolvedValueOnce(new ArrayBuffer(1024)) // 第一个分片
        .mockResolvedValueOnce(new ArrayBuffer(1024)) // 第二个分片

      // Mock the worker service to return hash values for multiple chunks
      const mockWorkerService = require('../../../src/shared/workerService').WorkerService
      mockWorkerService.mockImplementation(() => ({
        getHashForFiles: jest.fn().mockResolvedValue(['hash1', 'hash2']),
        adjustWorkerPoolSize: jest.fn(),
        terminate: jest.fn(),
      }))

      mockGetMerkleRootHashByChunks.mockResolvedValue('multiple-merkle-hash')

      const param: HashChksParam = {
        filePath,
        config: {
          workerCount: 2,
          isShowLog: false,
        },
      }

      const result = await getFileHashChunks(param)

      expect(result).toBeDefined()
      expect(result.chunksHash).toEqual(['hash1', 'hash2'])
      expect(result.merkleHash).toBe('multiple-merkle-hash')
      expect(mockReadFileAsArrayBuffer).toHaveBeenCalledTimes(2)
    })

    it('应该显示日志当 isShowLog 为 true', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      const filePath = '/test/file.txt'
      const mockStats = { isFile: () => true }
      const mockMetadata = {
        name: 'file.txt',
        size: 1024,
        lastModified: Date.now(),
        type: '.txt',
      }

      mockFs.statSync.mockReturnValue(mockStats as any)
      mockGetFileMetadata.mockResolvedValue(mockMetadata)
      mockGetFileSliceLocations.mockResolvedValue({
        sliceLocation: [[0, 1023]],
        endLocation: 1024,
      })

      const param: HashChksParam = {
        filePath,
        config: {
          workerCount: 2,
          isShowLog: true,
        },
      }

      await getFileHashChunks(param)

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('参数验证', () => {
    it('应该在没有 filePath 时抛出错误', async () => {
      const param = {
        config: {
          workerCount: 2,
          isShowLog: false,
        },
      } as HashChksParam

      await expect(getFileHashChunks(param)).rejects.toThrow(
        'The filePath attribute is required in node environment',
      )
    })

    it('应该在文件不存在时抛出错误', async () => {
      const filePath = '/nonexistent/file.txt'
      const error = new Error('ENOENT: no such file or directory')
      ;(error as any).code = 'ENOENT'

      mockPath.isAbsolute.mockReturnValue(true)
      mockFs.statSync.mockImplementation(() => {
        throw error
      })

      const param: HashChksParam = {
        filePath,
        config: {
          workerCount: 2,
          isShowLog: false,
        },
      }

      await expect(getFileHashChunks(param)).rejects.toThrow(
        'Invalid filePath: File does not exist',
      )
    })

    it('应该在路径不是文件时抛出错误', async () => {
      const filePath = '/test/directory'
      const mockStats = { isFile: () => false }

      mockPath.isAbsolute.mockReturnValue(true)
      mockFs.statSync.mockReturnValue(mockStats as any)

      const param: HashChksParam = {
        filePath,
        config: {
          workerCount: 2,
          isShowLog: false,
        },
      }

      await expect(getFileHashChunks(param)).rejects.toThrow(
        'Invalid filePath: Path does not point to a file',
      )
    })

    it('应该重新抛出其他 fs 错误', async () => {
      const filePath = '/test/file.txt'
      const error = new Error('Permission denied')
      ;(error as any).code = 'EACCES'

      mockPath.isAbsolute.mockReturnValue(true)
      mockFs.statSync.mockImplementation(() => {
        throw error
      })

      const param: HashChksParam = {
        filePath,
        config: {
          workerCount: 2,
          isShowLog: false,
        },
      }

      await expect(getFileHashChunks(param)).rejects.toThrow('Permission denied')
    })
  })

  describe('destroyWorkerPool', () => {
    it('应该正确销毁 worker 池', async () => {
      const filePath = '/test/file.txt'
      const mockStats = { isFile: () => true }
      const mockMetadata = {
        name: 'file.txt',
        size: 1024,
        lastModified: Date.now(),
        type: '.txt',
      }

      mockFs.statSync.mockReturnValue(mockStats as any)
      mockGetFileMetadata.mockResolvedValue(mockMetadata)
      mockGetFileSliceLocations.mockResolvedValue({
        sliceLocation: [[0, 1023]],
        endLocation: 1024,
      })

      const param: HashChksParam = {
        filePath,
        config: {
          workerCount: 2,
          isShowLog: false,
        },
      }

      await getFileHashChunks(param)
      destroyWorkerPool()

      // 验证 destroyWorkerPool 不会抛出错误
      expect(() => destroyWorkerPool()).not.toThrow()
    })

    it('应该安全地处理重复销毁', () => {
      expect(() => destroyWorkerPool()).not.toThrow()
    })
  })

  describe('配置合并', () => {
    it('应该正确合并配置', async () => {
      const filePath = '/test/file.txt'
      const mockStats = { isFile: () => true }
      const mockMetadata = {
        name: 'file.txt',
        size: 1024,
        lastModified: Date.now(),
        type: '.txt',
      }

      mockFs.statSync.mockReturnValue(mockStats as any)
      mockGetFileMetadata.mockResolvedValue(mockMetadata)
      mockGetFileSliceLocations.mockResolvedValue({
        sliceLocation: [[0, 1023]],
        endLocation: 1024,
      })

      const param: HashChksParam = {
        filePath,
        config: {
          chunkSize: 2,
          strategy: Strategy.md5,
          workerCount: 4,
        },
      }

      const result = await getFileHashChunks(param)

      // 验证配置被正确处理
      expect(result).toBeDefined()
    })
  })
})
