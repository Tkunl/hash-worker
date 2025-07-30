import {
  getMerkleRootHashByChunks,
  mergeConfig,
  calculateHashInWorker,
  getChunksHashSingle,
} from '../../../src/shared/helper'
import { Strategy, Config, WorkerReq } from '../../../src/types'
import { DEFAULT_MAX_WORKERS } from '../../../src/shared/constant'

// Mock hash-wasm functions
jest.mock('hash-wasm', () => ({
  md5: jest.fn().mockResolvedValue('mock-md5-hash'),
  xxhash128: jest.fn().mockResolvedValue('mock-xxHash128-hash'),
}))

describe('helper', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getMerkleRootHashByChunks', () => {
    it('应该使用默认 hash 函数计算 Merkle 根哈希', async () => {
      const hashList = ['hash1', 'hash2', 'hash3']
      const result = await getMerkleRootHashByChunks(hashList)

      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })

    it('应该使用自定义 hash 函数计算 Merkle 根哈希', async () => {
      const hashList = ['hash1', 'hash2']
      const customHashFn = jest.fn().mockResolvedValue('custom-hash')
      const result = await getMerkleRootHashByChunks(hashList, customHashFn)

      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })

    it('应该处理空哈希列表', async () => {
      await expect(getMerkleRootHashByChunks([])).rejects.toThrow('无法使用空输入创建 Merkle 树')
    })

    it('应该处理单个哈希', async () => {
      const result = await getMerkleRootHashByChunks(['single-hash'])
      expect(result).toBeDefined()
    })
  })

  describe('mergeConfig', () => {
    it('应该使用默认配置当没有提供参数时', () => {
      const config = mergeConfig()

      expect(config).toEqual({
        chunkSize: 10,
        workerCount: DEFAULT_MAX_WORKERS,
        strategy: Strategy.xxHash128,
        isCloseWorkerImmediately: true,
        isShowLog: false,
      })
    })

    it('应该合并部分配置参数', () => {
      const partialConfig: Config = {
        chunkSize: 20,
        strategy: Strategy.xxHash128,
        isShowLog: true,
      }

      const config = mergeConfig(partialConfig)

      expect(config).toEqual({
        chunkSize: 20,
        workerCount: DEFAULT_MAX_WORKERS,
        strategy: Strategy.xxHash128,
        isCloseWorkerImmediately: true,
        isShowLog: true,
      })
    })

    it('应该合并所有配置参数', () => {
      const fullConfig: Config = {
        chunkSize: 15,
        workerCount: 4,
        strategy: Strategy.md5,
        isCloseWorkerImmediately: false,
        isShowLog: true,
      }

      const config = mergeConfig(fullConfig)

      expect(config).toEqual(fullConfig)
    })

    it('应该处理 undefined 配置', () => {
      const config = mergeConfig(undefined)

      expect(config).toEqual({
        chunkSize: 10,
        workerCount: DEFAULT_MAX_WORKERS,
        strategy: Strategy.xxHash128,
        isCloseWorkerImmediately: true,
        isShowLog: false,
      })
    })
  })

  describe('calculateHashInWorker', () => {
    it('应该使用 md5 策略计算哈希', async () => {
      const req: WorkerReq = {
        chunk: new ArrayBuffer(8),
        strategy: Strategy.md5,
      }

      const result = await calculateHashInWorker(req)

      expect(result).toEqual({
        result: 'mock-md5-hash',
        chunk: req.chunk,
      })
    })

    it('应该使用 xxHash128 策略计算哈希', async () => {
      const req: WorkerReq = {
        chunk: new ArrayBuffer(32),
        strategy: Strategy.xxHash128,
      }

      const result = await calculateHashInWorker(req)

      expect(result).toEqual({
        result: 'mock-xxHash128-hash',
        chunk: req.chunk,
      })
    })

    it('应该抛出错误当使用不支持的策略时', async () => {
      const req: WorkerReq = {
        chunk: new ArrayBuffer(8),
        strategy: 'unsupported' as Strategy,
      }

      await expect(calculateHashInWorker(req)).rejects.toThrow('Unsupported strategy: unsupported')
    })

    it('应该正确处理空的 ArrayBuffer', async () => {
      const req: WorkerReq = {
        chunk: new ArrayBuffer(0),
        strategy: Strategy.md5,
      }

      const result = await calculateHashInWorker(req)

      expect(result).toEqual({
        result: 'mock-md5-hash',
        chunk: req.chunk,
      })
    })
  })

  describe('getChunksHashSingle', () => {
    it('应该使用 md5 策略计算单个哈希', async () => {
      const arrayBuffer = new ArrayBuffer(8)
      const result = await getChunksHashSingle(Strategy.md5, arrayBuffer)

      expect(result).toEqual(['mock-md5-hash'])
    })

    it('应该使用 xxHash128 策略计算单个哈希', async () => {
      const arrayBuffer = new ArrayBuffer(32)
      const result = await getChunksHashSingle(Strategy.xxHash128, arrayBuffer)

      expect(result).toEqual(['mock-xxHash128-hash'])
    })

    it('应该抛出错误当使用不支持的策略时', async () => {
      const arrayBuffer = new ArrayBuffer(8)

      await expect(getChunksHashSingle('unsupported' as Strategy, arrayBuffer)).rejects.toThrow(
        'Unsupported strategy: unsupported',
      )
    })

    it('应该处理空的 ArrayBuffer', async () => {
      const arrayBuffer = new ArrayBuffer(0)
      const result = await getChunksHashSingle(Strategy.md5, arrayBuffer)

      expect(result).toEqual(['mock-md5-hash'])
    })
  })
})
