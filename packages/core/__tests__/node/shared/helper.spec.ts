import {
  getMerkleRootHashByChunks,
  mergeConfig,
  calculateHashInWorker,
  getChunksHashSingle,
  getChunksHashMultipleStrategy,
} from '../../../src/shared/helper'
import { Strategy, Config, WorkerReq } from '../../../src/types'
import { BORDER_COUNT, DEFAULT_MAX_WORKERS } from '../../../src/shared/constant'

// Mock hash-wasm functions
jest.mock('hash-wasm', () => ({
  md5: jest.fn().mockResolvedValue('mock-md5-hash'),
  crc32: jest.fn().mockResolvedValue('mock-crc32-hash'),
  xxhash64: jest.fn().mockResolvedValue('mock-xxhash64-hash'),
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
        strategy: Strategy.mixed,
        borderCount: BORDER_COUNT,
        isCloseWorkerImmediately: true,
        isShowLog: false,
      })
    })

    it('应该合并部分配置参数', () => {
      const partialConfig: Config = {
        chunkSize: 20,
        strategy: Strategy.md5,
        isShowLog: true,
      }

      const config = mergeConfig(partialConfig)

      expect(config).toEqual({
        chunkSize: 20,
        workerCount: DEFAULT_MAX_WORKERS,
        strategy: Strategy.md5,
        borderCount: BORDER_COUNT,
        isCloseWorkerImmediately: true,
        isShowLog: true,
      })
    })

    it('应该合并所有配置参数', () => {
      const fullConfig: Config = {
        chunkSize: 15,
        workerCount: 4,
        strategy: Strategy.crc32,
        borderCount: 50,
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
        strategy: Strategy.mixed,
        borderCount: BORDER_COUNT,
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

    it('应该使用 crc32 策略计算哈希', async () => {
      const req: WorkerReq = {
        chunk: new ArrayBuffer(16),
        strategy: Strategy.crc32,
      }

      const result = await calculateHashInWorker(req)

      expect(result).toEqual({
        result: 'mock-crc32-hash',
        chunk: req.chunk,
      })
    })

    it('应该使用 xxHash64 策略计算哈希', async () => {
      const req: WorkerReq = {
        chunk: new ArrayBuffer(32),
        strategy: Strategy.xxHash64,
      }

      const result = await calculateHashInWorker(req)

      expect(result).toEqual({
        result: 'mock-xxhash64-hash',
        chunk: req.chunk,
      })
    })

    it('应该抛出错误当使用 mixed 策略时', async () => {
      const req: WorkerReq = {
        chunk: new ArrayBuffer(8),
        strategy: Strategy.mixed,
      }

      await expect(calculateHashInWorker(req)).rejects.toThrow(
        'Mixed strategy not supported in worker calculation',
      )
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

    it('应该使用 crc32 策略计算单个哈希', async () => {
      const arrayBuffer = new ArrayBuffer(16)
      const result = await getChunksHashSingle(Strategy.crc32, arrayBuffer)

      expect(result).toEqual(['mock-crc32-hash'])
    })

    it('应该使用 xxHash64 策略计算单个哈希', async () => {
      const arrayBuffer = new ArrayBuffer(32)
      const result = await getChunksHashSingle(Strategy.xxHash64, arrayBuffer)

      expect(result).toEqual(['mock-xxhash64-hash'])
    })

    it('应该为 mixed 策略使用 md5（默认情况）', async () => {
      const arrayBuffer = new ArrayBuffer(8)
      const result = await getChunksHashSingle(Strategy.mixed, arrayBuffer)

      expect(result).toEqual(['mock-md5-hash'])
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

  describe('getChunksHashMultipleStrategy', () => {
    it('应该为 mixed 策略且分片数量小于边界值时返回 md5', () => {
      const result = getChunksHashMultipleStrategy(Strategy.mixed, BORDER_COUNT - 1, BORDER_COUNT)

      expect(result).toBe(Strategy.md5)
    })

    it('应该为 mixed 策略且分片数量等于边界值时返回 md5', () => {
      const result = getChunksHashMultipleStrategy(Strategy.mixed, BORDER_COUNT, BORDER_COUNT)

      expect(result).toBe(Strategy.md5)
    })

    it('应该为 mixed 策略且分片数量大于边界值时返回 crc32', () => {
      const result = getChunksHashMultipleStrategy(Strategy.mixed, BORDER_COUNT + 1, BORDER_COUNT)

      expect(result).toBe(Strategy.crc32)
    })

    it('应该为非 mixed 策略直接返回原策略', () => {
      expect(getChunksHashMultipleStrategy(Strategy.md5, 50, 100)).toBe(Strategy.md5)
      expect(getChunksHashMultipleStrategy(Strategy.crc32, 50, 100)).toBe(Strategy.crc32)
      expect(getChunksHashMultipleStrategy(Strategy.xxHash64, 50, 100)).toBe(Strategy.xxHash64)
    })

    it('应该为 mixed 策略且没有边界参数时返回 md5（默认情况）', () => {
      const result = getChunksHashMultipleStrategy(Strategy.mixed, 0, 100)

      expect(result).toBe(Strategy.md5)
    })

    it('应该为 mixed 策略且只有分片数量时返回 md5（默认情况）', () => {
      const result = getChunksHashMultipleStrategy(Strategy.mixed, 50, 100)

      expect(result).toBe(Strategy.md5)
    })

    it('应该为 mixed 策略且边界值较大时返回 crc32', () => {
      const result = getChunksHashMultipleStrategy(Strategy.mixed, 150, 100)

      expect(result).toBe(Strategy.crc32)
    })
  })
})
