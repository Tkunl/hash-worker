import { initBufService, obtainBuf, restoreBuf } from '../../../src/shared/arrayBufferService'
import { WorkerReq } from '../../../src/types'
import { Strategy } from '../../../src/types'

describe('ArrayBufferService', () => {
  let mockArrayBuffers: ArrayBuffer[]
  let mockWorkerReq: WorkerReq

  beforeEach(() => {
    // 创建测试用的 ArrayBuffer
    mockArrayBuffers = [new ArrayBuffer(8), new ArrayBuffer(16), new ArrayBuffer(32)]

    // 创建测试用的 WorkerReq
    mockWorkerReq = {
      chunk: new ArrayBuffer(8),
      strategy: Strategy.md5,
    }
  })

  describe('initBufService', () => {
    it('应该正确初始化 ArrayBuffer 数组', () => {
      // 初始化服务
      initBufService(mockArrayBuffers)

      // 验证初始化后的行为
      const result = obtainBuf(mockWorkerReq)
      expect(result).toBe(mockWorkerReq.chunk)
    })

    it('应该能够处理空数组', () => {
      // 初始化空数组
      initBufService([])

      // 验证仍然可以正常工作
      const result = obtainBuf(mockWorkerReq)
      expect(result).toBe(mockWorkerReq.chunk)
    })

    it('应该能够处理单个 ArrayBuffer', () => {
      const singleBuffer = [new ArrayBuffer(8)]
      initBufService(singleBuffer)

      const result = obtainBuf(mockWorkerReq)
      expect(result).toBe(mockWorkerReq.chunk)
    })
  })

  describe('obtainBuf', () => {
    beforeEach(() => {
      initBufService(mockArrayBuffers)
    })

    it('应该返回请求中的 chunk', () => {
      const result = obtainBuf(mockWorkerReq)
      expect(result).toBe(mockWorkerReq.chunk)
    })

    it('应该返回不同大小的 ArrayBuffer', () => {
      const largeChunk = new ArrayBuffer(1024)
      const largeReq: WorkerReq = {
        chunk: largeChunk,
        strategy: Strategy.crc32,
      }

      const result = obtainBuf(largeReq)
      expect(result).toBe(largeChunk)
      expect(result.byteLength).toBe(1024)
    })

    it('应该处理不同的策略类型', () => {
      const reqWithDifferentStrategy: WorkerReq = {
        chunk: new ArrayBuffer(16),
        strategy: Strategy.xxHash64,
      }

      const result = obtainBuf(reqWithDifferentStrategy)
      expect(result).toBe(reqWithDifferentStrategy.chunk)
    })
  })

  describe('restoreBuf', () => {
    beforeEach(() => {
      initBufService(mockArrayBuffers)
    })

    it('应该正确恢复指定索引的 ArrayBuffer', () => {
      const newBuffer = new ArrayBuffer(64)
      const index = 1

      // 恢复指定索引的 buffer
      restoreBuf({ buf: newBuffer, index })

      // 验证恢复是否成功（通过间接方式验证，因为内部状态是私有的）
      // 这里我们主要测试函数调用不会抛出错误
      expect(() => {
        restoreBuf({ buf: newBuffer, index })
      }).not.toThrow()
    })

    it('应该能够恢复第一个位置的 ArrayBuffer', () => {
      const newBuffer = new ArrayBuffer(128)
      const index = 0

      expect(() => {
        restoreBuf({ buf: newBuffer, index })
      }).not.toThrow()
    })

    it('应该能够恢复最后一个位置的 ArrayBuffer', () => {
      const newBuffer = new ArrayBuffer(256)
      const index = mockArrayBuffers.length - 1

      expect(() => {
        restoreBuf({ buf: newBuffer, index })
      }).not.toThrow()
    })

    it('应该能够处理超出原数组长度的索引', () => {
      const newBuffer = new ArrayBuffer(512)
      const index = 999

      expect(() => {
        restoreBuf({ buf: newBuffer, index })
      }).not.toThrow()
    })

    it('应该能够处理空 ArrayBuffer', () => {
      const emptyBuffer = new ArrayBuffer(0)
      const index = 0

      expect(() => {
        restoreBuf({ buf: emptyBuffer, index })
      }).not.toThrow()
    })
  })

  describe('集成测试', () => {
    it('应该能够完整地初始化、获取和恢复 ArrayBuffer', () => {
      // 1. 初始化
      const testBuffers = [new ArrayBuffer(8), new ArrayBuffer(16), new ArrayBuffer(32)]
      initBufService(testBuffers)

      // 2. 获取 buffer
      const testReq: WorkerReq = {
        chunk: new ArrayBuffer(24),
        strategy: Strategy.mixed,
      }
      const obtainedBuffer = obtainBuf(testReq)
      expect(obtainedBuffer).toBe(testReq.chunk)

      // 3. 恢复 buffer
      const newBuffer = new ArrayBuffer(48)
      expect(() => {
        restoreBuf({ buf: newBuffer, index: 1 })
      }).not.toThrow()
    })

    it('应该能够处理多次连续操作', () => {
      // 初始化
      initBufService([new ArrayBuffer(8), new ArrayBuffer(16)])

      // 多次获取
      for (let i = 0; i < 5; i++) {
        const req: WorkerReq = {
          chunk: new ArrayBuffer(i * 8),
          strategy: Strategy.md5,
        }
        const result = obtainBuf(req)
        expect(result).toBe(req.chunk)
      }

      // 多次恢复
      for (let i = 0; i < 3; i++) {
        expect(() => {
          restoreBuf({ buf: new ArrayBuffer(i * 16), index: i })
        }).not.toThrow()
      }
    })
  })

  describe('边界情况测试', () => {
    it('应该能够处理非常大的 ArrayBuffer', () => {
      const largeBuffer = new ArrayBuffer(1024 * 1024) // 1MB
      initBufService([largeBuffer])

      const largeReq: WorkerReq = {
        chunk: largeBuffer,
        strategy: Strategy.crc32,
      }

      const result = obtainBuf(largeReq)
      expect(result).toBe(largeBuffer)
      expect(result.byteLength).toBe(1024 * 1024)
    })

    it('应该能够处理负数索引（虽然不应该发生）', () => {
      initBufService(mockArrayBuffers)

      expect(() => {
        restoreBuf({ buf: new ArrayBuffer(8), index: -1 })
      }).not.toThrow()
    })

    it('应该能够处理浮点数索引（虽然不应该发生）', () => {
      initBufService(mockArrayBuffers)

      expect(() => {
        restoreBuf({ buf: new ArrayBuffer(8), index: 1.5 })
      }).not.toThrow()
    })
  })
})
