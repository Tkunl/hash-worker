import { WorkerReq } from '../types'

/**
 * ArrayBuffer 服务类
 * 用于管理 Worker 线程间传输的 ArrayBuffer 对象
 */
class ArrayBufferService {
  private arrayBuffers: ArrayBuffer[] = []

  /**
   * 初始化缓冲区数组
   * @param buffers - ArrayBuffer 数组
   */
  init(buffers: ArrayBuffer[]): void {
    if (!Array.isArray(buffers)) {
      throw new Error('Buffers must be an array')
    }
    this.arrayBuffers = [...buffers] // 创建副本以避免外部修改
  }

  /**
   * 从 WorkerReq 中提取 ArrayBuffer
   * @param param - Worker 请求参数
   * @returns 提取的 ArrayBuffer
   */
  extractArrayBuffer(param: WorkerReq): ArrayBuffer {
    if (!param || !param.chunk) {
      throw new Error('Invalid WorkerReq: chunk is required')
    }
    if (!(param.chunk instanceof ArrayBuffer)) {
      throw new Error('Invalid chunk: must be an ArrayBuffer')
    }
    return param.chunk
  }

  /**
   * 恢复指定索引位置的 ArrayBuffer
   * @param options - 包含缓冲区和索引的选项
   */
  restoreArrayBuffer(options: { buf: ArrayBuffer; index: number }): void {
    const { index, buf } = options

    if (!buf || !(buf instanceof ArrayBuffer)) {
      throw new Error('Invalid buffer: must be an ArrayBuffer')
    }

    if (!Number.isInteger(index) || index < 0) {
      throw new Error('Invalid index: must be a non-negative integer')
    }

    if (index >= this.arrayBuffers.length) {
      throw new Error(`Index ${index} is out of bounds (array length: ${this.arrayBuffers.length})`)
    }

    this.arrayBuffers[index] = buf
  }

  /**
   * 清空缓冲区数组
   */
  clear(): void {
    this.arrayBuffers = []
  }
}

const instance = new ArrayBufferService()

export const initBufService = (buffers: ArrayBuffer[]) => instance.init(buffers)
export const obtainBuf = (param: WorkerReq) => instance.extractArrayBuffer(param)
export const restoreBuf = (options: { buf: ArrayBuffer; index: number }) =>
  instance.restoreArrayBuffer(options)
export const clearBufService = () => instance.clear()
